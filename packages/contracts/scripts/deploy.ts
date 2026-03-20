import { ethers } from "hardhat";
import { ADDRESSES } from "../config/addresses";

/**
 * APEX Protocol — Mainnet Deployment
 *
 * All contracts use immutable constructor args and revert on address(0).
 * We precompute all 5 addresses using the deployer nonce before deploying
 * anything, so every constructor gets the real final address.
 *
 * Deploy order matches nonce prediction:
 *   nonce+0 → StakingStrategy
 *   nonce+1 → BufferStrategy
 *   nonce+2 → APEXBrain
 *   nonce+3 → APEXCompounder
 *   nonce+4 → APEXVault
 */
async function main() {
    const [deployer] = await ethers.getSigners();
    const addrs = ADDRESSES[56];
    const deployerAddr = deployer.address;

    console.log("Deploying APEX Protocol with account:", deployerAddr);
    const balance = await ethers.provider.getBalance(deployerAddr);
    console.log("Account balance:", ethers.formatEther(balance), "BNB");
    console.log("");

    // ── Precompute all 5 addresses from deployer nonce ──────────
    const nonce = await ethers.provider.getTransactionCount(deployerAddr);
    console.log("Current deployer nonce:", nonce);

    const stakingAddr    = ethers.getCreateAddress({ from: deployerAddr, nonce: nonce });
    const bufferAddr     = ethers.getCreateAddress({ from: deployerAddr, nonce: nonce + 1 });
    const brainAddr      = ethers.getCreateAddress({ from: deployerAddr, nonce: nonce + 2 });
    const compounderAddr = ethers.getCreateAddress({ from: deployerAddr, nonce: nonce + 3 });
    const vaultAddr      = ethers.getCreateAddress({ from: deployerAddr, nonce: nonce + 4 });

    console.log("Precomputed addresses:");
    console.log("  StakingStrategy:", stakingAddr);
    console.log("  BufferStrategy: ", bufferAddr);
    console.log("  APEXBrain:      ", brainAddr);
    console.log("  APEXCompounder: ", compounderAddr);
    console.log("  APEXVault:      ", vaultAddr);
    console.log("");

    // ── Step 1: Deploy StakingStrategy (nonce+0) ────────────────
    console.log("1/5 Deploying StakingStrategy...");
    const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
    const stakingStrategy = await StakingStrategy.deploy(
        vaultAddr,        // precomputed
        compounderAddr,   // precomputed
        addrs.USDC,
        addrs.ASBNB,
        addrs.ASBNB_MINTER,
        addrs.WBNB,
        addrs.PANCAKE_ROUTER
    );
    await stakingStrategy.waitForDeployment();
    const deployed1 = await stakingStrategy.getAddress();
    if (deployed1.toLowerCase() !== stakingAddr.toLowerCase()) {
        throw new Error(`StakingStrategy address mismatch: expected ${stakingAddr}, got ${deployed1}`);
    }
    console.log("   ✓ StakingStrategy:", deployed1);

    // ── Step 2: Deploy BufferStrategy (nonce+1) ─────────────────
    console.log("2/5 Deploying BufferStrategy...");
    const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
    const bufferStrategy = await BufferStrategy.deploy(
        vaultAddr,        // precomputed
        compounderAddr,   // precomputed
        addrs.USDC,
        addrs.ASUSDF,
        addrs.ASUSDF_MINTER,
        addrs.USDF,
        addrs.PANCAKE_ROUTER
    );
    await bufferStrategy.waitForDeployment();
    const deployed2 = await bufferStrategy.getAddress();
    if (deployed2.toLowerCase() !== bufferAddr.toLowerCase()) {
        throw new Error(`BufferStrategy address mismatch: expected ${bufferAddr}, got ${deployed2}`);
    }
    console.log("   ✓ BufferStrategy:", deployed2);

    // ── Step 3: Deploy APEXBrain (nonce+2) ───────────────────────
    console.log("3/5 Deploying APEXBrain...");
    const APEXBrain = await ethers.getContractFactory("APEXBrain");
    const brain = await APEXBrain.deploy(
        vaultAddr,        // precomputed
        stakingAddr,      // already deployed
        bufferAddr,       // already deployed
        compounderAddr    // precomputed
    );
    await brain.waitForDeployment();
    const deployed3 = await brain.getAddress();
    if (deployed3.toLowerCase() !== brainAddr.toLowerCase()) {
        throw new Error(`APEXBrain address mismatch: expected ${brainAddr}, got ${deployed3}`);
    }
    console.log("   ✓ APEXBrain:", deployed3);

    // ── Step 4: Deploy APEXCompounder (nonce+3) ──────────────────
    console.log("4/5 Deploying APEXCompounder...");
    const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
    const compounder = await APEXCompounder.deploy(
        vaultAddr,        // precomputed
        brainAddr,        // already deployed
        stakingAddr,      // already deployed
        bufferAddr,       // already deployed
        addrs.USDC,
        addrs.WBNB,
        addrs.USDF,
        addrs.ASBNB,
        addrs.ASBNB_MINTER,
        addrs.ASUSDF_MINTER,
        addrs.PANCAKE_ROUTER
    );
    await compounder.waitForDeployment();
    const deployed4 = await compounder.getAddress();
    if (deployed4.toLowerCase() !== compounderAddr.toLowerCase()) {
        throw new Error(`APEXCompounder address mismatch: expected ${compounderAddr}, got ${deployed4}`);
    }
    console.log("   ✓ APEXCompounder:", deployed4);

    // ── Step 5: Deploy APEXVault (nonce+4) ───────────────────────
    console.log("5/5 Deploying APEXVault...");
    const APEXVault = await ethers.getContractFactory("APEXVault");
    const vault = await APEXVault.deploy(
        addrs.USDC,
        brainAddr,        // already deployed
        compounderAddr,   // already deployed
        stakingAddr,      // already deployed
        bufferAddr,       // already deployed
        addrs.TREASURY
    );
    await vault.waitForDeployment();
    const deployed5 = await vault.getAddress();
    if (deployed5.toLowerCase() !== vaultAddr.toLowerCase()) {
        throw new Error(`APEXVault address mismatch: expected ${vaultAddr}, got ${deployed5}`);
    }
    console.log("   ✓ APEXVault:", deployed5);

    // ── Summary ──────────────────────────────────────────────────
    console.log("");
    console.log("═══════════════════════════════════════════════════");
    console.log("  APEX Protocol — Deployment Complete ✅");
    console.log("═══════════════════════════════════════════════════");
    console.log(`  Vault:            ${deployed5}`);
    console.log(`  Brain:            ${deployed3}`);
    console.log(`  Compounder:       ${deployed4}`);
    console.log(`  StakingStrategy:  ${deployed1}`);
    console.log(`  BufferStrategy:   ${deployed2}`);
    console.log("═══════════════════════════════════════════════════");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Verify contracts on BscScan:");
    console.log(`     npx hardhat verify --network bsc ${deployed5} ${addrs.USDC} ${deployed3} ${deployed4} ${deployed1} ${deployed2} ${addrs.TREASURY}`);
    console.log(`     npx hardhat verify --network bsc ${deployed3} ${deployed5} ${deployed1} ${deployed2} ${deployed4}`);
    console.log("  2. Update .env with deployed addresses");
    console.log("  3. Re-deploy subgraph with real addresses");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
