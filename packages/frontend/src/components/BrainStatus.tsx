"use client";

import { useReadContract } from "wagmi";
import { APEX_BRAIN_ABI, getBrainAddress } from "@/lib/contracts";

interface SplitVector {
    stakingBps: bigint;
    bufferBps: bigint;
}

export function BrainStatus() {
    const address = getBrainAddress();

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

    const stakingPct = currentSplit ? Number(currentSplit.stakingBps) / 100 : 60;
    const bufferPct = currentSplit ? Number(currentSplit.bufferBps) / 100 : 40;

    const regimeClass = regime === "LOW" ? "low" : regime === "HIGH" ? "high" : "medium";
    const regimeDescription = regime === "LOW"
        ? "Low IL — maximising growth"
        : regime === "HIGH"
            ? "High IL — protecting capital"
            : "Medium IL — balanced split";

    return (
        <div className="brain-card glass-card animate-in" style={{ animationDelay: "0.2s" }}>
            <div className="brain-card-header">
                <span className="brain-card-title">🧠 Brain Status</span>
                <span className={`regime-badge ${regimeClass}`}>
                    {regime ?? "LOADING"}
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
