"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function TabIcon({ type, active }: { type: string; active: boolean }) {
    const className = `w-6 h-6 mb-1 transition-colors ${active ? "text-[#1A56DB]" : "text-[#9CA3AF]"}`;
    
    switch (type) {
        case "home":
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            );
        case "shield":
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            );
        case "plus":
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            );
        case "minus":
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
            );
        case "book":
            return (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            );
        default:
            return null;
    }
}

export function BottomTabBar() {
    const pathname = usePathname();

    const tabs = [
        { label: "Dashboard", type: "home", href: "/" },
        { label: "IL Score", type: "shield", href: "/#il-score" },
        { label: "Deposit", type: "plus", href: "/#deposit" },
        { label: "Withdraw", type: "minus", href: "/#withdraw" },
        { label: "Docs", type: "book", href: "/docs" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white/95 backdrop-blur-2xl border-t border-[rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
            {tabs.map((tab) => {
                // Approximate active logic
                const isActive = tab.href === "/" 
                    ? pathname === "/" 
                    : tab.href.startsWith("/docs") 
                        ? pathname.startsWith("/docs") 
                        : false; // Hack for hash routes since pathname doesn't include hash

                return (
                    <Link
                        key={tab.label}
                        href={tab.href}
                        prefetch={false}
                        className="flex-1 flex flex-col items-center justify-center h-[60px] active:scale-95 transition-transform"
                    >
                        <TabIcon type={tab.type} active={isActive} />
                        <span className={`text-[10px] font-medium tracking-wide ${isActive ? "text-[#1A56DB]" : "text-[#9CA3AF]"}`}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
