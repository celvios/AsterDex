/**
 * End-to-end testnet flow: Mint USDC → Deposit → Compound
 * Run: npx hardhat run scripts/test-flow.ts --network bscTestnet
 */
import { ethers } from "hardhat";

// ── Latest deploy (deploy #3) ────────────────────────────────────
const USDC_ADDR       = "0x318Fb4316C0B93B49b2547F9336D919A64c2C1e2";
const VAULT_ADDR      = "0x778e166511eF60FC1A337395FB74a395afa233FC";
const COMPOUNDER_ADDR = "0xAe0F4EE1A339a70359EA06f41964399Ab10B5206";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Running test flow with:", deployer.address);

    // 1. Mint 10,000 mock USDC
    console.log("\n1. Minting 10,000 USDC...");
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDR);
    const mintAmount = ethers.parseUnits("10000", 6);
    const tx1 = await usdc.mint(deployer.address, mintAmount);
    await tx1.wait();
    const balance = await usdc.balanceOf(deployer.address);
    console.log("   ✓ USDC balance:", ethers.formatUnits(balance, 6));

    // 2. Approve + Deposit 1,000 USDC into vault
    console.log("\n2. Depositing 1,000 USDC into vault...");
    const depositAmount = ethers.parseUnits("1000", 6);
    const tx2 = await usdc.approve(VAULT_ADDR, depositAmount);
    await tx2.wait();
    console.log("   ✓ Approved");

    const vault = await ethers.getContractAt("APEXVault", VAULT_ADDR);
    const tx3 = await vault.deposit(depositAmount, deployer.address);
    await tx3.wait();
    const shares = await vault.balanceOf(deployer.address);
    console.log("   ✓ Shares received:", ethers.formatUnits(shares, 6));

    // 3. Compound (harvests yield, records snapshot)
    console.log("\n3. Calling compound()...");
    const compounder = await ethers.getContractAt("APEXCompounder", COMPOUNDER_ADDR);
    try {
        const tx4 = await compounder.compound();
        await tx4.wait();
        console.log("   ✓ Compound successful — snapshot recorded!");
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log("   ⚠ Compound reverted (normal if no yield yet):", msg.slice(0, 200));
    }

    // 4. Check vault state
    console.log("\n4. Vault state:");
    const tvl = await vault.totalAssets();
    console.log("   TVL:", ethers.formatUnits(tvl, 6), "USDC");
    const histLen = await vault.hedgeHistoryLength();
    console.log("   Hedge snapshots:", histLen.toString());

    console.log("\n✅ Test flow complete!");
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
