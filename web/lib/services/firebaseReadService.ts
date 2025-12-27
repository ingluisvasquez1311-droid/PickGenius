import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

export class FirebaseReadService {

    /**
     * Get LIVE games for a sport directly from Firestore
     * Fastest possible read path
     */
    async getLiveGames(sport: string) {
        // Since we might not have a perfect 'status=live' sync every second, 
        // we can also look for games that *should* be live based on time
        if (!db) return [];

        const now = Timestamp.now();
        const gamesRef = collection(db, 'games');

        // Query: Sport matches AND (Status is Live OR (StartTime is past AND Status is Scheduled))
        // Firestore limitation: Logical OR usually requires separate queries or "in" clause on same field.
        // We'll trust the 'status' field updated by the BatchSync

        // Simple query for now: Get games marked as 'inprogress' OR 'live'
        // If BatchSync updates status correctly.

        const q = query(
            gamesRef,
            where('sport', '==', sport),
            where('expiresAt', '>', now)
            // We can filter by 'inprogress' locally or if we strictly sync status
        );

        const snapshot = await getDocs(q);
        const games = snapshot.docs.map(d => d.data());

        // Client-side filter for "Live" logic if needed to supplement Firestore query limits
        return games.filter((g: any) =>
            g.status === 'inprogress' ||
            g.status === 'live' ||
            (g.status === 'scheduled' && new Date(g.startTime).getTime() <= Date.now() && new Date(g.startTime).getTime() > Date.now() - 3 * 3600 * 1000)
        ).sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    /**
     * Get SCHEDULED games for a date
     */
    async getScheduledGames(sport: string, dateStr: string) {
        if (!db) return [];

        // Create start/end timestamps for the day
        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        const gamesRef = collection(db, 'games');
        const q = query(
            gamesRef,
            where('sport', '==', sport),
            where('startTime', '>=', startOfDay.toISOString()),
            where('startTime', '<=', endOfDay.toISOString())
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(d => d.data())
            .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    /**
     * Get a single game with its predictions
     */
    async getGameById(gameId: string, sport: string) {
        if (!db) return null;

        // Try the composite ID first
        const docRef = doc(db, 'games', `${sport}_${gameId}`);
        const snap = await getDoc(docRef);

        if (snap.exists()) return snap.data();

        return null;
    }
}

export const firebaseReadService = new FirebaseReadService();
