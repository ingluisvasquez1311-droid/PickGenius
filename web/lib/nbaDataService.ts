import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { NBAGame, NBADataProvider } from './nba/types';
import { FirestoreNBAProvider } from './nba/providers/firestoreProvider';
import { AllSportsApiNBAProvider } from './nba/providers/allSportsApiProvider';

export { type NBAGame };

export interface TeamStats {
    team: string;
    wins: number;
    losses: number;
    avgPoints: number;
    avgPointsAllowed: number;
}

export interface PlayerStats {
    playerName: string;
    team: string;
    points: number;
    rebounds: number;
    assists: number;
    gamesPlayed: number;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
    }
    cache.delete(key);
    return null;
}

function setCache(key: string, data: any): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// Initialize providers
const providers: NBADataProvider[] = [
    new FirestoreNBAProvider(),
    new AllSportsApiNBAProvider()
];

/**
 * Get today's NBA games with Multi-API support
 */
export async function getTodayGames(): Promise<NBAGame[]> {
    const cacheKey = 'today_games_v2';
    const cached = getCached<NBAGame[]>(cacheKey);
    if (cached) return cached;

    let allGames: NBAGame[] = [];

    // Try providers in order
    for (const provider of providers) {
        try {
            console.log(`Attempting to fetch NBA data from ${provider.name}...`);
            const games = await provider.getTodayGames();

            if (games && games.length > 0) {
                allGames = games;
                console.log(`Successfully fetched ${games.length} NBA games from ${provider.name}`);
                break; // Stop if successful
            }
        } catch (error) {
            console.error(`Provider ${provider.name} failed:`, error);
        }
    }

    setCache(cacheKey, allGames);
    return allGames;
}

/**
 * Get games by date range with Multi-API support
 */
export async function getGamesByDateRange(startDate: Date, endDate: Date): Promise<NBAGame[]> {
    const cacheKey = `games_${startDate.toISOString()}_${endDate.toISOString()}_v2`;
    const cached = getCached<NBAGame[]>(cacheKey);
    if (cached) return cached;

    let allGames: NBAGame[] = [];

    for (const provider of providers) {
        try {
            const games = await provider.getGamesByDateRange(startDate, endDate);
            if (games && games.length > 0) {
                allGames = games;
                break;
            }
        } catch (error) {
            console.error(`Provider ${provider.name} failed:`, error);
        }
    }

    setCache(cacheKey, allGames);
    return allGames;
}

/**
 * Get games for specific teams (Uses getGamesByDateRange internally or filters)
 * Note: Optimized to use existing provider methods
 */
export async function getGamesByTeams(teamNames: string[]): Promise<NBAGame[]> {
    if (teamNames.length === 0) return [];

    // For simplicity and API efficiency, we'll fetch recent games and filter
    // This is a trade-off: less specific API calls vs more client-side filtering
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 30); // Last 30 days

    const games = await getGamesByDateRange(pastDate, today);

    return games.filter(game =>
        teamNames.includes(game.homeTeam) || teamNames.includes(game.awayTeam)
    );
}

/**
 * Get top players stats (mock data for now, can be enhanced with real aggregation)
 */
export async function getTopPlayers(limit: number = 10): Promise<PlayerStats[]> {
    // This would require aggregation of player stats from multiple games
    // For now, returning mock data
    return [
        { playerName: 'Luka Dončić', team: 'DAL', points: 28.5, rebounds: 8.2, assists: 9.1, gamesPlayed: 15 },
        { playerName: 'Giannis Antetokounmpo', team: 'MIL', points: 31.2, rebounds: 11.5, assists: 5.8, gamesPlayed: 14 },
        { playerName: 'Joel Embiid', team: 'PHI', points: 33.1, rebounds: 10.8, assists: 4.2, gamesPlayed: 12 },
        { playerName: 'Nikola Jokić', team: 'DEN', points: 26.8, rebounds: 12.3, assists: 9.5, gamesPlayed: 16 },
        { playerName: 'Jayson Tatum', team: 'BOS', points: 27.3, rebounds: 8.1, assists: 4.6, gamesPlayed: 15 }
    ].slice(0, limit);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
    cache.clear();
}
