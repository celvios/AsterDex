"use client";

import { useMemo } from "react";
import { useHedgeSnapshots } from "@/hooks/useSubgraph";
import { useAsterDEX } from "@/hooks/useAsterDEX";

interface HedgeSnapshotData {
    id: string;
    timestamp: string;
    ilAmount: string;
    hedgeBuffer: string;
    hedgeEfficiency: string;
    stakingBps: string;
}

export function HedgeHistory() {
    const { data: rawData } = useHedgeSnapshots();
    const { isReady } = useAsterDEX();

    const rows = useMemo(() => {
        if (!rawData || rawData.length === 0) {
            return []; // No data yet — show empty table
        }

        const src = (rawData as HedgeSnapshotData[]).slice(0, 10);
        return src.map((d) => ({
            date: new Date(Number(d.timestamp) * 1000).toLocaleDateString("en-US", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            }),
            il: `$${(Number(d.ilAmount) / 1_000_000).toFixed(2)}`,
            buffer: `$${(Number(d.hedgeBuffer) / 1_000_000).toFixed(2)}`,
            efficiency: `${(Number(d.hedgeEfficiency) / 100).toFixed(1)}%`,
            split: `${(Number(d.stakingBps) / 100).toFixed(0)}/${(100 - Number(d.stakingBps) / 100).toFixed(0)}`,
        }));
    }, [rawData]);

    const hasData = rows.length > 0;

    return (
        <div className="chart-container glass-card animate-in" style={{ animationDelay: "0.5s" }}>
            <div className="chart-header">
                <span className="chart-title">Hedge History — Last 10 Snapshots</span>
            </div>
            <div className="table-wrapper">
                <table className="hedge-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>IL</th>
                            <th>Buffer</th>
                            <th>Efficiency</th>
                            <th>Split</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hasData ? (
                            rows.map((row, i) => (
                                <tr key={i}>
                                    <td className="mono">{row.date}</td>
                                    <td style={{ color: "var(--red)" }}>{row.il}</td>
                                    <td style={{ color: "var(--green)" }}>{row.buffer}</td>
                                    <td className="tabular">{row.efficiency}</td>
                                    <td className="tabular">{row.split}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", color: "#9CA3AF", padding: "2rem 0" }}>
                                    No hedge snapshots yet — data will appear after the first compound() call
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
