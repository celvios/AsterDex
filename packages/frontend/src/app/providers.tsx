"use client";

import { WagmiProvider, useAccount, useSwitchChain } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { type ReactNode, useState, useEffect } from "react";

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "56");

function AutoChainSwitch() {
    const { isConnected, chainId } = useAccount();
    const { switchChain } = useSwitchChain();

    useEffect(() => {
        if (isConnected && chainId && chainId !== TARGET_CHAIN_ID && switchChain) {
            switchChain({ chainId: TARGET_CHAIN_ID });
        }
    }, [isConnected, chainId, switchChain]);

    return null;
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 10_000,
                refetchInterval: 15_000,
            },
        },
    }));

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <AutoChainSwitch />
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

