const { db } = require('../config/firebase');

class HistoryService {
    constructor() {
        this.memoryStore = new Map(); // Fallback in-memory storage
    }

    /**
     * Guardar un snapshot de las estadísticas del partido
     * @param {string} eventId - ID del evento
     * @param {object} stats - Estadísticas actuales
     * @param {string} sport - 'basketball' o 'football'
     */
    async saveSnapshot(eventId, stats, sport) {
        const timestamp = Date.now();
        const snapshot = {
            timestamp,
            stats,
            sport
        };

        // 1. Guardar en memoria (siempre funciona)
        if (!this.memoryStore.has(eventId)) {
            this.memoryStore.set(eventId, []);
        }
        const history = this.memoryStore.get(eventId);
        history.push(snapshot);

        // Limitar historial en memoria a últimos 50 snapshots para no saturar RAM
        if (history.length > 50) {
            history.shift();
        }

        // 2. Intentar guardar en Firestore (si está configurado)
        if (db) {
            try {
                const docRef = db.collection('match_history').doc(eventId);
                await docRef.collection('snapshots').add({
                    ...snapshot,
                    createdAt: new Date()
                });
                // También actualizar el documento principal con la última actualización
                await docRef.set({
                    lastUpdate: new Date(),
                    sport,
                    eventId
                }, { merge: true });
            } catch (error) {
                console.warn(`⚠️ Firestore save failed for ${eventId} (using memory only):`, error.message);
            }
        }
    }

    /**
     * Obtener historial del partido para análisis de IA
     */
    async getHistory(eventId) {
        // Intentar obtener de Firestore primero si está disponible
        if (db) {
            try {
                const snapshot = await db.collection('match_history')
                    .doc(eventId)
                    .collection('snapshots')
                    .orderBy('timestamp', 'asc')
                    .limit(20) // Últimos 20 puntos de datos
                    .get();

                if (!snapshot.empty) {
                    return snapshot.docs.map(doc => doc.data());
                }
            } catch (error) {
                console.warn(`⚠️ Firestore read failed for ${eventId}, falling back to memory`);
            }
        }

        // Fallback a memoria
        return this.memoryStore.get(eventId) || [];
    }
}

module.exports = new HistoryService();
