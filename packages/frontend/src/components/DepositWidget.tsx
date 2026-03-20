"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { APEX_VAULT_ABI, getVaultAddress } from "@/lib/contracts";

const USDC_DECIMALS = 6;

export function DepositWidget() {
    const [amount, setAmount] = useState("");
    const { address: userAddress, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "56");
    const isCorrectChain = chainId === TARGET_CHAIN_ID;

    const vaultAddress = getVaultAddress();

    const { data: pricePerShare } = useReadContract({
        address: vaultAddress,
        abi: APEX_VAULT_ABI,
        functionName: "pricePerShare",
    }) as { data: bigint | undefined };

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const parsedAmount = amount ? parseUnits(amount, USDC_DECIMALS) : 0n;
    const pps = pricePerShare ? Number(formatUnits(pricePerShare, USDC_DECIMALS)) : 1;
    const sharesPreview = amount ? (Number(amount) / pps).toFixed(4) : "0.0000";

    const isLoading = isPending || isConfirming;

    const handleDeposit = () => {
        if (!isConnected) return;
        if (!isCorrectChain && switchChain) {
            switchChain({ chainId: TARGET_CHAIN_ID });
            return;
        }
        if (!userAddress || parsedAmount === 0n) return;
        
        writeContract({
            address: vaultAddress,
            abi: APEX_VAULT_ABI,
            functionName: "deposit",
            args: [parsedAmount, userAddress],
        });
    };

    return (
        <div className="widget glass-card animate-in" style={{ animationDelay: "0.3s" }}>
            <div className="widget-title">Deposit USDC</div>

            <div className="widget-input-group">
                <label className="widget-input-label" htmlFor="deposit-amount">
                    Amount (USDC)
                </label>
                <input
                    id="deposit-amount"
                    className="widget-input"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div className="widget-preview">
                {amount ? `You will receive ≈ ${sharesPreview} APEX-LP shares` : "Enter an amount to see preview"}
            </div>

            <button
                className={`widget-btn ${isLoading ? "loading" : ""} ${isSuccess ? "success" : ""} ${!isCorrectChain ? "wrong-network" : ""}`}
                onClick={handleDeposit}
                disabled={!isConnected ? false : (!isCorrectChain ? false : (isLoading || !amount || Number(amount) < 1))}
            >
                {!isConnected ? "Connect Wallet" : (!isCorrectChain ? "Switch Network" : (isSuccess ? "✓ Deposited" : isLoading ? "Depositing..." : "Deposit"))}
            </button>
        </div>
    );
}
