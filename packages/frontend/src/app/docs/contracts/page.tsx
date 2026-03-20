import { Metadata } from 'next';
import { ContractAddress } from '@/components/ContractAddress';

export const metadata: Metadata = {
    title: "Smart Contracts | APEX Protocol Docs",
    description: "Technical reference for APEX smart contracts, deployed addresses, and signatures.",
};

// Assuming process.env variables fallback to TESTNET for the docs if not set, or we dynamically pull from addresses.ts
// We'll use hardcoded fallbacks here just for the display on the docs page, aligning with testnet (Deploy #3)
const ADDR = {
    vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0xaDe268eC205E41A25B8DE4DEc9D6752D8DFB3766",
    brain: process.env.NEXT_PUBLIC_BRAIN_ADDRESS || "0xD8274431eB6bA88A196fb10b6528d2274A4Bfba8",
    compounder: process.env.NEXT_PUBLIC_COMPOUNDER_ADDRESS || "0xd653f538356897bDaA17B8CbE21226023EbaFEA9",
    staking: process.env.NEXT_PUBLIC_STAKING_STRATEGY_ADDRESS || "0x98A17D65F348E088A58Cbfe76e9FCA5ff0624dD3",
    buffer: process.env.NEXT_PUBLIC_BUFFER_STRATEGY_ADDRESS || "0x9AdbE809DeB866530691eCAfc16fC3A7A6Aa4C29",
    usdc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    asBnb: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
    asBnbMinter: "0x2F31ab8950c50080E77999fa456372f276952fD8",
    asUsdf: "0x917AF46B3C3c6e1Bb7286B9F59637Fb7C65851Fb",
    asUsdfMinter: "0xdB57a53C428a9faFcbFefFB6dd80d0f427543695"
};

export default function ContractsPage() {
    return (
        <div className="docs-content flex flex-col gap-8">
            <div>
                <h1 className="text-[28px] font-medium mb-4">Smart Contracts</h1>
                <p className="text-secondary mb-4">
                    The APEX Protocol is entirely non-custodial and operates through a suite of verified open-source smart contracts on the BNB Chain.
                </p>
            </div>

            <div>
                <h2 className="text-[20px] font-medium mb-4">Deployed Addresses</h2>
                <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.6)] shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[rgba(0,0,0,0.02)]">
                            <tr className="border-b border-[rgba(0,0,0,0.05)] text-secondary">
                                <th className="py-3 px-4 font-medium">Contract</th>
                                <th className="py-3 px-4 font-medium">Network</th>
                                <th className="py-3 px-4 font-medium">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">APEXVault</td>
                                <td className="py-3 px-4 text-secondary">BSC Testnet</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.vault} network="BSC Testnet" /></td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">APEXBrain</td>
                                <td className="py-3 px-4 text-secondary">BSC Testnet</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.brain} network="BSC Testnet" /></td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">APEXCompounder</td>
                                <td className="py-3 px-4 text-secondary">BSC Testnet</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.compounder} network="BSC Testnet" /></td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">StakingStrategy</td>
                                <td className="py-3 px-4 text-secondary">BSC Testnet</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.staking} network="BSC Testnet" /></td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-medium text-primary">BufferStrategy</td>
                                <td className="py-3 px-4 text-secondary">BSC Testnet</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.buffer} network="BSC Testnet" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-[20px] font-medium mb-4">Protocol Dependencies (Mainnet)</h2>
                <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.6)] shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[rgba(0,0,0,0.02)]">
                            <tr className="border-b border-[rgba(0,0,0,0.05)] text-secondary">
                                <th className="py-3 px-4 font-medium">Token/Protocol</th>
                                <th className="py-3 px-4 font-medium">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">USDC</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.usdc} /></td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">asBNB (AsterDEX)</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.asBnb} /></td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary text-[13px]">asBNB Minter</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.asBnbMinter} /></td>
                            </tr>
                            <tr className="border-b border-[rgba(0,0,0,0.05)]">
                                <td className="py-3 px-4 font-medium text-primary">asUSDF (AsterDEX)</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.asUsdf} /></td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-medium text-primary text-[13px]">asUSDF Minter</td>
                                <td className="py-3 px-4"><ContractAddress address={ADDR.asUsdfMinter} /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-[20px] font-medium mb-4">Key Functions</h2>
                
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-[16px] font-medium mb-3 text-accent flex items-center gap-2">
                            <span>APEXVault</span>
                            <span className="text-[10px] bg-[rgba(26,86,219,0.1)] text-accent px-2 py-0.5 rounded-full uppercase tracking-wider">ERC-4626</span>
                        </h3>
                        <div className="bg-[rgba(255,255,255,0.9)] border border-[rgba(0,0,0,0.08)] rounded-lg p-4 font-mono text-[13px] text-secondary flex flex-col gap-2 shadow-sm">
                            <div><span className="text-primary font-medium">deposit</span>(uint256 assets, address receiver) <span className="text-[rgba(0,0,0,0.3)]">→ uint256</span></div>
                            <div><span className="text-primary font-medium">withdraw</span>(uint256 assets, address receiver, address owner) <span className="text-[rgba(0,0,0,0.3)]">→ uint256</span></div>
                            <div className="border-t border-[rgba(0,0,0,0.05)] my-1 pt-2"><span className="text-primary font-medium">totalAssets</span>() <span className="text-[rgba(0,0,0,0.3)]">→ uint256</span></div>
                            <div><span className="text-primary font-medium">pricePerShare</span>() <span className="text-[rgba(0,0,0,0.3)]">→ uint256</span></div>
                            <div className="border-t border-[rgba(0,0,0,0.05)] my-1 pt-2"><span className="text-[#10B981] font-medium">latestHedgeSnapshot</span>() <span className="text-[rgba(0,0,0,0.3)]">→ HedgeSnapshot</span></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[16px] font-medium mb-3 text-accent">APEXBrain</h3>
                        <div className="bg-[rgba(255,255,255,0.9)] border border-[rgba(0,0,0,0.08)] rounded-lg p-4 font-mono text-[13px] text-secondary flex flex-col gap-2 shadow-sm">
                            <div><span className="text-primary font-medium">computeSplit</span>() <span className="text-[rgba(0,0,0,0.3)]">→ SplitVector</span></div>
                            <div><span className="text-primary font-medium">currentSplit</span>() <span className="text-[rgba(0,0,0,0.3)]">→ SplitVector</span></div>
                            <div><span className="text-primary font-medium">currentRegime</span>() <span className="text-[rgba(0,0,0,0.3)]">→ string</span></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[16px] font-medium mb-3 text-accent flex items-center gap-2">
                            <span>APEXCompounder</span>
                            <span className="text-[10px] bg-[rgba(16,185,129,0.1)] text-[#10B981] px-2 py-0.5 rounded-full uppercase tracking-wider">Permissionless</span>
                        </h3>
                        <div className="bg-[rgba(255,255,255,0.9)] border border-[rgba(0,0,0,0.08)] rounded-lg p-4 font-mono text-[13px] text-secondary flex flex-col gap-2 shadow-sm">
                            <div><span className="text-[#F59E0B] font-medium">compound</span>() <span className="text-[rgba(0,0,0,0.3)]">→ uint256 harvested</span> <span className="text-xs text-[rgba(0,0,0,0.4)] ml-2 italic">// Rewards caller 0.5%</span></div>
                            <div className="border-t border-[rgba(0,0,0,0.05)] my-1 pt-2"><span className="text-primary font-medium">lastCompound</span>() <span className="text-[rgba(0,0,0,0.3)]">→ uint256</span></div>
                            <div><span className="text-primary font-medium">totalCompounds</span>() <span className="text-[rgba(0,0,0,0.3)]">→ uint256</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 glass-card p-6 border-l-4 border-l-accent bg-[rgba(26,86,219,0.02)]">
                <h2 className="text-[18px] font-medium mb-3 text-primary">GitHub Repository</h2>
                <p className="text-secondary mb-3">
                    Every line of code powering the APEX Staking Protocol is completely open source. You can audit the architecture, the math libraries, and our extensive test suites.
                </p>
                <a 
                    href="https://github.com/celvios/apex-protocol" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(0,0,0,0.8)] text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    View Source Code
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
        </div>
    );
}
