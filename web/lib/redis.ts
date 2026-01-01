import Redis from 'ioredis';

/**
 * Professional Redis Connection Manager
 * Handles connection pooling, retries, and error states.
 * Only intended for use in Server Components or API Routes.
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisManager {
    private static instance: Redis | null = null;

    public static getInstance(): Redis {
        if (!this.instance) {
            console.log('[Redis] Initializing connection to:', REDIS_URL);

            this.instance = new Redis(REDIS_URL, {
                maxRetriesPerRequest: 3,
                connectTimeout: 10000,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                reconnectOnError: (err) => {
                    const targetError = 'READONLY';
                    if (err.message.includes(targetError)) {
                        return true;
                    }
                    return false;
                }
            });

            this.instance.on('error', (err) => {
                console.error('[Redis Critical Error]:', err.message);
            });

            this.instance.on('connect', () => {
                console.log('[Redis] Bridge Established Successfully');
            });
        }
        return this.instance;
    }
}

export default RedisManager;
