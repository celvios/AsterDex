"use client";

import { useMemo } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid
} from "recharts";
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

function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip glass-card">
            <div className="chart-tooltip-label">{label}</div>
            <div className="chart-tooltip-value">{payload[0].value.toFixed(1)}%</div>
        </div>
    );
}

export function ILScoreChart() {
    const { data: rawData } = useHedgeSnapshots();
    const { ilProtectionScore, isReady } = useAsterDEX();

    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) {
            return []; // No data yet — show empty chart
        }
        return (rawData as HedgeSnapshotData[]).map((d) => ({
            date: new Date(Number(d.timestamp) * 1000).toLocaleDateString("en-US", {
                month: "short", day: "numeric"
            }),
            score: Math.min(Number(d.hedgeEfficiency) / 100, 100),
        })).reverse();
    }, [rawData]);

    const hasData = chartData.length > 0;
    const avgScore = hasData
        ? chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length
        : (isReady ? ilProtectionScore : 0);
    const fillColor = avgScore >= 85 ? "#059669" : avgScore >= 50 ? "#D97706" : "#DC2626";

    return (
        <div className="chart-container glass-card animate-in" style={{ animationDelay: "0.45s" }}>
            <div className="chart-header">
                <span className="chart-title">IL Protection Score</span>
                {isReady && (
                    <span className="chart-badge" style={{ background: fillColor, color: "#fff" }}>
                        Live: {ilProtectionScore.toFixed(1)}%
                    </span>
                )}
            </div>
            <div className="chart-body">
                {hasData ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={fillColor} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={fillColor} stopOpacity={0.01} />
                                </linearGradient>
                            </defs>
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
                                domain={[0, 100]}
                            />
                            <Tooltip content={<GlassTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke={fillColor}
                                strokeWidth={2}
                                fill="url(#scoreGradient)"
                                dot={false}
                                activeDot={{ r: 4, fill: fillColor, stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>
                        No hedge snapshots yet — data will appear after the first compound() call
                    </div>
                )}
            </div>
        </div>
    );
}
