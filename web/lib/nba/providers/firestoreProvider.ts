import { db } from '../../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import { NBADataProvider, NBAGame } from '../types';

export class FirestoreNBAProvider implements NBADataProvider {
    name = 'Firestore';

    async getTodayGames(): Promise<NBAGame[]> {
        try {
            // Return empty if Firebase is not initialized
            if (!db) {
                console.warn(`[${this.name}] Firestore not initialized`);
                return [];
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Query current season games
            const gamesRef = collection(db, 'nba_regular_season_box_scores_2024_25');
            const q = query(
                gamesRef,
                where('game.date', '>=', Timestamp.fromDate(today)),
                where('game.date', '<', Timestamp.fromDate(tomorrow)),
                orderBy('game.date', 'asc'),
                limit(50)
            );

            const snapshot = await getDocs(q);
            const gameMap = new Map<number, NBAGame>();

            snapshot.forEach((doc) => {
                const data = doc.data();
                const gameId = data.game?.id;

                if (!gameId || gameMap.has(gameId)) return;

                const game: NBAGame = {
                    id: doc.id,
                    gameId: gameId,
                    date: data.game?.date?.toDate() || new Date(),
                    homeTeam: data.game?.home_team?.full_name || 'Unknown',
                    awayTeam: data.game?.visitor_team?.full_name || 'Unknown',
                    homeScore: data.game?.home_team_score || 0,
                    awayScore: data.game?.visitor_team_score || 0,
                    status: data.game?.status || 'Scheduled',
                    season: data.game?.season || '2024-25'
                };

                gameMap.set(gameId, game);
            });

            return Array.from(gameMap.values());
        } catch (error) {
            console.error(`[${this.name}] Error fetching today's games:`, error);
            return [];
        }
    }

    async getGamesByDateRange(startDate: Date, endDate: Date): Promise<NBAGame[]> {
        try {
            // Return empty if Firebase is not initialized
            if (!db) {
                console.warn(`[${this.name}] Firestore not initialized`);
                return [];
            }

            const gamesRef = collection(db, 'nba_regular_season_box_scores_2024_25');
            const q = query(
                gamesRef,
                where('game.date', '>=', Timestamp.fromDate(startDate)),
                where('game.date', '<=', Timestamp.fromDate(endDate)),
                orderBy('game.date', 'desc'),
                limit(100)
            );

            const snapshot = await getDocs(q);
            const gameMap = new Map<number, NBAGame>();

            snapshot.forEach((doc) => {
                const data = doc.data();
                const gameId = data.game?.id;

                if (!gameId || gameMap.has(gameId)) return;

                const game: NBAGame = {
                    id: doc.id,
                    gameId: gameId,
                    date: data.game?.date?.toDate() || new Date(),
                    homeTeam: data.game?.home_team?.full_name || 'Unknown',
                    awayTeam: data.game?.visitor_team?.full_name || 'Unknown',
                    homeScore: data.game?.home_team_score || 0,
                    awayScore: data.game?.visitor_team_score || 0,
                    status: data.game?.status || 'Scheduled',
                    season: data.game?.season || '2024-25'
                };

                gameMap.set(gameId, game);
            });

            return Array.from(gameMap.values());
        } catch (error) {
            console.error(`[${this.name}] Error fetching games by date:`, error);
            return [];
        }
    }
}
