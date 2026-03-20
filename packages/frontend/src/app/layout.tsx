import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomTabBar } from "@/components/BottomTabBar";

export const metadata: Metadata = {
    title: "APEX Protocol — Autonomous IL Protection",
    description: "Autonomous Protocol for Exponential Yield. Smart IL hedging on BNB Chain powered by the Brain.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {/* Ambient background blobs for glassmorphism refraction */}
                <div className="blob blob-blue" aria-hidden="true" />
                <div className="blob blob-violet" aria-hidden="true" />
                <div className="blob blob-teal" aria-hidden="true" />

                <Providers>
                    <MobileHeader />
                    {children}
                    <BottomTabBar />
                </Providers>
            </body>
        </html>
    );
}
