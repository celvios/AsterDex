"use client";

import { useReadContract, useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { APEX_VAULT_ABI, getVaultAddress } from "@/lib/contracts";
import { useAsterDEX } from "@/hooks/useAsterDEX";

export function VaultStats() {
    const address = getVaultAddress();
    const { address: userAddress } = useAccount();

    const { data: totalAssets } = useReadContract({
        address,
        abi: APEX_VAULT_ABI,
        functionName: "totalAssets",
    }) as { data: bigint | undefined };

    const { data: pricePerShare } = useReadContract({
        address,
        abi: APEX_VAULT_ABI,
        functionName: "pricePerShare",
    }) as { data: bigint | undefined };

    const { data: userShares } = useReadContract({
        address,
        abi: APEX_VAULT_ABI,
        functionName: "balanceOf",
        args: userAddress ? [userAddress] : undefined,
    }) as { data: bigint | undefined };

    // Format values
    const tvl = totalAssets ? Number(formatUnits(totalAssets, 6)) : 0;
    const pps = pricePerShare ? Number(formatUnits(pricePerShare, 6)) : 1;
    const shares = userShares ? Number(formatUnits(userShares, 6)) : 0;
    const userBalance = shares * pps;
    const userYield = userBalance > 0 ? userBalance - shares : 0; // shares at entry = 1:1

    // Estimated blended APY (asBNB ~30% × staking% + asUSDF ~3.6% × buffer%)
    // Get live live data from AsterDEX directly
    const { blendedAPY } = useAsterDEX();

    return (
        <div className="stats-bar animate-in" style={{ animationDelay: "0.1s" }}>
            <div className="stat-pill glass-card">
                <div className="stat-label">TVL</div>
                <div className="stat-value">${tvl.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="stat-pill glass-card">
                <div className="stat-label">Blended APY</div>
                <div className="stat-value" style={{ color: "var(--green)" }}>
                    {blendedAPY.toFixed(1)}%
                </div>
            </div>
            <div className="stat-pill glass-card">
                <div className="stat-label">Your Balance</div>
                <div className="stat-value">
                    {userAddress ? `$${userBalance.toFixed(2)}` : "—"}
                </div>
            </div>
            <div className="stat-pill glass-card">
                <div className="stat-label">Your Yield</div>
                <div className="stat-value" style={{ color: userYield > 0 ? "var(--green)" : undefined }}>
                    {userAddress ? `$${userYield.toFixed(2)}` : "—"}
                </div>
            </div>
        </div>
    );
}
