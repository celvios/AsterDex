// ── Contract Addresses from env vars ──────────────────────────────
// No hardcoded addresses — always load from NEXT_PUBLIC_ env vars

// ── ABI Stubs (replace with full ABIs from compiled artifacts) ────

export const APEX_VAULT_ABI = [
    { name: "totalAssets",         type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
    { name: "pricePerShare",       type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
    { name: "hedgeHistoryLength",  type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
    { name: "latestHedgeSnapshot", type: "function", stateMutability: "view", inputs: [], outputs: [
        { name: "timestamp",       type: "uint256" },
        { name: "ilAmount",        type: "uint256" },
        { name: "hedgeBuffer",     type: "uint256" },
        { name: "hedgeEfficiency", type: "uint256" },
        { name: "stakingBps",      type: "uint256" },
    ]},
    { name: "balanceOf",  type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
    { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
    { name: "deposit",  type: "function", stateMutability: "nonpayable", inputs: [{ name: "assets", type: "uint256" }, { name: "receiver", type: "address" }], outputs: [{ type: "uint256" }] },
    { name: "withdraw", type: "function", stateMutability: "nonpayable", inputs: [{ name: "assets", type: "uint256" }, { name: "receiver", type: "address" }, { name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

export const APEX_BRAIN_ABI = [
    { name: "currentSplit",  type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "stakingBps", type: "uint256" }, { name: "bufferBps", type: "uint256" }] },
    { name: "computeSplit",  type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "stakingBps", type: "uint256" }, { name: "bufferBps", type: "uint256" }] },
    { name: "currentRegime", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
] as const;

export const APEX_COMPOUNDER_ABI = [
    { name: "compound",       type: "function", stateMutability: "nonpayable", inputs: [], outputs: [{ type: "uint256" }] },
    { name: "lastCompound",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
    { name: "totalCompounds", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export function getVaultAddress(): `0x${string}` {
    const addr = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
    if (!addr) return "0x0000000000000000000000000000000000000000";
    return addr as `0x${string}`;
}

export function getBrainAddress(): `0x${string}` {
    const addr = process.env.NEXT_PUBLIC_BRAIN_ADDRESS;
    if (!addr) return "0x0000000000000000000000000000000000000000";
    return addr as `0x${string}`;
}

export function getCompounderAddress(): `0x${string}` {
    const addr = process.env.NEXT_PUBLIC_COMPOUNDER_ADDRESS;
    if (!addr) return "0x0000000000000000000000000000000000000000";
    return addr as `0x${string}`;
}
