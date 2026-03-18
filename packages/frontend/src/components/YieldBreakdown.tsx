"use client";

import { useMemo } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Legend
} from "recharts";
import { useDailySnapshots } from "@/hooks/useSubgraph";

// Demo data — staking vs buffer yield breakdown
const DEMO_DATA = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const stakingBase = 28 + Math.sin(i * 0.4) * 4 + (Math.random() * 2 - 1);
    const bufferBase = 3.6 + Math.sin(i * 0.2) * 0.4 + (Math.random() * 0.3 - 0.15);
    return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        staking: +stakingBase.toFixed(1),
        buffer: +bufferBase.toFixed(1),
    };
});

function GlassTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip glass-card">
            <div className="chart-tooltip-label">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="chart-tooltip-row">
                    <span style={{ color: p.color }}>●</span>{" "}
                    {p.dataKey === "staking" ? "asBNB" : "asUSDF"}: {p.value.toFixed(1)}%
                </div>
            ))}
        </div>
    );
}

export function YieldBreakdown() {
    const { data: rawData } = useDailySnapshots();

    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) return DEMO_DATA;
        return (rawData as Array<{
            date: string;
            stakingAPY: string;
        }>).map((d) => ({
            date: new Date(Number(d.date) * 1000).toLocaleDateString("en-US", {
                month: "short", day: "numeric"
            }),
            staking: Number(d.stakingAPY) / 100,
            buffer: 3.6, // asUSDF baseline rate
        })).reverse();
    }, [rawData]);

    return (
        <div className="chart-container glass-card animate-in" style={{ animationDelay: "0.55s" }}>
            <div className="chart-header">
                <span className="chart-title">Yield Breakdown</span>
                {rawData.length === 0 && (
                    <span className="chart-badge">Demo Data</span>
                )}
            </div>
            <div className="chart-body">
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                        <defs>
                            <linearGradient id="stakingGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#1A56DB" stopOpacity={0.01} />
                            </linearGradient>
                            <linearGradient id="bufferGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.01} />
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
                        />
                        <Tooltip content={<GlassTooltip />} />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            iconSize={8}
                            formatter={(value: string) => (
                                <span style={{ fontSize: 12, color: "#6B7280" }}>
                                    {value === "staking" ? "asBNB Staking" : "asUSDF Buffer"}
                                </span>
                            )}
                        />
                        <Area
                            type="monotone"
                            dataKey="staking"
                            stroke="#1A56DB"
                            strokeWidth={2}
                            fill="url(#stakingGrad)"
                            dot={false}
                            stackId="1"
                        />
                        <Area
                            type="monotone"
                            dataKey="buffer"
                            stroke="#93C5FD"
                            strokeWidth={2}
                            fill="url(#bufferGrad)"
                            dot={false}
                            stackId="1"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
