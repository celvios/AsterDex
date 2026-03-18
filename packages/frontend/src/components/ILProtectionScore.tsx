"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { APEX_VAULT_ABI, getVaultAddress } from "@/lib/contracts";

interface HedgeSnapshot {
    timestamp: bigint;
    ilAmount: bigint;
    hedgeBuffer: bigint;
    hedgeEfficiency: bigint;
    stakingBps: bigint;
}

export function ILProtectionScore() {
    const address = getVaultAddress();

    const { data: snapshot } = useReadContract({
        address,
        abi: APEX_VAULT_ABI,
        functionName: "latestHedgeSnapshot",
    }) as { data: HedgeSnapshot | undefined };

    const { data: historyLength } = useReadContract({
        address,
        abi: APEX_VAULT_ABI,
        functionName: "hedgeHistoryLength",
    }) as { data: bigint | undefined };

    // Compute efficiency as percentage
    const efficiency = snapshot?.hedgeEfficiency
        ? Number(snapshot.hedgeEfficiency) / 100
        : 0;

    const score = Math.min(efficiency, 100);
    const ilAmount = snapshot?.ilAmount
        ? formatUnits(snapshot.ilAmount, 6)
        : "0.00";
    const bufferAmount = snapshot?.hedgeBuffer
        ? formatUnits(snapshot.hedgeBuffer, 6)
        : "0.00";

    // Ring color based on score
    const ringColor = score >= 85 ? "var(--green)" : score >= 50 ? "var(--amber)" : "var(--red)";

    // Regime badge
    const regime = score >= 85 ? "low" : score >= 50 ? "medium" : "high";
    const regimeLabel = regime === "low" ? "✅ HEALTHY" : regime === "medium" ? "⚠️ BUILDING" : "🔴 EXPOSED";

    const hasSnapshot = historyLength !== undefined && historyLength > 0n;

    return (
        <div className="hero-card liquid-glass animate-in">
            <div className="hero-score-wrapper">
                <div className="hero-ring">
                    <div className="hero-ring-bg" />
                    <div
                        className="hero-ring-fill"
                        style={{
                            "--ring-pct": hasSnapshot ? score : 0,
                            "--ring-color": ringColor,
                        } as React.CSSProperties}
                    />
                    <div className="hero-score-value">
                        <span className="hero-score-number tabular">
                            {hasSnapshot ? score.toFixed(1) : "—"}
                        </span>
                        <span className="hero-score-unit">%</span>
                    </div>
                </div>
            </div>

            <div className="hero-title">IL Protection Score</div>

            <div className="hero-sub-metrics">
                <div className="hero-sub-metric">
                    IL: <span>-${Number(ilAmount).toFixed(2)}</span>
                </div>
                <div className="hero-sub-metric">
                    Buffer: <span>${Number(bufferAmount).toFixed(2)}</span>
                </div>
            </div>

            <span className={`regime-badge ${regime}`}>
                {hasSnapshot ? regimeLabel : "No snapshots yet"}
            </span>
        </div>
    );
}
