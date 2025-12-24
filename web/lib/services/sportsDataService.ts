// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
// Si estamos en el servidor, usamos la API directa.
// Si estamos en el cliente, usamos nuestro Proxy para evitar CORS.
const BASE_URL = typeof window === 'undefined'
    ? 'https://api.sofascore.com/api/v1'
    : '/api/proxy/sportsdata';

import { logApiCall } from '@/lib/adminService';
import axios from 'axios';

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
     * Generic method to make requests
     */
    async makeRequest<T = any>(endpoint: string): Promise<T | null> {
        try {
            const isServer = typeof window === 'undefined';
            const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

            // Priority 1: Backend Bridge (Dual Strategy: Cloud First -> Local Backup)
            const bridgeUrls = [
                process.env.NEXT_PUBLIC_CLOUD_API_URL, // Render (Stabilized 24/7)
                process.env.NEXT_PUBLIC_API_URL        // Local Ngrok (Developer Mode)
            ].filter(url => url && url.startsWith('http')) as string[];

            for (const bridgeUrl of bridgeUrls) {
                const cleanBridge = bridgeUrl.replace(/\/$/, "");
                const fetchUrl = `${cleanBridge}/api/proxy/sportsdata${cleanEndpoint}`;

                try {
                    const response = await fetch(fetchUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'application/json, text/plain, */*',
                            'ngrok-skip-browser-warning': 'true',
                            'Cache-Control': 'no-cache'
                        },
                        cache: 'no-store',
                        signal: AbortSignal.timeout(10000) // Lower timeout to switch faster
                    });

                    if (response.ok) {
                        return await response.json();
                    }
                } catch (err) {
                    console.warn(`⚠️ [SportsData] Failed bridge: ${bridgeUrl}. Trying next...`);
                }
            }

            // Priority 2: Local Proxy (Development) or Fallback
            const baseUrl = isServer
                ? 'https://api.sofascore.com/api/v1'
                : '/api/proxy/sportsdata';

            const url = `${baseUrl}${cleanEndpoint}`;

            const response = await axios.get(url, {
                timeout: 10000,
                headers: this.headers
            });

            return response.data;
        } catch (error: any) {
            // console.error(`Error fetching ${endpoint}:`, error.message);
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
        const data = await this.makeRequest<SportsDataResponse>(`/sport/football/events/${date}`);
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
        const data = await this.makeRequest<SportsDataResponse>(`/sport/basketball/events/${date}`);
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
        try {
            const data = await this.makeRequest(`/event/${eventId}/best-players`);

            // If data is valid and has expected structure, return it
            if (data && (data.bestPlayers || data.allPlayers)) {
                return data;
            }

            // Fallback: Try to derive best players from lineups/statistics
            // console.log(`🔍 [SportsData] No direct 'best-players' for ${eventId}, using lineups fallback...`);
            const lineups = await this.getMatchLineups(eventId);

            if (lineups && lineups.home && lineups.away) {
                const mapPlayers = (players: any[] = []) => players
                    .filter(p => p.statistics && (p.statistics.rating > 0 || p.statistics.points > 0))
                    .sort((a, b) => (b.statistics.rating || 0) - (a.statistics.rating || 0));

                const homePlayers = [...(lineups.home.players || []), ...(lineups.home.bench || [])];
                const awayPlayers = [...(lineups.away.players || []), ...(lineups.away.bench || [])];

                const processed = {
                    allPlayers: {
                        home: mapPlayers(homePlayers),
                        away: mapPlayers(awayPlayers)
                    },
                    bestPlayers: {
                        home: mapPlayers(homePlayers).slice(0, 3),
                        away: mapPlayers(awayPlayers).slice(0, 3)
                    },
                    source: 'lineups_derived'
                };
                return processed;
            }

            return { allPlayers: { home: [], away: [] }, bestPlayers: { home: [], away: [] } };
        } catch (error) {
            console.error(`❌ [SportsData] Error getting best players for ${eventId}:`, error);
            return { allPlayers: { home: [], away: [] }, bestPlayers: { home: [], away: [] } };
        }
    }

    async getMatchMomentum(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/attack-momentum`);
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
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/events/${yesterday}`),
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/events/${today}`),
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/events/${tomorrow}`)
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

        // console.log(`📊 [${sport.toUpperCase()}] Filtered ${uniqueEvents.length} events → ${recentEvents.length} recent (removed old finished)`);

        return recentEvents;
    }
}

export const sportsDataService = new SportsDataService();
