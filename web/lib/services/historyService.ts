import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface Snapshot {
    timestamp: number;
    stats: any;
    sport: string;
}

class HistoryService {
    private memoryStore: Map<string, Snapshot[]>;

    constructor() {
        this.memoryStore = new Map();
    }

    /**
     * Guardar un snapshot de las estadísticas del partido
     */
    async saveSnapshot(eventId: string, stats: any, sport: string): Promise<void> {
        const timestamp = Date.now();
        const snapshot: Snapshot = {
            timestamp,
            stats,
            sport
        };

        // 1. Guardar en memoria (siempre funciona)
        if (!this.memoryStore.has(eventId)) {
            this.memoryStore.set(eventId, []);
        }
        const history = this.memoryStore.get(eventId)!;
        history.push(snapshot);

        // Limitar historial en memoria a últimos 50 snapshots
        if (history.length > 50) {
            history.shift();
        }

        // 2. Intentar guardar en Firestore (si está configurado)
        if (db) {
            try {
                const docRef = doc(db, 'match_history', eventId);
                const snapshotsRef = collection(docRef, 'snapshots');

                await addDoc(snapshotsRef, {
                    ...snapshot,
                    createdAt: new Date()
                });

                // También actualizar el documento principal
                await setDoc(docRef, {
                    lastUpdate: new Date(),
                    sport,
                    eventId
                }, { merge: true });
            } catch (error: any) {
                console.warn(`⚠️ Firestore save failed for ${eventId} (using memory only):`, error.message);
            }
        }
    }

    /**
     * Obtener historial del partido para análisis de IA
     */
    async getHistory(eventId: string): Promise<Snapshot[]> {
        // Intentar obtener de Firestore primero si está disponible
        if (db) {
            try {
                const docRef = doc(db, 'match_history', eventId);
                const snapshotsRef = collection(docRef, 'snapshots');
                const q = query(snapshotsRef, orderBy('timestamp', 'asc'), limit(20));

                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    return snapshot.docs.map(doc => doc.data() as Snapshot);
                }
            } catch (error) {
                console.warn(`⚠️ Firestore read failed for ${eventId}, falling back to memory`);
            }
        }

        // Fallback a memoria
        return this.memoryStore.get(eventId) || [];
    }
}

// Export singleton instance
export const historyService = new HistoryService();
