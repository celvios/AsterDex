import { DocsSidebar } from "@/components/DocsSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation | APEX Protocol",
    description: "Official documentation for the APEX Protocol.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0A]">
            {/* Ambient background blobs match the main app but slightly muted */}
            <div className="blob blob-blue" aria-hidden="true" style={{ opacity: 0.08 }} />
            <div className="blob blob-violet" aria-hidden="true" style={{ opacity: 0.08 }} />
            <div className="blob blob-teal" aria-hidden="true" style={{ opacity: 0.08 }} />

            <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row relative z-10 gap-8 items-start">
                <DocsSidebar />
                <main className="flex-1 w-full max-w-[720px] mx-auto md:mx-0">
                    <div className="glass-card p-6 md:p-10 leading-[1.8]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
