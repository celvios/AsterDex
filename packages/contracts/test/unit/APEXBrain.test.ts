import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("APEXBrain", function () {
    async function deployBrainFixture() {
        const [owner, compounder] = await ethers.getSigners();

        // Deploy mock strategies and vault
        const MockSimple = await ethers.getContractFactory("MockSimple");
        const mockVault = await MockSimple.deploy();
        const mockStaking = await MockSimple.deploy();
        const mockBuffer = await MockSimple.deploy();

        const APEXBrain = await ethers.getContractFactory("APEXBrain");
        const brain = await APEXBrain.deploy(
            await mockVault.getAddress(),
            await mockStaking.getAddress(),
            await mockBuffer.getAddress(),
            compounder.address
        );

        return { brain, mockVault, mockStaking, mockBuffer, owner, compounder };
    }

    describe("constructor", function () {
        it("should set default split to 60/40", async function () {
            const { brain } = await loadFixture(deployBrainFixture);
            const split = await brain.currentSplit();
            expect(split.stakingBps).to.equal(6000);
            expect(split.bufferBps).to.equal(4000);
        });

        it("should revert on zero addresses", async function () {
            const APEXBrain = await ethers.getContractFactory("APEXBrain");
            await expect(
                APEXBrain.deploy(ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(APEXBrain, "ZeroAddress");
        });
    });

    describe("constants", function () {
        it("should have correct thresholds", async function () {
            const { brain } = await loadFixture(deployBrainFixture);
            expect(await brain.LOW_IL_THRESHOLD()).to.equal(500);
            expect(await brain.HIGH_IL_THRESHOLD()).to.equal(1500);
        });
    });

    describe("computeSplit", function () {
        it("should return a valid split that sums to BPS", async function () {
            const { brain } = await loadFixture(deployBrainFixture);
            const split = await brain.computeSplit();
            expect(split.stakingBps + split.bufferBps).to.equal(10000n);
        });
    });

    describe("updateSplit", function () {
        it("should revert when called by non-compounder", async function () {
            const { brain, owner } = await loadFixture(deployBrainFixture);
            await expect(
                brain.connect(owner).updateSplit()
            ).to.be.revertedWithCustomError(brain, "NotCompounder");
        });

        it("should emit SplitUpdated event when called by compounder", async function () {
            const { brain, compounder } = await loadFixture(deployBrainFixture);
            await expect(
                brain.connect(compounder).updateSplit()
            ).to.emit(brain, "SplitUpdated");
        });

        it("should update currentSplit state", async function () {
            const { brain, compounder } = await loadFixture(deployBrainFixture);
            await brain.connect(compounder).updateSplit();
            const split = await brain.currentSplit();
            // Split should still sum to BPS
            expect(split.stakingBps + split.bufferBps).to.equal(10000n);
        });
    });

    describe("currentRegime", function () {
        it("should return a valid regime string", async function () {
            const { brain } = await loadFixture(deployBrainFixture);
            const regime = await brain.currentRegime();
            expect(["LOW", "MEDIUM", "HIGH"]).to.include(regime);
        });
    });

    describe("split invariant", function () {
        it("split should always sum to 10000 regardless of regime", async function () {
            const { brain } = await loadFixture(deployBrainFixture);
            // computeSplit reads from staking strategy which returns 0 for mock
            // This means IL = 0, so LOW regime = 70/30
            const split = await brain.computeSplit();
            expect(split.stakingBps + split.bufferBps).to.equal(10000n);
        });
    });
});
