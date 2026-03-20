"use client";

import { useReadContract } from "wagmi";
import { APEX_BRAIN_ABI, getBrainAddress } from "@/lib/contracts";
import { useAsterDEX } from "@/hooks/useAsterDEX";

interface SplitVector {
    stakingBps: bigint;
    bufferBps: bigint;
}

export function BrainStatus() {
    const address = getBrainAddress();
    const { ilBps } = useAsterDEX();

    const { data: currentSplit } = useReadContract({
        address,
        abi: APEX_BRAIN_ABI,
        functionName: "currentSplit",
    }) as { data: SplitVector | undefined };

    const { data: regime } = useReadContract({
        address,
        abi: APEX_BRAIN_ABI,
        functionName: "currentRegime",
    }) as { data: string | undefined };

    const rawStaking = currentSplit ? (currentSplit as any).stakingBps ?? (currentSplit as any)[0] : undefined;
    const rawBuffer = currentSplit ? (currentSplit as any).bufferBps ?? (currentSplit as any)[1] : undefined;
    
    const stakingPct = rawStaking !== undefined ? Number(rawStaking) / 100 : 60;
    const bufferPct = rawBuffer !== undefined ? Number(rawBuffer) / 100 : 40;

    // Determine regime from live IL if APEX is not yet deployed
    const computedRegime = regime ?? (ilBps > 500 ? "HIGH" : ilBps > 200 ? "MEDIUM" : "LOW");
    
    const regimeClass = computedRegime === "LOW" ? "low" : computedRegime === "HIGH" ? "high" : "medium";
    const regimeDescription = computedRegime === "LOW"
        ? "Low IL — maximising growth"
        : computedRegime === "HIGH"
            ? "High IL — protecting capital"
            : "Medium IL — balanced split";

    return (
        <div className="brain-card glass-card animate-in" style={{ animationDelay: "0.2s" }}>
            <div className="brain-card-header">
                <span className="brain-card-title">🧠 Brain Status</span>
                <span className={`regime-badge ${regimeClass}`}>
                    {computedRegime}
                </span>
            </div>

            <div className="split-gauge-container">
                <div className="split-gauge">
                    <div
                        className="split-gauge-staking"
                        style={{ width: `${stakingPct}%` }}
                    />
                    <div
                        className="split-gauge-buffer"
                        style={{ width: `${bufferPct}%` }}
                    />
                </div>
                <div className="split-gauge-labels">
                    <span>Staking (asBNB) — {stakingPct.toFixed(0)}%</span>
                    <span>Buffer (asUSDF) — {bufferPct.toFixed(0)}%</span>
                </div>
            </div>

            <div className="brain-regime-label">
                Regime: {regimeDescription}
            </div>
        </div>
    );
}
