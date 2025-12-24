// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
// Si estamos en el servidor, usamos la API directa.
// Si estamos en el cliente, usamos nuestro Proxy para evitar CORS.
const BASE_URL = typeof window === 'undefined'
    ? 'https://api.sofascore.com/api/v1'
    : '/api/proxy/sportsdata';

import { logApiCall } from '@/lib/adminService';

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
        period3?: number;
        period4?: number;
        normaltime?: number;
    };
    awayScore: {
        current: number;
        display: number;
        period1?: number;
        period2?: number;
        period3?: number;
        period4?: number;
        normaltime?: number;
    };
    status: {
        code: number;
        description: string;
        type: 'notstarted' | 'inprogress' | 'finished';
    };
    lastPeriod?: string;
    time?: {
        currentPeriodStartTimestamp?: number;
        initial?: number;
        max?: number;
        played?: number;
        periodLength?: number;
        overtimeLength?: number;
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
        'Accept': 'application/json, text/plain, */*',
        'Bypass-Tunnel-Reminder': 'true', // Evita la pantalla de bloqueo de LocalTunnel
        'ngrok-skip-browser-warning': 'true' // Evita la pantalla de advertencia de ngrok
    };

    /**
     * Método genérico para realizar peticiones
     */
    async makeRequest<T = any>(endpoint: string): Promise<T | null> {
        try {
            const isServer = typeof window === 'undefined';
            const useProxy = process.env.USE_PROXY === 'true';

            // Priority Detection: Local Backend vs Render vs ScraperAPI
            const localBackend = 'http://localhost:3001';
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_HOST)?.trim();

            // In development, if we have a local backend, let's prefer it over slow Scraper fallback
            const isDev = process.env.NODE_ENV === 'development';
            const preferredBridge = (isDev && isServer) ? localBackend : apiUrl;

            const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
            const targetUrl = `https://www.sofascore.com/api/v1${cleanEndpoint}`;

            console.log(`🔍 [SportsData] Requesting: ${cleanEndpoint} | isServer: ${isServer}`);

            // Priority 1: Backend Bridge (Local Tunnel / ngrok)
            // ONLY use the bridge if we are in PRODUCTION (Vercel) to reach the local PC.
            // If we are in development, we are the bridge, so fetch directly.
            const shouldTryBridge = !isDev && isServer && preferredBridge && preferredBridge.startsWith('http');

            if (shouldTryBridge) {
                const cleanBridgeUrl = preferredBridge!.trim().replace(/\/$/, "");
                const fetchUrl = `${cleanBridgeUrl}/api/proxy/sportsdata${cleanEndpoint}`;
                console.log(`🔌 [SportsData] Routing to Bridge: ${cleanBridgeUrl}${cleanEndpoint}`);

                try {
                    const response = await fetch(fetchUrl, {
                        headers: {
                            ...this.headers,
                            'Cache-Control': 'no-store',
                            'ngrok-skip-browser-warning': 'true'
                        },
                        cache: 'no-store',
                        signal: AbortSignal.timeout(8000) // Tighter timeout for Bridge
                    });

                    if (response.ok) {
                        const jsonData = await response.json();
                        console.log(`✅ [SportsData] Success from Bridge! (${cleanEndpoint})`);
                        return jsonData;
                    } else {
                        const errorMsg = await response.text().catch(() => "Unknown error");
                        console.warn(`⚠️ [SportsData] Bridge error ${response.status}: ${errorMsg.substring(0, 100)}`);
                    }
                } catch (bridgeError: any) {
                    console.error(`❌ [SportsData] Bridge Connection Failed (${cleanBridgeUrl}): ${bridgeError.message}`);
                    if (bridgeError.name === 'TimeoutError') {
                        console.error(`⏳ [SportsData] Bridge TIMEOUT - Check if ngrok is running and responsive.`);
                    }
                }
            }

            // Priority 2: Direct Fetch (Stealth Mode)
            // Fallback if the bridge is down/not configured.
            const fetchUrl = !isServer ? `/api/proxy/sportsdata${cleanEndpoint}` : targetUrl;
            console.log(`🌍 [SportsData] Internal Fallback: ${fetchUrl}`);

            let response = await fetch(fetchUrl, {
                headers: this.headers,
                cache: 'no-store',
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok && isServer) {
                console.warn(`⚠️ [SportsData] Falling back to Stealth Mode...`);

                // Direct call to Sofascore API with advanced mimicking headers
                const directUrl = `https://api.sofascore.com/api/v1${cleanEndpoint}`;

                response = await fetch(directUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                        'Referer': 'https://www.sofascore.com/',
                        'Origin': 'https://www.sofascore.com',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Ch-Ua-Platform': '"Windows"',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-site'
                    },
                    cache: 'no-store',
                    signal: AbortSignal.timeout(30000)
                });

                console.log(`🕵️ [SportsData] Stealth Mode Response: ${response.status}`);
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => "No error body");
                console.error(`❌ Request Failed: ${response.status}. Body: ${errorText.substring(0, 200)}`);
                logApiCall('Sofascore', endpoint, response.status).catch(() => { });
                return null; // Changed from throw to return null to match original behavior for non-200
            }

            logApiCall('Sofascore', endpoint, 200).catch(() => { });
            const data = await response.json();
            return data;
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
     * Obtiene cuotas reales de mercado (Bet365, etc.) para el partido
     */
    async getMatchOdds(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/odds/1/all`);
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
     * Obtiene los últimos partidos de un equipo
     */
    async getTeamLastResults(teamId: number, sport: string = 'football'): Promise<any[]> {
        const data = await this.makeRequest(`/team/${teamId}/events/last/0`);
        return data?.events || [];
    }

    /**
     * Obtiene el historial de enfrentamientos directos (H2H)
     */
    async getMatchH2H(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/h2h`);
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
        try {
            // Priority 1: Regular Season (Most common for NBA/leagues)
            const regularRes = await this.makeRequest(`/player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/regularSeason`);
            if (regularRes && regularRes.statistics) return regularRes;
        } catch (e) {
            // Ignore 404s on regularSeason
        }

        try {
            // Priority 2: Overall (Fallback)
            const overallRes = await this.makeRequest(`/player/${playerId}/unique-tournament/${tournamentId}/season/${seasonId}/statistics/overall`);
            if (overallRes && overallRes.statistics) return overallRes;
        } catch (e) {
            console.warn(`[SportsData] No season stats found for player ${playerId}`);
        }

        return { statistics: {} };
    }

    /**
     * Obtiene eventos para un deporte específico (en vivo + programados)
     * FILTERS OUT finished matches older than 2 hours
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

        // Remove duplicates
        const uniqueEvents = allEvents.filter((event, index, self) =>
            index === self.findIndex(e => e.id === event.id)
        );

        // Filter out old finished matches (older than 2 hours)
        const now = Date.now() / 1000; // Current time in seconds
        const twoHoursAgo = now - (2 * 60 * 60); // 2 hours ago in seconds

        const recentEvents = uniqueEvents.filter((event) => {
            // Keep all non-finished events
            if (event.status?.type !== 'finished') {
                return true;
            }
            // For finished events, only keep if they finished within last 2 hours
            return event.startTimestamp > twoHoursAgo;
        });

        console.log(`📊 [${sport.toUpperCase()}] Filtered ${uniqueEvents.length} events → ${recentEvents.length} recent (removed old finished)`);

        return recentEvents;
    }
}

export const sportsDataService = new SportsDataService();
