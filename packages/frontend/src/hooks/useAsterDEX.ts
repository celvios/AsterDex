import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { parseEther, formatUnits } from "viem";
import { LIVE_ADDRESSES, IS_TESTNET, PANCAKE_ROUTER_ABI, AS_BNB_MINTER_ABI, AS_USDF_MINTER_ABI } from "@/lib/addresses";

// ── CoinGecko: current + 30d-ago BNB price ──────────────────────
async function fetchBnbPrices(): Promise<{ current: number; entry: number } | null> {
    try {
        const to = Math.floor(Date.now() / 1000);
        const from = to - 30 * 24 * 3600;
        const url = `https://api.coingecko.com/api/v3/coins/binancecoin/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        const json = await res.json();
        const prices: [number, number][] = json?.prices ?? [];
        if (prices.length === 0) return null;
        return {
            entry: prices[0][1],           // ~30 days ago
            current: prices[prices.length - 1][1], // most recent
        };
    } catch {
        return null;
    }
}

export function useAsterDEX() {
    // ── On-chain reads (skip PancakeSwap on testnet) ─────────────
    const contracts = [];

    // Only call PancakeSwap on mainnet
    if (!IS_TESTNET) {
        contracts.push({
            address: LIVE_ADDRESSES.PANCAKE_ROUTER as `0x${string}`,
            abi: PANCAKE_ROUTER_ABI,
            functionName: "getAmountsOut" as const,
            args: [parseEther("1"), [LIVE_ADDRESSES.WBNB as `0x${string}`, LIVE_ADDRESSES.USDC as `0x${string}`]],
        });
    }

    // asBNB exchangeRate — works on both mainnet and testnet (mock returns 1.05e18)
    contracts.push({
        address: LIVE_ADDRESSES.AS_BNB_MINTER as `0x${string}`,
        abi: AS_BNB_MINTER_ABI,
        functionName: "exchangeRate" as const,
    });

    // asUSDF exchangePrice — works on both (mock returns 1.018e18)
    contracts.push({
        address: LIVE_ADDRESSES.AS_USDF_MINTER as `0x${string}`,
        abi: AS_USDF_MINTER_ABI,
        functionName: "exchangePrice" as const,
    });

    const { data: multicallData } = useReadContracts({ contracts });

    // ── CoinGecko price (used for BNB price on testnet + entry price everywhere)
    const [geckoData, setGeckoData] = useState<{ current: number; entry: number } | null>(null);

    useEffect(() => {
        fetchBnbPrices().then((data) => {
            if (data) setGeckoData(data);
        });
    }, []);

    // ── Parse results (index depends on whether PancakeSwap call is included)
    let bnbPrice: number | null = null;
    let asBNBRateRaw: bigint | undefined;
    let asUSDFPriceRaw: bigint | undefined;

    if (IS_TESTNET) {
        // On testnet: no PancakeSwap, use CoinGecko for BNB price
        bnbPrice = geckoData?.current ?? null;
        asBNBRateRaw = multicallData?.[0]?.result as bigint | undefined;
        asUSDFPriceRaw = multicallData?.[1]?.result as bigint | undefined;
    } else {
        // On mainnet: PancakeSwap is index 0
        const bnbPriceRaw = multicallData?.[0]?.result as readonly bigint[] | undefined;
        bnbPrice = bnbPriceRaw ? Number(formatUnits(bnbPriceRaw[1], 6)) : null;
        asBNBRateRaw = multicallData?.[1]?.result as bigint | undefined;
        asUSDFPriceRaw = multicallData?.[2]?.result as bigint | undefined;
    }

    // ── Derived values ───────────────────────────────────────────
    const asBNBRate = asBNBRateRaw ? Number(formatUnits(asBNBRateRaw, 18)) : null;
    const asUSDFPrice = asUSDFPriceRaw ? Number(formatUnits(asUSDFPriceRaw, 18)) : null;

    // asUSDF APY: derived from exchange price growth
    const asUSDFGrowth = asUSDFPrice ? asUSDFPrice - 1.0 : null;
    const bufferAPY = asUSDFGrowth !== null && asUSDFGrowth > 0
        ? Math.min(20, Math.max(0.5, asUSDFGrowth * 2 * 100))
        : 3.6;

    // asBNB staking APY
    const genesisRate = 1.0;
    const stakingAPY = asBNBRate && asBNBRate > genesisRate
        ? Math.min(60, ((asBNBRate - genesisRate) * 12 * 100))
        : 22.4;

    // Blended APY (60/40 split)
    const blendedAPY = (stakingAPY * 0.6) + (bufferAPY * 0.4);

    // ── IL Computation ───────────────────────────────────────────
    const entryPrice = geckoData?.entry ?? bnbPrice ?? null;
    const priceRatio = bnbPrice && entryPrice ? bnbPrice / entryPrice : 1;
    let ilPct = 0;
    if (priceRatio !== 1) {
        ilPct = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
    }
    const ilBps = Math.abs(ilPct) * 10000;
    const ilProtectionScore = Math.max(0, 100 - (ilBps / 100));

    return {
        bnbPrice,
        asBNBRate,
        asUSDFPrice,
        stakingAPY,
        bufferAPY,
        blendedAPY,
        ilBps,
        ilProtectionScore,
        entryPrice,
        isReady: IS_TESTNET
            ? asBNBRate !== null   // On testnet, ready once mock minter responds
            : bnbPrice !== null && asBNBRate !== null,
    };
}
