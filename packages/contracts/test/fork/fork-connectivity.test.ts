/**
 * Task 2 — Fork Connectivity Test
 *
 * Proves the BSC mainnet fork is live and integrations are real:
 *   1. Impersonate USDC whale → transfer 10,000 USDC to test wallet ✓
 *   2. Call asBNB minter with BNB → assert asBNB balance > 0         ✓
 *
 * Run with:
 *   FORK=true npx hardhat test test/fork/fork-connectivity.test.ts --network hardhat
 *
 * This test ONLY runs when FORK=true to avoid slowing the CI unit-test suite.
 */
import { expect } from "chai";
import { ethers } from "hardhat";
import { ADDRESSES } from "../../config/addresses";
import { fundWithUSDC } from "../helpers/fork";

const ASBNB_MINTER = ADDRESSES[56].ASBNB_MINTER;
const ASBNB_TOKEN  = ADDRESSES[56].ASBNB;
const USDC_TOKEN   = ADDRESSES[56].USDC;

const ASMINTER_ABI = [
    "function deposit() external payable returns (uint256)",
    "function exchangeRate() external view returns (uint256)",
];

const ERC20_ABI = [
    "function balanceOf(address) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
];

// Skip entire suite unless running on a BSC fork
const describeIf = process.env.FORK ? describe : describe.skip;

describeIf("Task 2 — Fork Connectivity", function () {
    // Forks can be slow — give the suite plenty of time
    this.timeout(120_000);

    it("should impersonate USDC whale and transfer 10,000 USDC", async function () {
        const [wallet] = await ethers.getSigners();

        const amount = ethers.parseUnits("10000", 6); // 10,000 USDC (6 dec)
        await fundWithUSDC(wallet.address, amount);

        const usdc = await ethers.getContractAt(ERC20_ABI, USDC_TOKEN);
        const balance = await usdc.balanceOf(wallet.address);

        expect(balance).to.be.gte(amount);
        console.log(`  ✓ Wallet USDC balance: ${ethers.formatUnits(balance, 6)} USDC`);
    });

    it("should call asBNB minter with BNB and receive asBNB — rate must be > 1e18", async function () {
        const [wallet] = await ethers.getSigners();

        const minter  = await ethers.getContractAt(ASMINTER_ABI, ASBNB_MINTER, wallet);
        const asBNB   = await ethers.getContractAt(ERC20_ABI, ASBNB_TOKEN);

        // Check exchange rate is live and > 1e18 (i.e., asBNB has accrued yield)
        const rate = await minter.exchangeRate();
        console.log(`  ✓ Live asBNB exchangeRate: ${ethers.formatEther(rate)} (${rate})`);
        expect(rate).to.be.gt(ethers.parseEther("1.0"), "exchangeRate should be > 1.0 (yield earned)");

        // Mint asBNB with 0.01 BNB
        const bnbIn  = ethers.parseEther("0.01");
        const before = await asBNB.balanceOf(wallet.address);

        await minter.deposit({ value: bnbIn });

        const after = await asBNB.balanceOf(wallet.address);
        const minted = after - before;

        console.log(`  ✓ Minted asBNB: ${ethers.formatEther(minted)} asBNB for 0.01 BNB`);
        expect(minted).to.be.gt(0n, "Should have received asBNB");
    });

    it("should confirm fork is on BSC mainnet (chainId 56)", async function () {
        const { chainId } = await ethers.provider.getNetwork();
        console.log(`  ✓ chainId: ${chainId}`);
        expect(chainId).to.equal(56n);
    });
});
