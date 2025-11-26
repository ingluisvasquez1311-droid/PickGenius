import { FootballDataProvider, FootballMatch } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_FOOTBALL_API_BASE_URL || 'https://v3.football.api-sports.io';

export class ApiSportsProvider implements FootballDataProvider {
    name = 'api-sports';

    async getMatches(date: string): Promise<FootballMatch[]> {
        if (!API_KEY) {
            console.warn('API-Sports key not found');
            return [];
        }

        const leagueIds = [39, 140, 135, 78, 61]; // PL, La Liga, Serie A, Bundesliga, Ligue 1
        const allMatches: FootballMatch[] = [];

        // We can fetch all matches for the date in one go or per league
        // API-Sports allows fetching by date directly
        try {
            const response = await fetch(
                `${BASE_URL}/fixtures?date=${date}&season=2024`,
                {
                    headers: {
                        'x-apisports-key': API_KEY
                    }
                }
            );

            if (!response.ok) {
                console.warn(`[${this.name}] Failed to fetch matches: ${response.status}`);
                return [];
            }

            const data = await response.json();

            if (data.response) {
                // Filter by our leagues of interest
                const relevantMatches = data.response.filter((item: any) =>
                    leagueIds.includes(item.league.id)
                );

                return relevantMatches.map(this.mapToFootballMatch);
            }
        } catch (error) {
            console.error(`[${this.name}] Error fetching matches:`, error);
        }

        return allMatches;
    }

    private mapToFootballMatch(item: any): FootballMatch {
        return {
            id: item.fixture.id,
            competition: {
                id: item.league.id,
                name: item.league.name,
                emblem: item.league.logo
            },
            utcDate: item.fixture.date,
            status: item.fixture.status.short, // "NS", "FT", etc.
            homeTeam: {
                id: item.teams.home.id,
                name: item.teams.home.name,
                crest: item.teams.home.logo
            },
            awayTeam: {
                id: item.teams.away.id,
                name: item.teams.away.name,
                crest: item.teams.away.logo
            },
            score: {
                winner: item.teams.home.winner ? 'HOME_TEAM' : item.teams.away.winner ? 'AWAY_TEAM' : 'DRAW',
                duration: 'REGULAR',
                fullTime: {
                    home: item.goals.home,
                    away: item.goals.away
                }
            }
        };
    }
}
