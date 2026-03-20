"use client";

import { useState } from "react";

export function ContractAddress({ address, network = "BSC" }: { address: string, network?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const bscScanUrl = network === "BSC Testnet" 
        ? `https://testnet.bscscan.com/address/${address}` 
        : `https://bscscan.com/address/${address}`;

    // If it's a zero address (not deployed yet), show a simple placeholder
    if (!address || address === "0x0000000000000000000000000000000000000000") {
        return (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.06)] text-secondary text-sm mono">
                Contract not deployed yet
            </span>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.8)] rounded-lg px-3 py-1.5 shadow-sm">
            <span className="mono text-[13px] tracking-tight">{address}</span>
            <div className="flex items-center gap-1 border-l border-[rgba(0,0,0,0.1)] pl-2 ml-1">
                <button 
                    onClick={handleCopy}
                    className="p-1 hover:bg-[rgba(0,0,0,0.05)] rounded transition-colors text-secondary hover:text-primary"
                    title="Copy address"
                >
                    {copied ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green, #10B981)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    )}
                </button>
                <a 
                    href={bscScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-[rgba(0,0,0,0.05)] rounded transition-colors text-secondary hover:text-accent"
                    title="View on BscScan"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>
            </div>
        </div>
    );
}
