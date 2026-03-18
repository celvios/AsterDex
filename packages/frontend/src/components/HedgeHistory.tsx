"use client";

import { useMemo } from "react";
import { useHedgeSnapshots } from "@/hooks/useSubgraph";

interface HedgeSnapshotData {
    id: string;
    timestamp: string;
    ilAmount: string;
    hedgeBuffer: string;
    hedgeEfficiency: string;
    stakingBps: string;
}

// Demo data
const DEMO_DATA: HedgeSnapshotData[] = Array.from({ length: 10 }, (_, i) => {
    const ts = Math.floor(Date.now() / 1000) - (9 - i) * 86400;
    const il = (Math.random() * 200 + 50).toFixed(0);
    const buffer = (Number(il) * (1.2 + Math.random() * 0.8)).toFixed(0);
    const efficiency = Math.floor(Number(buffer) / Number(il) * 10000);
    return {
        id: `snap-${i}`,
        timestamp: String(ts),
        ilAmount: String(Number(il) * 1_000_000),
        hedgeBuffer: String(Number(buffer) * 1_000_000),
        hedgeEfficiency: String(efficiency),
        stakingBps: String(6000 + Math.floor(Math.random() * 2000 - 1000)),
    };
});

export function HedgeHistory() {
    const { data: rawData } = useHedgeSnapshots();

    const rows = useMemo(() => {
        const src = (rawData && rawData.length > 0)
            ? (rawData as HedgeSnapshotData[]).slice(0, 10)
            : DEMO_DATA;

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

    const isDemo = !rawData || rawData.length === 0;

    return (
        <div className="chart-container glass-card animate-in" style={{ animationDelay: "0.5s" }}>
            <div className="chart-header">
                <span className="chart-title">Hedge History — Last 10 Snapshots</span>
                {isDemo && <span className="chart-badge">Demo Data</span>}
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
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td className="mono">{row.date}</td>
                                <td style={{ color: "var(--red)" }}>{row.il}</td>
                                <td style={{ color: "var(--green)" }}>{row.buffer}</td>
                                <td className="tabular">{row.efficiency}</td>
                                <td className="tabular">{row.split}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
