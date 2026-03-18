"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { APEX_VAULT_ABI, getVaultAddress } from "@/lib/contracts";

const USDC_DECIMALS = 6;

export function WithdrawWidget() {
    const [amount, setAmount] = useState("");
    const { address: userAddress, isConnected } = useAccount();
    const vaultAddress = getVaultAddress();

    const { data: userShares } = useReadContract({
        address: vaultAddress,
        abi: APEX_VAULT_ABI,
        functionName: "balanceOf",
        args: userAddress ? [userAddress] : undefined,
    }) as { data: bigint | undefined };

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const isLoading = isPending || isConfirming;
    const maxWithdraw = userShares ? formatUnits(userShares, USDC_DECIMALS) : "0";

    // Exit fee preview (0.1%)
    const fee = amount ? (Number(amount) * 0.001).toFixed(4) : "0.00";
    const net = amount ? (Number(amount) * 0.999).toFixed(4) : "0.00";

    const handleWithdraw = () => {
        if (!userAddress || !amount) return;
        const parsedAmount = parseUnits(amount, USDC_DECIMALS);
        writeContract({
            address: vaultAddress,
            abi: APEX_VAULT_ABI,
            functionName: "withdraw",
            args: [parsedAmount, userAddress, userAddress],
        });
    };

    return (
        <div className="widget glass-card animate-in" style={{ animationDelay: "0.35s" }}>
            <div className="widget-title">Withdraw USDC</div>

            <div className="widget-input-group">
                <label className="widget-input-label" htmlFor="withdraw-amount">
                    Amount (USDC) — Max: {Number(maxWithdraw).toFixed(2)}
                </label>
                <input
                    id="withdraw-amount"
                    className="widget-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div className="widget-preview">
                {amount
                    ? `You receive ≈ $${net} USDC (${fee} USDC fee)`
                    : "Enter an amount to see preview"}
            </div>

            <button
                className={`widget-btn ${isLoading ? "loading" : ""} ${isSuccess ? "success" : ""}`}
                onClick={handleWithdraw}
                disabled={!isConnected || isLoading || !amount || Number(amount) <= 0}
            >
                {isSuccess ? "✓ Withdrawn" : isLoading ? "Withdrawing..." : !isConnected ? "Connect Wallet" : "Withdraw"}
            </button>
        </div>
    );
}
