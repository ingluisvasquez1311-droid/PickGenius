import { EuroleagueGame, EuroleagueDataProvider } from './euroleague/types';
import { MockEuroleagueProvider } from './euroleague/providers/mockProvider';

export { type EuroleagueGame };

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
const providers: EuroleagueDataProvider[] = [
    new MockEuroleagueProvider()
];

/**
 * Get today's Euroleague games
 */
export async function getTodayGames(): Promise<EuroleagueGame[]> {
    const cacheKey = 'euroleague_today_games';
    const cached = getCached<EuroleagueGame[]>(cacheKey);
    if (cached) return cached;

    let allGames: EuroleagueGame[] = [];

    // Try providers in order
    for (const provider of providers) {
        try {
            console.log(`Attempting to fetch Euroleague data from ${provider.name}...`);
            const games = await provider.getTodayGames();

            if (games && games.length > 0) {
                allGames = games;
                console.log(`Successfully fetched ${games.length} Euroleague games from ${provider.name}`);
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
 * Get games by date range
 */
export async function getGamesByDateRange(startDate: Date, endDate: Date): Promise<EuroleagueGame[]> {
    const cacheKey = `euroleague_games_${startDate.toISOString()}_${endDate.toISOString()}`;
    const cached = getCached<EuroleagueGame[]>(cacheKey);
    if (cached) return cached;

    let allGames: EuroleagueGame[] = [];

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
 * Clear all cache
 */
export function clearCache(): void {
    cache.clear();
}
