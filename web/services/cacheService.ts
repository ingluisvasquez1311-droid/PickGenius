type CacheEntry<T> = {
    data: T;
    expiry: number;
};

class SimpleCacheService {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly DEFAULT_TTL = 60 * 1000; // 1 minute default

    /**
     * Set a value in the cache with a specific TTL (in seconds)
     */
    set<T>(key: string, data: T, ttlSeconds: number = 60): void {
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { data, expiry });

        // Basic cleanup strategy: limit size
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }
    }

    /**
     * Get a value from the cache if it exists and hasn't expired.
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Helper to wrap an async function with caching
     */
    async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 60): Promise<T> {
        const cached = this.get<T>(key);
        if (cached) {
            console.log(`[Cache] HIT: ${key}`);
            return cached;
        }

        console.log(`[Cache] MISS: ${key}`);
        const data = await fetchFn();
        this.set(key, data, ttlSeconds);
        return data;
    }

    /**
     * Clear specific key or flush all
     */
    invalidate(key: string) {
        this.cache.delete(key);
    }

    flush() {
        this.cache.clear();
    }
}

// Singleton instance
export const globalCache = new SimpleCacheService();
