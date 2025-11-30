/**
 * Cache Manager Service
 * Gestiona el almacenamiento inteligente de datos en Firestore
 * con TTL (time-to-live) y limpieza automática
 */

const { db } = require('../config/firebase');
const { Timestamp } = require('firebase-admin/firestore');

class CacheManager {
    constructor() {
        this.collections = {
            football: 'football_fixtures_cache',
            nba: 'nba_fixtures_cache',
            sofascore: 'sofascore_cache'
        };

        // TTL por defecto en segundos
        this.defaultTTL = {
            fixtures: 6 * 60 * 60,      // 6 horas
            predictions: 12 * 60 * 60,  // 12 horas
            standings: 24 * 60 * 60     // 24 horas
        };
    }

    /**
     * Obtiene datos del cache si están disponibles y no han expirado
     */
    async get(sport, key, filters = {}) {
        try {
            const collection = this.collections[sport];
            if (!collection) {
                throw new Error(`Sport not supported: ${sport}`);
            }

            let query = db.collection(collection).where('cacheKey', '==', key);

            // Aplicar filtros adicionales
            for (const [field, value] of Object.entries(filters)) {
                query = query.where(field, '==', value);
            }

            const snapshot = await query.limit(1).get();

            if (snapshot.empty) {
                return null; // No hay cache
            }

            const doc = snapshot.docs[0];
            const data = doc.data();

            // Verificar si expiró
            if (this.isExpired(data)) {
                console.log(`🗑️ Cache expired for ${key}, deleting...`);
                await doc.ref.delete();
                return null;
            }

            console.log(`✅ Cache hit for ${key}`);
            return {
                id: doc.id,
                ...data,
                isExpired: false
            };

        } catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    }

    /**
     * Guarda datos en el cache con TTL
     */
    async set(sport, key, data, options = {}) {
        try {
            const collection = this.collections[sport];
            if (!collection) {
                throw new Error(`Sport not supported: ${sport}`);
            }

            const ttl = options.ttl || this.defaultTTL.fixtures;
            const now = new Date();
            const expiresAt = new Date(now.getTime() + ttl * 1000);

            // Calcular autoDeleteAt (2 horas después del partido si tiene fecha)
            let autoDeleteAt = null;
            if (data.matchDate) {
                const matchDate = new Date(data.matchDate);
                autoDeleteAt = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);
            }

            const cacheDoc = {
                cacheKey: key,
                ...data,
                cachedAt: Timestamp.fromDate(now),
                expiresAt: Timestamp.fromDate(expiresAt),
                autoDeleteAt: autoDeleteAt ? Timestamp.fromDate(autoDeleteAt) : null,
                ttlSeconds: ttl
            };

            // Usar cacheKey como ID del documento
            const docId = this.generateDocId(key, data);
            await db.collection(collection).doc(docId).set(cacheDoc, { merge: true });

            console.log(`💾 Cached ${key} (TTL: ${ttl}s, expires: ${expiresAt.toISOString()})`);

            return true;

        } catch (error) {
            console.error('Error setting cache:', error);
            return false;
        }
    }

    /**
     * Verifica si un documento de cache ha expirado
     */
    isExpired(cacheDoc) {
        if (!cacheDoc.expiresAt) return true;

        const now = new Date();
        const expiresAt = cacheDoc.expiresAt.toDate();

        return now > expiresAt;
    }

    /**
     * Limpia automáticamente partidos jugados y datos expirados
     */
    async cleanupExpired(sport = null) {
        try {
            const collections = sport
                ? [this.collections[sport]]
                : Object.values(this.collections);

            let totalDeleted = 0;

            for (const collection of collections) {
                const now = Timestamp.now();

                // Eliminar documentos expirados
                const expiredQuery = db.collection(collection)
                    .where('expiresAt', '<=', now)
                    .limit(500);

                const expiredSnapshot = await expiredQuery.get();

                if (!expiredSnapshot.empty) {
                    const batch = db.batch();
                    expiredSnapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    totalDeleted += expiredSnapshot.size;
                    console.log(`🗑️ Deleted ${expiredSnapshot.size} expired docs from ${collection}`);
                }

                // Eliminar partidos jugados (autoDeleteAt)
                const playedQuery = db.collection(collection)
                    .where('autoDeleteAt', '<=', now)
                    .where('status', '==', 'finished')
                    .limit(500);

                const playedSnapshot = await playedQuery.get();

                if (!playedSnapshot.empty) {
                    const batch = db.batch();
                    playedSnapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    totalDeleted += playedSnapshot.size;
                    console.log(`🗑️ Deleted ${playedSnapshot.size} played matches from ${collection}`);
                }
            }

            console.log(`✅ Cleanup completed: ${totalDeleted} documents deleted`);
            return { success: true, deleted: totalDeleted };

        } catch (error) {
            console.error('Error during cleanup:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza el estado de un partido (scheduled -> live -> finished)
     */
    async updateMatchStatus(sport, matchId, status) {
        try {
            const collection = this.collections[sport];
            const docRef = db.collection(collection).doc(matchId);

            await docRef.update({
                status,
                updatedAt: Timestamp.now()
            });

            console.log(`📊 Updated match ${matchId} status to: ${status}`);
            return true;

        } catch (error) {
            console.error('Error updating match status:', error);
            return false;
        }
    }

    /**
     * Obtiene estadísticas del cache
     */
    async getStats(sport = null) {
        try {
            const collections = sport
                ? [{ name: sport, collection: this.collections[sport] }]
                : Object.entries(this.collections).map(([name, collection]) => ({ name, collection }));

            const stats = {};

            for (const { name, collection } of collections) {
                const snapshot = await db.collection(collection).get();
                const docs = snapshot.docs.map(doc => doc.data());

                const now = new Date();
                const valid = docs.filter(doc => !this.isExpired(doc));
                const expired = docs.length - valid.length;

                stats[name] = {
                    total: docs.length,
                    valid: valid.length,
                    expired,
                    byStatus: {
                        scheduled: docs.filter(d => d.status === 'scheduled').length,
                        live: docs.filter(d => d.status === 'live').length,
                        finished: docs.filter(d => d.status === 'finished').length
                    }
                };
            }

            return stats;

        } catch (error) {
            console.error('Error getting cache stats:', error);
            return {};
        }
    }

    /**
     * Genera un ID único para el documento de cache
     */
    generateDocId(key, data) {
        if (data.fixtureId) return `fixture_${data.fixtureId}`;
        if (data.gameId) return `game_${data.gameId}`;

        // Fallback: usar el key con timestamp
        return `${key}_${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    /**
     * Invalida cache específico
     */
    async invalidate(sport, key) {
        try {
            const collection = this.collections[sport];
            const snapshot = await db.collection(collection)
                .where('cacheKey', '==', key)
                .get();

            if (snapshot.empty) return false;

            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log(`🗑️ Invalidated cache for ${key}`);
            return true;

        } catch (error) {
            console.error('Error invalidating cache:', error);
            return false;
        }
    }
}

module.exports = new CacheManager();
