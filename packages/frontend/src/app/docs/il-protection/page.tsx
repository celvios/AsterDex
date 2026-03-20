import { Metadata } from 'next';
import { ContractAddress } from '@/components/ContractAddress';

export const metadata: Metadata = {
    title: "IL Protection Explained | APEX Protocol Docs",
    description: "Learn how APEX hedges against Impermanent Loss with a yield-bearing buffer and on-chain efficiency proofs.",
};

export default function ILProtectionPage() {
    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">IL Protection Explained</h1>
                <p className="text-secondary mb-4">
                    Impermanent Loss (IL) is the silent killer of DeFi yields. APEX is designed entirely around mitigating this risk. Here is how we measure it, prove it, and protect you from it.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-3">What Is Impermanent Loss?</h2>
                <div className="glass-card p-6 bg-[rgba(255,255,255,0.8)] border border-[rgba(0,0,0,0.05)] mb-4">
                    <p className="text-[#0A0A0A] mb-3">
                        Imagine you deposit <strong className="font-medium">$500 BNB</strong> and <strong className="font-medium">$500 USDC</strong> into a standard AMM liquidity pool (total value $1,000).
                    </p>
                    <p className="text-secondary mb-3">
                        If the price of BNB doubles (2x), the pool automatically rebalances. Arbitrageurs buy the cheaper BNB from your pool until the ratio balances out. 
                    </p>
                    <p className="text-secondary">
                        When you withdraw, you no longer have your exact original BNB. Instead of having $1,000 BNB + $500 USDC = $1,500, your pool position is now worth roughly <strong>$1,414</strong>. You "lost" $86 compared to simply holding the assets in your wallet. That $86 difference is your Impermanent Loss.
                    </p>
                </div>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-3">The Universal IL Formula</h2>
                <p className="text-secondary mb-4">
                    The percentage of loss relative to holding depends purely on the price divergence between the two assets.
                </p>
                <div className="bg-[rgba(255,255,255,0.6)] border border-[rgba(0,0,0,0.08)] rounded-xl p-6 text-center shadow-sm">
                    <div className="text-[22px] font-medium text-accent tracking-wide mono">
                        IL% = 1 - (2 × √r / (1 + r))
                    </div>
                    <div className="text-sm text-secondary mt-3">
                        where <strong className="mx-1 mono">r</strong> = current price / entry price
                    </div>
                </div>
            </div>

            <div className="border-t border-[rgba(0,0,0,0.05)] pt-8 mt-2">
                <h2 className="text-[20px] font-medium mb-4">How Other Vaults Handle IL</h2>
                <p className="text-secondary mb-4">
                    Most vaults don't handle it at all. They generate high yield and implicitly hope that IL doesn't eat into your returns. Some vaults claim to hedge against IL using complex off-chain algorithms — but none of them prove it transparently on-chain. You are forced to trust their marketing.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-4">How APEX Handles IL</h2>
                <div className="flex flex-col gap-4">
                    <div className="glass-card p-5 pl-12 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[rgba(26,86,219,0.05)] border-r border-[rgba(26,86,219,0.1)] flex items-center justify-center font-bold text-accent text-lg">1</div>
                        <p className="text-secondary"><strong className="text-primary font-medium">Measure:</strong> Every single compound cycle, the APEX Brain calculates your exact current IL exposure in USDC terms.</p>
                    </div>
                    <div className="glass-card p-5 pl-12 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[rgba(26,86,219,0.05)] border-r border-[rgba(26,86,219,0.1)] flex items-center justify-center font-bold text-accent text-lg">2</div>
                        <p className="text-secondary"><strong className="text-primary font-medium">Compare:</strong> It compares this exposure to your dedicated <strong className="text-accent">asUSDF</strong> protection buffer (which is actively compounding yield at ~3.6% APY).</p>
                    </div>
                    <div className="glass-card p-5 pl-12 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[rgba(26,86,219,0.05)] border-r border-[rgba(26,86,219,0.1)] flex items-center justify-center font-bold text-accent text-lg">3</div>
                        <p className="text-secondary"><strong className="text-primary font-medium">Store:</strong> It records the resulting Hedge Coverage Score directly to the Ethereum Virtual Machine (EVM) state permanently.</p>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-[20px] font-medium mb-4">The Hedge Efficiency Score</h2>
                <div className="bg-[rgba(255,255,255,0.6)] border border-[rgba(0,0,0,0.08)] rounded-xl p-6 text-center shadow-sm mb-6">
                    <div className="text-[20px] font-medium text-primary tracking-wide mono">
                        hedgeEfficiency = (asUSDF buffer / IL amount) × 10,000
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-4 border-t-4 border-t-[#10B981]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-primary">≥ 8,500</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] font-bold tracking-wider">HEALTHY</span>
                        </div>
                        <p className="text-sm text-secondary leading-relaxed">The buffer successfully covers 85%+ of your total IL exposure.</p>
                    </div>
                    <div className="glass-card p-4 border-t-4 border-t-[#F59E0B]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-primary">5,000 – 8,500</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.1)] text-[#F59E0B] font-bold tracking-wider">BUILDING</span>
                        </div>
                        <p className="text-sm text-secondary leading-relaxed">The Brain is actively re-routing yield to catch up to sudden volatility.</p>
                    </div>
                    <div className="glass-card p-4 border-t-4 border-t-[#EF4444]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-primary">&lt; 5,000</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.1)] text-[#EF4444] font-bold tracking-wider">EXPOSED</span>
                        </div>
                        <p className="text-sm text-secondary leading-relaxed">High IL environment. 60% of all yield is strictly routed to safety.</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 glass-card p-6 border-l-4 border-l-[#10B981] bg-[rgba(16,185,129,0.03)]">
                <h2 className="text-[18px] font-medium mb-3 text-primary">Don't Trust. Verify.</h2>
                <p className="text-secondary mb-4">
                    You don't need our dashboard to see your protection score. You can read it directly from the blockchain:
                </p>
                <ol className="list-decimal pl-5 text-sm text-secondary space-y-2">
                    <li>Go to BscScan and navigate to the <strong className="text-primary font-medium">APEXVault</strong> contract.</li>
                    <li>Click <strong className="text-primary font-medium">Contract</strong> → <strong className="text-primary font-medium">Read Contract</strong>.</li>
                    <li>Query exactly: <strong className="mono bg-white px-1.5 py-0.5 rounded border border-[rgba(0,0,0,0.1)]">latestHedgeSnapshot()</strong>.</li>
                    <li>Read the <strong className="text-primary font-medium">hedgeEfficiency</strong> return value. That is your non-forgeable, EVM-verified coverage score.</li>
                </ol>
            </div>

        </div>
    );
}
