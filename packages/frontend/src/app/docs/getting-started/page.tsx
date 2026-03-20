import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Getting Started | APEX Protocol Docs",
    description: "A step-by-step guide to connecting your wallet and depositing USDC into APEX.",
};

export default function GettingStartedPage() {
    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">Getting Started</h1>
                <p className="text-secondary mb-4">
                    Going from zero to earning yield requires just a few minutes. Follow this step-by-step guide to make your first deposit into the APEX Protocol.
                </p>
            </div>

            <div className="glass-card p-6 bg-[rgba(34,197,94,0.05)] border-l-4 border-l-[#22C55E]">
                <h2 className="text-[18px] font-medium mb-3 text-primary">What You Need</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                    <li>A Web3 wallet (MetaMask, Trust Wallet, or Rabby).</li>
                    <li><strong className="text-primary font-medium">BNB</strong> to pay for blockchain gas fees (~$0.50 worth is plenty).</li>
                    <li><strong className="text-primary font-medium">USDC</strong> natively on the BNB Chain (minimum 1 USDC).</li>
                </ul>
            </div>

            <div className="flex flex-col gap-10 mt-4">
                {/* Step 1 */}
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">1</div>
                    <h2 className="text-[20px] font-medium mb-2">Install a Wallet</h2>
                    <p className="text-secondary mb-4">
                        If you don't have one, install <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MetaMask ↗</a> in your browser or on your phone. Write down your 12-word seed phrase on paper and never share it with anyone.
                    </p>
                    <div className="glass-card p-4 text-sm text-[#EF4444] bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)]">
                        <strong>⚠️ Security Warning:</strong> Only download wallets from their official websites. Never enter your seed phrase into any website — including ours.
                    </div>
                </div>

                {/* Step 2 */}
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">2</div>
                    <h2 className="text-[20px] font-medium mb-2">Configure BNB Chain</h2>
                    <p className="text-secondary mb-4">
                        APEX operates exclusively on the BNB Chain. If your wallet defaults to Ethereum, you need to add the BNB network. Our app will attempt to do this automatically when you connect, or you can add it manually:
                    </p>
                    <div className="bg-[rgba(255,255,255,0.6)] border border-[rgba(0,0,0,0.08)] rounded-xl p-4 md:p-6 overflow-x-auto shadow-sm">
                        <pre className="mono text-sm text-[13px] text-primary">
Network Name : BNB Smart Chain
RPC URL      : https://bsc-dataseed.binance.org/
Chain ID     : 56
Symbol       : BNB
Explorer     : https://bscscan.com
                        </pre>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">3</div>
                    <h2 className="text-[20px] font-medium mb-2">Get USDC on BNB Chain</h2>
                    <p className="text-secondary mb-4">
                        APEX specifically accepts native USDC. You can get this by:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-secondary mb-4">
                        <li>Withdrawing USDC from a centralized exchange (like Binance or Gate.io) directly to your wallet via the <strong>BEP20 / BSC network</strong>.</li>
                        <li>Bridging USDC from Ethereum or Arbitrum using a bridge like Stargate.</li>
                    </ul>
                    <div className="glass-card p-4 text-sm bg-[rgba(26,86,219,0.05)] border border-[rgba(26,86,219,0.1)]">
                        <strong>Note:</strong> Make absolutely sure you are withdrawing to the BNB Chain (BEP20). Sending assets to the wrong network can result in permanent loss.
                    </div>
                </div>

                {/* Step 4 */}
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">4</div>
                    <h2 className="text-[20px] font-medium mb-2">Connect Your Wallet</h2>
                    <p className="text-secondary mb-4">
                        Go to the APEX Dashboard and click the <strong>Connect Wallet</strong> button in the top right corner. Accept the signature request in your wallet.
                    </p>
                </div>

                {/* Step 5 */}
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">5</div>
                    <h2 className="text-[20px] font-medium mb-2">Approve USDC</h2>
                    <p className="text-secondary mb-4">
                        Before APEX can move your USDC into the vault, you must grant the smart contract permission. Enter your deposit amount and click <strong>Approve</strong>. Your wallet will prompt you to set a spending cap. Setting the exact amount provides maximum security.
                    </p>
                </div>

                {/* Step 6 */}
                <div className="relative pl-12">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">6</div>
                    <h2 className="text-[20px] font-medium mb-2">Deposit</h2>
                    <p className="text-secondary mb-4">
                        Once approved, click <strong>Deposit</strong>. Confirm the transaction in your wallet and pay the small BNB gas fee.
                    </p>
                    <p className="text-secondary">
                        Upon success, your USDC leaves your wallet, and you will receive <strong>APEX-LP</strong> shares in return. These receipt tokens guarantee your ownership of the vault's underlying assets.
                    </p>
                </div>

                {/* Step 7 */}
                <div className="relative pl-12 border-l-0">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-sm">7</div>
                    <h2 className="text-[20px] font-medium mb-2">Watch Your Yield</h2>
                    <p className="text-secondary mb-4">
                        You're done! Your yield automatically compounds. You do not need to claim anything. As the vault generates yield, the <strong>Price Per Share</strong> of your APEX-LP tokens increases. When you withdraw, your shares will be exchanged for more USDC than you initially put in.
                    </p>
                </div>
                
            </div>

            <div className="border-t border-[rgba(0,0,0,0.05)] pt-8 mt-2">
                <h2 className="text-[20px] font-medium mb-4">Withdrawing</h2>
                <p className="text-secondary mb-4">
                    Withdrawing is simple. Go to the Withdraw tab, enter the amount of APEX-LP shares you want to burn, and hit <strong>Withdraw</strong>.
                </p>
                <p className="text-secondary">
                    Please note that the protocol charges a strict <strong className="text-accent">0.1% exit fee</strong> on the withdrawn capital. This fee remains inside the vault to boost the APY of long-term holders and protect against malicious sandwich attacks.
                </p>
            </div>

            <div className="glass-card p-6 mt-4 flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-primary mb-1">Still confused?</h3>
                    <p className="text-sm text-secondary">Check out the most common beginner questions.</p>
                </div>
                <Link href="/docs/faq" className="px-4 py-2 bg-[rgba(26,86,219,0.1)] text-accent border border-[rgba(26,86,219,0.2)] text-sm font-medium rounded-lg hover:bg-accent hover:text-white transition-colors">
                    Read the FAQ
                </Link>
            </div>

        </div>
    );
}
