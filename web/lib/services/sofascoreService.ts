// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
// Si estamos en el servidor, usamos la API directa.
// Si estamos en el cliente, usamos nuestro Proxy para evitar CORS.
const BASE_URL = typeof window === 'undefined'
    ? 'https://www.sofascore.com/api/v1'
    : '/api/proxy/sofascore';

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
    private headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.sofascore.com/',
        'Accept': 'application/json, text/plain, */*'
    };

    /**
     * Método genérico para realizar peticiones con bypass de ScraperAPI si está configurado
     */
    async makeRequest<T = any>(endpoint: string): Promise<T | null> {
        try {
            const targetUrl = endpoint.startsWith('http') ? endpoint : `https://www.sofascore.com/api/v1${endpoint}`;
            const useProxy = process.env.USE_PROXY === 'true' && !!process.env.SCRAPER_API_KEY;

            let fetchUrl = targetUrl;
            let fetchHeaders: any = this.headers;

            // Only use ScraperAPI on the server side
            if (useProxy && typeof window === 'undefined') {
                const apiKey = process.env.SCRAPER_API_KEY?.trim();
                console.log(`🔒 [Service Proxy] Using ScraperAPI for: ${endpoint}`);
                fetchUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}`;
                fetchHeaders = {};
            } else if (typeof window !== 'undefined') {
                // If on client, use our internal proxy
                fetchUrl = `/api/proxy/sofascore${endpoint}`;
            }

            const response = await fetch(fetchUrl, {
                headers: fetchHeaders,
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error(`❌ SofaScore Request Error (${endpoint}): ${response.status}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ SofaScore Fetch Exception (${endpoint}):`, error);
            return null;
        }
    }

    /**
     * Obtiene partidos de fútbol en vivo
     */
    async getLiveFootballMatches(): Promise<SofascoreEvent[]> {
        const data = await this.makeRequest<SofascoreResponse>('/sport/football/events/live');
        return data?.events || [];
    }

    /**
     * Obtiene partidos de fútbol programados para una fecha
     */
    async getScheduledFootballMatches(date: string): Promise<SofascoreEvent[]> {
        const data = await this.makeRequest<SofascoreResponse>(`/sport/football/scheduled-events/${date}`);
        return data?.events || [];
    }

    /**
     * Obtiene todos los partidos de fútbol (en vivo + programados)
     */
    async getAllFootballMatches(date?: string): Promise<SofascoreEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];
        const [liveMatches, scheduledMatches] = await Promise.all([
            this.getLiveFootballMatches(),
            this.getScheduledFootballMatches(today)
        ]);

        const allMatches = [...(liveMatches || []), ...(scheduledMatches || [])];
        return allMatches.filter((match, index, self) =>
            index === self.findIndex(m => m.id === match.id)
        );
    }

    /**
     * Obtiene partidos de baloncesto en vivo
     */
    async getLiveBasketballGames(): Promise<SofascoreEvent[]> {
        const data = await this.makeRequest<SofascoreResponse>('/sport/basketball/events/live');
        return data?.events || [];
    }

    /**
     * Obtiene partidos de baloncesto programados para una fecha
     */
    async getScheduledBasketballGames(date: string): Promise<SofascoreEvent[]> {
        const data = await this.makeRequest<SofascoreResponse>(`/sport/basketball/scheduled-events/${date}`);
        return data?.events || [];
    }

    /**
     * Obtiene todos los partidos de baloncesto (en vivo + programados)
     */
    async getAllBasketballGames(date?: string): Promise<SofascoreEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];
        const [liveGames, scheduledGames] = await Promise.all([
            this.getLiveBasketballGames(),
            this.getScheduledBasketballGames(today)
        ]);

        const allGames = [...(liveGames || []), ...(scheduledGames || [])];
        return allGames.filter((game, index, self) =>
            index === self.findIndex(g => g.id === game.id)
        );
    }

    /**
     * Filtra partidos de baloncesto por liga
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

    async getMatchBestPlayers(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/best-players`);
    }

    /**
     * Obtiene alineaciones y estadísticas de jugadores del partido
     */
    async getMatchLineups(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/lineups`);
    }

    /**
     * Obtiene los jugadores de un equipo (plantilla)
     */
    async getTeamPlayers(teamId: number): Promise<any> {
        return await this.makeRequest(`/team/${teamId}/players`);
    }

    /**
     * Obtiene estadísticas detalladas de un jugador en un partido específico
     */
    async getPlayerEventStatistics(playerId: number, eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/player/${playerId}/statistics`);
    }

    /**
     * Obtiene los últimos eventos de un jugador
     */
    async getPlayerLastEvents(playerId: number): Promise<any> {
        return await this.makeRequest(`/player/${playerId}/events/last/0`);
    }

    /**
     * Obtiene estadísticas de un jugador para una temporada
     */
    async getPlayerSeasonStats(playerId: number, tournamentId: number, seasonId: number): Promise<any> {
        return await this.makeRequest(`/player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`);
    }

    /**
     * Obtiene eventos para un deporte específico (en vivo + programados)
     */
    async getEventsBySport(sport: string, date?: string): Promise<SofascoreEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];
        const [liveData, scheduledData] = await Promise.all([
            this.makeRequest<SofascoreResponse>(`/sport/${sport}/events/live`),
            this.makeRequest<SofascoreResponse>(`/sport/${sport}/scheduled-events/${today}`)
        ]);

        const allEvents = [...(liveData?.events || []), ...(scheduledData?.events || [])];
        return allEvents.filter((event, index, self) =>
            index === self.findIndex(e => e.id === event.id)
        );
    }
}

export const sofascoreService = new SofascoreService();
