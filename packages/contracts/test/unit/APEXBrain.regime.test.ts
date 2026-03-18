import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("APEXBrain — Regime Tests", function () {
    async function deployBrainWithILFixture() {
        const [owner, compounder] = await ethers.getSigners();

        // Deploy mock vault and buffer
        const MockSimple = await ethers.getContractFactory("MockSimple");
        const mockVault = await MockSimple.deploy();
        const mockBuffer = await MockSimple.deploy();

        // Deploy the configurable IL mock
        const MockStakingWithIL = await ethers.getContractFactory("MockStakingWithIL");
        // Start with equal entry/current rate = no IL
        const mockStaking = await MockStakingWithIL.deploy(
            ethers.parseEther("1.0"), // entryPrice
            ethers.parseEther("1.0")  // currentPrice
        );

        const APEXBrain = await ethers.getContractFactory("APEXBrain");
        const brain = await APEXBrain.deploy(
            await mockVault.getAddress(),
            await mockStaking.getAddress(),
            await mockBuffer.getAddress(),
            compounder.address
        );

        return { brain, mockStaking, owner, compounder };
    }

    // ── LOW IL Regime (< 5% IL) → 70/30 split ───────────────────

    describe("LOW IL regime (<500 bps)", function () {
        it("should return 70/30 split when IL is 0%", async function () {
            const { brain } = await loadFixture(deployBrainWithILFixture);
            const split = await brain.computeSplit();
            expect(split.stakingBps).to.equal(7000);
            expect(split.bufferBps).to.equal(3000);
        });

        it("should return 70/30 when price moves 2% (very low IL)", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            // Small price change: 1.0 → 1.02 (2% up)
            await mockStaking.setCurrentPrice(ethers.parseEther("1.02"));
            const split = await brain.computeSplit();
            expect(split.stakingBps).to.equal(7000);
            expect(split.bufferBps).to.equal(3000);
        });

        it("should report regime as LOW", async function () {
            const { brain } = await loadFixture(deployBrainWithILFixture);
            expect(await brain.currentRegime()).to.equal("LOW");
        });

        it("should update to 70/30 when compounder calls updateSplit", async function () {
            const { brain, compounder } = await loadFixture(deployBrainWithILFixture);
            await brain.connect(compounder).updateSplit();
            const split = await brain.currentSplit();
            expect(split.stakingBps).to.equal(7000);
            expect(split.bufferBps).to.equal(3000);
        });
    });

    // ── MEDIUM IL Regime (500-1500 bps) → 60/40 split ───────────

    describe("MEDIUM IL regime (500–1500 bps)", function () {
        it("should return 60/40 when price diverges ~50% (IL ≈ 5.72%)", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            // 2x price move → IL ~5.72% = ~572 bps → MEDIUM
            await mockStaking.setCurrentPrice(ethers.parseEther("2.0"));
            const split = await brain.computeSplit();
            expect(split.stakingBps).to.equal(6000);
            expect(split.bufferBps).to.equal(4000);
        });

        it("should report regime as MEDIUM", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            await mockStaking.setCurrentPrice(ethers.parseEther("2.0"));
            expect(await brain.currentRegime()).to.equal("MEDIUM");
        });

        it("should keep 60/40 at 3x price divergence (IL ≈ 13.4%)", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            // 3x price move → IL ~13.4% = ~1340 bps → still MEDIUM
            await mockStaking.setCurrentPrice(ethers.parseEther("3.0"));
            const split = await brain.computeSplit();
            expect(split.stakingBps).to.equal(6000);
            expect(split.bufferBps).to.equal(4000);
        });
    });

    // ── HIGH IL Regime (> 1500 bps) → 40/60 split ───────────────

    describe("HIGH IL regime (>1500 bps)", function () {
        it("should return 40/60 when price diverges ~4x (IL ≈ 20%)", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            // 4x price move → IL ~20% = ~2000 bps → HIGH
            await mockStaking.setCurrentPrice(ethers.parseEther("4.0"));
            const split = await brain.computeSplit();
            expect(split.stakingBps).to.equal(4000);
            expect(split.bufferBps).to.equal(6000);
        });

        it("should report regime as HIGH", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            await mockStaking.setCurrentPrice(ethers.parseEther("4.0"));
            expect(await brain.currentRegime()).to.equal("HIGH");
        });

        it("should return 40/60 on extreme price divergence (10x)", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            await mockStaking.setCurrentPrice(ethers.parseEther("10.0"));
            const split = await brain.computeSplit();
            expect(split.stakingBps).to.equal(4000);
            expect(split.bufferBps).to.equal(6000);
        });

        it("should protect capital on price decrease too", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            // Price drops to 0.1x → same IL as 10x due to IL symmetry
            await mockStaking.setCurrentPrice(ethers.parseEther("0.1"));
            const split = await brain.computeSplit();
            expect(split.stakingBps).to.equal(4000);
            expect(split.bufferBps).to.equal(6000);
        });
    });

    // ── Split Invariant ──────────────────────────────────────────

    describe("split invariant (fuzz-style)", function () {
        it("split should always sum to 10000 at LOW IL (0%)", async function () {
            const { brain } = await loadFixture(deployBrainWithILFixture);
            const split = await brain.computeSplit();
            expect(split.stakingBps + split.bufferBps).to.equal(10000n);
        });

        it("split should always sum to 10000 at MEDIUM IL (2x)", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            await mockStaking.setCurrentPrice(ethers.parseEther("2.0"));
            const split = await brain.computeSplit();
            expect(split.stakingBps + split.bufferBps).to.equal(10000n);
        });

        it("split should always sum to 10000 at HIGH IL (4x)", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            await mockStaking.setCurrentPrice(ethers.parseEther("4.0"));
            const split = await brain.computeSplit();
            expect(split.stakingBps + split.bufferBps).to.equal(10000n);
        });

        it("split should sum to 10000 across 20 random price multipliers", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);
            // Test with various price multipliers
            const multipliers = [
                "0.01", "0.1", "0.5", "0.9", "0.99",
                "1.0", "1.01", "1.1", "1.5", "2.0",
                "2.5", "3.0", "4.0", "5.0", "7.0",
                "10.0", "20.0", "50.0", "100.0", "0.001"
            ];

            for (const m of multipliers) {
                await mockStaking.setCurrentPrice(ethers.parseEther(m));
                const split = await brain.computeSplit();
                expect(split.stakingBps + split.bufferBps).to.equal(
                    10000n,
                    `Split invariant failed at price multiplier ${m}`
                );
            }
        });
    });

    // ── Regime Transitions ───────────────────────────────────────

    describe("regime transitions", function () {
        it("should transition from LOW to MEDIUM to HIGH as IL increases", async function () {
            const { brain, mockStaking, compounder } = await loadFixture(deployBrainWithILFixture);

            // Start: no IL → LOW
            expect(await brain.currentRegime()).to.equal("LOW");

            // Moderate IL → MEDIUM
            await mockStaking.setCurrentPrice(ethers.parseEther("2.0"));
            expect(await brain.currentRegime()).to.equal("MEDIUM");

            // High IL → HIGH
            await mockStaking.setCurrentPrice(ethers.parseEther("4.0"));
            expect(await brain.currentRegime()).to.equal("HIGH");
        });

        it("should transition back from HIGH to LOW when IL recovers", async function () {
            const { brain, mockStaking } = await loadFixture(deployBrainWithILFixture);

            // Push to HIGH
            await mockStaking.setCurrentPrice(ethers.parseEther("5.0"));
            expect(await brain.currentRegime()).to.equal("HIGH");

            // Recover to entry price → LOW
            await mockStaking.setCurrentPrice(ethers.parseEther("1.0"));
            expect(await brain.currentRegime()).to.equal("LOW");
        });

        it("should emit SplitUpdated event with HIGH regime", async function () {
            const { brain, mockStaking, compounder } = await loadFixture(deployBrainWithILFixture);

            // Set to HIGH IL
            await mockStaking.setCurrentPrice(ethers.parseEther("5.0"));
            const tx = await brain.connect(compounder).updateSplit();

            // Verify event was emitted — check old split (6000) and new split (4000/6000)
            await expect(tx).to.emit(brain, "SplitUpdated");

            // Verify the new state is correct after the event
            const split = await brain.currentSplit();
            expect(split.stakingBps).to.equal(4000);
            expect(split.bufferBps).to.equal(6000);
        });
    });
});
