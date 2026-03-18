const GRAPH_URL = process.env.NEXT_PUBLIC_GRAPH_URL || "";

export async function querySubgraph<T>(query: string): Promise<T> {
    const res = await fetch(GRAPH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    });
    const json = await res.json();
    return json.data as T;
}

export const HEDGE_SNAPSHOTS_QUERY = `{
    hedgeSnapshots(first: 100, orderBy: timestamp, orderDirection: desc) {
        id timestamp ilAmount hedgeBuffer hedgeEfficiency stakingBps
    }
}`;

export const COMPOUND_EVENTS_QUERY = `{
    compoundEvents(first: 100, orderBy: timestamp, orderDirection: desc) {
        id timestamp totalHarvested toStaking toBuffer callerBounty caller
    }
}`;

export const SPLIT_UPDATES_QUERY = `{
    splitUpdates(first: 100, orderBy: timestamp, orderDirection: desc) {
        id timestamp stakingBps bufferBps ilBps regime
    }
}`;

export const DAILY_SNAPSHOTS_QUERY = `{
    dailySnapshots(first: 30, orderBy: date, orderDirection: desc) {
        id date tvl hedgeEfficiency stakingAPY totalCompounds
    }
}`;
