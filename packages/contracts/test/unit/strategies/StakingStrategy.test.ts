import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("StakingStrategy", function () {
    async function deployStakingFixture() {
        const [owner, vault, compounder, user1] = await ethers.getSigners();

        // Deploy mock tokens
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
        const asBNB = await MockERC20.deploy("asBNB", "asBNB", 18);
        const wbnb = await MockERC20.deploy("Wrapped BNB", "WBNB", 18);

        // Deploy mock minter and router
        const MockSimple = await ethers.getContractFactory("MockSimple");
        const mockMinter = await MockSimple.deploy();
        const mockRouter = await MockSimple.deploy();

        // Deploy StakingStrategy
        const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
        const strategy = await StakingStrategy.deploy(
            vault.address,
            compounder.address,
            await usdc.getAddress(),
            await asBNB.getAddress(),
            await mockMinter.getAddress(),
            await wbnb.getAddress(),
            await mockRouter.getAddress()
        );

        return {
            strategy, usdc, asBNB, wbnb,
            mockMinter, mockRouter,
            owner, vault, compounder, user1,
        };
    }

    describe("constructor", function () {
        it("should set correct immutables", async function () {
            const { strategy, usdc, asBNB, wbnb, mockMinter, mockRouter, vault, compounder } =
                await loadFixture(deployStakingFixture);

            expect(await strategy.vault()).to.equal(vault.address);
            expect(await strategy.compounder()).to.equal(compounder.address);
            expect(await strategy.usdc()).to.equal(await usdc.getAddress());
            expect(await strategy.asBNB()).to.equal(await asBNB.getAddress());
            expect(await strategy.asBNBMinter()).to.equal(await mockMinter.getAddress());
            expect(await strategy.wbnb()).to.equal(await wbnb.getAddress());
            expect(await strategy.pancakeRouter()).to.equal(await mockRouter.getAddress());
        });

        it("should revert on zero address for vault", async function () {
            const { usdc, asBNB, wbnb, mockMinter, mockRouter, compounder } =
                await loadFixture(deployStakingFixture);

            const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
            await expect(
                StakingStrategy.deploy(
                    ethers.ZeroAddress,
                    compounder.address,
                    await usdc.getAddress(),
                    await asBNB.getAddress(),
                    await mockMinter.getAddress(),
                    await wbnb.getAddress(),
                    await mockRouter.getAddress()
                )
            ).to.be.revertedWithCustomError(StakingStrategy, "ZeroAddress");
        });

        it("should revert on zero address for asBNB", async function () {
            const { usdc, wbnb, mockMinter, mockRouter, vault, compounder } =
                await loadFixture(deployStakingFixture);

            const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
            await expect(
                StakingStrategy.deploy(
                    vault.address,
                    compounder.address,
                    await usdc.getAddress(),
                    ethers.ZeroAddress,
                    await mockMinter.getAddress(),
                    await wbnb.getAddress(),
                    await mockRouter.getAddress()
                )
            ).to.be.revertedWithCustomError(StakingStrategy, "ZeroAddress");
        });

        it("should revert on zero address for asBNBMinter", async function () {
            const { usdc, asBNB, wbnb, mockRouter, vault, compounder } =
                await loadFixture(deployStakingFixture);

            const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
            await expect(
                StakingStrategy.deploy(
                    vault.address,
                    compounder.address,
                    await usdc.getAddress(),
                    await asBNB.getAddress(),
                    ethers.ZeroAddress,
                    await wbnb.getAddress(),
                    await mockRouter.getAddress()
                )
            ).to.be.revertedWithCustomError(StakingStrategy, "ZeroAddress");
        });

        it("should revert on zero address for pancakeRouter", async function () {
            const { usdc, asBNB, wbnb, mockMinter, vault, compounder } =
                await loadFixture(deployStakingFixture);

            const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
            await expect(
                StakingStrategy.deploy(
                    vault.address,
                    compounder.address,
                    await usdc.getAddress(),
                    await asBNB.getAddress(),
                    await mockMinter.getAddress(),
                    await wbnb.getAddress(),
                    ethers.ZeroAddress
                )
            ).to.be.revertedWithCustomError(StakingStrategy, "ZeroAddress");
        });
    });

    describe("access control", function () {
        it("should revert deposit from non-vault", async function () {
            const { strategy, user1 } = await loadFixture(deployStakingFixture);
            await expect(
                strategy.connect(user1).deposit(1_000_000n)
            ).to.be.revertedWithCustomError(strategy, "NotVault");
        });

        it("should revert withdraw from non-vault", async function () {
            const { strategy, user1 } = await loadFixture(deployStakingFixture);
            await expect(
                strategy.connect(user1).withdraw(1_000_000n)
            ).to.be.revertedWithCustomError(strategy, "NotVault");
        });

        it("should revert harvest from non-compounder", async function () {
            const { strategy, user1 } = await loadFixture(deployStakingFixture);
            await expect(
                strategy.connect(user1).harvest()
            ).to.be.revertedWithCustomError(strategy, "NotCompounder");
        });

        it("should revert harvest from vault (only compounder allowed)", async function () {
            const { strategy, vault } = await loadFixture(deployStakingFixture);
            await expect(
                strategy.connect(vault).harvest()
            ).to.be.revertedWithCustomError(strategy, "NotCompounder");
        });

        it("should revert deposit from compounder (only vault allowed)", async function () {
            const { strategy, compounder } = await loadFixture(deployStakingFixture);
            await expect(
                strategy.connect(compounder).deposit(1_000_000n)
            ).to.be.revertedWithCustomError(strategy, "NotVault");
        });
    });

    describe("view functions", function () {
        it("should return 0 totalAssets when no balance", async function () {
            const { strategy } = await loadFixture(deployStakingFixture);
            expect(await strategy.totalAssets()).to.equal(0);
        });

        it("should return 0 entryPrice initially", async function () {
            const { strategy } = await loadFixture(deployStakingFixture);
            expect(await strategy.entryPrice()).to.equal(0);
        });

        it("should revert currentAPY when minter has no exchangeRate (mock limitation)", async function () {
            const { strategy } = await loadFixture(deployStakingFixture);
            // currentAPY() calls IasBNBMinter.exchangeRate() before checking entryExchangeRate
            // MockSimple doesn't implement exchangeRate(), so this reverts
            // On real minter this works fine
            await expect(strategy.currentAPY()).to.be.reverted;
        });
    });

});
