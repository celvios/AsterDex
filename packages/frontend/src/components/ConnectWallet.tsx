"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "56");

export function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();

    if (!isConnected) {
        return (
            <button
                className="connect-btn"
                onClick={() => connect({ connector: injected() })}
            >
                Connect Wallet
            </button>
        );
    }

    const shortAddr = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "";

    const isCorrectChain = chainId === TARGET_CHAIN_ID;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isCorrectChain && (
                <button
                    className="regime-badge high"
                    style={{ fontSize: "12px", cursor: "pointer", border: "none" }}
                    onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
                >
                    Switch to {TARGET_CHAIN_ID === 97 ? "BSC Testnet" : "BNB Chain"}
                </button>
            )}
            <button
                className="wallet-badge glass-card"
                onClick={() => disconnect()}
                title="Click to disconnect"
                style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.06)" }}
            >
                <span className="wallet-dot" style={{
                    background: isCorrectChain ? "var(--green)" : "var(--red)"
                }} />
                <span className="mono" style={{ fontSize: "13px" }}>{shortAddr}</span>
            </button>
        </div>
    );
}
