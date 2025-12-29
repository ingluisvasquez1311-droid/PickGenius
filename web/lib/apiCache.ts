const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export async function getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    duration: number = CACHE_DURATION
): Promise<T> {
    // If running on server side, just fetch
    if (typeof window === 'undefined') {
        return fetchFn();
    }

    try {
        const cached = localStorage.getItem(key);
        if (cached) {
            const { data, timestamp }: CacheItem<T> = JSON.parse(cached);

            // Check if cache is valid
            if (Date.now() - timestamp < duration) {
                return data;
            }
        }
    } catch (error) {
        console.error('Error reading from cache:', error);
    }

    // Fetch fresh data
    try {
        const data = await fetchFn();

        // Save to cache
        try {
            localStorage.setItem(key, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error writing to cache:', error);
        }

        return data;
    } catch (error) {
        throw error;
    }
}
