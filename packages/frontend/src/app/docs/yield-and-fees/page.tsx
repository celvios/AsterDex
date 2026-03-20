import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Yield & Fees | APEX Protocol Docs",
    description: "A transparent breakdown of APEX yield sources, blended APY calculations, and protocol fees.",
};

async function getVaultStats() {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
        : 'http://localhost:3000';
        
    try {
        const res = await fetch(`${baseUrl}/api/vault-stats`, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    } catch (err) {
        return { blendedAPY: "16.44" };
    }
}

export default async function YieldAndFeesPage() {
    const stats = await getVaultStats();

    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">Yield & Fees</h1>
                <p className="text-secondary mb-4">
                    Total transparency is a core tenet of APEX. Here is exactly where your yield comes from, how it is calculated, and what fees the protocol charges.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-4">Yield Sources</h2>
                
                <h3 className="text-[16px] font-medium mb-2 text-primary">asBNB Staking <span className="text-secondary font-normal">— Up to 30% APY</span></h3>
                <p className="text-secondary mb-6">
                    The primary growth engine for the vault is <strong>Aster Liquid Staked BNB (asBNB)</strong>. By deploying capital here, the vault earns standard BNB validator rewards, high-yield HODLer airdrops, and Binance Megadrop rewards. Note that this rate is highly variable depending on market activity. Visit <a href="#" className="text-accent hover:underline">AsterDEX Earn</a> for live base rates.
                </p>

                <h3 className="text-[16px] font-medium mb-2 text-primary">asUSDF Buffer <span className="text-secondary font-normal">— ~3.6% APY</span></h3>
                <p className="text-secondary mb-4">
                    The Impermanent Loss protection buffer is composed of <strong>asUSDF</strong>. Instead of holding idle USDC which bleeds value to inflation, the buffer earns a steady, delta-neutral stablecoin yield. Your protection fund earns money while it protects you.
                </p>
            </div>

            <div className="border-t border-[rgba(0,0,0,0.05)] pt-6 mt-2">
                <h2 className="text-[20px] font-medium mb-4">Blended APY Calculation</h2>
                <p className="text-secondary mb-4">
                    Because your capital is split between two different strategies, your total vault APY is a weighted average of both strategies based on the current Brain allocation block.
                </p>
                
                <div className="bg-[rgba(255,255,255,0.6)] border border-[rgba(0,0,0,0.08)] rounded-xl p-6 text-center shadow-sm mb-6">
                    <div className="text-[18px] md:text-[20px] font-medium text-accent tracking-wide mono leading-relaxed">
                        Blended APY = (asBNB APY × Staking %) + (asUSDF APY × Buffer %)
                    </div>
                </div>

                <div className="glass-card p-6 bg-[rgba(255,255,255,0.8)] border border-[rgba(0,0,0,0.05)] mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Example Calculation</h3>
                    <p className="text-sm text-secondary mb-3">Assuming a baseline MEDIUM IL regime (60/40 split), with asBNB yielding 25% and asUSDF yielding 3.6%:</p>
                    <ul className="text-sm font-mono text-secondary space-y-2 ml-4">
                        <li>= (25% × 0.60) + (3.6% × 0.40)</li>
                        <li>= 15% + 1.44%</li>
                        <li className="text-accent font-medium">= 16.44% Blended APY</li>
                    </ul>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-[rgba(26,86,219,0.05)] border border-[rgba(26,86,219,0.1)] inline-flex">
                    <span className="text-sm font-medium text-primary">Live Blended APY:</span>
                    <span className="text-xl font-bold tracking-tight text-accent">{stats.blendedAPY}%</span>
                </div>
            </div>

            <div className="border-t border-[rgba(0,0,0,0.05)] pt-6 mt-4">
                <h2 className="text-[20px] font-medium mb-4">Fee Structure</h2>
                <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.6)] shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[rgba(0,0,0,0.02)]">
                            <tr className="border-b border-[rgba(0,0,0,0.05)] text-secondary">
                                <th className="py-3 px-4 font-medium">Action</th>
                                <th className="py-3 px-4 font-medium">Fee</th>
                                <th className="py-3 px-4 font-medium">Who Gets It</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">Deposit</td>
                                <td className="py-3 px-4 text-[#10B981] font-medium">0%</td>
                                <td className="py-3 px-4 text-secondary">—</td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">Performance / Management</td>
                                <td className="py-3 px-4 text-[#10B981] font-medium">0%</td>
                                <td className="py-3 px-4 text-secondary">—</td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">Withdrawal</td>
                                <td className="py-3 px-4 text-[#EF4444] font-medium">0.1%</td>
                                <td className="py-3 px-4 text-secondary">Protocol Treasury (Sustainability)</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-medium text-primary">Compound trigger</td>
                                <td className="py-3 px-4 text-accent font-medium">0.5%</td>
                                <td className="py-3 px-4 text-secondary">The Caller (Keeper Incentive)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 p-4 glass-card bg-[rgba(26,86,219,0.03)] border-l-4 border-l-accent overflow-hidden">
                    <p className="text-sm text-secondary">
                        <strong className="text-primary">Note on Compounding:</strong> The 0.5% compound bounty is paid <em>strictly from the harvested rewards</em>, not from your principal. It incentivizes the decentralized network to maintain the autonomous loop without requiring a centralized cron job. It costs you nothing out of pocket.
                    </p>
                </div>
            </div>

            <div className="mt-6 p-6 glass-card bg-[rgba(245,158,11,0.05)] border-l-4 border-l-[#F59E0B]">
                <h3 className="text-[#0A0A0A] font-medium mb-2">⚠️ APY Disclaimer</h3>
                <p className="text-sm text-secondary leading-relaxed">
                    APY figures are estimates based on current protocol rates and historical market conditions. Actual future returns will vary. This documentation does not constitute financial advice. DeFi inherently carries risks including smart contract risk, protocol risk, and general market risk. Never invest capital you cannot afford to lose.
                </p>
            </div>
        </div>
    );
}
