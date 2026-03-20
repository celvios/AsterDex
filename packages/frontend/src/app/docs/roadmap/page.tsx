import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Roadmap | APEX Protocol Docs",
    description: "The 4-phase development roadmap for the APEX Protocol.",
};

const phases = [
    {
        title: "Phase 1: Hackathon MVP (Current)",
        status: "Active",
        statusColor: "text-accent bg-[rgba(26,86,219,0.1)] border-[rgba(26,86,219,0.2)]",
        icon: "🚀",
        items: [
            "Core non-custodial APEX Vault deployment on BSC Testnet.",
            "APEX Brain dynamic split logic integration.",
            "Integration with AsterDEX testnet minters (asBNB / asUSDF).",
            "Permissionless compounding loop with incentives.",
            "On-chain HedgeSnapshot recording.",
            "Next.js glassmorphism decentralized dashboard."
        ]
    },
    {
        title: "Phase 2: Hardening & Mainnet",
        status: "Up Next",
        statusColor: "text-primary bg-[rgba(0,0,0,0.05)] border-[rgba(0,0,0,0.1)]",
        icon: "🛡️",
        items: [
            "Formal third-party security audits of core contracts.",
            "Bug bounty program launch.",
            "Deployment to BNB Chain Mainnet.",
            "Integration with real AsterDEX mainnet liquidity.",
            "Initial liquidity bootstrap event (LBE)."
        ]
    },
    {
        title: "Phase 3: Expanded Collateral",
        status: "Planned",
        statusColor: "text-secondary bg-[rgba(0,0,0,0.02)] border-[rgba(0,0,0,0.05)]",
        icon: "🌍",
        items: [
            "Support for native USDT deposits alongside USDC.",
            "New backend strategies utilizing decentralized perp yield.",
            "Cross-chain deployment (Arbitrum, Base).",
            "Advanced Brain logic using multi-variate risk parameters.",
            "Governance token launch for protocol parameter voting."
        ]
    },
    {
        title: "Phase 4: Institutional Adoption",
        status: "Future",
        statusColor: "text-secondary bg-[rgba(0,0,0,0.02)] border-[rgba(0,0,0,0.05)]",
        icon: "🏛️",
        items: [
            "KYC/AML permissioned vault wrapper deployments.",
            "Direct API integration for CeFi applications to route yield.",
            "Custom enterprise vault deployments (white-label).",
            "Automated insurance fund backing the Hedge Efficiency."
        ]
    }
];

export default function RoadmapPage() {
    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">Roadmap</h1>
                <p className="text-secondary mb-8">
                    APEX is currently in its initial Hackathon phase. Our vision extends far beyond a proof of concept. Here is how we plan to scale the most secure yield primitive in DeFi.
                </p>
            </div>

            <div className="relative border-l-2 border-[rgba(0,0,0,0.05)] ml-3 md:ml-6 flex flex-col gap-10">
                {phases.map((phase, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-10">
                        {/* Timeline dot */}
                        <div className={`
                            absolute left-[-17px] top-1 w-8 h-8 rounded-full flex items-center justify-center text-[14px] shadow-sm
                            ${idx === 0 ? "bg-accent text-white" : "bg-white border-2 border-[rgba(0,0,0,0.1)]"}
                        `}>
                            {phase.icon}
                        </div>
                        
                        <div className="glass-card p-6 border border-[rgba(0,0,0,0.05)] hover:border-[rgba(0,0,0,0.1)] transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                <h2 className="text-[20px] font-medium">{phase.title}</h2>
                                <span className={`text-[11px] px-3 py-1 uppercase tracking-wider font-bold rounded-full border border-transparent w-max ${phase.statusColor}`}>
                                    {phase.status}
                                </span>
                            </div>
                            <ol className="list-decimal pl-5 space-y-2 text-sm text-secondary">
                                {phase.items.map((item, id) => (
                                    <li key={id}>{item}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-sm text-secondary p-4 glass-card bg-[rgba(0,0,0,0.02)]">
                <strong className="text-primary">Disclaimer:</strong> This roadmap is intended for informational purposes only. The cryptocurrency market is highly dynamic. Goals, timelines, and features are subject to change based on market conditions, audit results, and community feedback.
            </div>
        </div>
    );
}
