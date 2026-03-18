"use client";

import { useMemo } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { useHedgeSnapshots } from "@/hooks/useSubgraph";

interface HedgeSnapshotData {
    id: string;
    timestamp: string;
    ilAmount: string;
    hedgeBuffer: string;
    hedgeEfficiency: string;
    stakingBps: string;
}

// Demo data — IL protection score over time
const DEMO_DATA = Array.from({ length: 20 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (19 - i));
    const baseScore = 85;
    const noise = Math.sin(i * 0.3) * 8 + (Math.random() * 5 - 2.5);
    return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: Math.max(40, Math.min(100, +(baseScore + noise).toFixed(1))),
    };
});

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

    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) return DEMO_DATA;
        return (rawData as HedgeSnapshotData[]).map((d) => ({
            date: new Date(Number(d.timestamp) * 1000).toLocaleDateString("en-US", {
                month: "short", day: "numeric"
            }),
            score: Math.min(Number(d.hedgeEfficiency) / 100, 100),
        })).reverse();
    }, [rawData]);

    // Score color gradient
    const avgScore = chartData.length > 0
        ? chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length
        : 85;
    const fillColor = avgScore >= 85 ? "#059669" : avgScore >= 50 ? "#D97706" : "#DC2626";

    return (
        <div className="chart-container glass-card animate-in" style={{ animationDelay: "0.45s" }}>
            <div className="chart-header">
                <span className="chart-title">IL Protection Score</span>
                {rawData.length === 0 && (
                    <span className="chart-badge">Demo Data</span>
                )}
            </div>
            <div className="chart-body">
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
            </div>
        </div>
    );
}
