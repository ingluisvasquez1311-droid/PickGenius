// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
// Si estamos en el servidor, usamos la API directa.
// Si estamos en el cliente, usamos nuestro Proxy para evitar CORS.
const BASE_URL = typeof window === 'undefined'
    ? 'https://www.sofascore.com/api/v1'
    : '/api/proxy/sportsdata';

export interface SportsDataTeam {
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

export interface SportsDataEvent {
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
    homeTeam: SportsDataTeam;
    awayTeam: SportsDataTeam;
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

export interface SportsDataResponse {
    events: SportsDataEvent[];
}

/**
 * Servicio para obtener datos deportivos
 */
class SportsDataService {
    private headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.sofascore.com/',
        'Accept': 'application/json, text/plain, */*'
    };

    /**
     * Método genérico para realizar peticiones
     */
    async makeRequest<T = any>(endpoint: string): Promise<T | null> {
        try {
            const isServer = typeof window === 'undefined';
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            let fetchUrl: string;
            let fetchHeaders: any = { ...this.headers };

            // Determine the final URL with robust construction
            if (isServer && apiUrl) {
                const cleanApiUrl = apiUrl.trim().replace(/\/$/, "");
                const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

                // Route through our Render bridge
                fetchUrl = `${cleanApiUrl}/api/sofascore/proxy${cleanEndpoint}`;

                if (!process.env.NEXT_PHASE) {
                    console.log(`� [SportsData] Proxy Tunnel: ${fetchUrl}`);
                }
            } else {
                // Client side (browser) or local dev without apiUrl
                const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

                if (!isServer) {
                    // Use local Next.js API route as gateway (which we will also update to bridge to Render)
                    fetchUrl = `/api/proxy/sportsdata${cleanEndpoint}`;
                } else {
                    // Fallback to direct Sofascore (standard for local/dev)
                    fetchUrl = `https://www.sofascore.com/api/v1${cleanEndpoint}`;
                }
            }

            const response = await fetch(fetchUrl, {
                headers: fetchHeaders,
                cache: 'no-store',
                // Wait up to 15s for the bridge/Render to wake up
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "No error body");
                console.error(`❌ Request Error (${endpoint}): ${response.status} from ${fetchUrl}. Body: ${errorText.substring(0, 100)}`);
                return null;
            }

            return await response.json();
        } catch (error: any) {
            console.error(`❌ Fetch Exception (${endpoint}):`, error.message);
            return null;
        }
    }

    /**
     * Obtiene partidos de fútbol en vivo
     */
    async getLiveFootballMatches(): Promise<SportsDataEvent[]> {
        const data = await this.makeRequest<SportsDataResponse>('/sport/football/events/live');
        return data?.events || [];
    }

    /**
     * Obtiene partidos de fútbol programados para una fecha
     */
    async getScheduledFootballMatches(date: string): Promise<SportsDataEvent[]> {
        const data = await this.makeRequest<SportsDataResponse>(`/sport/football/scheduled-events/${date}`);
        return data?.events || [];
    }

    /**
     * Obtiene todos los partidos de fútbol (en vivo + programados)
     */
    async getAllFootballMatches(date?: string): Promise<SportsDataEvent[]> {
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
    async getLiveBasketballGames(): Promise<SportsDataEvent[]> {
        const data = await this.makeRequest<SportsDataResponse>('/sport/basketball/events/live');
        return data?.events || [];
    }

    /**
     * Obtiene partidos de baloncesto programados para una fecha
     */
    async getScheduledBasketballGames(date: string): Promise<SportsDataEvent[]> {
        const data = await this.makeRequest<SportsDataResponse>(`/sport/basketball/scheduled-events/${date}`);
        return data?.events || [];
    }

    /**
     * Obtiene todos los partidos de baloncesto (en vivo + programados)
     */
    async getAllBasketballGames(date?: string): Promise<SportsDataEvent[]> {
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
    filterBasketballByLeague(games: SportsDataEvent[], league: 'NBA' | 'Euroleague'): SportsDataEvent[] {
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
     * Obtiene estadísticas generales del partido (posesión, tiros, etc.)
     */
    async getMatchStatistics(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/statistics`);
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
        // Primero intentamos regularSeason que es más común en ligas como NBA
        const res = await this.makeRequest(`/player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/regularSeason`);
        if (res && res.statistics) return res;

        // Fallback a overall
        return await this.makeRequest(`/player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`);
    }

    /**
     * Obtiene eventos para un deporte específico (en vivo + programados)
     */
    async getEventsBySport(sport: string, date?: string): Promise<SportsDataEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];
        const yesterday = new Date(new Date(today).getTime() - 86400000).toISOString().split('T')[0];
        const tomorrow = new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0];

        const [liveData, scheduledYesterday, scheduledToday, scheduledTomorrow] = await Promise.all([
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/events/live`),
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/scheduled-events/${yesterday}`),
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/scheduled-events/${today}`),
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/scheduled-events/${tomorrow}`)
        ]);

        const allEvents = [
            ...(liveData?.events || []),
            ...(scheduledYesterday?.events || []),
            ...(scheduledToday?.events || []),
            ...(scheduledTomorrow?.events || [])
        ];

        return allEvents.filter((event, index, self) =>
            index === self.findIndex(e => e.id === event.id)
        );
    }
}

export const sportsDataService = new SportsDataService();
