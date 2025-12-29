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
            const eventsRef = this.db.collection('events');
            let query = eventsRef.where('sport', '==', sport);

            if (statusCategory === 'live') {
                query = query.where('status', '==', 'inprogress');
            } else if (statusCategory === 'scheduled') {
                query = query.where('status', 'in', ['notstarted', 'scheduled']);
            } else if (statusCategory === 'finished') {
                query = query.where('status', '==', 'finished');
            }

            const snapshot = await query.limit(1).get();
            return !snapshot.empty;
        } catch (error) {
            console.error(`[FirebaseRead] Error checking recent data for ${sport}:`, error);
            return false;
        }
    }

    /**
     * Obtiene juegos en vivo desde la colección 'events'
     */
    async getLiveGames(sport: string): Promise<any[]> {
        try {
            const snapshot = await this.db.collection('events')
                .where('sport', '==', sport)
                .where('status', '==', 'inprogress')
                .get();

            return this.mapSnapshotToEvents(snapshot);
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching live ${sport}:`, error);
            return [];
        }
    }

    /**
     * Obtiene juegos programados desde la colección 'events'
     */
    async getScheduledGames(sport: string): Promise<any[]> {
        try {
            const now = new Date();
            const snapshot = await this.db.collection('events')
                .where('sport', '==', sport)
                .where('status', 'in', ['notstarted', 'scheduled'])
                .where('startTime', '>=', now)
                .orderBy('startTime', 'asc')
                .limit(50)
                .get();

            return this.mapSnapshotToEvents(snapshot);
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching scheduled ${sport}:`, error);
            return [];
        }
    }

    /**
     * Obtiene un evento específico por ID desde la colección 'events'
     */
    async getEventById(eventId: string | number): Promise<any | null> {
        try {
            // Buscamos por el ID del documento (que es el externalId de Sofascore)
            const doc = await this.db.collection('events').doc(eventId.toString()).get();
            if (!doc.exists) return null;

            const data = doc.data();
            // Mapeamos a la estructura de LiveEvent para consistencia
            const events = this.mapSnapshotToEvents({ docs: [doc] } as any);
            return events[0] || null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching event ${eventId} from Firebase:`, error);
            return null;
        }
    }

    async getMatchStats(gameId: string | number): Promise<any | null> {
        try {
            // Intentar buscar en matchStats (estructura antigua) o eventos enriquecidos
            const doc = await this.db.collection('matchStats').doc(gameId.toString()).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching match stats for ${gameId}:`, error);
            return null;
        }
    }

    async getMarketLine(gameId: string | number, sport: string): Promise<any | null> {
        try {
            // Ahora leemos de la colección 'odds' creada por el Robot 2
            const doc = await this.db.collection('odds').doc(`${sport}_${gameId}`).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[FirebaseRead] Error fetching market line for ${gameId}:`, error);
            return null;
        }
    }

    private mapSnapshotToEvents(snapshot: FirebaseFirestore.QuerySnapshot): any[] {
        return snapshot.docs.map(doc => {
            const data = doc.data();

            // Mapeo de compatibilidad con LiveEvent interface del frontend
            return {
                ...data,
                id: data.externalId || doc.id,
                status: {
                    type: data.status, // 'inprogress', 'notstarted', 'finished'
                    description: data.statusDescription || (data.status === 'inprogress' ? 'En Vivo' : data.status === 'finished' ? 'Finalizado' : 'Programado')
                },
                homeScore: {
                    current: data.homeTeam?.score || 0,
                    period1: data.homeTeam?.halfScore || 0
                },
                awayScore: {
                    current: data.awayTeam?.score || 0,
                    period1: data.awayTeam?.halfScore || 0
                },
                // Asegurar que Teams tengan el formato { id, name, logo }
                homeTeam: {
                    id: data.homeTeam?.id,
                    name: data.homeTeam?.name,
                    logo: data.homeTeam?.logo
                },
                awayTeam: {
                    id: data.awayTeam?.id,
                    name: data.awayTeam?.name,
                    logo: data.awayTeam?.logo
                },
                startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : (data.startTime ? new Date(data.startTime) : new Date()),
                syncedAt: data.syncedAt instanceof Timestamp ? data.syncedAt.toDate() : (data.syncedAt ? new Date(data.syncedAt) : new Date()),
                startTimestamp: data.startTime instanceof Timestamp ? Math.floor(data.startTime.toDate().getTime() / 1000) : (data.startTime ? Math.floor(new Date(data.startTime).getTime() / 1000) : 0)
            };
        });
    }
}

export const firebaseReadService = new FirebaseReadService();
export default firebaseReadService;
