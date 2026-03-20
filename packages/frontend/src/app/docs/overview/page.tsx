import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Overview | APEX Protocol Docs",
    description: "What is APEX? Understand the autonomous protocol for exponential yield on BNB Chain.",
};

async function getVaultStats() {
    // Determine the base URL for the API fetch (handles local dev and Vercel deployments)
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
        : 'http://localhost:3000';
        
    try {
        const res = await fetch(`${baseUrl}/api/vault-stats`, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    } catch (err) {
        // Safe fallback if fetch fails during build or runtime
        return {
            totalAssets: "1250000.00",
            blendedAPY: "16.44",
            ilScore: "8750",
            totalCompounds: "42",
            isFallback: true
        };
    }
}

export default async function OverviewPage() {
    const stats = await getVaultStats();
    
    // Format numbers
    const formatCurrency = (val: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));
    const formatScore = (val: string) => (Number(val) / 100).toFixed(1) + "%";

    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">What is APEX?</h1>
                <p className="text-secondary mb-4">
                    APEX is a non-custodial yield vault on BNB Chain that automatically grows your USDC while protecting against impermanent loss — and proves it's working on-chain after every compound cycle.
                </p>
            </div>

            <div className="glass-card p-6 border-l-4 border-l-accent bg-[rgba(255,255,255,0.8)]">
                <h2 className="text-[20px] font-medium mb-3">The Problem</h2>
                <p className="text-secondary">
                    When you put money into DeFi liquidity pools, a hidden risk called impermanent loss (IL) can silently erode your returns. Most yield vaults either ignore this risk or claim to handle it without any proof.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-3">The Solution</h2>
                <p className="text-secondary mb-4">
                    APEX deposits your USDC into <strong className="text-primary font-medium">asBNB</strong> — one of BNB Chain's highest-yielding staking assets — while simultaneously building an IL protection buffer in <strong className="text-primary font-medium">asUSDF</strong>. After every automatic compound cycle, APEX writes a verifiable protection score directly to the blockchain. Anyone can check it.
                </p>
            </div>

            {/* Live Stats Row */}
            <div>
                <h2 className="text-[20px] font-medium mb-4">Live Protocol Metrics</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-4 text-center">
                        <div className="text-xs text-secondary mb-1">Blended APY</div>
                        <div className="text-xl font-medium tracking-tight text-accent">{stats.blendedAPY}%</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className="text-xs text-secondary mb-1">IL Score</div>
                        <div className="text-xl font-medium tracking-tight text-accent">{formatScore(stats.ilScore)}</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className="text-xs text-secondary mb-1">Total Deposits</div>
                        <div className="text-xl font-medium tracking-tight text-accent">{formatCurrency(stats.totalAssets)}</div>
                    </div>
                    <div className="glass-card p-4 text-center">
                        <div className="text-xs text-secondary mb-1">Compounds</div>
                        <div className="text-xl font-medium tracking-tight text-accent">{stats.totalCompounds}</div>
                    </div>
                </div>
                {stats.isFallback && (
                    <p className="text-[12px] text-secondary mt-2 text-right">
                        *Displaying fallback data because contracts are not yet deployed.
                    </p>
                )}
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-4">How It Compares</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[rgba(0,0,0,0.1)] text-sm text-secondary">
                                <th className="py-3 px-4 font-medium">Feature</th>
                                <th className="py-3 px-4 font-medium text-center">Other Vaults</th>
                                <th className="py-3 px-4 font-medium text-center">APEX</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 text-primary font-medium">IL score stored on-chain</td>
                                <td className="py-3 px-4 text-center">❌</td>
                                <td className="py-3 px-4 text-center">✅</td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 text-primary font-medium">Buffer earns yield</td>
                                <td className="py-3 px-4 text-center">❌</td>
                                <td className="py-3 px-4 text-center">✅</td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 text-primary font-medium">Dynamic Brain split</td>
                                <td className="py-3 px-4 text-center">❌</td>
                                <td className="py-3 px-4 text-center">✅</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-primary font-medium">Permissionless loop</td>
                                <td className="py-3 px-4 text-center">❌</td>
                                <td className="py-3 px-4 text-center">✅</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 text-sm text-secondary p-4 glass-card bg-[rgba(245,158,11,0.05)] border-l-4 border-l-[#F59E0B]">
                <strong className="text-[#0A0A0A] font-medium">Disclaimer:</strong> APY figures are estimates based on current protocol rates and market conditions. Actual returns will vary. This is not financial advice. DeFi carries risks including smart contract risk, protocol risk, and market risk.
            </div>
        </div>
    );
}
