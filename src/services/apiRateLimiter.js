/**
 * API Rate Limiter Service
 * Gestiona cuotas de API, rotación de claves y verificación de cache
 */

const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');
const cacheManager = require('./cacheManager');

class ApiRateLimiter {
    constructor() {
        this.collection = 'api_usage_tracking';
        this.dailyLimit = 100;
    }

    /**
     * Obtiene una clave API disponible (con llamadas restantes)
     * Verifica cache primero para evitar llamadas innecesarias
     */
    async getAvailableKey(provider, cacheKey = null, cacheFilters = {}) {
        try {
            // 1. Si hay cacheKey, verificar cache primero
            if (cacheKey) {
                const sport = provider === 'api-football' ? 'football' : 'nba';
                const cached = await cacheManager.get(sport, cacheKey, cacheFilters);

                if (cached && !cached.isExpired) {
                    console.log('✅ Serving from cache - No API call needed');
                    return {
                        fromCache: true,
                        data: cached,
                        apiKey: null
                    };
                }
            }

            // 2. No hay cache válido, necesitamos una API key
            const keys = await this.getProviderKeys(provider);

            if (keys.length === 0) {
                throw new Error(`No API keys configured for ${provider}`);
            }

            // 3. Buscar una clave con llamadas disponibles
            for (const apiKey of keys) {
                const usage = await this.getUsage(apiKey, provider);

                // Verificar si necesita reset (nuevo día)
                if (this.needsReset(usage)) {
                    await this.resetUsage(apiKey, provider);
                    return {
                        fromCache: false,
                        apiKey,
                        callsRemaining: this.dailyLimit
                    };
                }

                // Verificar si tiene llamadas disponibles
                if (usage.callsToday < this.dailyLimit) {
                    return {
                        fromCache: false,
                        apiKey,
                        callsRemaining: this.dailyLimit - usage.callsToday
                    };
                }
            }

            // 4. Todas las claves agotadas
            throw new Error(`All API keys for ${provider} have reached daily limit (${this.dailyLimit} calls)`);

        } catch (error) {
            console.error('Error getting available key:', error);
            throw error;
        }
    }

    /**
     * Registra una llamada API
     */
    async recordCall(apiKey, provider) {
        try {
            const docId = this.getDocId(apiKey, provider);
            const docRef = db.collection(this.collection).doc(docId);

            await docRef.set({
                apiKey: this.maskApiKey(apiKey),
                provider,
                callsToday: db.FieldValue.increment(1),
                lastUsed: Timestamp.now(),
                isActive: true
            }, { merge: true });

            // Obtener el conteo actualizado
            const doc = await docRef.get();
            const data = doc.data();

            console.log(`📊 API call recorded: ${data.callsToday}/${this.dailyLimit} for ${provider}`);

            return {
                callsToday: data.callsToday,
                callsRemaining: this.dailyLimit - data.callsToday
            };

        } catch (error) {
            console.error('Error recording API call:', error);
            throw error;
        }
    }

    /**
     * Obtiene el uso actual de una API key
     */
    async getUsage(apiKey, provider) {
        try {
            const docId = this.getDocId(apiKey, provider);
            const doc = await db.collection(this.collection).doc(docId).get();

            if (!doc.exists) {
                // Inicializar si no existe
                await this.initializeKey(apiKey, provider);
                return {
                    callsToday: 0,
                    dailyLimit: this.dailyLimit,
                    lastReset: new Date(),
                    isActive: true
                };
            }

            const data = doc.data();
            return {
                callsToday: data.callsToday || 0,
                dailyLimit: this.dailyLimit,
                lastReset: data.lastReset?.toDate() || new Date(),
                lastUsed: data.lastUsed?.toDate(),
                isActive: data.isActive !== false,
                cacheHitRate: data.cacheHitRate || 0
            };

        } catch (error) {
            console.error('Error getting usage:', error);
            return { callsToday: 0, dailyLimit: this.dailyLimit };
        }
    }

    /**
     * Verifica si necesita reset (nuevo día UTC)
     */
    needsReset(usage) {
        if (!usage.lastReset) return true;

        const now = new Date();
        const lastReset = new Date(usage.lastReset);

        // Comparar solo la fecha (ignorar hora)
        const nowDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        const lastResetDate = new Date(lastReset.getUTCFullYear(), lastReset.getUTCMonth(), lastReset.getUTCDate());

        return nowDate > lastResetDate;
    }

    /**
     * Resetea el contador de llamadas (nuevo día)
     */
    async resetUsage(apiKey, provider) {
        try {
            const docId = this.getDocId(apiKey, provider);

            await db.collection(this.collection).doc(docId).set({
                apiKey: this.maskApiKey(apiKey),
                provider,
                callsToday: 0,
                dailyLimit: this.dailyLimit,
                lastReset: Timestamp.now(),
                isActive: true
            }, { merge: true });

            console.log(`🔄 Reset usage for ${provider} API key`);
            return true;

        } catch (error) {
            console.error('Error resetting usage:', error);
            return false;
        }
    }

    /**
     * Inicializa una nueva API key
     */
    async initializeKey(apiKey, provider) {
        const docId = this.getDocId(apiKey, provider);

        await db.collection(this.collection).doc(docId).set({
            apiKey: this.maskApiKey(apiKey),
            provider,
            callsToday: 0,
            dailyLimit: this.dailyLimit,
            lastReset: Timestamp.now(),
            isActive: true,
            cacheHitRate: 0
        });

        console.log(`✅ Initialized new API key for ${provider}`);
    }

    /**
     * Obtiene todas las claves configuradas para un provider
     */
    async getProviderKeys(provider) {
        const keys = [];

        if (provider === 'api-football') {
            // Buscar todas las claves FOOTBALL_API_KEY_*
            for (let i = 1; i <= 10; i++) {
                const key = process.env[`FOOTBALL_API_KEY_${i}`] || process.env[`FOOTBALL_API_KEY`];
                if (key && !keys.includes(key)) {
                    keys.push(key);
                }
                if (i === 1 && !process.env[`FOOTBALL_API_KEY_${i}`]) break;
            }
        } else if (provider === 'nba') {
            const key = process.env.NBA_API_KEY;
            if (key) keys.push(key);
        }

        return keys;
    }

    /**
     * Obtiene estadísticas de todas las API keys
     */
    async getAllStats() {
        try {
            const snapshot = await db.collection(this.collection).get();
            const stats = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const provider = data.provider;

                if (!stats[provider]) {
                    stats[provider] = {
                        totalKeys: 0,
                        totalCalls: 0,
                        availableCalls: 0,
                        keys: []
                    };
                }

                const callsRemaining = this.dailyLimit - (data.callsToday || 0);

                stats[provider].totalKeys++;
                stats[provider].totalCalls += data.callsToday || 0;
                stats[provider].availableCalls += callsRemaining;
                stats[provider].keys.push({
                    id: doc.id,
                    callsToday: data.callsToday || 0,
                    callsRemaining,
                    lastUsed: data.lastUsed?.toDate(),
                    cacheHitRate: data.cacheHitRate || 0
                });
            });

            return stats;

        } catch (error) {
            console.error('Error getting all stats:', error);
            return {};
        }
    }

    /**
     * Actualiza la tasa de aciertos del cache
     */
    async updateCacheHitRate(apiKey, provider, hitRate) {
        try {
            const docId = this.getDocId(apiKey, provider);

            await db.collection(this.collection).doc(docId).update({
                cacheHitRate: hitRate
            });

        } catch (error) {
            console.error('Error updating cache hit rate:', error);
        }
    }

    /**
     * Genera ID del documento
     */
    getDocId(apiKey, provider) {
        // Usar los últimos 8 caracteres de la API key para identificar
        const keyHash = apiKey.slice(-8);
        return `${provider}_${keyHash}`;
    }

    /**
     * Enmascara la API key para logs (muestra solo últimos 4 caracteres)
     */
    maskApiKey(apiKey) {
        if (!apiKey || apiKey.length < 8) return '****';
        return '****' + apiKey.slice(-4);
    }
}

module.exports = new ApiRateLimiter();
