import RedisManager from '@/lib/redis';

type CacheEntry<T> = {
    data: T;
    expiry: number;
};

class HybridCacheService {
    private localCache: Map<string, CacheEntry<any>> = new Map();
    private readonly DEFAULT_TTL = 60; // 1 minute in seconds

    /**
     * Get a value from the cache. 
     * Tries memory first (L1), then Redis (L2) if on server.
     */
    async get<T>(key: string): Promise<T | null> {
        // L1: Memory Cache (Ultra-fast)
        const entry = this.localCache.get(key);
        if (entry && Date.now() < entry.expiry) {
            console.log(`[Cache L1 HIT]: ${key}`);
            return entry.data as T;
        }

        // L2: Redis Cache (Persistent/Distributed)
        if (typeof window === 'undefined') {
            try {
                const redis = RedisManager.getInstance();
                const data = await redis.get(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    // Hydrate local cache
                    this.localCache.set(key, { data: parsed, expiry: Date.now() + (this.DEFAULT_TTL * 1000) });
                    console.log(`[Cache L2 HIT]: ${key}`);
                    return parsed as T;
                }
            } catch (error) {
                console.warn(`[Redis Error] Failed to get ${key}:`, error);
            }
        }

        return null;
    }

    /**
     * Set a value in both L1 and L2 caches.
     */
    async set<T>(key: string, data: T, ttlSeconds: number = 60): Promise<void> {
        const expiry = Date.now() + (ttlSeconds * 1000);

        // Update L1
        this.localCache.set(key, { data, expiry });

        // Update L2 (Server-only)
        if (typeof window === 'undefined') {
            try {
                const redis = RedisManager.getInstance();
                await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            } catch (error) {
                console.warn(`[Redis Error] Failed to set ${key}:`, error);
            }
        }

        // Cleanup L1 if too large
        if (this.localCache.size > 500) {
            const firstKey = this.localCache.keys().next().value;
            if (firstKey) this.localCache.delete(firstKey);
        }
    }

    /**
     * Helper to wrap an async function with hybrid caching
     */
    async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 60): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached) return cached;

        console.log(`[Cache MISS]: ${key}. Fetching fresh data...`);
        const data = await fetchFn();
        await this.set(key, data, ttlSeconds);
        return data;
    }

    async invalidate(key: string) {
        this.localCache.delete(key);
        if (typeof window === 'undefined') {
            try {
                await RedisManager.getInstance().del(key);
            } catch { }
        }
    }

    async flush() {
        this.localCache.clear();
        if (typeof window === 'undefined') {
            try {
                await RedisManager.getInstance().flushdb();
            } catch { }
        }
    }
}

// Singleton instance
export const globalCache = new HybridCacheService();
