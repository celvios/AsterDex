"use client";

import { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { useDailySnapshots } from "@/hooks/useSubgraph";
import { useAsterDEX } from "@/hooks/useAsterDEX";

interface DailySnapshot {
    id: string;
    date: string;
    tvl: string;
    hedgeEfficiency: string;
    stakingAPY: string;
    totalCompounds: string;
}

function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip glass-card">
            <div className="chart-tooltip-label">{label}</div>
            <div className="chart-tooltip-value">{payload[0].value.toFixed(1)}%</div>
        </div>
    );
}

export function APYChart() {
    const { data: rawData } = useDailySnapshots();
    const { blendedAPY, isReady } = useAsterDEX();

    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) {
            return []; // No data yet — show empty chart
        }
        return (rawData as DailySnapshot[]).map((d) => ({
            date: new Date(Number(d.date) * 1000).toLocaleDateString("en-US", {
                month: "short", day: "numeric"
            }),
            apy: Number(d.stakingAPY) / 100,
        })).reverse();
    }, [rawData]);

    const hasData = chartData.length > 0;

    return (
        <div className="chart-container glass-card animate-in" style={{ animationDelay: "0.4s" }}>
            <div className="chart-header">
                <span className="chart-title">Blended APY — 30 Days</span>
                {isReady && (
                    <span className="chart-badge" style={{ background: "var(--green)", color: "#fff" }}>
                        Live: {blendedAPY.toFixed(1)}%
                    </span>
                )}
            </div>
            <div className="chart-body">
                {hasData ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                            <CartesianGrid
                                horizontal={true}
                                vertical={false}
                                strokeDasharray="0"
                                stroke="rgba(0,0,0,0.04)"
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                                tickFormatter={(v: number) => `${v}%`}
                                domain={["auto", "auto"]}
                            />
                            <Tooltip content={<GlassTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="apy"
                                stroke="#1A56DB"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: "#1A56DB", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>
                        No compound events yet — data will appear after the first compound() call
                    </div>
                )}
            </div>
        </div>
    );
}
