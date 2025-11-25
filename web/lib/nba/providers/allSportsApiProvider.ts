import { NBADataProvider, NBAGame } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_ALL_SPORTS_API_KEY || '1b1792ff40914cdc8e753a1d1bb60dff44765a5cb22a954ea0f995ca7db6a4b3';
const BASE_URL = 'https://apiv2.allsportsapi.com/basketball';

interface AllSportsNBAMatch {
    event_key: number;
    event_date: string;
    event_time: string;
    event_home_team: string;
    home_team_key: number;
    event_away_team: string;
    away_team_key: number;
    event_final_result: string;
    event_status: string;
    league_name: string;
    league_key: number;
    scores?: {
        [key: string]: {
            score_home: string;
            score_away: string;
        };
    };
}

export class AllSportsApiNBAProvider implements NBADataProvider {
    name = 'AllSportsApi';

    async getTodayGames(): Promise<NBAGame[]> {
        const today = new Date().toISOString().split('T')[0];
        return this.fetchGames(today, today);
    }

    async getGamesByDateRange(startDate: Date, endDate: Date): Promise<NBAGame[]> {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        return this.fetchGames(start, end);
    }

    private async fetchGames(from: string, to: string): Promise<NBAGame[]> {
        try {
            // League ID 787 is often NBA in AllSportsApi, but it's safer to filter by name or fetch all and filter
            // We'll fetch by date and filter for "NBA" in league name to be safe
            const response = await fetch(
                `${BASE_URL}/?met=Fixtures&APIkey=${API_KEY}&from=${from}&to=${to}`
            );

            if (!response.ok) {
                throw new Error(`API response not ok: ${response.status}`);
            }

            const data = await response.json();

            if (!data.result || !Array.isArray(data.result)) {
                return [];
            }

            // Filter for NBA games only
            const nbaGames = data.result.filter((match: AllSportsNBAMatch) =>
                match.league_name.includes('NBA')
            );

            return nbaGames.map(this.mapToCanonical);
        } catch (error) {
            console.error(`[${this.name}] Error fetching matches:`, error);
            return [];
        }
    }

    private mapToCanonical(match: AllSportsNBAMatch): NBAGame {
        // Parse score
        // event_final_result format is usually "Home - Away" or empty if scheduled
        let homeScore = 0;
        let awayScore = 0;

        if (match.event_final_result && match.event_final_result.includes('-')) {
            const scores = match.event_final_result.split('-');
            homeScore = parseInt(scores[0].trim()) || 0;
            awayScore = parseInt(scores[1].trim()) || 0;
        }

        // Map status
        let status: 'Scheduled' | 'Live' | 'Finished' = 'Scheduled';
        if (match.event_status === 'Finished') status = 'Finished';
        else if (match.event_status === '' || match.event_status === 'After ET') status = 'Finished';
        else if (match.event_status === 'Scheduled') status = 'Scheduled';
        else status = 'Live'; // Assume anything else is live

        // UTC Date construction
        const utcDate = new Date(`${match.event_date}T${match.event_time}:00`);

        return {
            id: match.event_key.toString(),
            gameId: match.event_key,
            date: utcDate,
            homeTeam: match.event_home_team,
            awayTeam: match.event_away_team,
            homeScore: homeScore,
            awayScore: awayScore,
            status: status,
            season: '2024-25' // Defaulting for now
        };
    }
}
