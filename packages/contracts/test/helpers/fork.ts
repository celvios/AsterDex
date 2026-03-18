import { ethers } from "hardhat";
import { ADDRESSES } from "../../config/addresses";

export const USDC_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

/// @notice Fund an address with USDC by impersonating a whale
export async function fundWithUSDC(recipient: string, amount: bigint) {
    await ethers.provider.send("hardhat_impersonateAccount", [USDC_WHALE]);
    const whale = await ethers.getSigner(USDC_WHALE);

    // Fund whale with ETH for gas
    const [deployer] = await ethers.getSigners();
    await deployer.sendTransaction({
        to: USDC_WHALE,
        value: ethers.parseEther("1.0"),
    });

    const usdc = await ethers.getContractAt("IERC20", ADDRESSES[56].USDC, whale);
    await usdc.transfer(recipient, amount);
    await ethers.provider.send("hardhat_stopImpersonatingAccount", [USDC_WHALE]);
}

/// @notice Advance time by a number of seconds
export async function advanceTime(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
}

/// @notice Advance time by a number of days
export async function advanceDays(days: number) {
    await advanceTime(days * 24 * 60 * 60);
}

/// @notice Advance time by a number of hours
export async function advanceHours(hours: number) {
    await advanceTime(hours * 60 * 60);
}

/// @notice Mine a specific number of blocks
export async function mineBlocks(count: number) {
    for (let i = 0; i < count; i++) {
        await ethers.provider.send("evm_mine", []);
    }
}
