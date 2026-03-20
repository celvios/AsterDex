const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ?? "56";

// ── Mainnet addresses (BSC chainId 56) ──────────────────────────
const MAINNET_ADDRESSES = {
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    WBNB: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095b",
    AS_BNB: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
    AS_BNB_MINTER: "0x2F31ab8950c50080E77999fa456372f276952fD8",
    AS_USDF: "0x917AF46B3C3c6e1Bb7286B9F59637Fb7C65851Fb",
    AS_USDF_MINTER: "0xdB57a53C428a9faFcbFefFB6dd80d0f427543695",
    PANCAKE_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
};

// ── Testnet addresses (BSC Testnet chainId 97) ──────────────────
// These point to the deployed mocks from deploy-testnet.ts
const TESTNET_ADDRESSES = {
    USDC: "0x87113dA48FC32a61989d182a428eA42A167d7b0d",
    WBNB: "0x0000000000000000000000000000000000000000", // no WBNB on testnet mocks
    AS_BNB: "0xf7bE838eA2706f52B663e20aED6804862bd6F287",
    AS_BNB_MINTER: "0xa7Ed1460591DB119e8E1a4090a6eaDe2aE22Ac08",
    AS_USDF: "0xE89CF028F456ec2bB2b650A6996Bb4b2Dc130cdd",
    AS_USDF_MINTER: "0xA46eBA41B841AD176bB5B1CB95434FFfd8E3ccb7",
    PANCAKE_ROUTER: "0x0000000000000000000000000000000000000000", // no PancakeSwap on testnet
};

export const LIVE_ADDRESSES = CHAIN_ID === "97" ? TESTNET_ADDRESSES : MAINNET_ADDRESSES;
export const IS_TESTNET = CHAIN_ID === "97";

export const PANCAKE_ROUTER_ABI = [
    { name: "getAmountsOut", type: "function", stateMutability: "view", inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }], outputs: [{ name: "amounts", type: "uint256[]" }] },
] as const;

export const AS_BNB_MINTER_ABI = [
    { name: "exchangeRate", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

// exchangePrice: returns asUSDF price in USDF terms (1e18 scale, starts at 1e18 and grows over time)
export const AS_USDF_MINTER_ABI = [
    { name: "exchangePrice", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;
