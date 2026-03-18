"use client";

import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { injected } from "wagmi/connectors";

export function ConnectWallet() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

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

    const isCorrectChain = chainId === 56;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!isCorrectChain && (
                <span className="regime-badge high" style={{ fontSize: "12px" }}>
                    Wrong Network
                </span>
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
