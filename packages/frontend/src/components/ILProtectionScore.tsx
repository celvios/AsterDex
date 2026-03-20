"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { APEX_VAULT_ABI, getVaultAddress } from "@/lib/contracts";
import { useAsterDEX } from "@/hooks/useAsterDEX";

interface HedgeSnapshot {
    timestamp: bigint;
    ilAmount: bigint;
    hedgeBuffer: bigint;
    hedgeEfficiency: bigint;
    stakingBps: bigint;
}

export function ILProtectionScore() {
    const address = getVaultAddress();
    const { ilBps, ilProtectionScore: liveScore, isReady } = useAsterDEX();

    const { data: historyLength } = useReadContract({
        address,
        abi: APEX_VAULT_ABI,
        functionName: "hedgeHistoryLength",
    }) as { data: bigint | undefined };

    const hasSnapshot = historyLength !== undefined && historyLength > 0n;

    const { data: snapshot } = useReadContract({
        address,
        abi: APEX_VAULT_ABI,
        functionName: "latestHedgeSnapshot",
        query: {
            enabled: hasSnapshot,
        },
    }) as { data: HedgeSnapshot | undefined };

    // Compute efficiency as percentage
    const efficiency = snapshot?.hedgeEfficiency
        ? Number(snapshot.hedgeEfficiency) / 100
        : (isReady ? liveScore : 0);

    const score = Math.min(efficiency, 100);
    
    // Fallback to simulated live data context
    const simulatedIL = (ilBps * 1500) / 10000; // Simulated $1500 per $10k TVL baseline
    const simulatedBuffer = simulatedIL * (score / 100);

    const ilAmount = snapshot?.ilAmount
        ? formatUnits(snapshot.ilAmount, 6)
        : (isReady ? simulatedIL.toFixed(2) : "0.00");
    const bufferAmount = snapshot?.hedgeBuffer
        ? formatUnits(snapshot.hedgeBuffer, 6)
        : (isReady ? simulatedBuffer.toFixed(2) : "0.00");

    // Ring color based on score
    const ringColor = score >= 85 ? "var(--green)" : score >= 50 ? "var(--amber)" : "var(--red)";

    // Regime badge
    const regime = score >= 85 ? "low" : score >= 50 ? "medium" : "high";
    const regimeLabel = regime === "low" ? "✅ HEALTHY" : regime === "medium" ? "⚠️ BUILDING" : "🔴 EXPOSED";

    return (
        <div className="hero-card liquid-glass animate-in">
            <div className="hero-score-wrapper">
                <div className="hero-ring">
                    <div className="hero-ring-bg" />
                    <div
                        className="hero-ring-fill"
                        style={{
                            "--ring-pct": (hasSnapshot || isReady) ? score : 0,
                            "--ring-color": ringColor,
                        } as React.CSSProperties}
                    />
                    <div className="hero-score-value">
                        <span className="hero-score-number tabular">
                            {(hasSnapshot || isReady) ? score.toFixed(1) : "—"}
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
                {(hasSnapshot || isReady) ? regimeLabel : "No snapshots yet"}
            </span>
        </div>
    );
}
