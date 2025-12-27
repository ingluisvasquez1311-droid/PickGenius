// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
// Si estamos en el servidor, usamos la API directa.
// Si estamos en el cliente, usamos nuestro Proxy para evitar CORS.
// La URL del Bridge (Tu IP casera) es obligatoria para NO ser bloqueados
const BRIDGE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const BASE_URL = typeof window === 'undefined'
    ? `${BRIDGE_URL}/api/proxy/sportsdata` // En el servidor, USAMOS EL PUENTE (Tu IP) siempre
    : '/api/proxy/sportsdata'; // En el cliente, usamos el proxy local del navegador

import { logApiCall } from '@/lib/adminService';
import axios from 'axios';
import { fetchAPI } from '../api';

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
        type: 'notstarted' | 'inprogress' | 'finished' | 'scheduled' | 'canceled' | 'postponed';
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://www.sofascore.com/',
        'Origin': 'https://www.sofascore.com',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="121", "Google Chrome";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Bypass-Tunnel-Reminder': 'true',
        'ngrok-skip-browser-warning': 'true'
    };

    /**
     * Generic method to make requests
     * Using fetchAPI for centralized URL and error handling
     */
    async makeRequest<T = any>(endpoint: string): Promise<T | null> {
        try {
            const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
            const proxyEndpoint = `/api/proxy/sportsdata${cleanEndpoint}`;

            return await fetchAPI(proxyEndpoint, {
                headers: this.headers
            });
        } catch (error: any) {
            console.error(`❌ [SportsDataService] Request failed for ${endpoint}:`, error.message);
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
        return this.getScheduledEventsBySport('football', date);
    }

    /**
     * Obtiene eventos programados de forma filtrada (Backend Local)
     */
    async getScheduledEventsBySport(sport: string, date?: string): Promise<SportsDataEvent[]> {
        try {
            const queryParams = date ? `?date=${date}` : '';
            const endpoint = `/api/${sport}/scheduled${queryParams}`;

            const result = await fetchAPI(endpoint, {
                headers: this.headers
            });

            return result.events || result.data || [];
        } catch (error) {
            console.error(`❌ [SportsDataService] Error fetching scheduled ${sport}:`, error);
            return [];
        }
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
        return this.getScheduledEventsBySport('basketball', date);
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

    /**
     * Obtiene un evento específico por ID
     */
    async getEventById(eventId: string | number): Promise<SportsDataEvent | null> {
        const data = await this.makeRequest<{ event: SportsDataEvent }>(`/event/${eventId}`);
        return data?.event || null;
    }

    /**
     * Obtiene estadísticas detalladas de un evento
     */
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
    async getMatchOdds(eventId: number, marketId: number = 1): Promise<any> {
        try {
            const data = await this.makeRequest(`/event/${eventId}/odds/${marketId}/all`);
            // The makeRequest already handles errors and returns null for failed requests.
            // We just need to check if the data is null or empty, which might indicate a 404 or no data.
            if (!data || Object.keys(data).length === 0) {
                console.warn(`[SportsData] Odds not available (or empty response) for event ${eventId}, market ${marketId}`);
                return null;
            }
            return data;
        } catch (error) {
            console.error(`[SportsData] Error fetching odds for ${eventId}:`, error);
            return null;
        }
    }

    /**
     * Intenta extraer la línea principal de Over/Under (Totales) de un evento
     */
    async getMatchTotalLine(eventId: number, sport: string): Promise<{ line: number; provider: string } | null> {
        try {
            const odds = await this.getMatchOdds(eventId);
            if (!odds || !odds.markets) return null;

            // Diferentes nombres de mercado según el deporte
            const marketKeywords = sport === 'football' ? ['total goals', 'over/under'] : ['total points', 'over/under', 'total'];

            const market = odds.markets.find((m: any) =>
                marketKeywords.some(key => m.marketName.toLowerCase().includes(key))
            );

            if (market && market.choices && market.choices.length > 0) {
                const choice = market.choices[0];
                const lineMatch = choice.name.match(/(\d+\.?\d*)/);
                if (lineMatch) {
                    return {
                        line: parseFloat(lineMatch[1]),
                        provider: 'Betplay'
                    };
                }
            }
            return null;
        } catch (error) {
            console.error(`Error al extraer línea total para ${eventId}:`, error);
            return null;
        }
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
     * FILTERS OUT upcoming matches starting more than 12 hours from now
     */
    async getEventsBySport(sport: string, date?: string): Promise<SportsDataEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0];

        // Fetch using our backend API routes
        const [liveResult, scheduledToday, scheduledTomorrow] = await Promise.all([
            fetchAPI(`/api/${sport}/live`).catch(() => ({ data: [] })),
            this.getScheduledEventsBySport(sport, today),
            this.getScheduledEventsBySport(sport, tomorrow)
        ]);

        const liveEvents = liveResult?.events || liveResult?.data || [];
        const liveIds = new Set(liveEvents.map((e: any) => e.id));

        // Filter out matches that are already LIVE from the scheduled lists
        const cleanToday = (Array.isArray(scheduledToday) ? scheduledToday : [])
            .filter(e => !liveIds.has(e.id));

        const cleanTomorrow = (Array.isArray(scheduledTomorrow) ? scheduledTomorrow : [])
            .filter(e => !liveIds.has(e.id));

        const allEvents = [
            ...liveEvents,
            ...cleanToday,
            ...cleanTomorrow
        ];

        // Final deduplication (just in case there's overlap between today and tomorrow or live)
        const uniqueEvents = allEvents.filter((event, index, self) =>
            index === self.findIndex(e => e.id === event.id)
        );

        // Filter out old finished matches (older than 2 hours) AND future matches (more than 12 hours away)
        const now = Date.now() / 1000;
        const twoHoursAgo = now - (2 * 60 * 60);
        const twelveHoursFromNow = now + (12 * 60 * 60);

        const recentEvents = uniqueEvents.filter((event) => {
            if (event.status?.type === 'finished') {
                return event.startTimestamp > twoHoursAgo;
            }

            if (event.status?.type === 'notstarted' || event.status?.type === 'scheduled') {
                return event.startTimestamp <= twelveHoursFromNow;
            }

            return true;
        });

        console.log(`📊 [${sport.toUpperCase()}] Filtered ${uniqueEvents.length} events → ${recentEvents.length} (deduplicated and windowed)`);

        return recentEvents;
    }
}

export const sportsDataService = new SportsDataService();
