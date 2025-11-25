const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function cacheData(key: string, data: any) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error('Error caching data:', error);
    }
}

export function getCachedData<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        // Check if cache is expired
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }

        return data as T;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

export function clearCache(key?: string) {
    if (typeof window === 'undefined') return;

    if (key) {
        localStorage.removeItem(key);
    } else {
        // Clear all cache
        const keys = Object.keys(localStorage);
        keys.forEach(k => {
            if (k.startsWith('cache_')) {
                localStorage.removeItem(k);
            }
        });
    }
}
