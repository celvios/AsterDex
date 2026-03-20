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
            {/* Mobile Hamburger Overlay */}
            <div className="md:hidden flex items-center justify-between p-4 glass-card mb-4">
                <div className="font-semibold text-[18px]">
                    <span className="text-accent">APEX</span> Docs
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-primary"
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </>
                        )}
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                glass-card flex-col p-6 w-full md:w-[240px] flex-shrink-0
                md:flex md:sticky md:top-8 md:h-[calc(100vh-64px)] 
                ${isOpen ? "flex mb-6" : "hidden"}
            `}>
                <div className="hidden md:block mb-8">
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
                                onClick={() => setIsOpen(false)}
                                className={`
                                    px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                                    ${isActive 
                                        ? "bg-[rgba(26,86,219,0.1)] text-accent font-semibold border border-[rgba(26,86,219,0.2)]" 
                                        : "text-secondary hover:bg-[rgba(0,0,0,0.03)] hover:text-primary"}
                                `}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                
                <div className="mt-auto pt-8">
                    <Link 
                        href="/"
                        className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                        Back to App
                    </Link>
                </div>
            </div>
        </>
    );
}
