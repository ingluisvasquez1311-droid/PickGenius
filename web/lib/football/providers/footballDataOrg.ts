import { FootballDataProvider, FootballMatch } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_ORG_KEY || 'e8c7b9a4f3d2e1c0b9a8f7e6d5c4b3a2';
const BASE_URL = 'https://api.football-data.org/v4';

export class FootballDataOrgProvider implements FootballDataProvider {
    name = 'football-data.org';

    async getMatches(date: string): Promise<FootballMatch[]> {
        const leagueIds = ['PL', 'PD', 'SA', 'BL1', 'FL1'];
        const allMatches: FootballMatch[] = [];

        for (const leagueId of leagueIds) {
            try {
                const response = await fetch(
                    `${BASE_URL}/competitions/${leagueId}/matches?dateFrom=${date}&dateTo=${date}`,
                    {
                        headers: {
                            'X-Auth-Token': API_KEY
                        }
                    }
                );

                if (!response.ok) {
                    console.warn(`[${this.name}] Failed to fetch league ${leagueId}: ${response.status}`);
                    continue;
                }

                const data = await response.json();
                if (data.matches) {
                    allMatches.push(...data.matches);
                }
            } catch (error) {
                console.error(`[${this.name}] Error fetching league ${leagueId}:`, error);
            }
        }

        return allMatches;
    }
}
