/**
 * Simple In-Memory Cache
 * Alternativa temporal a Firestore mientras se resuelven problemas de autenticación
 */

class MemoryCache {
    private cache: Map<string, any>;
    private ttls: Map<string, number>;

    constructor() {
        this.cache = new Map();
        this.ttls = new Map();

        // Limpiar caché expirado cada 5 minutos
        if (typeof setInterval !== 'undefined') {
            setInterval(() => this.cleanup(), 5 * 60 * 1000);
        }
    }

    /**
     * Guardar en caché con TTL
     */
    set(key: string, value: any, ttlSeconds: number = 60): void {
        const expiresAt = Date.now() + (ttlSeconds * 1000);

        this.cache.set(key, value);
        this.ttls.set(key, expiresAt);

        console.log(`💾 [MemoryCache] Cached ${key} (TTL: ${ttlSeconds}s)`);
    }

    /**
     * Obtener del caché
     */
    get(key: string): any | null {
        const expiresAt = this.ttls.get(key);

        // No existe o expiró
        if (!expiresAt || Date.now() > expiresAt) {
            this.delete(key);
            return null;
        }

        const value = this.cache.get(key);
        console.log(`✅ [MemoryCache] Cache hit: ${key}`);
        return value;
    }

    /**
     * Eliminar del caché
     */
    delete(key: string): void {
        this.cache.delete(key);
        this.ttls.delete(key);
    }

    /**
     * Limpiar entradas expiradas
     */
    cleanup(): void {
        const now = Date.now();
        let deleted = 0;

        for (const [key, expiresAt] of this.ttls.entries()) {
            if (now > expiresAt) {
                this.delete(key);
                deleted++;
            }
        }

        if (deleted > 0) {
            console.log(`🗑️  [MemoryCache] Cleaned ${deleted} expired entries`);
        }
    }

    /**
     * Estadísticas del caché
     */
    getStats(): { totalEntries: number; keys: string[] } {
        return {
            totalEntries: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Export singleton instance
export const memoryCache = new MemoryCache();
