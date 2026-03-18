import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Integration — Deposit → Compound → Snapshot", function () {
    async function deployIntegrationFixture() {
        const [deployer, user1, treasury, caller] = await ethers.getSigners();

        // ── Deploy mock tokens ──────────────────────────
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);

        // ── Deploy mock strategies ──────────────────────
        const MockStrategy = await ethers.getContractFactory("MockStrategy");
        const mockStaking = await MockStrategy.deploy(await usdc.getAddress());
        const mockBuffer = await MockStrategy.deploy(await usdc.getAddress());

        // ── Deploy mock brain and compounder placeholders ──
        const MockStakingWithIL = await ethers.getContractFactory("MockStakingWithIL");
        const ilMock = await MockStakingWithIL.deploy(
            ethers.parseEther("1.0"),
            ethers.parseEther("1.0")
        );

        const MockSimple = await ethers.getContractFactory("MockSimple");
        const mockBrain = await MockSimple.deploy();
        const mockCompounder = await MockSimple.deploy();

        // ── Deploy APEXVault ────────────────────────────
        const APEXVault = await ethers.getContractFactory("APEXVault");
        const vault = await APEXVault.deploy(
            await usdc.getAddress(),
            await mockBrain.getAddress(),
            await mockCompounder.getAddress(),
            await mockStaking.getAddress(),
            await mockBuffer.getAddress(),
            treasury.address
        );

        // ── Mint USDC to users ──────────────────────────
        const depositAmount = ethers.parseUnits("1000", 6);
        await usdc.mint(user1.address, depositAmount);

        return {
            vault, usdc, mockStaking, mockBuffer, mockBrain, mockCompounder,
            ilMock, deployer, user1, treasury, caller, depositAmount
        };
    }

    describe("deposit flow", function () {
        it("should accept USDC deposit and mint shares", async function () {
            const { vault, usdc, user1, depositAmount } = await loadFixture(deployIntegrationFixture);

            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount, user1.address);

            const shares = await vault.balanceOf(user1.address);
            expect(shares).to.be.gt(0);
        });

        it("should route deposited USDC to staking strategy", async function () {
            const { vault, usdc, mockStaking, user1, depositAmount } = await loadFixture(deployIntegrationFixture);

            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount, user1.address);

            const strategyBalance = await usdc.balanceOf(await mockStaking.getAddress());
            expect(strategyBalance).to.equal(depositAmount);
        });

        it("should update totalAssets after deposit", async function () {
            const { vault, usdc, user1, depositAmount } = await loadFixture(deployIntegrationFixture);

            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount, user1.address);

            expect(await vault.totalAssets()).to.be.gt(0);
        });
    });

    describe("snapshot recording", function () {
        it("should record snapshot and calculate efficiency correctly", async function () {
            const { vault, mockCompounder, deployer } = await loadFixture(deployIntegrationFixture);

            const compAddr = await mockCompounder.getAddress();
            await ethers.provider.send("hardhat_impersonateAccount", [compAddr]);
            const compSigner = await ethers.getSigner(compAddr);
            await deployer.sendTransaction({ to: compAddr, value: ethers.parseEther("1") });

            // IL = $10, Buffer = $15 → efficiency = 15/10 × 10000 = 15000
            const il = ethers.parseUnits("10", 6);
            const buffer = ethers.parseUnits("15", 6);
            await vault.connect(compSigner).recordHedgeSnapshot(il, buffer, 6000);

            const snapshot = await vault.latestHedgeSnapshot();
            expect(snapshot.hedgeEfficiency).to.equal(15_000n);
            expect(snapshot.ilAmount).to.equal(il);
            expect(snapshot.hedgeBuffer).to.equal(buffer);

            await ethers.provider.send("hardhat_stopImpersonatingAccount", [compAddr]);
        });

        it("should increment snapshot history length", async function () {
            const { vault, mockCompounder, deployer } = await loadFixture(deployIntegrationFixture);

            const compAddr = await mockCompounder.getAddress();
            await ethers.provider.send("hardhat_impersonateAccount", [compAddr]);
            const compSigner = await ethers.getSigner(compAddr);
            await deployer.sendTransaction({ to: compAddr, value: ethers.parseEther("1") });

            await vault.connect(compSigner).recordHedgeSnapshot(100, 200, 6000);
            expect(await vault.hedgeHistoryLength()).to.equal(1);

            await vault.connect(compSigner).recordHedgeSnapshot(150, 180, 5500);
            expect(await vault.hedgeHistoryLength()).to.equal(2);

            await vault.connect(compSigner).recordHedgeSnapshot(200, 220, 5000);
            expect(await vault.hedgeHistoryLength()).to.equal(3);

            await ethers.provider.send("hardhat_stopImpersonatingAccount", [compAddr]);
        });
    });

    describe("withdraw flow", function () {
        it("should return USDC on withdraw", async function () {
            const { vault, usdc, user1, depositAmount } = await loadFixture(deployIntegrationFixture);

            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount, user1.address);

            const shares = await vault.balanceOf(user1.address);
            const withdrawAmount = ethers.parseUnits("500", 6);

            // Need USDC in vault or strategy for withdrawal
            // Mock strategy has USDC — vault needs to pull from it
            await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);

            const userBalance = await usdc.balanceOf(user1.address);
            // User should have some USDC back (minus exit fee)
            expect(userBalance).to.be.gt(0);
        });

        it("should deduct 0.1% exit fee to treasury", async function () {
            const { vault, usdc, user1, treasury, depositAmount } = await loadFixture(deployIntegrationFixture);

            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount, user1.address);

            const treasuryBefore = await usdc.balanceOf(treasury.address);
            const withdrawAmount = ethers.parseUnits("100", 6);

            await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);

            const treasuryAfter = await usdc.balanceOf(treasury.address);
            const feeCollected = treasuryAfter - treasuryBefore;

            // Fee should be ~0.1% of withdrawal = 100000 (0.1 USDC out of 100)
            expect(feeCollected).to.be.gt(0);
            // 0.1% of 100 USDC = 100000 (0.1 USDC in 6 decimals)
            expect(feeCollected).to.equal(100_000n);
        });

        it("should emit Withdrawn event", async function () {
            const { vault, usdc, user1, depositAmount } = await loadFixture(deployIntegrationFixture);

            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount, user1.address);

            const withdrawAmount = ethers.parseUnits("100", 6);

            await expect(
                vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address)
            ).to.emit(vault, "Withdrawn");
        });
    });

    describe("Brain regime integration", function () {
        async function deployBrainIntegrationFixture() {
            const [deployer, compounder] = await ethers.getSigners();

            const MockStakingWithIL = await ethers.getContractFactory("MockStakingWithIL");
            const MockSimple = await ethers.getContractFactory("MockSimple");

            const mockVault = await MockSimple.deploy();
            const mockBuffer = await MockSimple.deploy();

            const mockStaking = await MockStakingWithIL.deploy(
                ethers.parseEther("1.0"),
                ethers.parseEther("1.0")
            );

            const APEXBrain = await ethers.getContractFactory("APEXBrain");
            const brain = await APEXBrain.deploy(
                await mockVault.getAddress(),
                await mockStaking.getAddress(),
                await mockBuffer.getAddress(),
                compounder.address
            );

            return { brain, mockStaking, compounder };
        }

        it("should shift to 40/60 when IL simulates HIGH regime", async function () {
            const { brain, mockStaking, compounder } = await loadFixture(deployBrainIntegrationFixture);

            // Start: LOW regime (no IL)
            let split = await brain.currentSplit();
            expect(split.stakingBps).to.equal(6000); // initial default

            // Push to HIGH IL
            await mockStaking.setCurrentPrice(ethers.parseEther("5.0"));
            await brain.connect(compounder).updateSplit();

            split = await brain.currentSplit();
            expect(split.stakingBps).to.equal(4000);
            expect(split.bufferBps).to.equal(6000);
        });

        it("should recover to 70/30 when IL goes back to LOW", async function () {
            const { brain, mockStaking, compounder } = await loadFixture(deployBrainIntegrationFixture);

            // Push to HIGH, then recover
            await mockStaking.setCurrentPrice(ethers.parseEther("5.0"));
            await brain.connect(compounder).updateSplit();

            await mockStaking.setCurrentPrice(ethers.parseEther("1.0"));
            await brain.connect(compounder).updateSplit();

            const split = await brain.currentSplit();
            expect(split.stakingBps).to.equal(7000);
            expect(split.bufferBps).to.equal(3000);
        });
    });
});
