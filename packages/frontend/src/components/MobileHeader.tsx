"use client";

import { ConnectWallet } from "./ConnectWallet";
import { usePathname } from "next/navigation";

export function MobileHeader() {
    const pathname = usePathname();
    const isDocs = pathname?.startsWith("/docs");
    
    // The docs have their own header mechanics, so we hide this general Dashboard header on docs pages
    if (isDocs) return null;

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-white/85 backdrop-blur-xl border-b border-[rgba(0,0,0,0.06)] md:hidden">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#1A56DB] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </div>
                <span className="font-semibold tracking-tight text-[#0A0A0A] text-[17px]">APEX</span>
            </div>
            
            {/* The ConnectWallet component itself will handle responsive shrinking via globals CSS or Tailwind */}
            <div className="scale-90 origin-right">
                <ConnectWallet />
            </div>
        </header>
    );
}
