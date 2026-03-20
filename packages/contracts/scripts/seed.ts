import { ethers } from "hardhat";
import { ADDRESSES } from "../config/addresses";

/**
 * Seed script — fork BNB mainnet, impersonate a USDC whale,
 * and transfer USDC to your account for testing.
 *
 * ── How to use ──────────────────────────────────────────────
 *
 * Option A: Hardhat default account (no .env needed)
 *   Terminal 1:  FORK=true npx hardhat node
 *   Terminal 2:  npx hardhat run scripts/seed.ts --network localhost
 *
 * Option B: Your imported private key from .env
 *   Set PRIVATE_KEY in your .env file, then:
 *   Terminal 1:  FORK=true npx hardhat node
 *   Terminal 2:  SEED_TO=0xYourAddress npx hardhat run scripts/seed.ts --network localhost
 *
 * Option C: Quick one-shot (no persistent node)
 *   FORK=true npx hardhat run scripts/seed.ts
 *   (runs on an ephemeral fork — good for verifying whale has USDC)
 */
async function main() {
    const addrs = ADDRESSES[56];

    // ── Determine recipient ─────────────────────────────────
    // Priority: SEED_TO env var → first Hardhat signer
    const [defaultSigner] = await ethers.getSigners();
    const recipient = process.env.SEED_TO || defaultSigner.address;

    // ── USDC whale — Binance Hot Wallet 14 ──────────────────
    const WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

    console.log("");
    console.log("═══════════════════════════════════════");
    console.log("  APEX — Mainnet Fork Seeder");
    console.log("═══════════════════════════════════════");
    console.log(`  Chain:     BNB Chain (fork)`);
    console.log(`  Recipient: ${recipient}`);
    console.log(`  Whale:     ${WHALE}`);
    console.log("");

    // ── Step 1: Impersonate whale ───────────────────────────
    await ethers.provider.send("hardhat_impersonateAccount", [WHALE]);

    // Fund whale with BNB for gas (Hardhat gives default signers 10k ETH)
    await defaultSigner.sendTransaction({
        to: WHALE,
        value: ethers.parseEther("1"),
    });

    const whale = await ethers.getSigner(WHALE);
    const usdc = new ethers.Contract(addrs.USDC, [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
    ], whale);

    const decimals = await usdc.decimals();
    const symbol = await usdc.symbol();

    // ── Step 2: Show whale balance ──────────────────────────
    const whaleBalance = await usdc.balanceOf(WHALE);
    console.log(`  Whale ${symbol} balance: ${ethers.formatUnits(whaleBalance, decimals)}`);

    if (whaleBalance === 0n) {
        console.error("  ❌ Whale has no USDC — fork may not be working correctly");
        process.exit(1);
    }

    // ── Step 3: Transfer USDC ───────────────────────────────
    const amount = ethers.parseUnits("10000", decimals); // 10,000 USDC
    const tx = await usdc.transfer(recipient, amount);
    await tx.wait();
    console.log(`  ✓ Transferred 10,000 ${symbol} to recipient`);

    // ── Step 4: Check recipient balance ─────────────────────
    const recipientBalance = await usdc.balanceOf(recipient);
    const recipientBNB = await ethers.provider.getBalance(recipient);

    // ── Step 5: Stop impersonation ──────────────────────────
    await ethers.provider.send("hardhat_stopImpersonatingAccount", [WHALE]);

    // ── Summary ─────────────────────────────────────────────
    console.log("");
    console.log("═══════════════════════════════════════");
    console.log("  ✅ Account Seeded Successfully");
    console.log("═══════════════════════════════════════");
    console.log(`  Account:    ${recipient}`);
    console.log(`  USDC:       ${ethers.formatUnits(recipientBalance, decimals)} ${symbol}`);
    console.log(`  BNB:        ${ethers.formatEther(recipientBNB)}`);
    console.log("═══════════════════════════════════════");
    console.log("");
    console.log("  Next: deposit via dashboard or run tests");
    console.log("");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
