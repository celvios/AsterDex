"use client";

import { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { useDailySnapshots } from "@/hooks/useSubgraph";

interface DailySnapshot {
    id: string;
    date: string;
    tvl: string;
    hedgeEfficiency: string;
    stakingAPY: string;
    totalCompounds: string;
}

// Demo data for when subgraph is not connected
const DEMO_DATA = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseAPY = 19.4;
    const noise = (Math.sin(i * 0.5) * 2.5) + (Math.random() * 1.5 - 0.75);
    return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        apy: +(baseAPY + noise).toFixed(1),
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

export function APYChart() {
    const { data: rawData, loading } = useDailySnapshots();

    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) return DEMO_DATA;
        return (rawData as DailySnapshot[]).map((d) => ({
            date: new Date(Number(d.date) * 1000).toLocaleDateString("en-US", {
                month: "short", day: "numeric"
            }),
            apy: Number(d.stakingAPY) / 100,
        })).reverse();
    }, [rawData]);

    return (
        <div className="chart-container glass-card animate-in" style={{ animationDelay: "0.4s" }}>
            <div className="chart-header">
                <span className="chart-title">Blended APY — 30 Days</span>
                {rawData.length === 0 && (
                    <span className="chart-badge">Demo Data</span>
                )}
            </div>
            <div className="chart-body">
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
            </div>
        </div>
    );
}
