import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "How It Works | APEX Protocol Docs",
    description: "Discover the mechanisms powering APEX's IL protection and yield compounding.",
};

function FlowDiagram() {
    return (
        <div className="my-10 p-6 md:p-8 glass-card bg-[rgba(255,255,255,0.7)] overflow-x-auto relative mt-12 pb-16">
            <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-accent font-medium bg-[rgba(26,86,219,0.1)] px-3 py-1 rounded-full">
                Live Core Loop
            </div>
            
            <svg 
                viewBox="0 0 600 700" 
                className="w-full h-auto min-w-[500px] max-w-[600px] mx-auto drop-shadow-sm font-sans"
            >
                <style>
                    {`
                        .flow-line { 
                            stroke: #9CA3AF; 
                            stroke-width: 2; 
                            fill: none; 
                            stroke-dasharray: 4 4;
                            animation: dash 20s linear infinite;
                        }
                        .flow-line-solid {
                            stroke: #1A56DB;
                            stroke-width: 2;
                            fill: none;
                        }
                        .flow-node { fill: url(#glassGradient); stroke: rgba(255,255,255,0.9); stroke-width: 1; }
                        .flow-node-accent { fill: url(#accentGradient); stroke: rgba(26,86,219,0.3); stroke-width: 1; }
                        .flow-text { font-family: Inter, sans-serif; fill: #0A0A0A; font-size: 14px; font-weight: 500; text-anchor: middle; }
                        .flow-subtext { fill: #6B7280; font-size: 12px; font-weight: 400; text-anchor: middle; }
                        .flow-text-white { fill: #FFFFFF; font-size: 14px; font-weight: 500; text-anchor: middle; }
                        
                        @keyframes dash {
                            to { stroke-dashoffset: -400; }
                        }
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 0.8; }
                            50% { transform: scale(1.05); opacity: 1; }
                            100% { transform: scale(1); opacity: 0.8; }
                        }
                        .pulse-circle {
                            animation: pulse 3s ease-in-out infinite;
                            transform-origin: center;
                        }
                    `}
                </style>

                <defs>
                    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                        <stop offset="100%" stopColor="rgba(240,245,255,0.9)" />
                    </linearGradient>
                    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1A56DB" />
                    </linearGradient>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9CA3AF" />
                    </marker>
                    <marker id="arrowSolid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#1A56DB" />
                    </marker>
                </defs>

                {/* Vertical Base Lines */}
                <path d="M 300 60 L 300 120" className="flow-line-solid" markerEnd="url(#arrowSolid)" />
                <path d="M 300 180 L 300 240" className="flow-line-solid" markerEnd="url(#arrowSolid)" />
                <path d="M 300 300 L 300 360" className="flow-line-solid" markerEnd="url(#arrowSolid)" />
                
                {/* Branching Lines */}
                <path d="M 300 420 L 300 450 L 150 450 L 150 480" className="flow-line" markerEnd="url(#arrow)" />
                <path d="M 300 420 L 300 450 L 450 450 L 450 480" className="flow-line" markerEnd="url(#arrow)" />
                
                {/* Return Lines to Brain */}
                <path d="M 150 540 L 150 590 L 290 590" className="flow-line" markerEnd="url(#arrow)" />
                <path d="M 450 540 L 450 590 L 310 590" className="flow-line" markerEnd="url(#arrow)" />

                {/* Final Snapshot Line */}
                <path d="M 300 620 L 300 680" className="flow-line" markerEnd="url(#arrow)" />

                {/* Nodes */}
                {/* Step 1: User Deposit */}
                <g transform="translate(300, 30)">
                    <rect x="-80" y="-25" width="160" height="50" rx="25" className="flow-node" />
                    <text x="0" y="5" className="flow-text">User Deposits USDC</text>
                </g>

                {/* Step 2: Staking Strategy */}
                <g transform="translate(300, 150)">
                    <rect x="-110" y="-30" width="220" height="60" rx="12" className="flow-node" />
                    <text x="0" y="-5" className="flow-text text-accent">Staking Strategy</text>
                    <text x="0" y="15" className="flow-subtext">Mints asBNB (Up to 30% APY)</text>
                </g>

                {/* Step 3: Compounder */}
                <g transform="translate(300, 270)">
                    <circle cx="0" cy="0" r="35" className="flow-node-accent pulse-circle" />
                    <text x="0" y="5" className="flow-text-white">Compound</text>
                    <text x="80" y="0" className="flow-subtext" textAnchor="start">Every cycle: caller earns 0.5%</text>
                    <text x="80" y="15" className="flow-subtext" textAnchor="start">Yield is harvested</text>
                </g>

                {/* Step 4: Split - Growth */}
                <g transform="translate(300, 390)">
                    <rect x="-80" y="-25" width="160" height="50" rx="8" className="flow-node" />
                    <text x="0" y="0" className="flow-text">Dynamic Split</text>
                    <text x="0" y="18" className="flow-subtext">e.g. 60% / 40%</text>
                </g>

                {/* Step 5L: Growth (asBNB) */}
                <g transform="translate(150, 510)">
                    <rect x="-90" y="-30" width="180" height="60" rx="12" className="flow-node" />
                    <text x="0" y="-5" className="flow-text">60% to asBNB</text>
                    <text x="0" y="15" className="flow-subtext">Compounds Growth</text>
                </g>

                {/* Step 5R: Buffer (asUSDF) */}
                <g transform="translate(450, 510)">
                    <rect x="-90" y="-30" width="180" height="60" rx="12" className="flow-node" />
                    <text x="0" y="-5" className="flow-text">40% to asUSDF</text>
                    <text x="0" y="15" className="flow-subtext">Builds Protection (3.6% APY)</text>
                </g>

                {/* Step 6: Brain */}
                <g transform="translate(300, 590)">
                    <rect x="-70" y="-20" width="140" height="40" rx="20" className="flow-node-accent" />
                    <text x="0" y="5" className="flow-text-white">APEX Brain 🧠</text>
                    <text x="-80" y="5" className="flow-subtext" textAnchor="end">Reads IL exposure</text>
                    <text x="-80" y="20" className="flow-subtext" textAnchor="end">adjusts next split</text>
                </g>
                
                {/* Step 7: On-chain Verification */}
                <g transform="translate(300, 680)">
                    <rect x="-100" y="-25" width="200" height="50" rx="8" className="flow-node" />
                    <text x="0" y="0" className="flow-text">HedgeSnapshot</text>
                    <text x="0" y="18" className="flow-subtext text-accent font-medium">Recorded on Blockchain</text>
                </g>

            </svg>
        </div>
    )
}

export default function HowItWorksPage() {
    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">How APEX Works</h1>
                <p className="text-secondary mb-4">
                    The APEX Protocol uses dual-asset deployment and a dynamic brain to automate your portfolio growth. Here is a clear breakdown of how the engine runs under the hood.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-3">The Simple Version</h2>
                <p className="text-secondary mb-4">
                    You deposit USDC. APEX puts it to work in two places simultaneously. Every few hours it harvests the interest, splits it intelligently, and writes proof of your protection to the blockchain.
                </p>
            </div>

            <FlowDiagram />

            <div>
                <h2 className="text-[20px] font-medium mb-4 mt-8">The Two Strategies</h2>
                
                <h3 className="text-[16px] font-medium mb-2 text-primary">Strategy 1: asBNB Staking (Primary Yield)</h3>
                <p className="text-secondary mb-6">
                    <strong className="text-primary">asBNB</strong> is AsterDEX's premier liquid staking receipt. By holding asBNB, you earn BNB staking rewards, HODLer airdrops, and Megadrop rewards seamlessly. Yields can reach up to 30% APY in high-growth environments.
                </p>

                <h3 className="text-[16px] font-medium mb-2 text-primary">Strategy 2: asUSDF Buffer (IL Protection That Earns)</h3>
                <p className="text-secondary mb-4">
                    Static hedge buffers waste capital. Instead of holding idle USDC to protect against Impermanent Loss, APEX converts your buffer into <strong className="text-primary">asUSDF</strong> — an auto-compounding, delta-neutral yield asset powered by AsterDEX earning ~3.6% APY. Your protection fund is always growing.
                </p>
            </div>

            <div className="glass-card p-6 border-l-4 border-l-accent bg-[rgba(26,86,219,0.03)] my-4">
                <h2 className="text-[20px] font-medium mb-4 text-accent">The APEX Brain</h2>
                <p className="text-secondary mb-4">
                    The core innovation of APEX. The Brain constantly evaluates your Impermanent Loss exposure against the size of your buffer, and dynamically limits risk by shifting the reward distribution.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-lg p-4 border border-[rgba(0,0,0,0.05)] shadow-sm">
                        <div className="text-xs font-semibold text-accent mb-2 tracking-wider">LOW IL (&lt; 5%)</div>
                        <div className="text-lg font-medium text-primary mb-1">70% / 30%</div>
                        <div className="text-sm text-secondary">Maximises your growth potential</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-[rgba(0,0,0,0.05)] shadow-sm">
                        <div className="text-xs font-semibold text-[#F59E0B] mb-2 tracking-wider">MEDIUM IL (5-15%)</div>
                        <div className="text-lg font-medium text-primary mb-1">60% / 40%</div>
                        <div className="text-sm text-secondary">Balanced allocation</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-[rgba(0,0,0,0.05)] shadow-sm">
                        <div className="text-xs font-semibold text-[#EF4444] mb-2 tracking-wider">HIGH IL (&gt; 15%)</div>
                        <div className="text-lg font-medium text-primary mb-1">40% / 60%</div>
                        <div className="text-sm text-secondary">Prioritises capital protection</div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-3 mt-4">The Compound Cycle</h2>
                <p className="text-secondary mb-4">
                    APEX does not rely on off-chain servers or secret multi-sigs to harvest yield. The <code>compound()</code> function is entirely <strong>permissionless</strong>. Anyone can call it. To ensure it happens regularly, the protocol pays a strict <strong className="text-accent">0.5% caller bounty</strong> from the harvested rewards to the wallet that triggers the function.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-3">The HedgeSnapshot</h2>
                <p className="text-secondary mb-4">
                    At the end of every compound cycle, APEX writes your live security metrics directly into the Ethereum Virtual Machine (EVM) state.
                </p>
                
                <div className="bg-[rgba(255,255,255,0.6)] border border-[rgba(0,0,0,0.08)] rounded-xl p-4 md:p-6 overflow-x-auto">
                    <pre className="mono text-sm text-[13px] text-primary">
<span className="text-accent font-semibold">struct</span> HedgeSnapshot {'{'}
    uint256 timestamp;
    uint256 ilAmount;         <span className="text-secondary">// Your current IL in USDC (6 decimals)</span>
    uint256 hedgeBuffer;      <span className="text-secondary">// Your protection buffer in USDC</span>
    uint256 hedgeEfficiency;  <span className="text-secondary">// The coverage score (e.g. 8500 = 85%)</span>
    uint256 stakingBps;       <span className="text-secondary">// Brain's staking allocation this cycle</span>
{'}'}
                    </pre>
                </div>
                <p className="text-sm text-secondary mt-3 italic">
                    This struct guarantees that APEX cannot lie about its performance. Want to know more? Read about <Link href="/docs/il-protection" className="text-accent hover:underline">IL Protection</Link>.
                </p>
            </div>
        </div>
    );
}
