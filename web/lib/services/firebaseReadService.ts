import { firebaseReadService as adminReadService } from '../FirebaseReadService';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';

/**
 * Esta es una versión del servicio que usa el SDK de CLIENTE de Firebase.
 * Se sincroniza con la lógica de la versión de ADMIN para mantener consistencia.
 */
export class FirebaseReadService {
    /**
     * Obtiene juegos en vivo desde la colección 'events' (SDK Cliente)
     */
    async getLiveGames(sport: string) {
        if (!db) return [];
        const gamesRef = collection(db, 'events');
        const q = query(
            gamesRef,
            where('sport', '==', sport),
            where('status', '==', 'inprogress')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            status: {
                type: 'inprogress',
                description: 'En Vivo'
            }
        }));
    }

    /**
     * Obtiene juegos programados (SDK Cliente)
     */
    async getScheduledGames(sport: string, dateStr: string) {
        if (!db) return [];

        const gamesRef = collection(db, 'events');
        const q = query(
            gamesRef,
            where('sport', '==', sport),
            where('status', 'in', ['notstarted', 'scheduled']),
            orderBy('startTime', 'asc'),
            limit(50)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));
    }

    /**
     * Obtiene un juego por ID
     */
    async getGameById(gameId: string, sport: string) {
        if (!db) return null;
        // La lógica de AdminReadService es más robusta para esto si se llama desde SSR
        // Pero para cliente usamos esto:
        const gamesRef = collection(db, 'events');
        const q = query(gamesRef, where('sport', '==', sport));
        const snapshot = await getDocs(q);
        const doc = snapshot.docs.find(d => d.id === gameId || d.data().externalId?.toString() === gameId.toString());
        return doc ? doc.data() : null;
    }
}

export const firebaseReadService = new FirebaseReadService();
