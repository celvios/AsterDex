import { ethers } from "hardhat";
import { ADDRESSES } from "../config/addresses";

async function main() {
    const [deployer] = await ethers.getSigners();
    const addrs = ADDRESSES[56];

    console.log("Deploying APEX Protocol with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
    console.log("");

    // ── Step 1: Deploy StakingStrategy ────────────────────────────
    console.log("1. Deploying StakingStrategy...");
    const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
    const stakingStrategy = await StakingStrategy.deploy(
        ethers.ZeroAddress, // vault — set after vault deploy
        ethers.ZeroAddress, // compounder — set after compounder deploy
        addrs.USDC,
        addrs.ASBNB,
        addrs.ASBNB_MINTER,
        addrs.WBNB,
        addrs.PANCAKE_ROUTER
    );
    await stakingStrategy.waitForDeployment();
    const m1 = await stakingStrategy.getAddress();
    console.log("   StakingStrategy deployed:", m1);

    // ── Step 2: Deploy BufferStrategy ────────────────────────────
    console.log("2. Deploying BufferStrategy...");
    const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
    const bufferStrategy = await BufferStrategy.deploy(
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        addrs.USDC,
        addrs.ASUSDF,
        addrs.ASUSDF_MINTER,
        addrs.USDF,
        addrs.PANCAKE_ROUTER
    );
    await bufferStrategy.waitForDeployment();
    const m2 = await bufferStrategy.getAddress();
    console.log("   BufferStrategy deployed:", m2);

    // ── Step 3: Deploy APEXBrain ─────────────────────────────────
    console.log("3. Deploying APEXBrain...");
    const APEXBrain = await ethers.getContractFactory("APEXBrain");
    const brain = await APEXBrain.deploy(
        ethers.ZeroAddress, // vault
        m1,
        m2,
        ethers.ZeroAddress  // compounder
    );
    await brain.waitForDeployment();
    const brainAddr = await brain.getAddress();
    console.log("   APEXBrain deployed:", brainAddr);

    // ── Step 4: Deploy APEXCompounder ────────────────────────────
    console.log("4. Deploying APEXCompounder...");
    const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
    const compounder = await APEXCompounder.deploy(
        ethers.ZeroAddress, // vault
        brainAddr,
        m1,
        m2,
        addrs.USDC,
        addrs.WBNB,
        addrs.USDF,
        addrs.ASBNB,
        addrs.ASBNB_MINTER,
        addrs.ASUSDF_MINTER,
        addrs.PANCAKE_ROUTER
    );
    await compounder.waitForDeployment();
    const compAddr = await compounder.getAddress();
    console.log("   APEXCompounder deployed:", compAddr);

    // ── Step 5: Deploy APEXVault ─────────────────────────────────
    console.log("5. Deploying APEXVault...");
    const APEXVault = await ethers.getContractFactory("APEXVault");
    const vault = await APEXVault.deploy(
        addrs.USDC,
        brainAddr,
        compAddr,
        m1,
        m2,
        addrs.TREASURY
    );
    await vault.waitForDeployment();
    const vaultAddr = await vault.getAddress();
    console.log("   APEXVault deployed:", vaultAddr);

    // ── Step 6: Wire references ──────────────────────────────────
    // TODO: Add setter functions to strategies/brain/compounder for vault wiring
    console.log("");
    console.log("6. TODO: Wire vault and compounder references");
    console.log("   brain.setVault(vault)");
    console.log("   brain.setCompounder(compounder)");
    console.log("   compounder.setVault(vault)");
    console.log("   stakingStrategy.setVault(vault)");
    console.log("   stakingStrategy.setCompounder(compounder)");
    console.log("   bufferStrategy.setVault(vault)");
    console.log("   bufferStrategy.setCompounder(compounder)");

    // ── Summary ──────────────────────────────────────────────────
    console.log("");
    console.log("═══════════════════════════════════════");
    console.log("  APEX Protocol — Deployment Summary");
    console.log("═══════════════════════════════════════");
    console.log(`  Vault:            ${vaultAddr}`);
    console.log(`  Brain:            ${brainAddr}`);
    console.log(`  Compounder:       ${compAddr}`);
    console.log(`  StakingStrategy:  ${m1}`);
    console.log(`  BufferStrategy:   ${m2}`);
    console.log("═══════════════════════════════════════");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
