import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch<T>(fetchFn: () => Promise<T>, deps: any[] = [], interval: number = 0) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchFnRef = useRef(fetchFn);
    const isFirstRun = useRef(true);

    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const result = await fetchFnRef.current();
            setData(result);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    // İlk yüklemede bir kez fetch yap
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // deps değiştiğinde yeniden fetch yap (ilk render hariç)
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        refetch();
    }, deps);

    useEffect(() => {
        if (interval > 0) {
            const intervalId = setInterval(() => {
                console.log('Auto-refreshing data...');
                fetchData();
            }, interval);

            return () => clearInterval(intervalId);
        }
    }, [interval, fetchData]);

    return {
        data,
        loading,
        error,
        refetch
    };
}
