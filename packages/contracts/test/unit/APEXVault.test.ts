import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("APEXVault", function () {
    // Use a simple fixture with mock contracts for unit testing
    async function deployVaultFixture() {
        const [owner, user1, user2, treasury] = await ethers.getSigners();

        // Deploy a mock USDC (ERC20)
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
        await usdc.waitForDeployment();

        // Deploy mock strategies (just to satisfy constructor)
        const MockStrategy = await ethers.getContractFactory("MockStrategy");
        const mockStaking = await MockStrategy.deploy(await usdc.getAddress());
        const mockBuffer = await MockStrategy.deploy(await usdc.getAddress());
        await mockStaking.waitForDeployment();
        await mockBuffer.waitForDeployment();

        // Deploy mock brain and compounder
        const MockSimple = await ethers.getContractFactory("MockSimple");
        const mockBrain = await MockSimple.deploy();
        const mockCompounder = await MockSimple.deploy();
        await mockBrain.waitForDeployment();
        await mockCompounder.waitForDeployment();

        // Deploy APEXVault
        const APEXVault = await ethers.getContractFactory("APEXVault");
        const vault = await APEXVault.deploy(
            await usdc.getAddress(),
            await mockBrain.getAddress(),
            await mockCompounder.getAddress(),
            await mockStaking.getAddress(),
            await mockBuffer.getAddress(),
            treasury.address
        );
        await vault.waitForDeployment();

        // Mint USDC to users
        const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDC
        await usdc.mint(user1.address, mintAmount);
        await usdc.mint(user2.address, mintAmount);

        return { vault, usdc, mockStaking, mockBuffer, mockBrain, mockCompounder, owner, user1, user2, treasury };
    }

    describe("constructor", function () {
        it("should set correct immutables", async function () {
            const { vault, usdc, mockBrain, mockCompounder, mockStaking, mockBuffer, treasury } = await loadFixture(deployVaultFixture);

            expect(await vault.asset()).to.equal(await usdc.getAddress());
            expect(await vault.brain()).to.equal(await mockBrain.getAddress());
            expect(await vault.compounder()).to.equal(await mockCompounder.getAddress());
            expect(await vault.stakingStrategy()).to.equal(await mockStaking.getAddress());
            expect(await vault.bufferStrategy()).to.equal(await mockBuffer.getAddress());
            expect(await vault.treasury()).to.equal(treasury.address);
        });

        it("should revert on zero addresses", async function () {
            const APEXVault = await ethers.getContractFactory("APEXVault");
            await expect(
                APEXVault.deploy(ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress, ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(APEXVault, "ZeroAddress");
        });
    });

    describe("constants", function () {
        it("should have correct EXIT_FEE_BPS", async function () {
            const { vault } = await loadFixture(deployVaultFixture);
            expect(await vault.EXIT_FEE_BPS()).to.equal(10);
        });

        it("should have correct MIN_DEPOSIT", async function () {
            const { vault } = await loadFixture(deployVaultFixture);
            expect(await vault.MIN_DEPOSIT()).to.equal(1_000_000n); // 1 USDC
        });

        it("should have correct BPS", async function () {
            const { vault } = await loadFixture(deployVaultFixture);
            expect(await vault.BPS()).to.equal(10_000);
        });
    });

    describe("deposit", function () {
        it("should revert when deposit is below minimum", async function () {
            const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
            const tooSmall = 500_000n; // 0.5 USDC
            await usdc.connect(user1).approve(await vault.getAddress(), tooSmall);

            await expect(
                vault.connect(user1).deposit(tooSmall, user1.address)
            ).to.be.revertedWithCustomError(vault, "BelowMinDeposit");
        });

        it("should mint shares on valid deposit", async function () {
            const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
            const amount = ethers.parseUnits("100", 6); // 100 USDC
            await usdc.connect(user1).approve(await vault.getAddress(), amount);

            await vault.connect(user1).deposit(amount, user1.address);

            const shares = await vault.balanceOf(user1.address);
            expect(shares).to.be.gt(0);
        });

        it("should emit Deposited event", async function () {
            const { vault, usdc, user1 } = await loadFixture(deployVaultFixture);
            const amount = ethers.parseUnits("100", 6);
            await usdc.connect(user1).approve(await vault.getAddress(), amount);

            await expect(vault.connect(user1).deposit(amount, user1.address))
                .to.emit(vault, "Deposited");
        });

        it("should route deposit to staking strategy", async function () {
            const { vault, usdc, mockStaking, user1 } = await loadFixture(deployVaultFixture);
            const amount = ethers.parseUnits("100", 6);
            await usdc.connect(user1).approve(await vault.getAddress(), amount);

            await vault.connect(user1).deposit(amount, user1.address);

            // USDC should have been transferred to staking strategy
            const strategyBalance = await usdc.balanceOf(await mockStaking.getAddress());
            expect(strategyBalance).to.equal(amount);
        });
    });

    describe("pricePerShare", function () {
        it("should return 1e6 when no deposits", async function () {
            const { vault } = await loadFixture(deployVaultFixture);
            expect(await vault.pricePerShare()).to.equal(1_000_000n);
        });
    });

    describe("hedgeSnapshot", function () {
        it("should revert recordHedgeSnapshot from non-compounder", async function () {
            const { vault, user1 } = await loadFixture(deployVaultFixture);
            await expect(
                vault.connect(user1).recordHedgeSnapshot(100, 200, 6000)
            ).to.be.revertedWithCustomError(vault, "NotCompounder");
        });

        it("should record snapshot from compounder", async function () {
            const { vault, mockCompounder } = await loadFixture(deployVaultFixture);
            // We need to call from the compounder address
            // Since mockCompounder is a contract, we impersonate it
            const compAddr = await mockCompounder.getAddress();
            await ethers.provider.send("hardhat_impersonateAccount", [compAddr]);
            const compSigner = await ethers.getSigner(compAddr);

            // Fund compounder with ETH for gas
            const [deployer] = await ethers.getSigners();
            await deployer.sendTransaction({ to: compAddr, value: ethers.parseEther("1") });

            await vault.connect(compSigner).recordHedgeSnapshot(
                100_000n,  // IL: $0.10
                200_000n,  // Buffer: $0.20
                6000       // 60% staking
            );

            expect(await vault.hedgeHistoryLength()).to.equal(1);

            const snapshot = await vault.latestHedgeSnapshot();
            expect(snapshot.ilAmount).to.equal(100_000n);
            expect(snapshot.hedgeBuffer).to.equal(200_000n);
            expect(snapshot.stakingBps).to.equal(6000);
            // efficiency = 200000 * 10000 / 100000 = 20000
            expect(snapshot.hedgeEfficiency).to.equal(20_000n);

            await ethers.provider.send("hardhat_stopImpersonatingAccount", [compAddr]);
        });

        it("should set efficiency to BPS when IL is zero", async function () {
            const { vault, mockCompounder } = await loadFixture(deployVaultFixture);
            const compAddr = await mockCompounder.getAddress();
            await ethers.provider.send("hardhat_impersonateAccount", [compAddr]);
            const compSigner = await ethers.getSigner(compAddr);
            const [deployer] = await ethers.getSigners();
            await deployer.sendTransaction({ to: compAddr, value: ethers.parseEther("1") });

            await vault.connect(compSigner).recordHedgeSnapshot(0, 200_000n, 6000);

            const snapshot = await vault.latestHedgeSnapshot();
            expect(snapshot.hedgeEfficiency).to.equal(10_000n); // BPS = no IL
            await ethers.provider.send("hardhat_stopImpersonatingAccount", [compAddr]);
        });

        it("should emit HedgeSnapshotRecorded event", async function () {
            const { vault, mockCompounder } = await loadFixture(deployVaultFixture);
            const compAddr = await mockCompounder.getAddress();
            await ethers.provider.send("hardhat_impersonateAccount", [compAddr]);
            const compSigner = await ethers.getSigner(compAddr);
            const [deployer] = await ethers.getSigners();
            await deployer.sendTransaction({ to: compAddr, value: ethers.parseEther("1") });

            await expect(
                vault.connect(compSigner).recordHedgeSnapshot(100_000n, 200_000n, 6000)
            ).to.emit(vault, "HedgeSnapshotRecorded");

            await ethers.provider.send("hardhat_stopImpersonatingAccount", [compAddr]);
        });

        it("should revert latestHedgeSnapshot when no snapshots exist", async function () {
            const { vault } = await loadFixture(deployVaultFixture);
            await expect(vault.latestHedgeSnapshot()).to.be.reverted;
        });
    });

    describe("emergency", function () {
        it("should allow owner to pause", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);
            await vault.connect(owner).emergencyPause();
            expect(await vault.paused()).to.be.true;
        });

        it("should block deposits when paused", async function () {
            const { vault, usdc, owner, user1 } = await loadFixture(deployVaultFixture);
            await vault.connect(owner).emergencyPause();

            const amount = ethers.parseUnits("100", 6);
            await usdc.connect(user1).approve(await vault.getAddress(), amount);

            await expect(
                vault.connect(user1).deposit(amount, user1.address)
            ).to.be.reverted;
        });

        it("should not allow non-owner to pause", async function () {
            const { vault, user1 } = await loadFixture(deployVaultFixture);
            await expect(
                vault.connect(user1).emergencyPause()
            ).to.be.reverted;
        });
    });
});
