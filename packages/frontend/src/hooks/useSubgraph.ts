import { useEffect, useState, useCallback } from "react";
import {
    querySubgraph,
    HEDGE_SNAPSHOTS_QUERY,
    COMPOUND_EVENTS_QUERY,
    DAILY_SNAPSHOTS_QUERY,
} from "@/lib/graphql";

const POLL_INTERVAL_MS = 60_000; // Re-fetch subgraph every 60 seconds

export function useHedgeSnapshots() {
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(() => {
        querySubgraph<{ hedgeSnapshots: unknown[] }>(HEDGE_SNAPSHOTS_QUERY)
            .then((res) => setData(res.hedgeSnapshots ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetch();
        const timer = setInterval(fetch, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetch]);

    return { data, loading };
}

export function useCompoundEvents() {
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(() => {
        querySubgraph<{ compoundEvents: unknown[] }>(COMPOUND_EVENTS_QUERY)
            .then((res) => setData(res.compoundEvents ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetch();
        const timer = setInterval(fetch, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetch]);

    return { data, loading };
}

export function useDailySnapshots() {
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(() => {
        querySubgraph<{ dailySnapshots: unknown[] }>(DAILY_SNAPSHOTS_QUERY)
            .then((res) => setData(res.dailySnapshots ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetch();
        const timer = setInterval(fetch, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetch]);

    return { data, loading };
}
