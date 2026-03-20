import { http, createConfig } from "wagmi";
import { bsc, bscTestnet, hardhat } from "wagmi/chains";

/// wagmi v2 config — BNB Chain mainnet, testnet, or Hardhat fork
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

const chains = chainId === "31337"
    ? [hardhat] as const
    : chainId === "97"
        ? [bscTestnet] as const
        : [bsc] as const;

export const config = createConfig({
    chains,
    transports: {
        [hardhat.id]: http("http://127.0.0.1:8545"),
        [bscTestnet.id]: http("https://bnb-testnet.g.alchemy.com/v2/Xo1rl1WS3c_qYc5694os6"),
        [bsc.id]: http("https://rpc.ankr.com/bsc"),
    },
});
