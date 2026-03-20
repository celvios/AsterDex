"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { APEX_VAULT_ABI, getVaultAddress } from "@/lib/contracts";
import { LIVE_ADDRESSES } from "@/lib/addresses";

const USDC_DECIMALS = 6;
const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "56");

const ERC20_ABI = [
    { name: "allowance", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
    { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

export function DepositWidget() {
    const [amount, setAmount] = useState("");
    const [step, setStep] = useState<"idle" | "approving" | "depositing">("idle");

    const { address: userAddress, isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const isCorrectChain = chainId === TARGET_CHAIN_ID;

    const vaultAddress = getVaultAddress();
    const usdcAddress = LIVE_ADDRESSES.USDC as `0x${string}`;

    // Read price per share for preview
    const { data: pricePerShare } = useReadContract({
        address: vaultAddress,
        abi: APEX_VAULT_ABI,
        functionName: "pricePerShare",
    }) as { data: bigint | undefined };

    // Read current allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: userAddress ? [userAddress, vaultAddress] : undefined,
        query: { enabled: !!userAddress },
    }) as { data: bigint | undefined; refetch: () => void };

    // Approve tx
    const {
        writeContract: writeApprove,
        data: approveTxHash,
        isPending: isApprovePending,
        reset: resetApprove,
    } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveTxHash,
    });

    // Deposit tx
    const {
        writeContract: writeDeposit,
        data: depositTxHash,
        isPending: isDepositPending,
        reset: resetDeposit,
    } = useWriteContract();
    const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
        hash: depositTxHash,
    });

    const parsedAmount = amount ? parseUnits(amount, USDC_DECIMALS) : 0n;
    const pps = pricePerShare ? Number(formatUnits(pricePerShare, USDC_DECIMALS)) : 1;
    const sharesPreview = amount ? (Number(amount) / pps).toFixed(4) : "0.0000";

    const needsApproval = allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount;
    const isLoading = isApprovePending || isApproveConfirming || isDepositPending || isDepositConfirming;

    // After approve confirms, automatically fire the deposit
    useEffect(() => {
        if (isApproveSuccess && step === "approving") {
            refetchAllowance();
            setStep("depositing");
            writeDeposit({
                address: vaultAddress,
                abi: APEX_VAULT_ABI,
                functionName: "deposit",
                args: [parsedAmount, userAddress!],
            });
        }
    }, [isApproveSuccess, step]);

    // After deposit confirms, reset
    useEffect(() => {
        if (isDepositSuccess && step === "depositing") {
            setStep("idle");
        }
    }, [isDepositSuccess, step]);

    const handleDeposit = () => {
        if (!isConnected) return;
        if (!isCorrectChain && switchChain) {
            switchChain({ chainId: TARGET_CHAIN_ID });
            return;
        }
        if (!userAddress || parsedAmount === 0n) return;

        // Reset any previous tx state
        resetApprove();
        resetDeposit();

        if (needsApproval) {
            // Step 1: Approve
            setStep("approving");
            writeApprove({
                address: usdcAddress,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [vaultAddress, maxUint256],
            });
        } else {
            // Already approved — go straight to deposit
            setStep("depositing");
            writeDeposit({
                address: vaultAddress,
                abi: APEX_VAULT_ABI,
                functionName: "deposit",
                args: [parsedAmount, userAddress],
            });
        }
    };

    // Button label
    const getButtonLabel = () => {
        if (!isConnected) return "Connect Wallet";
        if (!isCorrectChain) return "Switch Network";
        if (isDepositSuccess) return "✓ Deposited";
        if (isDepositPending || isDepositConfirming) return "Depositing...";
        if (isApprovePending || isApproveConfirming) return "Approving USDC...";
        if (needsApproval) return "Approve & Deposit";
        return "Deposit";
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
                className={`widget-btn ${isLoading ? "loading" : ""} ${isDepositSuccess ? "success" : ""} ${!isCorrectChain ? "wrong-network" : ""}`}
                onClick={handleDeposit}
                disabled={!isConnected ? false : (!isCorrectChain ? false : (isLoading || !amount || Number(amount) < 1))}
            >
                {getButtonLabel()}
            </button>
        </div>
    );
}
