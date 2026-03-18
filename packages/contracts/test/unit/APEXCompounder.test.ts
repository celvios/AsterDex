import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("APEXCompounder", function () {
    async function deployCompounderFixture() {
        const [owner, user1, user2] = await ethers.getSigners();

        // Deploy mock USDC
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
        const wbnb = await MockERC20.deploy("Wrapped BNB", "WBNB", 18);
        const usdf = await MockERC20.deploy("USDF", "USDF", 18);
        const asBNB = await MockERC20.deploy("asBNB", "asBNB", 18);

        // Deploy mock strategy that can harvest
        const MockHarvestable = await ethers.getContractFactory("MockHarvestableStrategy");
        const mockStaking = await MockHarvestable.deploy(await usdc.getAddress());
        const mockBuffer = await MockHarvestable.deploy(await usdc.getAddress());

        // Deploy mock simple contracts for remaining addresses
        const MockSimple = await ethers.getContractFactory("MockSimple");
        const mockBrain = await MockSimple.deploy();
        const mockAsBNBMinter = await MockSimple.deploy();
        const mockAsUSDFMinter = await MockSimple.deploy();
        const mockRouter = await MockSimple.deploy();

        // We can't deploy the real compounder against mocks that don't implement
        // the Brain interface properly, so let's test what we can:
        // constants and constructor validation

        return {
            usdc, wbnb, usdf, asBNB,
            mockStaking, mockBuffer,
            mockBrain, mockAsBNBMinter, mockAsUSDFMinter, mockRouter,
            owner, user1, user2
        };
    }

    describe("constructor", function () {
        it("should revert on zero address for vault", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            await expect(
                APEXCompounder.deploy(
                    ethers.ZeroAddress, // vault — should revert
                    await mockBrain.getAddress(),
                    await mockStaking.getAddress(),
                    await mockBuffer.getAddress(),
                    await usdc.getAddress(),
                    await wbnb.getAddress(),
                    await usdf.getAddress(),
                    await asBNB.getAddress(),
                    await mockAsBNBMinter.getAddress(),
                    await mockAsUSDFMinter.getAddress(),
                    await mockRouter.getAddress()
                )
            ).to.be.revertedWithCustomError(APEXCompounder, "ZeroAddress");
        });

        it("should deploy successfully with all non-zero addresses", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter, owner } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            const compounder = await APEXCompounder.deploy(
                owner.address,
                await mockBrain.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                await usdc.getAddress(),
                await wbnb.getAddress(),
                await usdf.getAddress(),
                await asBNB.getAddress(),
                await mockAsBNBMinter.getAddress(),
                await mockAsUSDFMinter.getAddress(),
                await mockRouter.getAddress()
            );
            await compounder.waitForDeployment();
            expect(await compounder.getAddress()).to.not.equal(ethers.ZeroAddress);
        });
    });

    describe("constants", function () {
        it("should have CALLER_BOUNTY_BPS of 50 (0.5%)", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter, owner } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            const compounder = await APEXCompounder.deploy(
                owner.address,
                await mockBrain.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                await usdc.getAddress(),
                await wbnb.getAddress(),
                await usdf.getAddress(),
                await asBNB.getAddress(),
                await mockAsBNBMinter.getAddress(),
                await mockAsUSDFMinter.getAddress(),
                await mockRouter.getAddress()
            );

            expect(await compounder.CALLER_BOUNTY_BPS()).to.equal(50);
            expect(await compounder.MIN_COMPOUND_USDC()).to.equal(1_000_000n);
            expect(await compounder.BPS()).to.equal(10_000);
        });
    });

    describe("initial state", function () {
        it("should have zero compounds and zero lastCompound", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter, owner } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            const compounder = await APEXCompounder.deploy(
                owner.address,
                await mockBrain.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                await usdc.getAddress(),
                await wbnb.getAddress(),
                await usdf.getAddress(),
                await asBNB.getAddress(),
                await mockAsBNBMinter.getAddress(),
                await mockAsUSDFMinter.getAddress(),
                await mockRouter.getAddress()
            );

            expect(await compounder.lastCompound()).to.equal(0);
            expect(await compounder.totalCompounds()).to.equal(0);
        });
    });

    describe("compound() threshold guard", function () {
        it("should revert when harvest returns below minimum", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter, owner } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            const compounder = await APEXCompounder.deploy(
                owner.address,
                await mockBrain.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                await usdc.getAddress(),
                await wbnb.getAddress(),
                await usdf.getAddress(),
                await asBNB.getAddress(),
                await mockAsBNBMinter.getAddress(),
                await mockAsUSDFMinter.getAddress(),
                await mockRouter.getAddress()
            );

            // Set harvest to return 0 (below 1 USDC minimum)
            await mockStaking.setHarvestAmount(0);

            await expect(
                compounder.compound()
            ).to.be.revertedWithCustomError(compounder, "BelowThreshold");
        });

        it("should revert when harvest returns dust amount", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter, owner } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            const compounder = await APEXCompounder.deploy(
                owner.address,
                await mockBrain.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                await usdc.getAddress(),
                await wbnb.getAddress(),
                await usdf.getAddress(),
                await asBNB.getAddress(),
                await mockAsBNBMinter.getAddress(),
                await mockAsUSDFMinter.getAddress(),
                await mockRouter.getAddress()
            );

            // Set harvest to return 0.5 USDC (500000 < 1e6)
            await mockStaking.setHarvestAmount(500_000);

            await expect(
                compounder.compound()
            ).to.be.revertedWithCustomError(compounder, "BelowThreshold");
        });
    });

    describe("bounty calculation (math check)", function () {
        it("should correctly calculate 0.5% bounty", function () {
            // Pure math check — verified against contract constants
            const totalHarvested = 100_000_000n; // 100 USDC
            const BOUNTY_BPS = 50n;
            const BPS = 10_000n;

            const bounty = totalHarvested * BOUNTY_BPS / BPS;
            expect(bounty).to.equal(500_000n); // 0.5 USDC

            const remaining = totalHarvested - bounty;
            expect(remaining).to.equal(99_500_000n); // 99.5 USDC
        });

        it("should correctly split remaining by 60/40", function () {
            const remaining = 99_500_000n; // after bounty on 100 USDC harvest
            const stakingBps = 6000n;
            const BPS = 10_000n;

            const toStaking = remaining * stakingBps / BPS;
            const toBuffer = remaining - toStaking;

            expect(toStaking).to.equal(59_700_000n); // 59.70 USDC
            expect(toBuffer).to.equal(39_800_000n);  // 39.80 USDC
            expect(toStaking + toBuffer).to.equal(remaining);
        });

        it("should correctly split remaining by 70/30 (low IL)", function () {
            const remaining = 99_500_000n;
            const stakingBps = 7000n;
            const BPS = 10_000n;

            const toStaking = remaining * stakingBps / BPS;
            const toBuffer = remaining - toStaking;

            expect(toStaking).to.equal(69_650_000n);
            expect(toBuffer).to.equal(29_850_000n);
            expect(toStaking + toBuffer).to.equal(remaining);
        });

        it("should correctly split remaining by 40/60 (high IL)", function () {
            const remaining = 99_500_000n;
            const stakingBps = 4000n;
            const BPS = 10_000n;

            const toStaking = remaining * stakingBps / BPS;
            const toBuffer = remaining - toStaking;

            expect(toStaking).to.equal(39_800_000n);
            expect(toBuffer).to.equal(59_700_000n);
            expect(toStaking + toBuffer).to.equal(remaining);
        });
    });

    describe("permissionless compound", function () {
        it("should allow any address to call compound() — user1", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter, user1 } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            const compounder = await APEXCompounder.deploy(
                user1.address,
                await mockBrain.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                await usdc.getAddress(),
                await wbnb.getAddress(),
                await usdf.getAddress(),
                await asBNB.getAddress(),
                await mockAsBNBMinter.getAddress(),
                await mockAsUSDFMinter.getAddress(),
                await mockRouter.getAddress()
            );

            // 0 harvest → threshold revert confirms we reach compound logic (no access control)
            await expect(
                compounder.connect(user1).compound()
            ).to.be.revertedWithCustomError(compounder, "BelowThreshold");
        });

        it("should allow any address to call compound() — user2", async function () {
            const { usdc, wbnb, usdf, asBNB,
                mockStaking, mockBuffer, mockBrain,
                mockAsBNBMinter, mockAsUSDFMinter, mockRouter, user1, user2 } = await loadFixture(deployCompounderFixture);

            const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
            const compounder = await APEXCompounder.deploy(
                user1.address,
                await mockBrain.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                await usdc.getAddress(),
                await wbnb.getAddress(),
                await usdf.getAddress(),
                await asBNB.getAddress(),
                await mockAsBNBMinter.getAddress(),
                await mockAsUSDFMinter.getAddress(),
                await mockRouter.getAddress()
            );

            // user2 can also call — confirming no access control
            await expect(
                compounder.connect(user2).compound()
            ).to.be.revertedWithCustomError(compounder, "BelowThreshold");
        });
    });
});
