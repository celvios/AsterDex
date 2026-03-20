import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("BufferStrategy", function () {
    async function deployBufferFixture() {
        const [owner, vault, compounder, user1] = await ethers.getSigners();

        // Deploy mock tokens
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
        const asUSDF = await MockERC20.deploy("asUSDF", "asUSDF", 18);
        const usdf = await MockERC20.deploy("USDF", "USDF", 18);

        // Deploy mock minter and router
        const MockSimple = await ethers.getContractFactory("MockSimple");
        const mockMinter = await MockSimple.deploy();
        const mockRouter = await MockSimple.deploy();

        // Deploy BufferStrategy
        const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
        const strategy = await BufferStrategy.deploy(
            vault.address,
            compounder.address,
            await usdc.getAddress(),
            await asUSDF.getAddress(),
            await mockMinter.getAddress(),
            await usdf.getAddress(),
            await mockRouter.getAddress()
        );

        return {
            strategy, usdc, asUSDF, usdf,
            mockMinter, mockRouter,
            owner, vault, compounder, user1,
        };
    }

    describe("constructor", function () {
        it("should set correct immutables", async function () {
            const { strategy, usdc, asUSDF, usdf, mockMinter, mockRouter, vault, compounder } =
                await loadFixture(deployBufferFixture);

            expect(await strategy.vault()).to.equal(vault.address);
            expect(await strategy.compounder()).to.equal(compounder.address);
            expect(await strategy.usdc()).to.equal(await usdc.getAddress());
            expect(await strategy.asUSDF()).to.equal(await asUSDF.getAddress());
            expect(await strategy.asUSDFMinter()).to.equal(await mockMinter.getAddress());
            expect(await strategy.usdf()).to.equal(await usdf.getAddress());
            expect(await strategy.pancakeRouter()).to.equal(await mockRouter.getAddress());
        });

        it("should revert on zero address for vault", async function () {
            const { usdc, asUSDF, usdf, mockMinter, mockRouter, compounder } =
                await loadFixture(deployBufferFixture);

            const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
            await expect(
                BufferStrategy.deploy(
                    ethers.ZeroAddress,
                    compounder.address,
                    await usdc.getAddress(),
                    await asUSDF.getAddress(),
                    await mockMinter.getAddress(),
                    await usdf.getAddress(),
                    await mockRouter.getAddress()
                )
            ).to.be.revertedWithCustomError(BufferStrategy, "ZeroAddress");
        });

        it("should revert on zero address for asUSDF", async function () {
            const { usdc, usdf, mockMinter, mockRouter, vault, compounder } =
                await loadFixture(deployBufferFixture);

            const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
            await expect(
                BufferStrategy.deploy(
                    vault.address,
                    compounder.address,
                    await usdc.getAddress(),
                    ethers.ZeroAddress,
                    await mockMinter.getAddress(),
                    await usdf.getAddress(),
                    await mockRouter.getAddress()
                )
            ).to.be.revertedWithCustomError(BufferStrategy, "ZeroAddress");
        });

        it("should revert on zero address for asUSDFMinter", async function () {
            const { usdc, asUSDF, usdf, mockRouter, vault, compounder } =
                await loadFixture(deployBufferFixture);

            const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
            await expect(
                BufferStrategy.deploy(
                    vault.address,
                    compounder.address,
                    await usdc.getAddress(),
                    await asUSDF.getAddress(),
                    ethers.ZeroAddress,
                    await usdf.getAddress(),
                    await mockRouter.getAddress()
                )
            ).to.be.revertedWithCustomError(BufferStrategy, "ZeroAddress");
        });

        it("should revert on zero address for pancakeRouter", async function () {
            const { usdc, asUSDF, usdf, mockMinter, vault, compounder } =
                await loadFixture(deployBufferFixture);

            const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
            await expect(
                BufferStrategy.deploy(
                    vault.address,
                    compounder.address,
                    await usdc.getAddress(),
                    await asUSDF.getAddress(),
                    await mockMinter.getAddress(),
                    await usdf.getAddress(),
                    ethers.ZeroAddress
                )
            ).to.be.revertedWithCustomError(BufferStrategy, "ZeroAddress");
        });
    });

    describe("access control", function () {
        it("should revert deposit from non-vault", async function () {
            const { strategy, user1 } = await loadFixture(deployBufferFixture);
            await expect(
                strategy.connect(user1).deposit(1_000_000n)
            ).to.be.revertedWithCustomError(strategy, "NotVault");
        });

        it("should revert withdraw from non-vault", async function () {
            const { strategy, user1 } = await loadFixture(deployBufferFixture);
            await expect(
                strategy.connect(user1).withdraw(1_000_000n)
            ).to.be.revertedWithCustomError(strategy, "NotVault");
        });

        it("should revert harvest from non-compounder", async function () {
            const { strategy, user1 } = await loadFixture(deployBufferFixture);
            await expect(
                strategy.connect(user1).harvest()
            ).to.be.revertedWithCustomError(strategy, "NotCompounder");
        });

        it("should revert harvest from vault (only compounder allowed)", async function () {
            const { strategy, vault } = await loadFixture(deployBufferFixture);
            await expect(
                strategy.connect(vault).harvest()
            ).to.be.revertedWithCustomError(strategy, "NotCompounder");
        });

        it("should revert deposit from compounder (only vault allowed)", async function () {
            const { strategy, compounder } = await loadFixture(deployBufferFixture);
            await expect(
                strategy.connect(compounder).deposit(1_000_000n)
            ).to.be.revertedWithCustomError(strategy, "NotVault");
        });
    });

    describe("view functions", function () {
        it("should return 0 totalAssets when no balance", async function () {
            const { strategy } = await loadFixture(deployBufferFixture);
            expect(await strategy.totalAssets()).to.equal(0);
        });
    });

    describe("harvest", function () {
        it("should always return 0 (yield is embedded in asUSDF)", async function () {
            const { strategy, compounder } = await loadFixture(deployBufferFixture);
            // Harvest from compounder should succeed but return 0
            const result = await strategy.connect(compounder).harvest.staticCall();
            expect(result).to.equal(0);
        });
    });
});
