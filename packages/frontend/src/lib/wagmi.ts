import { http, createConfig } from "wagmi";
import { bsc } from "wagmi/chains";

/// wagmi v2 config — BNB Chain only
export const config = createConfig({
    chains: [bsc],
    transports: {
        [bsc.id]: http(),
    },
});
