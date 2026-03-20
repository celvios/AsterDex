import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "FAQ | APEX Protocol Docs",
    description: "Frequently asked questions about APEX's non-custodial yield and IL protection.",
};

const faqs = [
    {
        q: "Is my USDC safe?",
        a: "APEX is strictly non-custodial. We never hold your funds. Your USDC is handled entirely by verified smart contracts on the BNB Chain. However, like all DeFi protocols, APEX carries smart contract risk. Read more on the Security page."
    },
    {
        q: "What is APEX-LP and why do I receive it?",
        a: "APEX-LP is the standard ERC-4626 receipt token representing your share of the total vault. When you deposit USDC, you receive APEX-LP. When you want to withdraw, you burn your APEX-LP to retrieve your principal plus yield."
    },
    {
        q: "When does compounding happen?",
        a: "Compounding is permissionless and happens whenever any user calls the compound() function. Since we pay a 0.5% bounty to the caller, independent keepers usually trigger it multiple times a day as soon as the harvest becomes profitable."
    },
    {
        q: "Can I lose money?",
        a: "Yes. While APEX hedges against Impermanent Loss, extreme market volatility could outpace the buffer's growth. Additionally, if the underlying yield assets (asBNB or asUSDF) suffer a catastrophic failure, your principal is at risk."
    },
    {
        q: "What is impermanent loss?",
        a: "Impermanent loss (IL) happens when the price of assets in a liquidity pool diverge. APEX calculates this divergence exposure and actively builds a yield-bearing buffer to cover the difference. See the IL Protection page for formulas."
    },
    {
        q: "What does the IL Protection Score mean?",
        a: "The score (technically hedgeEfficiency) measures how much of your IL exposure is covered by the asUSDF buffer. A score of 8,500 means 85% of your exposure is covered. This is recorded permanently on-chain every compound cycle."
    },
    {
        q: "Why is my APY different from the displayed rate?",
        a: "The displayed Blended APY is an estimate based on current rates. The actual APY you receive depends on the Brain's real-time splits, the varying base yield of asBNB, and how long you remain in the vault."
    },
    {
        q: "How do I claim my yield?",
        a: "You don't need to do anything. APEX is an auto-compounding vault. Your yield is automatically reinvested, increasing the underlying value of your APEX-LP shares. You simply withdraw when you are ready."
    },
    {
        q: "What is the 0.1% exit fee for?",
        a: "The 0.1% withdrawal fee remains fully inside the vault. It acts as an anti-dilution measure against sandwich attacks and boosts the APY for the long-term holders remaining in the vault."
    },
    {
        q: "Can I withdraw anytime?",
        a: "Yes. There are no lock-up periods in APEX. You can withdraw your full position at any time, subject only to blockchain gas fees and the 0.1% protocol exit fee."
    },
    {
        q: "What happens if BNB price crashes 50%?",
        a: "Since the Staking Strategy is long BNB via asBNB, a 50% crash in BNB would result in IL. However, the APEX Brain would detect this and shift up to 60% of all yield into the asUSDF stablecoin buffer to limit the drawdown."
    },
    {
        q: "What is the Brain and can I turn it off?",
        a: "The APEX Brain is an autonomous on-chain risk engine that controls the reward split based on real-time IL. It is hardcoded into the protocol and cannot be turned off by users or admins."
    },
    {
        q: "Who controls APEX?",
        a: "No one. The vault operates entirely autonomously. The deployment team only controls an emergency pause function secured by a multi-sig, which can freeze interaction in the event of a catastrophic vulnerability."
    },
    {
        q: "Has APEX been audited?",
        a: "No. APEX is currently a Hackathon release and has not undergone a formal third-party security audit. While we follow all OpenZeppelin best practices, please use at your own risk."
    },
    {
        q: "What is asBNB?",
        a: "asBNB (Aster Liquid Staked BNB) is a yield-bearing token representing staked BNB. Its value appreciates automatically as it accrues staking rewards, HODLer airdrops, and Megadrops."
    },
    {
        q: "What is asUSDF?",
        a: "asUSDF is a yield-bearing version of the USDF stablecoin provided by AsterDEX. It earns a steady, low-risk yield (~3.6% APY), making it the perfect asset to build the APEX Hedge Buffer."
    },
    {
        q: "What is the 0.5% compound bounty?",
        a: "To ensure the vault compounds automatically without centralized servers, APEX pays 0.5% of the harvested yield directly to whatever wallet triggers the compound() function. This costs depositors nothing extra."
    },
    {
        q: "Why does my balance show as APEX-LP not USDC?",
        a: "Because you deposited into a managed vault. APEX-LP represents your receipt. If the vault grows by 10%, your APEX-LP shares will be worth 10% more USDC when you withdraw them."
    },
    {
        q: "What is BNB Chain?",
        a: "BNB Chain is a high-throughput, low-fee Ethereum Virtual Machine (EVM) compatible blockchain where the APEX Protocol smart contracts are deployed."
    },
    {
        q: "How is APEX different from just holding asBNB?",
        a: "If you just hold asBNB, you assume 100% of the volatility risk. APEX actively skims the yield from asBNB and builds a stablecoin safety net (asUSDF) to hedge your downside during volatility."
    }
];

export default function FAQPage() {
    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">Frequently Asked Questions</h1>
                <p className="text-secondary mb-8">
                    Everything you need to know about APEX, from smart contract safety to claiming your yield.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {faqs.map((faq, index) => (
                    <details 
                        key={index} 
                        className="glass-card group [&_summary::-webkit-details-marker]:hidden bg-[rgba(255,255,255,0.7)]"
                    >
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-primary hover:bg-[rgba(0,0,0,0.02)] transition-colors rounded-xl">
                            <span className="pr-4">{faq.q}</span>
                            <span className="shrink-0 transition-transform duration-300 group-open:-rotate-180 text-accent bg-[rgba(26,86,219,0.1)] p-1 rounded-full">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </summary>
                        <div className="px-4 pb-4 pt-1 text-sm text-secondary leading-relaxed border-t border-[rgba(0,0,0,0.05)] mx-4 mt-2 pt-4">
                            {faq.a}
                        </div>
                    </details>
                ))}
            </div>
            
            <div className="mt-8 p-6 glass-card bg-[rgba(26,86,219,0.03)] border-l-4 border-l-accent flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                    <h3 className="font-medium text-primary mb-1">Still have questions?</h3>
                    <p className="text-sm text-secondary">Join our community or read the Glossary for terminology.</p>
                </div>
                <Link href="/docs/glossary" className="shrink-0 px-4 py-2 bg-[rgba(0,0,0,0.8)] text-white text-sm font-medium rounded-lg hover:bg-black transition-colors">
                    View Glossary
                </Link>
            </div>
        </div>
    );
}
