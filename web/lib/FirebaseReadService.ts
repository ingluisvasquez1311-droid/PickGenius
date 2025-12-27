import { getFirestore } from './firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface Game {
    id: string;
    sport: string;
    status: string; // 'Scheduled', 'Live', 'Finished', etc.
    homeTeam: string;
    awayTeam: string;
    startTime: Date;
    // ... otros campos
    [key: string]: any;
}

class FirebaseReadService {
    private db;

    constructor() {
        this.db = getFirestore();
    }

    /**
     * Verifica si hay datos recientes para un deporte y estado específico.
     * Útil para decidir si disparar una sincronización de fondo.
     */
    async hasRecentData(sport: string, statusCategory: 'live' | 'scheduled' | 'finished'): Promise<boolean> {
        try {
            const gamesRef = this.db.collection('games');
            let query = gamesRef.where('sport', '==', sport);

            // Filtro simple por estado (ajusta según tus valores reales de status)
            if (statusCategory === 'live') {
                query = query.where('status', 'in', ['First Half', 'Second Half', 'Live', 'In Progress', '1Q', '2Q', '3Q', '4Q']);
            } else if (statusCategory === 'scheduled') {
                query = query.where('status', '==', 'Not Started');
                // Podríamos filtrar por fecha futura también
            }

            const snapshot = await query.limit(1).get();
            return !snapshot.empty;
        } catch (error) {
            console.error(`[FirebaseRead] Error checking recent data for ${sport}:`, error);
            return false;
        }
    }

    /**
     * Obtiene juegos en vivo
     */
    async getLiveGames(sport: string): Promise<Game[]> {
        // Definir estados "Live" comunes
        const LIVE_STATUSES = ['First Half', 'Second Half', 'Halftime', 'Live', 'In Progress', '1Q', '2Q', '3Q', '4Q', 'OT']; // Ajusta según tu data real

        try {
            const snapshot = await this.db.collection('games')
                .where('sport', '==', sport)
                .where('status', 'in', LIVE_STATUSES)
                .get();

            return this.mapSnapshotToGames(snapshot);
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching live ${sport}:`, error);
            return [];
        }
    }

    /**
     * Obtiene juegos programados (futuros)
     */
    async getScheduledGames(sport: string): Promise<Game[]> {
        try {
            const now = new Date();
            const snapshot = await this.db.collection('games')
                .where('sport', '==', sport)
                .where('status', '==', 'Not Started')
                .where('startTime', '>=', now)
                .orderBy('startTime', 'asc')
                .limit(50)
                .get();

            return this.mapSnapshotToGames(snapshot);
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching scheduled ${sport}:`, error);
            return [];
        }
    }

    async getMatchStats(gameId: string | number): Promise<any | null> {
        try {
            const doc = await this.db.collection('matchStats').doc(gameId.toString()).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching match stats for ${gameId}:`, error);
            return null;
        }
    }

    async getMarketLine(gameId: string | number, sport: string): Promise<any | null> {
        try {
            const doc = await this.db.collection('marketLines').doc(`${sport}_${gameId}`).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching market line for ${gameId}:`, error);
            return null;
        }
    }

    private mapSnapshotToGames(snapshot: FirebaseFirestore.QuerySnapshot): Game[] {
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                // Convertir Timestamps a Date objetos para serialización JSON segura después
                startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : (data.startTime ? new Date(data.startTime) : new Date()),
                syncedAt: data.syncedAt instanceof Timestamp ? data.syncedAt.toDate() : (data.syncedAt ? new Date(data.syncedAt) : new Date()),
            } as any as Game;
        });
    }
}

export const firebaseReadService = new FirebaseReadService();
export default firebaseReadService;
