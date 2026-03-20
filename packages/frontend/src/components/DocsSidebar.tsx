"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const DOCS_LINKS = [
    { name: "Overview", path: "/docs/overview" },
    { name: "How It Works", path: "/docs/how-it-works" },
    { name: "IL Protection", path: "/docs/il-protection" },
    { name: "Getting Started", path: "/docs/getting-started" },
    { name: "Yield & Fees", path: "/docs/yield-and-fees" },
    { name: "Security", path: "/docs/security" },
    { name: "Smart Contracts", path: "/docs/contracts" },
    { name: "FAQ", path: "/docs/faq" },
    { name: "Roadmap", path: "/docs/roadmap" },
    { name: "Glossary", path: "/docs/glossary" },
];

export function DocsSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Hamburger Header */}
            <div className="md:hidden flex items-center justify-between p-4 glass-card mb-4 mt-1">
                <div className="font-semibold text-[18px]">
                    <span className="text-accent">APEX</span> Docs
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-primary"
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            {/* Mobile Full-Screen Slide-over drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] md:hidden flex animate-in fade-in">
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div className="relative w-[280px] h-full bg-white/95 backdrop-blur-2xl p-6 flex flex-col border-r border-[#E5E7EB] animate-in slide-in-from-left shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div className="font-semibold text-xl">
                                <span className="text-accent">APEX</span> Docs
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2 overflow-y-auto pr-2">
                            {DOCS_LINKS.map((link) => {
                                const isActive = pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        href={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? "bg-[#1A56DB]/10 text-[#1A56DB] font-semibold border border-[#1A56DB]/20" : "text-[#4B5563] active:bg-gray-100"}`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        
                        <div className="mt-auto pt-8 border-t border-gray-100">
                            <Link href="/" className="flex items-center gap-2 text-sm text-[#4B5563] active:text-[#111827] font-medium" onClick={() => setIsOpen(false)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg> Back to App
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden md:flex glass-card flex-col p-6 w-[240px] flex-shrink-0 sticky top-8 h-[calc(100vh-64px)]">
                <div className="mb-8">
                    <Link href="/" className="font-semibold text-xl hover:opacity-80 transition-opacity">
                        <span className="text-accent">APEX</span> Docs
                    </Link>
                </div>

                <nav className="flex flex-col gap-2 overflow-y-auto pr-2">
                    {DOCS_LINKS.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? "bg-[rgba(26,86,219,0.1)] text-accent font-semibold border border-[rgba(26,86,219,0.2)]" : "text-secondary hover:bg-[rgba(0,0,0,0.03)] hover:text-primary"}`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                
                <div className="mt-auto pt-8">
                    <Link href="/" className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg> Back to App
                    </Link>
                </div>
            </div>
        </>
    );
}
