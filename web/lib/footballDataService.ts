import { cacheData, getCachedData } from './cache';
import { FootballMatch, FootballDataProvider } from './football/types';
import { FootballDataOrgProvider } from './football/providers/footballDataOrg';
import { AllSportsApiProvider } from './football/providers/allSportsApi';

// Mock data fallback
function getMockFootballMatches(): Record<string, FootballMatch[]> {
    const today = new Date().toISOString();
    return {
        "Premier League": [
            {
                id: 1001,
                competition: { id: 2021, name: "Premier League", emblem: "" },
                utcDate: today,
                status: "SCHEDULED",
                homeTeam: { id: 65, name: "Man City", crest: "https://crests.football-data.org/65.png" },
                awayTeam: { id: 64, name: "Liverpool", crest: "https://crests.football-data.org/64.png" },
                score: { winner: null, duration: "REGULAR", fullTime: { home: null, away: null } }
            }
        ],
        "La Liga": [
            {
                id: 2001,
                competition: { id: 2014, name: "Primera Division", emblem: "" },
                utcDate: today,
                status: "SCHEDULED",
                homeTeam: { id: 86, name: "Real Madrid", crest: "https://crests.football-data.org/86.png" },
                awayTeam: { id: 81, name: "Barcelona", crest: "https://crests.football-data.org/81.png" },
                score: { winner: null, duration: "REGULAR", fullTime: { home: null, away: null } }
            }
        ]
    };
}

export { type FootballMatch };

export async function getFootballMatches(): Promise<Record<string, FootballMatch[]>> {
    const CACHE_KEY = 'football_matches_today_v3';
    const cached = getCachedData<Record<string, FootballMatch[]>>(CACHE_KEY);
    if (cached) return cached;

    const today = new Date().toISOString().split('T')[0];

    // Initialize providers
    const providers: FootballDataProvider[] = [
        new FootballDataOrgProvider(),
        new AllSportsApiProvider()
    ];

    let allMatches: FootballMatch[] = [];
    let success = false;

    // Try providers in order
    for (const provider of providers) {
        try {
            console.log(`Attempting to fetch football data from ${provider.name}...`);
            const matches = await provider.getMatches(today);

            if (matches && matches.length > 0) {
                allMatches = matches;
                success = true;
                console.log(`Successfully fetched ${matches.length} matches from ${provider.name}`);
                break; // Stop if successful
            }
        } catch (error) {
            console.error(`Provider ${provider.name} failed:`, error);
            // Continue to next provider
        }
    }

    // Group by league
    const matchesByLeague = allMatches.reduce((acc, match) => {
        const league = match.competition.name;
        if (!acc[league]) acc[league] = [];
        acc[league].push(match);
        return acc;
    }, {} as Record<string, FootballMatch[]>);

    // If no matches found from ANY provider, use mock data
    if (Object.keys(matchesByLeague).length === 0) {
        console.warn('All providers failed or returned no data. Using mock data.');
        return getMockFootballMatches();
    }

    // Cache results
    cacheData(CACHE_KEY, matchesByLeague);

    return matchesByLeague;
}
