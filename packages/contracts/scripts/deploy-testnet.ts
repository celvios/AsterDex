/**
 * APEX Protocol — BSC Testnet Deployment (Task 5)
 *
 * Deploys all 5 APEX contracts + mock tokens + mock minters + mock router
 * to BSC Testnet (chainId 97).
 *
 * Run:
 *   npx hardhat run scripts/deploy-testnet.ts --network bscTestnet
 *
 * Required env vars:
 *   PRIVATE_KEY      — deployer wallet with tBNB
 *   BSCSCAN_API_KEY  — for contract verification
 */
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying to BSC Testnet with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "tBNB\n");

    // ── 1. Deploy mock tokens ───────────────────────────────────────
    console.log("1/10 Deploying MockERC20 (asBNB)...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockAsBNB = await MockERC20.deploy("AsterDEX asBNB (Mock)", "asBNB", 18);
    await mockAsBNB.waitForDeployment();
    const asBNBAddr = await mockAsBNB.getAddress();
    console.log("   ✓ Mock asBNB:", asBNBAddr);

    console.log("2/10 Deploying MockERC20 (asUSDF)...");
    const mockAsUSDF = await MockERC20.deploy("AsterDEX asUSDF (Mock)", "asUSDF", 18);
    await mockAsUSDF.waitForDeployment();
    const asUSDFAddr = await mockAsUSDF.getAddress();
    console.log("   ✓ Mock asUSDF:", asUSDFAddr);

    console.log("3/10 Deploying MockERC20 (USDF)...");
    const mockUSDF = await MockERC20.deploy("AsterDEX USDF (Mock)", "USDF", 18);
    await mockUSDF.waitForDeployment();
    const usdfAddr = await mockUSDF.getAddress();
    console.log("   ✓ Mock USDF:", usdfAddr);

    console.log("4/10 Deploying MockERC20 (USDC)...");
    const mockUSDC = await MockERC20.deploy("USD Coin (Mock)", "USDC", 6);
    await mockUSDC.waitForDeployment();
    const usdcAddr = await mockUSDC.getAddress();
    console.log("   ✓ Mock USDC:", usdcAddr);

    console.log("5/10 Deploying MockERC20 (WBNB)...");
    const mockWBNB = await MockERC20.deploy("Wrapped BNB (Mock)", "WBNB", 18);
    await mockWBNB.waitForDeployment();
    const wbnbAddr = await mockWBNB.getAddress();
    console.log("   ✓ Mock WBNB:", wbnbAddr);

    // ── 2. Deploy mock minters ──────────────────────────────────────
    console.log("6/10 Deploying MockAsBNBMinter...");
    const MockAsBNBMinter = await ethers.getContractFactory("MockAsBNBMinter");
    const mockAsBNBMinter = await MockAsBNBMinter.deploy(asBNBAddr);
    await mockAsBNBMinter.waitForDeployment();
    const asBNBMinterAddr = await mockAsBNBMinter.getAddress();
    await mockAsBNB.mint(asBNBMinterAddr, ethers.parseEther("1000000"));
    console.log("   ✓ MockAsBNBMinter:", asBNBMinterAddr);

    console.log("7/10 Deploying MockAsUSDFMinter...");
    const MockAsUSDFMinter = await ethers.getContractFactory("MockAsUSDFMinter");
    const mockAsUSDFMinter = await MockAsUSDFMinter.deploy(asUSDFAddr, usdfAddr);
    await mockAsUSDFMinter.waitForDeployment();
    const asUSDFMinterAddr = await mockAsUSDFMinter.getAddress();
    await mockAsUSDF.mint(asUSDFMinterAddr, ethers.parseEther("10000000"));
    console.log("   ✓ MockAsUSDFMinter:", asUSDFMinterAddr);

    // ── 3. Deploy MockPancakeRouter ─────────────────────────────────
    console.log("8/10 Deploying MockPancakeRouter...");
    const MockPancakeRouter = await ethers.getContractFactory("MockPancakeRouter");
    const mockRouter = await MockPancakeRouter.deploy();
    await mockRouter.waitForDeployment();
    const routerAddr = await mockRouter.getAddress();

    // Pre-fund router with USDC, WBNB, USDF so swaps work
    await mockUSDC.mint(routerAddr, ethers.parseUnits("10000000", 6));  // 10M USDC
    await mockUSDF.mint(routerAddr, ethers.parseEther("10000000"));     // 10M USDF
    // Fund router with tBNB for BNB swaps
    const fundRouterTx = await deployer.sendTransaction({ to: routerAddr, value: ethers.parseEther("0.01") });
    await fundRouterTx.wait();
    console.log("   ✓ MockPancakeRouter:", routerAddr, "(pre-funded)");

    // ── 4. Precompute APEX contract addresses ───────────────────────
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    const stakingAddr    = ethers.getCreateAddress({ from: deployer.address, nonce });
    const bufferAddr     = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 1 });
    const brainAddr      = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 2 });
    const compounderAddr = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 3 });
    const vaultAddr      = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 4 });

    const TREASURY = deployer.address;

    // ── 5. Deploy APEX contracts ────────────────────────────────────
    console.log("\n--- Deploying APEX Protocol ---");

    console.log("9/10 Deploying StakingStrategy...");
    const StakingStrategy = await ethers.getContractFactory("StakingStrategy");
    const stakingStrategy = await StakingStrategy.deploy(
        vaultAddr, compounderAddr, usdcAddr, asBNBAddr, asBNBMinterAddr, wbnbAddr, routerAddr
    );
    await stakingStrategy.waitForDeployment();
    console.log("   ✓ StakingStrategy:", await stakingStrategy.getAddress());

    console.log("   Deploying BufferStrategy...");
    const BufferStrategy = await ethers.getContractFactory("BufferStrategy");
    const bufferStrategy = await BufferStrategy.deploy(
        vaultAddr, compounderAddr, usdcAddr, asUSDFAddr, asUSDFMinterAddr, usdfAddr, routerAddr
    );
    await bufferStrategy.waitForDeployment();
    console.log("   ✓ BufferStrategy:", await bufferStrategy.getAddress());

    console.log("   Deploying APEXBrain...");
    const APEXBrain = await ethers.getContractFactory("APEXBrain");
    const brain = await APEXBrain.deploy(vaultAddr, stakingAddr, bufferAddr, compounderAddr);
    await brain.waitForDeployment();
    console.log("   ✓ APEXBrain:", await brain.getAddress());

    console.log("   Deploying APEXCompounder...");
    const APEXCompounder = await ethers.getContractFactory("APEXCompounder");
    const compounder = await APEXCompounder.deploy(
        vaultAddr, brainAddr, stakingAddr, bufferAddr,
        usdcAddr, wbnbAddr, usdfAddr, asBNBAddr, asBNBMinterAddr, asUSDFMinterAddr, routerAddr
    );
    await compounder.waitForDeployment();
    console.log("   ✓ APEXCompounder:", await compounder.getAddress());

    console.log("10/10 Deploying APEXVault...");
    const APEXVault = await ethers.getContractFactory("APEXVault");
    const vault = await APEXVault.deploy(
        usdcAddr, brainAddr, compounderAddr, stakingAddr, bufferAddr, TREASURY
    );
    await vault.waitForDeployment();
    console.log("   ✓ APEXVault:", await vault.getAddress());

    // ── 6. Summary ──────────────────────────────────────────────────
    console.log("\n════════════════════════════════════════════════════════");
    console.log("  APEX Protocol — BSC Testnet Deployment Complete ✅");
    console.log("════════════════════════════════════════════════════════");
    console.log(`  APEXVault:           ${vaultAddr}`);
    console.log(`  APEXBrain:           ${brainAddr}`);
    console.log(`  APEXCompounder:      ${compounderAddr}`);
    console.log(`  StakingStrategy:     ${stakingAddr}`);
    console.log(`  BufferStrategy:      ${bufferAddr}`);
    console.log("────────────────────────────────────────────────────────");
    console.log(`  MockPancakeRouter:   ${routerAddr}`);
    console.log(`  MockAsBNBMinter:     ${asBNBMinterAddr}`);
    console.log(`  MockAsUSDFMinter:    ${asUSDFMinterAddr}`);
    console.log(`  Mock USDC:           ${usdcAddr}`);
    console.log(`  Mock WBNB:           ${wbnbAddr}`);
    console.log(`  Mock asBNB:          ${asBNBAddr}`);
    console.log(`  Mock asUSDF:         ${asUSDFAddr}`);
    console.log(`  Mock USDF:           ${usdfAddr}`);
    console.log("════════════════════════════════════════════════════════");
    console.log("\nPaste these into packages/frontend/.env.local:\n");
    console.log(`NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddr}`);
    console.log(`NEXT_PUBLIC_BRAIN_ADDRESS=${brainAddr}`);
    console.log(`NEXT_PUBLIC_COMPOUNDER_ADDRESS=${compounderAddr}`);
    console.log(`NEXT_PUBLIC_STAKING_STRATEGY_ADDRESS=${stakingAddr}`);
    console.log(`NEXT_PUBLIC_BUFFER_STRATEGY_ADDRESS=${bufferAddr}`);

    console.log("\n✅ Done!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
