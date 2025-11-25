import { FootballDataProvider, FootballMatch } from '../types';

const API_KEY = process.env.NEXT_PUBLIC_ALL_SPORTS_API_KEY || '1b1792ff40914cdc8e753a1d1bb60dff44765a5cb22a954ea0f995ca7db6a4b3';
const BASE_URL = 'https://apiv2.allsportsapi.com/football';

interface AllSportsMatch {
    event_key: number;
    event_date: string;
    event_time: string;
    event_home_team: string;
    home_team_key: number;
    home_team_logo?: string;
    event_away_team: string;
    away_team_key: number;
    away_team_logo?: string;
    event_final_result: string;
    event_status: string;
    league_name: string;
    league_key: number;
    league_logo?: string;
}

export class AllSportsApiProvider implements FootballDataProvider {
    name = 'AllSportsApi';

    async getMatches(date: string): Promise<FootballMatch[]> {
        // League IDs mapping for AllSportsApi (Top 5 leagues)
        // Premier League: 152, La Liga: 302, Serie A: 207, Bundesliga: 175, Ligue 1: 168
        // Note: These IDs might need verification, using generic query for now or specific IDs if known.
        // For simplicity in this demo, we'll query by date and filter/map commonly known leagues if possible,
        // or just fetch all and let the UI handle it.
        // AllSportsApi allows fetching by date directly.

        try {
            const response = await fetch(
                `${BASE_URL}/?met=Fixtures&APIkey=${API_KEY}&from=${date}&to=${date}`
            );

            if (!response.ok) {
                throw new Error(`API response not ok: ${response.status}`);
            }

            const data = await response.json();

            if (!data.result || !Array.isArray(data.result)) {
                return [];
            }

            return data.result.map(this.mapToCanonical);
        } catch (error) {
            console.error(`[${this.name}] Error fetching matches:`, error);
            throw error; // Let the service handle the fallback
        }
    }

    private mapToCanonical(match: AllSportsMatch): FootballMatch {
        // Parse score
        const scores = match.event_final_result.split(' - ');
        const homeScore = scores.length === 2 ? parseInt(scores[0]) : null;
        const awayScore = scores.length === 2 ? parseInt(scores[1]) : null;

        // Map status
        let status = 'SCHEDULED';
        if (match.event_status === 'Finished') status = 'FINISHED';
        else if (match.event_status === '' || match.event_status === 'After ET' || match.event_status === 'After Pen.') status = 'FINISHED'; // simplistic
        else status = 'IN_PLAY'; // Assume anything else is live/scheduled

        // UTC Date construction (event_date is YYYY-MM-DD, event_time is HH:mm)
        const utcDate = `${match.event_date}T${match.event_time}:00Z`; // Rough approximation, API usually returns local time or server time.

        return {
            id: match.event_key,
            competition: {
                id: match.league_key,
                name: match.league_name,
                emblem: match.league_logo || ''
            },
            utcDate: utcDate,
            status: status,
            homeTeam: {
                id: match.home_team_key,
                name: match.event_home_team,
                crest: match.home_team_logo || ''
            },
            awayTeam: {
                id: match.away_team_key,
                name: match.event_away_team,
                crest: match.away_team_logo || ''
            },
            score: {
                winner: null,
                duration: 'REGULAR',
                fullTime: {
                    home: homeScore,
                    away: awayScore
                }
            }
        };
    }
}
