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
            
            {/* Desktop Table */}
            <div className="table-wrapper hidden md:block">
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
                                    <td className="mono" style={{ fontSize: "14px" }}>{row.date}</td>
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

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 md:hidden mt-4">
                {hasData ? (
                    rows.map((row, i) => {
                        // Extract numeric efficiency for color coding
                        const effVal = parseFloat(row.efficiency);
                        const isHigh = effVal >= 85;
                        const isMedium = effVal >= 50 && effVal < 85;
                        
                        return (
                            <div key={i} className="rounded-xl border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.4)] p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.04)] pb-3">
                                    <span className="text-[13px] text-[#6B7280] font-mono">{row.date}</span>
                                    <span className={`text-[12px] font-medium px-2 py-0.5 rounded-md ${isHigh ? 'bg-[#10B981]/10 text-[#10B981]' : isMedium ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                                        {row.efficiency}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[14px]">
                                    <div>
                                        <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">IL Amount</div>
                                        <div className="font-medium text-[#EF4444]">{row.il}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Hedge Buffer</div>
                                        <div className="font-medium text-[#10B981]">{row.buffer}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Current Split</div>
                                        <div className="font-medium tabular-nums">{row.split}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-[#9CA3AF] text-[13px] py-8 border border-[rgba(0,0,0,0.06)] rounded-xl bg-[rgba(255,255,255,0.4)]">
                        No hedge snapshots yet
                    </div>
                )}
            </div>
        </div>
    );
}
