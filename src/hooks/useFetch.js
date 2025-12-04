import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for data fetching with auto-refresh
 * @param {Function} fetchFn - Async function to fetch data
 * @param {number} interval - Auto-refresh interval in ms (0 to disable)
 * @returns {object} { data, loading, error, refetch }
 */
export const useFetch = (fetchFn, interval = 0) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchFnRef = useRef(fetchFn);

    // Update ref when fetchFn changes
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    /**
     * Fetch data
     */
    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const result = await fetchFnRef.current();
            setData(result);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Refetch data manually
     */
    const refetch = useCallback(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh
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
};
