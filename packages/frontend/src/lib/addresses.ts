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
// Deploy #3 — must match the vault's constructor args
const TESTNET_ADDRESSES = {
    USDC: "0x318Fb4316C0B93B49b2547F9336D919A64c2C1e2",
    WBNB: "0xCC86105d69Bd74762804E205D7904D2Be4d91221",
    AS_BNB: "0xC61abAE7309608556B6B66383629c7279D9d5993",
    AS_BNB_MINTER: "0xeB92eafE44B0a724d995ac72CA48F20B1cB8D647",
    AS_USDF: "0xfb5E59eB0f5C5315544110795d6B6a4c12972Cfb",
    AS_USDF_MINTER: "0xDC0ef19891A44cdc21E7EEbAbd65B7FB13BE7505",
    PANCAKE_ROUTER: "0xF153B3Be64d8a64631Df3D9D37D79C7eFe2027ac",
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
