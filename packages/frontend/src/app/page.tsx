import Link from "next/link";
import { ILProtectionScore } from "@/components/ILProtectionScore";
import { VaultStats } from "@/components/VaultStats";
import { BrainStatus } from "@/components/BrainStatus";
import { DepositWidget } from "@/components/DepositWidget";
import { WithdrawWidget } from "@/components/WithdrawWidget";
import { ConnectWallet } from "@/components/ConnectWallet";
import { APYChart } from "@/components/APYChart";
import { ILScoreChart } from "@/components/ILScoreChart";
import { HedgeHistory } from "@/components/HedgeHistory";
import { YieldBreakdown } from "@/components/YieldBreakdown";

export default function Dashboard() {
    return (
        <main className="dashboard">
            {/* ── Header ─────────────────────────────────────── */}
            <header className="header">
                <div>
                    <h1 className="header-title">APEX Protocol</h1>
                    <p className="header-subtitle">Autonomous IL Protection on BNB Chain</p>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/docs" className="text-[14px] font-medium text-[#4B5563] hover:text-[#111827] transition-colors no-underline">
                        Documentation
                    </Link>
                    <ConnectWallet />
                </div>
            </header>

            {/* ── Hero — IL Protection Score ──────────────────── */}
            <ILProtectionScore />

            {/* ── Stats Bar ──────────────────────────────────── */}
            <VaultStats />

            {/* ── Brain Status ────────────────────────────────── */}
            <BrainStatus />

            {/* ── Deposit / Withdraw Grid ─────────────────────── */}
            <div className="main-grid">
                <DepositWidget />
                <WithdrawWidget />
            </div>

            {/* ── Charts Section ──────────────────────────────── */}
            <h2 className="section-heading">Analytics</h2>

            <div className="charts-grid">
                <APYChart />
                <ILScoreChart />
            </div>

            <YieldBreakdown />

            {/* ── Hedge History Table ─────────────────────────── */}
            <HedgeHistory />
        </main>
    );
}
