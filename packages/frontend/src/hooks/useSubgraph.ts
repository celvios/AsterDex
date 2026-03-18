import { useEffect, useState } from "react";
import {
    querySubgraph,
    HEDGE_SNAPSHOTS_QUERY,
    COMPOUND_EVENTS_QUERY,
    DAILY_SNAPSHOTS_QUERY,
} from "@/lib/graphql";

export function useHedgeSnapshots() {
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        querySubgraph<{ hedgeSnapshots: unknown[] }>(HEDGE_SNAPSHOTS_QUERY)
            .then((res) => setData(res.hedgeSnapshots))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}

export function useCompoundEvents() {
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        querySubgraph<{ compoundEvents: unknown[] }>(COMPOUND_EVENTS_QUERY)
            .then((res) => setData(res.compoundEvents))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}

export function useDailySnapshots() {
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        querySubgraph<{ dailySnapshots: unknown[] }>(DAILY_SNAPSHOTS_QUERY)
            .then((res) => setData(res.dailySnapshots))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}
