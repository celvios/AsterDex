"use client";

import { useAsterDEX } from "@/hooks/useAsterDEX";
import { useReadContract, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { APEX_VAULT_ABI, APEX_COMPOUNDER_ABI, getVaultAddress, getCompounderAddress } from "@/lib/contracts";

export function LiveProtocolMetrics() {
    const { blendedAPY, ilProtectionScore, isReady } = useAsterDEX();
    const vaultAddress = getVaultAddress();
    const compounderAddress = getCompounderAddress();

    const { data: totalAssets } = useReadContract({
        address: vaultAddress,
        abi: APEX_VAULT_ABI,
        functionName: "totalAssets",
    }) as { data: bigint | undefined };

    const { data: totalCompounds } = useReadContract({
        address: compounderAddress,
        abi: APEX_COMPOUNDER_ABI,
        functionName: "totalCompounds",
    }) as { data: bigint | undefined };

    const tvl = totalAssets ? Number(formatUnits(totalAssets, 6)) : 0;
    const compounds = totalCompounds ? Number(totalCompounds) : 0;
    const score = isReady ? ilProtectionScore.toFixed(1) : "—";
    const apy = isReady ? blendedAPY.toFixed(2) : "—";

    return (
        <div>
            <h2 className="text-[20px] font-medium mb-4">Live Protocol Metrics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <div className="text-xs text-secondary mb-1">Blended APY</div>
                    <div className="text-xl font-medium tracking-tight text-accent">
                        {apy}{isReady ? "%" : ""}
                    </div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-xs text-secondary mb-1">IL Score</div>
                    <div className="text-xl font-medium tracking-tight text-accent">
                        {score}{isReady ? "%" : ""}
                    </div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-xs text-secondary mb-1">Total Deposits</div>
                    <div className="text-xl font-medium tracking-tight text-accent">
                        {tvl > 0 ? `$${tvl.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—"}
                    </div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-xs text-secondary mb-1">Compounds</div>
                    <div className="text-xl font-medium tracking-tight text-accent">
                        {compounds > 0 ? compounds : "—"}
                    </div>
                </div>
            </div>
        </div>
    );
}
