const BASE_URL = 'https://www.sofascore.com/api/v1';

export interface SofascoreTeam {
    id: number;
    name: string;
    shortName: string;
    slug: string;
    nameCode: string;
    teamColors: {
        primary: string;
        secondary: string;
        text: string;
    };
}

export interface SofascoreEvent {
    id: number;
    slug: string;
    tournament: {
        id: number;
        name: string;
        slug: string;
        uniqueTournament?: {
            id: number;
            name: string;
            primaryColorHex?: string;
            secondaryColorHex?: string;
        };
        category: {
            id: number;
            name: string;
            slug: string;
            sport: {
                id: number;
                name: string;
                slug: string;
            };
        };
    };
    season?: {
        id: number;
        name: string;
        year: string;
    };
    homeTeam: SofascoreTeam;
    awayTeam: SofascoreTeam;
    homeScore: {
        current: number;
        display: number;
        period1?: number;
        period2?: number;
        normaltime?: number;
    };
    awayScore: {
        current: number;
        display: number;
        period1?: number;
        period2?: number;
        normaltime?: number;
    };
    status: {
        code: number;
        description: string;
        type: 'notstarted' | 'inprogress' | 'finished';
    };
    startTimestamp: number;
    customId?: string;
    roundInfo?: {
        round: number;
        name?: string;
    };
}

export interface SofascoreResponse {
    events: SofascoreEvent[];
}

/**
 * Servicio para obtener datos de Sofascore API
 */
class SofascoreService {
    /**
     * Obtiene partidos de fútbol en vivo
     */
    async getLiveFootballMatches(): Promise<SofascoreEvent[]> {
        try {
            const response = await fetch(`${BASE_URL}/sport/football/events/live`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: SofascoreResponse = await response.json();
            return data.events || [];
        } catch (error) {
            console.error('Error fetching live football matches:', error);
            return [];
        }
    }

    /**
     * Obtiene partidos de fútbol programados para una fecha
     * @param date - Fecha en formato YYYY-MM-DD
     */
    async getScheduledFootballMatches(date: string): Promise<SofascoreEvent[]> {
        try {
            const response = await fetch(`${BASE_URL}/sport/football/scheduled-events/${date}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: SofascoreResponse = await response.json();
            return data.events || [];
        } catch (error) {
            console.error('Error fetching scheduled football matches:', error);
            return [];
        }
    }

    /**
     * Obtiene todos los partidos de fútbol (en vivo + programados)
     * @param date - Fecha en formato YYYY-MM-DD (default: hoy)
     */
    async getAllFootballMatches(date?: string): Promise<SofascoreEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];

        const [liveMatches, scheduledMatches] = await Promise.all([
            this.getLiveFootballMatches(),
            this.getScheduledFootballMatches(today)
        ]);

        // Combinar y eliminar duplicados por ID
        const allMatches = [...liveMatches, ...scheduledMatches];
        const uniqueMatches = allMatches.filter((match, index, self) =>
            index === self.findIndex(m => m.id === match.id)
        );

        return uniqueMatches;
    }

    /**
     * Obtiene partidos de baloncesto en vivo
     */
    async getLiveBasketballGames(): Promise<SofascoreEvent[]> {
        try {
            const response = await fetch(`${BASE_URL}/sport/basketball/events/live`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: SofascoreResponse = await response.json();
            return data.events || [];
        } catch (error) {
            console.error('Error fetching live basketball games:', error);
            return [];
        }
    }

    /**
     * Obtiene partidos de baloncesto programados para una fecha
     * @param date - Fecha en formato YYYY-MM-DD
     */
    async getScheduledBasketballGames(date: string): Promise<SofascoreEvent[]> {
        try {
            const response = await fetch(`${BASE_URL}/sport/basketball/scheduled-events/${date}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: SofascoreResponse = await response.json();
            return data.events || [];
        } catch (error) {
            console.error('Error fetching scheduled basketball games:', error);
            return [];
        }
    }

    /**
     * Obtiene todos los partidos de baloncesto (en vivo + programados)
     * @param date - Fecha en formato YYYY-MM-DD (default: hoy)
     */
    async getAllBasketballGames(date?: string): Promise<SofascoreEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];

        const [liveGames, scheduledGames] = await Promise.all([
            this.getLiveBasketballGames(),
            this.getScheduledBasketballGames(today)
        ]);

        // Combinar y eliminar duplicados por ID
        const allGames = [...liveGames, ...scheduledGames];
        const uniqueGames = allGames.filter((game, index, self) =>
            index === self.findIndex(g => g.id === game.id)
        );

        return uniqueGames;
    }

    /**
     * Filtra partidos de baloncesto por liga
     * @param games - Lista de partidos
     * @param league - 'NBA' o 'Euroleague'
     */
    filterBasketballByLeague(games: SofascoreEvent[], league: 'NBA' | 'Euroleague'): SofascoreEvent[] {
        return games.filter(game => {
            const tournamentName = game.tournament.name.toLowerCase();
            const uniqueTournamentName = game.tournament.uniqueTournament?.name.toLowerCase() || '';

            if (league === 'NBA') {
                return tournamentName.includes('nba') || uniqueTournamentName.includes('nba');
            } else {
                return tournamentName.includes('euroleague') || uniqueTournamentName.includes('euroleague');
            }
        });
    }
    async getMatchBestPlayers(eventId: number): Promise<any[]> {
        try {
            const response = await fetch(`${BASE_URL}/event/${eventId}/best-players`);
            if (!response.ok) {
                // Si falla el endpoint específico, intentamos lineups como fallback
                // o retornamos vacío. Sofascore a veces no tiene best-players para todos los eventos.
                return [];
            }
            const data = await response.json();
            return data.bestPlayers || [];
        } catch (error) {
            console.error('Error fetching match best players:', error);
            return [];
        }
    }

    /**
     * Obtiene alineaciones y estadísticas de jugadores del partido
     */
    async getMatchLineups(eventId: number): Promise<any> {
        try {
            const response = await fetch(`${BASE_URL}/event/${eventId}/lineups`);
            if (!response.ok) return null;
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching lineups:', error);
            return null;
        }
    }
}

export const sofascoreService = new SofascoreService();
