import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Security | APEX Protocol Docs",
    description: "Understand the security architecture, risks, and non-custodial design of APEX.",
};

export default function SecurityPage() {
    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">Security</h1>
                <p className="text-secondary mb-4">
                    Trust is earned through transparency. We want you to fully understand the exact security parameters, architectural decisions, and residual risks involved in using the APEX Protocol.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-3">Non-Custodial Design</h2>
                <div className="glass-card p-6 bg-[rgba(255,255,255,0.8)] border border-[rgba(0,0,0,0.05)]">
                    <p className="text-secondary">
                        Your USDC is never held by a person, company, or team entity. It is held entirely within immutable smart contracts deployed on the BNB Chain. <strong>No one — including the APEX team — can move or access your funds.</strong>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-[18px] font-medium mb-2 text-primary">No Admin Keys</h2>
                    <p className="text-sm text-secondary leading-relaxed">
                        APEX contracts possess no owner functions that can shift user funds or alter the primary logic. The logic governing the brain and compounder is permanently set. 
                    </p>
                </div>
                <div>
                    <h2 className="text-[18px] font-medium mb-2 text-primary">No Upgradeable Contracts</h2>
                    <p className="text-sm text-secondary leading-relaxed">
                        Once deployed, APEX contracts cannot be changed. What is deployed is what runs — permanently. This prevents malicious updates and completely removes the "rug via upgrade" attack vector.
                    </p>
                </div>
                <div>
                    <h2 className="text-[18px] font-medium mb-2 text-primary">Emergency Pause Guard</h2>
                    <p className="text-sm text-secondary leading-relaxed">
                        In the event of a critical global vulnerability, the vault can be paused to prevent new deposits and withdrawals while the issue is triaged. This is the only privileged function, and it is strictly controlled by a multisig wallet requiring multiple signatures.
                    </p>
                </div>
                <div>
                    <h2 className="text-[18px] font-medium mb-2 text-primary">Open Source Codebase</h2>
                    <p className="text-sm text-secondary leading-relaxed">
                        Security requires sunlight. All APEX contracts are fully open source, documented, and verifiable on both GitHub and BscScan. We encourage developers to independently audit our contract code.
                    </p>
                </div>
            </div>

            <div className="border-t border-[rgba(0,0,0,0.05)] pt-8 mt-2">
                <h2 className="text-[20px] font-medium mb-4">Audit Status</h2>
                <div className="glass-card p-6 border-l-4 border-l-secondary bg-[rgba(0,0,0,0.02)]">
                    <p className="text-[#0A0A0A] font-medium mb-2">Currently Unaudited (Hackathon Phase)</p>
                    <p className="text-secondary text-sm leading-relaxed">
                        APEX is currently a Hackathon release candidate. It has <strong>not yet</strong> undergone a formal third-party security audit. While the contracts are built exclusively on standard OpenZeppelin foundations and tested rigorously, undiscovered bugs may exist. A full audit is planned as the first post-hackathon milestone. Please use at your own risk.
                    </p>
                </div>
            </div>

            <div className="border-t border-[rgba(0,0,0,0.05)] pt-8 mt-2">
                <h2 className="text-[20px] font-medium mb-4">Known Systemic Risks</h2>
                <div className="flex flex-col gap-4">
                    <div className="glass-card p-5 border-l-4 border-l-[#EF4444]">
                        <h3 className="font-medium text-primary mb-1">Smart Contract Risk</h3>
                        <p className="text-sm text-secondary">Despite best efforts and test coverage, complex interactions between contracts can yield unexpected behaviors or logic bugs that attackers can exploit.</p>
                    </div>
                    <div className="glass-card p-5 border-l-4 border-l-[#F59E0B]">
                        <h3 className="font-medium text-primary mb-1">Protocol / Counterparty Risk</h3>
                        <p className="text-sm text-secondary">APEX relies heavily on the underlying stability of the <strong>AsterDEX</strong> components (asBNB and asUSDF minters). If AsterDEX suffers a compromise, APEX positions will be affected.</p>
                    </div>
                    <div className="glass-card p-5 border-l-4 border-l-[#F59E0B]">
                        <h3 className="font-medium text-primary mb-1">Market Risk</h3>
                        <p className="text-sm text-secondary">BNB price movements directly affect the value of the Staking Strategy. While the buffer hedges this, it cannot prevent the raw fiat devaluation of the underlying token.</p>
                    </div>
                    <div className="glass-card p-5 border-l-4 border-l-[#F59E0B]">
                        <h3 className="font-medium text-primary mb-1">Residual IL Risk</h3>
                        <p className="text-sm text-secondary">During violent, rapid market crashes, Impermanent Loss may accumulate faster than the asUSDF buffer's ability to cover it, resulting in a Hedge Efficiency Score below 100%.</p>
                    </div>
                    <div className="glass-card p-5 border-l-4 border-l-[#F59E0B]">
                        <h3 className="font-medium text-primary mb-1">Liquidity Risk</h3>
                        <p className="text-sm text-secondary">Large withdrawals depend on sufficient exit liquidity in the underlying decentralized exchanges (e.g. PancakeSwap) for swapping asBNB/asUSDF back to USDC.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
