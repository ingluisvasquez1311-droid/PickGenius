(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/web/lib/services/sportsDataService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sportsDataService",
    ()=>sportsDataService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
// Si estamos en el servidor, usamos la API directa.
// Si estamos en el cliente, usamos nuestro Proxy para evitar CORS.
// La URL del Bridge (Tu IP casera) es obligatoria para NO ser bloqueados
const BRIDGE_URL = ("TURBOPACK compile-time value", "http://localhost:3001") || 'http://localhost:3001';
const BASE_URL = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" // En el servidor, USAMOS EL PUENTE (Tu IP) siempre
 : '/api/proxy/sportsdata'; // En el cliente, usamos el proxy local del navegador
;
/**
 * Servicio para obtener datos deportivos
 */ class SportsDataService {
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    };
    /**
     * Generic method to make requests
     * Using fetchAPI for centralized URL and error handling
     */ async makeRequest(endpoint) {
        try {
            const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
            const proxyEndpoint = `/api/proxy/sportsdata${cleanEndpoint}`;
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(proxyEndpoint, {
                headers: this.headers
            });
        } catch (error) {
            // Silence 404s as they are often expected (e.g., no momentum or no lineups for small leagues)
            const errorMsg = error.message || '';
            const is404 = errorMsg.includes('404') || error.status === 404 || error.response?.status === 404;
            if (!is404) {
                console.error(`❌ [SportsDataService] Request failed for ${endpoint}:`, errorMsg);
            } else {
            // console.warn(`[SportsDataService] Data not found (404) for ${endpoint} - This is often expected.`);
            }
            return null;
        }
    }
    /**
     * Obtiene partidos de fútbol en vivo
     */ /**
     * Obtiene partidos de fútbol en vivo
     */ async getLiveFootballMatches() {
        try {
            // 1. Prioridad: Sofascore DIRECTO (vía Bridge) para inmediatez absoluta
            const data = await this.makeRequest('/sport/football/events/live');
            if (data?.events && data.events.length > 0) return data.events;
        } catch (e) {
            console.warn("⚠️ Fallback to Firebase for Live Football");
        }
        // 2. Fallback: Firebase (Vía nuestra API interna)
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/football/live', {
            headers: this.headers
        });
        return res?.events || [];
    }
    /**
     * Obtiene partidos de fútbol programados para una fecha
     */ async getScheduledFootballMatches(date) {
        return this.getScheduledEventsBySport('football', date);
    }
    /**
     * Obtiene eventos programados de forma filtrada (Backend Local)
     */ async getScheduledEventsBySport(sport, date) {
        const today = date || new Date().toISOString().split('T')[0];
        try {
            // 1. Prioridad: Sofascore DIRECTO (vía Bridge) - Lo que Daniel ve en su PC
            const ssData = await this.makeRequest(`/sport/${sport}/scheduled-events/${today}`);
            if (ssData?.events && ssData.events.length > 0) {
                return ssData.events;
            }
        } catch (e) {
            console.warn(`⚠️ SofaScore Direct failed for ${sport}, checking Firebase...`);
        }
        try {
            // 2. Fallback: Nuestra API de Firebase
            const queryParams = date ? `?date=${date}` : '';
            const endpoint = `/api/${sport}/scheduled${queryParams}`;
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(endpoint, {
                headers: this.headers
            });
            return result.events || result.data || [];
        } catch (error) {
            console.error(`❌ [SportsDataService] Error total fetching scheduled ${sport}:`, error);
            return [];
        }
    }
    /**
     * Obtiene todos los partidos de fútbol (en vivo + programados)
     */ async getAllFootballMatches(date) {
        const today = date || new Date().toISOString().split('T')[0];
        const [liveMatches, scheduledMatches] = await Promise.all([
            this.getLiveFootballMatches(),
            this.getScheduledFootballMatches(today)
        ]);
        const allMatches = [
            ...liveMatches || [],
            ...scheduledMatches || []
        ];
        return allMatches.filter((match, index, self)=>index === self.findIndex((m)=>m.id === match.id));
    }
    /**
     * Obtiene partidos de baloncesto en vivo
     */ async getLiveBasketballGames() {
        try {
            // 1. Prioridad: Sofascore DIRECTO
            const data = await this.makeRequest('/sport/basketball/events/live');
            if (data?.events && data.events.length > 0) return data.events;
        } catch (e) {
            console.warn("⚠️ Fallback to Firebase for Live Basketball");
        }
        // 2. Fallback: Firebase
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/basketball/live', {
            headers: this.headers
        });
        return res?.events || [];
    }
    /**
     * Obtiene partidos de baloncesto programados para una fecha
     */ async getScheduledBasketballGames(date) {
        return this.getScheduledEventsBySport('basketball', date);
    }
    /**
     * Obtiene todos los partidos de baloncesto (en vivo + programados)
     */ async getAllBasketballGames(date) {
        const today = date || new Date().toISOString().split('T')[0];
        const [liveGames, scheduledGames] = await Promise.all([
            this.getLiveBasketballGames(),
            this.getScheduledBasketballGames(today)
        ]);
        const allGames = [
            ...liveGames || [],
            ...scheduledGames || []
        ];
        return allGames.filter((game, index, self)=>index === self.findIndex((g)=>g.id === game.id));
    }
    /**
     * Filtra partidos de baloncesto por liga
     */ filterBasketballByLeague(games, league) {
        return games.filter((game)=>{
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
     */ async getEventById(eventId) {
        try {
            // 1. PRIORIDAD ABSOLUTA: Sofascore DIRECTO (vía Bridge)
            // Esto garantiza que Momentum, Estadísticas y Alineaciones estén disponibles AL INSTANTE
            const ssData = await this.makeRequest(`/event/${eventId}`);
            if (ssData && ssData.event) {
                const event = ssData.event;
                // 2. ENRIQUECIMIENTO ASÍNCRONO: Intentar obtener cuotas/predicciones de Firebase
                try {
                    const firebaseRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(`/api/events/${eventId}`);
                    if (firebaseRes && firebaseRes.event) {
                        // Combinamos: Datos base de Sofascore + Lo que tengamos en nuestra DB (cuotas, verificaciones)
                        return {
                            ...event,
                            ...firebaseRes.event,
                            // Mantenemos los scores de Sofascore como fuente de verdad en vivo
                            homeScore: event.homeScore,
                            awayScore: event.awayScore,
                            status: event.status,
                            // Indicador de que fue enriquecido
                            isEnriched: true
                        };
                    }
                } catch (e) {
                // Si falla Firebase, devolvemos el evento puro de Sofascore sin problemas
                }
                return event;
            }
        } catch (error) {
            console.error(`❌ [SportsDataService] Error getting event ${eventId} from Bridge:`, error);
        }
        // 3. FALLBACK: Si el bridge falla o el evento no existe en Sofascore, intentar solo Firebase
        try {
            const firebaseRes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])(`/api/events/${eventId}`);
            return firebaseRes?.event || null;
        } catch (e) {
            return null;
        }
    }
    /**
     * Obtiene estadísticas detalladas de un evento
     */ async getMatchBestPlayers(eventId) {
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
                const mapPlayers = (players = [])=>players.filter((p)=>p.statistics && (p.statistics.rating > 0 || p.statistics.points > 0)).sort((a, b)=>(b.statistics.rating || 0) - (a.statistics.rating || 0));
                const homePlayers = [
                    ...lineups.home.players || [],
                    ...lineups.home.bench || []
                ];
                const awayPlayers = [
                    ...lineups.away.players || [],
                    ...lineups.away.bench || []
                ];
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
            return {
                allPlayers: {
                    home: [],
                    away: []
                },
                bestPlayers: {
                    home: [],
                    away: []
                }
            };
        } catch (error) {
            console.error(`❌ [SportsData] Error getting best players for ${eventId}:`, error);
            return {
                allPlayers: {
                    home: [],
                    away: []
                },
                bestPlayers: {
                    home: [],
                    away: []
                }
            };
        }
    }
    async getMatchMomentum(eventId) {
        return await this.makeRequest(`/event/${eventId}/attack-momentum`);
    }
    /**
     * Obtiene estadísticas generales del partido (posesión, tiros, etc.)
     */ async getMatchStatistics(eventId) {
        return await this.makeRequest(`/event/${eventId}/statistics`);
    }
    /**
     * Obtiene cuotas reales de mercado (Bet365, etc.) para el partido
     */ async getMatchOdds(eventId, marketId = 1) {
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
     */ async getMatchTotalLine(eventId, sport) {
        try {
            const odds = await this.getMatchOdds(eventId);
            if (!odds || !odds.markets) return null;
            // Diferentes nombres de mercado según el deporte
            const marketKeywords = sport === 'football' ? [
                'total goals',
                'over/under'
            ] : [
                'total points',
                'over/under',
                'total'
            ];
            const market = odds.markets.find((m)=>marketKeywords.some((key)=>m.marketName.toLowerCase().includes(key)));
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
     */ async getMatchLineups(eventId) {
        return await this.makeRequest(`/event/${eventId}/lineups`);
    }
    /**
     * Obtiene los jugadores de un equipo (plantilla)
     */ async getTeamPlayers(teamId) {
        return await this.makeRequest(`/team/${teamId}/players`);
    }
    /**
     * Obtiene los últimos partidos de un equipo
     */ async getTeamLastResults(teamId, sport = 'football') {
        const data = await this.makeRequest(`/team/${teamId}/events/last/0`);
        return data?.events || [];
    }
    /**
     * Obtiene el historial de enfrentamientos directos (H2H)
     */ async getMatchH2H(eventId) {
        return await this.makeRequest(`/event/${eventId}/h2h`);
    }
    /**
     * Obtiene estadísticas detalladas de un jugador en un partido específico
     */ async getPlayerEventStatistics(playerId, eventId) {
        return await this.makeRequest(`/event/${eventId}/player/${playerId}/statistics`);
    }
    /**
     * Obtiene los últimos eventos de un jugador
     */ async getPlayerLastEvents(playerId) {
        return await this.makeRequest(`/player/${playerId}/events/last/0`);
    }
    /**
     * Obtiene estadísticas de un jugador para una temporada
     */ async getPlayerSeasonStats(playerId, tournamentId, seasonId) {
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
        return {
            statistics: {}
        };
    }
    /**
     * Obtiene eventos para un deporte específico (en vivo + programados)
     * FILTERS OUT finished matches older than 2 hours
     * FILTERS OUT upcoming matches starting more than 12 hours from now
     */ async getEventsBySport(sport, date) {
        const today = date || new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0];
        // 1. Obtener datos REAL-TIME directamente de Sofascore (vía Bridge)
        const [liveFromBridge, scheduledToday, scheduledTomorrow] = await Promise.all([
            this.makeRequest(`/sport/${sport}/events/live`).catch(()=>null),
            this.getScheduledEventsBySport(sport, today),
            this.getScheduledEventsBySport(sport, tomorrow)
        ]);
        const liveEvents = liveFromBridge?.events || [];
        const liveIds = new Set(liveEvents.map((e)=>e.id));
        // Filter out matches that are already LIVE from the scheduled lists
        const cleanToday = (Array.isArray(scheduledToday) ? scheduledToday : []).filter((e)=>!liveIds.has(e.id));
        const cleanTomorrow = (Array.isArray(scheduledTomorrow) ? scheduledTomorrow : []).filter((e)=>!liveIds.has(e.id));
        const allEvents = [
            ...liveEvents,
            ...cleanToday,
            ...cleanTomorrow
        ];
        // Final deduplication (just in case there's overlap between today and tomorrow or live)
        const uniqueEvents = allEvents.filter((event, index, self)=>index === self.findIndex((e)=>e.id === event.id));
        // Filter out old finished matches (older than 12 hours) AND future matches (more than 24 hours away)
        const now = Date.now() / 1000;
        const twelveHoursAgo = now - 12 * 60 * 60;
        const twentyFourHoursFromNow = now + 24 * 60 * 60;
        const recentEvents = uniqueEvents.filter((event)=>{
            if (event.status?.type === 'finished') {
                return event.startTimestamp > twelveHoursAgo;
            }
            if (event.status?.type === 'notstarted' || event.status?.type === 'scheduled') {
                return event.startTimestamp <= twentyFourHoursFromNow;
            }
            return true;
        });
        console.log(`📊 [${sport.toUpperCase()}] Filtered ${uniqueEvents.length} events → ${recentEvents.length} (deduplicated and windowed)`);
        return recentEvents;
    }
}
const sportsDataService = new SportsDataService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/hooks/useMatchData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMatchBestPlayers",
    ()=>useMatchBestPlayers,
    "useMatchDetails",
    ()=>useMatchDetails,
    "useMatchMomentum",
    ()=>useMatchMomentum,
    "useMatchStatistics",
    ()=>useMatchStatistics
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/services/sportsDataService.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
;
;
// Fetch basic match details
async function fetchMatchDetails(eventId) {
    // sportsDataService handles the API call and proxying
    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getEventById(eventId);
    if (!data) {
        throw new Error('Failed to fetch match details');
    }
    return data;
}
// Fetch best players / top performers
async function fetchBestPlayers(eventId) {
    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getMatchBestPlayers(Number(eventId));
    return data;
}
function useMatchDetails(sport, eventId) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'match',
            sport,
            eventId
        ],
        queryFn: {
            "useMatchDetails.useQuery": ()=>fetchMatchDetails(eventId)
        }["useMatchDetails.useQuery"],
        enabled: !!eventId,
        // Refetch every 30 seconds for live games
        refetchInterval: {
            "useMatchDetails.useQuery": (query)=>{
                const status = query.state.data?.status?.type;
                return status === 'inprogress' ? 30000 : false;
            }
        }["useMatchDetails.useQuery"],
        staleTime: 10000
    });
}
_s(useMatchDetails, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useMatchBestPlayers(sport, eventId) {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'match-players',
            sport,
            eventId
        ],
        queryFn: {
            "useMatchBestPlayers.useQuery": ()=>fetchBestPlayers(eventId)
        }["useMatchBestPlayers.useQuery"],
        enabled: !!eventId,
        staleTime: 60000
    });
}
_s1(useMatchBestPlayers, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
async function fetchMatchStatistics(eventId) {
    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getMatchStatistics(Number(eventId));
    return data;
}
function useMatchStatistics(sport, eventId) {
    _s2();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'match-stats',
            sport,
            eventId
        ],
        queryFn: {
            "useMatchStatistics.useQuery": ()=>fetchMatchStatistics(eventId)
        }["useMatchStatistics.useQuery"],
        enabled: !!eventId,
        refetchInterval: {
            "useMatchStatistics.useQuery": (query)=>{
                const status = query.state.data?.status?.type;
                return status === 'inprogress' ? 30000 : false;
            }
        }["useMatchStatistics.useQuery"],
        staleTime: 20000
    });
}
_s2(useMatchStatistics, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
async function fetchMatchMomentum(eventId) {
    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$sportsDataService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sportsDataService"].getMatchMomentum(Number(eventId));
    // Check if valid momentum data exists
    if (!data || !data.graph) {
        // Return empty/null safely rather than throwing to avoid UI crashes
        return null;
    }
    return data;
}
function useMatchMomentum(sport, eventId) {
    _s3();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'match-momentum',
            sport,
            eventId
        ],
        queryFn: {
            "useMatchMomentum.useQuery": ()=>fetchMatchMomentum(eventId)
        }["useMatchMomentum.useQuery"],
        enabled: !!eventId,
        refetchInterval: {
            "useMatchMomentum.useQuery": (query)=>{
                return 30000;
            }
        }["useMatchMomentum.useQuery"],
        staleTime: 15000
    });
}
_s3(useMatchMomentum, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ui/SkeletonLoader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SkeletonLoader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function SkeletonLoader({ className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `glass-card p-4 relative overflow-hidden bg-white/[0.02] border border-white/5 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"
            }, void 0, false, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 5,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mb-4 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 bg-white/10 rounded-full w-24"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 8,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-3 bg-white/10 rounded-full w-12"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 9,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 7,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center bg-black/20 p-2 rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-full bg-white/10"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 15,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-white/10 rounded w-32"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 16,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 14,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-6 bg-white/10 rounded w-8"
                            }, void 0, false, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 18,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 13,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center bg-black/20 p-2 rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-full bg-white/10"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 23,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-4 bg-white/10 rounded w-32"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                        lineNumber: 24,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 22,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-6 bg-white/10 rounded w-8"
                            }, void 0, false, {
                                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                                lineNumber: 26,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 21,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 12,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex justify-between items-center pt-3 border-t border-white/5 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-2 bg-white/10 rounded w-16"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 31,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-2 bg-white/10 rounded w-16"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                        lineNumber: 32,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
                lineNumber: 30,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/ui/SkeletonLoader.tsx",
        lineNumber: 3,
        columnNumber: 9
    }, this);
}
_c = SkeletonLoader;
var _c;
__turbopack_context__.k.register(_c, "SkeletonLoader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/lib/predictionService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkPredictionAvailability",
    ()=>checkPredictionAvailability,
    "generatePrediction",
    ()=>generatePrediction,
    "savePredictionToHistory",
    ()=>savePredictionToHistory
]);
/**
 * Prediction Service - AI-powered game predictions
 * Integrates with Gemini API for advanced analysis
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
;
async function generatePrediction(request) {
    try {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 90000); // 90 seconds
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/predictions', {
            method: 'POST',
            body: JSON.stringify({
                gameId: request.gameId,
                sport: request.sport,
                homeTeam: request.homeTeam,
                awayTeam: request.awayTeam,
                uid: request.userId // Pass user ID for tier check
            }),
            signal: controller.signal
        });
        // If API returns fallback/mock flag, USE IT if it has data
        // We prefer the server-side mock because it's richer
        if (data.isMock || data.isFallback) {
            console.warn('Using server-side mock prediction');
            return data;
        }
        return data;
    } catch (error) {
        console.error('Error generating prediction:', error);
        // Check if it's a timeout error
        if (error.name === 'AbortError') {
            console.error('Prediction request timed out after 90 seconds');
            throw new Error('El análisis está tomando más tiempo del esperado. Por favor, intenta de nuevo.');
        }
        // Return mock prediction as fallback
        return generateMockPrediction(request);
    }
}
/**
 * Generate mock prediction (for development/fallback)
 */ function generateMockPrediction(request) {
    const sportNames = {
        'football': 'fútbol',
        'basketball': 'baloncesto',
        'tennis': 'tenis',
        'baseball': 'béisbol',
        'hockey': 'hockey',
        'american-football': 'fútbol americano'
    };
    const isFootball = request.sport === 'football';
    const sportDisplayName = sportNames[request.sport] || request.sport;
    const homeName = request.homeTeam || 'Local';
    const awayName = request.awayTeam || 'Visitante';
    // Sport-specific picks
    const picks = isFootball ? [
        `${homeName} ML`,
        `${awayName} ML`,
        `${homeName} -1`,
        `${awayName} +1`,
        'Over 2.5 Goles',
        'Under 2.5 Goles',
        'Ambos Anotan (BTTS)'
    ] : request.sport === 'basketball' ? [
        `${homeName} ML`,
        `${awayName} ML`,
        `${homeName} -5.5`,
        `${awayName} +5.5`,
        'Over 215.5',
        'Under 215.5'
    ] : [
        `${homeName} Ganador`,
        `${awayName} Ganador`
    ];
    const randomPick = picks[Math.floor(Math.random() * picks.length)];
    const confidence = Math.floor(Math.random() * 30) + 65; // 65-95%
    const factors = isFootball ? [
        'Ventaja de local fuerte',
        'Racha de victorias consecutivas',
        'Defensa sólida en casa',
        'Lesiones clave en el equipo contrario',
        'Dominio en enfrentamientos directos recientes'
    ] : [
        'Eficiencia ofensiva superior',
        'Dominio en la pintura/rebotes',
        'Racha positiva de tiro exterior',
        'Ventaja física en emparejamientos clave',
        'Historial favorable en la liga'
    ];
    const randomFactors = factors.sort(()=>Math.random() - 0.5).slice(0, 3);
    // Dynamic Predictions object based on sport
    const predictions = {};
    if (isFootball) {
        predictions.totalGoals = '2.5';
        predictions.overUnder = {
            line: 2.5,
            pick: Math.random() > 0.5 ? 'Más de' : 'Menos de',
            confidence: 'Alta'
        };
        predictions.corners = {
            total: 9.5,
            pick: 'Más de',
            line: 9.5
        };
        predictions.cards = {
            yellowCards: 4,
            redCards: 0,
            pick: 'Menos de',
            line: 4.5
        };
        predictions.bothTeamsScore = {
            pick: 'Sí',
            confidence: 'Media'
        };
    } else if (request.sport === 'basketball') {
        const teamString = (request.homeTeam || '').toLowerCase() + (request.awayTeam || '').toLowerCase();
        // Check for NBA teams or generic NBA label
        const isNBA = teamString.includes('nba') || teamString.includes('celtics') || teamString.includes('lakers') || teamString.includes('warriors') || teamString.includes('bulls') || teamString.includes('knicks') || teamString.includes('pacers');
        const defaultLine = isNBA ? '232.5' : '174.5';
        predictions.totalPoints = defaultLine;
        predictions.overUnder = {
            line: parseFloat(defaultLine),
            pick: 'Más de',
            confidence: 'Media'
        };
        predictions.playerProps = {
            threes: {
                player: "Estrella Local",
                line: 2.5,
                pick: "Más de"
            },
            pra: {
                player: "Estrella Visitante",
                line: 30.5,
                pick: "Más de"
            }
        };
        predictions.quarterMarkets = {
            raceTo20: {
                pick: homeName,
                confidence: "Media"
            }
        };
    } else if (request.sport === 'tennis') {
        predictions.finalScore = '2-0';
        predictions.totalGames = '21.5';
        predictions.overUnder = {
            line: 21.5,
            pick: 'Menos de',
            confidence: 'Alta'
        };
    } else if (request.sport === 'baseball') {
        predictions.totalRuns = '8.5';
        predictions.overUnder = {
            line: 8.5,
            pick: 'Más de',
            confidence: 'Media'
        };
        predictions.runLine = {
            favorite: homeName,
            line: -1.5,
            recommendation: 'Cubrir'
        };
    } else if (request.sport === 'hockey') {
        predictions.totalGoals = '5.5';
        predictions.overUnder = {
            line: 5.5,
            pick: 'Más de',
            confidence: 'Media'
        };
        predictions.puckLine = {
            favorite: homeName,
            line: -1.5,
            recommendation: 'Cubrir'
        };
    } else if (request.sport === 'american-football') {
        predictions.totalPoints = '45.5';
        predictions.overUnder = {
            line: 45.5,
            pick: 'Más de',
            confidence: 'Alta'
        };
        predictions.touchdowns = {
            total: 4.5,
            pick: 'Más de',
            line: 4.5
        };
        predictions.yards = {
            total: 650,
            pick: 'Más de',
            line: 640.5
        };
    }
    return {
        winner: randomPick,
        confidence,
        reasoning: `Basado en el análisis de datos históricos y tendencias recientes de ${sportDisplayName}, ${randomPick} presenta una oportunidad sólida. Los factores clave incluyen el rendimiento reciente del equipo y las estadísticas de enfrentamientos directos.`,
        bettingTip: `🧙‍♂️ Pronóstico de ${sportDisplayName}: ${randomPick} con confianza ${confidence}%`,
        keyFactors: randomFactors,
        predictions
    };
}
async function checkPredictionAvailability(userId) {
    // This would integrate with your user service
    // For now, returning mock data
    return {
        available: true,
        remaining: 2,
        message: 'Tienes 2 predicciones restantes hoy'
    };
}
async function savePredictionToHistory(userId, prediction, gameId) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAPI"])('/api/predictions/history', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                prediction,
                gameId,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving prediction to history:', error);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ai/AIPredictionCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AIPredictionCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/crown.js [app-client] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/canvas-confetti/dist/confetti.module.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$predictionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/predictionService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$BettingSlipContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/contexts/BettingSlipContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function AIPredictionCard({ eventId, sport, homeTeam, awayTeam }) {
    _s();
    const { user, notify, saveToHistory, addPlayerFavorite, removePlayerFavorite } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { addToSlip } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$BettingSlipContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBettingSlip"])();
    const [prediction, setPrediction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const isPlayerFavorite = (playerName)=>{
        return user?.favoritePlayers?.some((p)=>p.name === playerName) || false;
    };
    const handleTogglePlayerFavorite = async (playerName)=>{
        if (!user) return;
        if (isPlayerFavorite(playerName)) {
            const playerToRemove = (user.favoritePlayers || []).find((p)=>p.name === playerName);
            if (playerToRemove) await removePlayerFavorite(playerToRemove);
        } else {
            await addPlayerFavorite({
                id: Math.random().toString(36).substring(2, 11),
                name: playerName,
                sport: sport
            });
        }
    };
    // Estimate odds based on AI confidence (rough approximation)
    const estimateOdds = (confidence)=>{
        const probability = confidence / 100;
        return Number((1 / probability).toFixed(2));
    };
    const handlePredict = async ()=>{
        let timeout1 = null;
        let timeout2 = null;
        try {
            setLoading(true);
            setError(null);
            const toastId = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].loading('Consultando el Oráculo de PickGenius...', {
                description: 'Invocando estadísticas históricas y momentum...'
            });
            // Simulate steps for a more "pro" feeling
            timeout1 = setTimeout(()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].loading('Analizando alineaciones y mística del campo...', {
                    id: toastId
                });
            }, 1000);
            timeout2 = setTimeout(()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].loading('Calculando probabilidades con el Motor Genius...', {
                    id: toastId
                });
            }, 2500);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$predictionService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generatePrediction"])({
                gameId: eventId.toString(),
                sport: sport,
                homeTeam,
                awayTeam,
                userId: user?.uid
            });
            // Limpiar timeouts para que no sobrescriban el éxito
            if (timeout1) clearTimeout(timeout1);
            if (timeout2) clearTimeout(timeout2);
            if (result) {
                // @ts-ignore - Handle possible confidence mismatch
                const confidenceVal = typeof result.confidence === 'number' ? result.confidence : parseInt(result.confidence || '0');
                setPrediction(result);
                // --- NEW: Universal History Archiving (Now including Guests) ---
                try {
                // 🔥 AUTO-ARCHIVE: Now handled by the backend during generation
                // to avoid Permission Denied on Firestore client
                /*
                    await saveToHistory({
                        gameId: eventId.toString(),
                        sport: sport,
                        winner: result.winner,
                        bettingTip: result.bettingTip,
                        confidence: result.confidence,
                        reasoning: result.reasoning,
                        predictions: result.predictions,
                        keyFactors: result.keyFactors,
                        status: 'pending'
                    });
                    console.log('✅ AI Oracle verdict archived');
                    */ } catch (saveErr) {
                    console.error('❌ Failed to archive prediction:', saveErr);
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('¡Revelación Estratégica Finalizada!', {
                    id: toastId,
                    description: `Veredicto: ${result.winner || 'Listo'} con ${confidenceVal}% de acierto.`,
                    duration: 5000
                });
                // Notificar si la confianza es alta (>= 75)
                if (confidenceVal >= 75) {
                    await notify('🏆 PICK TOP DETECTADO', `Nueva predicción para ${sport}: ${result.winner || 'Análisis listo'} con ${confidenceVal}% de confianza.`, 'success', `/match/${sport}/${eventId}`);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$canvas$2d$confetti$2f$dist$2f$confetti$2e$module$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                        particleCount: 150,
                        spread: 80,
                        origin: {
                            y: 0.6
                        },
                        colors: [
                            '#a855f7',
                            '#06b6d4',
                            '#ffffff',
                            '#fbbf24'
                        ]
                    });
                }
            } else {
                setError('No se pudo generar la predicción');
                __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Fallo en la conexión mística', {
                    id: toastId
                });
            }
        } catch (err) {
            if (timeout1) clearTimeout(timeout1);
            if (timeout2) clearTimeout(timeout2);
            console.error(err);
            setError(err.message || 'Error al generar predicción');
            __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Error crítico en el Motor Genius');
        } finally{
            setLoading(false);
        }
    };
    // Derived values for premium access
    const isPremiumOrAdmin = user?.isPremium || user?.role === 'admin';
    const showMasked = prediction?.isMasked && !isPremiumOrAdmin;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 shadow-2xl border border-purple-500/30 mt-8 relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20"
            }, void 0, false, {
                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                lineNumber: 159,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold text-white flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-3xl",
                                                children: "🧙"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 165,
                                                columnNumber: 29
                                            }, this),
                                            " Oráculo PickGenius"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 164,
                                        columnNumber: 25
                                    }, this),
                                    prediction?.sourceVerification && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 mt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `flex h-2 w-2 rounded-full animate-pulse ${prediction.sourceVerification.isVerified ? 'bg-green-500' : 'bg-blue-500'}`
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 169,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${prediction.sourceVerification.isVerified ? 'text-green-400' : 'text-blue-400'}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 37
                                                    }, this),
                                                    prediction.sourceVerification.isVerified ? 'Verificado Betplay Direct' : `Análisis en Base a: ${prediction.dataSource || 'Bridge de Datos'}`
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 170,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 168,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 163,
                                columnNumber: 21
                            }, this),
                            !prediction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handlePredict,
                                disabled: loading,
                                className: "px-6 py-2 bg-white text-purple-900 font-bold rounded-full hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "animate-spin h-4 w-4 border-2 border-purple-900 border-t-transparent rounded-full"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 185,
                                            columnNumber: 37
                                        }, this),
                                        "Analizando..."
                                    ]
                                }, void 0, true) : 'Generar Predicción'
                            }, void 0, false, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 178,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                        lineNumber: 162,
                        columnNumber: 17
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-500/20 text-red-200 p-4 rounded-lg mb-4 border border-red-500/30",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-2xl",
                                    children: "⚠️"
                                }, void 0, false, {
                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                    lineNumber: 198,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-bold text-sm mb-1",
                                            children: "Error en el Análisis"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 200,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs opacity-90",
                                            children: error
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 201,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handlePredict,
                                            className: "mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors",
                                            children: "Reintentar Análisis"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 202,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                    lineNumber: 199,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                            lineNumber: 197,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                        lineNumber: 196,
                        columnNumber: 21
                    }, this),
                    prediction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-center shadow-2xl shadow-yellow-500/30 border-2 border-yellow-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-4xl",
                                            children: "🏆"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 218,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 217,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-black/70 text-xs uppercase font-bold mb-2 mt-2",
                                        children: "Veredicto del Genio"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 220,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-center gap-2 mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-2xl md:text-3xl font-black text-black",
                                                children: !prediction.winner || prediction.winner.toLowerCase().includes('undefined') ? 'Resultado Analizado' : prediction.winner
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 222,
                                                columnNumber: 33
                                            }, this),
                                            prediction.isValueBet && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "bg-black text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-400 animate-pulse",
                                                children: "VALUE BET"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 226,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 221,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 px-4 py-2 bg-black/10 rounded-xl border border-black/10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] text-black/50 uppercase font-black mb-1",
                                                children: "Pick Recomendado"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 234,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: `text-lg font-black text-black ${showMasked ? 'blur-sm select-none' : ''}`,
                                                children: prediction.bettingTip || 'Analizando...'
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 235,
                                                columnNumber: 33
                                            }, this),
                                            showMasked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "mt-2 text-[10px] bg-black text-white px-3 py-1 rounded-full font-bold hover:bg-black/80 transition-all",
                                                onClick: ()=>window.location.href = '/pricing',
                                                children: "⭐ Desbloquear con Premium"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 239,
                                                columnNumber: 37
                                            }, this),
                                            !showMasked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    const confidence = typeof prediction.confidence === 'number' ? prediction.confidence : parseInt(prediction.confidence || '50');
                                                    const estimatedOdds = estimateOdds(confidence);
                                                    addToSlip({
                                                        matchId: eventId.toString(),
                                                        selection: prediction.winner || 'Resultado Analizado',
                                                        odds: estimatedOdds,
                                                        matchLabel: prediction.teamsLabel || `${sport.toUpperCase()} Match`,
                                                        market: prediction.bettingTip || 'Ganador'
                                                    });
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('¡Añadido al Ticket!', {
                                                        description: `Cuota estimada: ${estimatedOdds.toFixed(2)}`
                                                    });
                                                },
                                                className: "mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-purple-900/30 active:scale-95 flex items-center justify-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "🎫"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Añadir al Ticket"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 271,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 249,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 233,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 max-w-xs h-3 bg-black/20 rounded-full overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-black rounded-full transition-all duration-500",
                                                    style: {
                                                        width: `${typeof prediction.confidence === 'number' ? prediction.confidence : parseInt(prediction.confidence || '0')}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 277,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 276,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-black font-black text-xl",
                                                children: typeof prediction.confidence === 'number' ? `${prediction.confidence}%` : prediction.confidence ? `${parseInt(prediction.confidence)}%` : '-%'
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 282,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 275,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-black/60 text-xs mt-2 font-semibold",
                                        children: "Precisión del Oráculo"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 286,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 216,
                                columnNumber: 25
                            }, this),
                            prediction.mostViablePick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gradient-to-br from-yellow-500/20 via-yellow-600/10 to-transparent p-[2px] rounded-2xl shadow-xl shadow-yellow-500/10 border border-yellow-500/30 overflow-hidden group",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-slate-900/90 backdrop-blur-xl p-4 rounded-[14px]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-start mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-yellow-500 p-1.5 rounded-lg shadow-lg shadow-yellow-500/40",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                                                className: "w-4 h-4 text-black"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 296,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 295,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] block leading-none",
                                                                    children: "Recomendación VIP"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 299,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "text-white font-black text-lg leading-tight uppercase",
                                                                    children: "Pick de Oro"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 300,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 298,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 294,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-end",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[10px] text-yellow-500/60 font-black uppercase italic",
                                                            children: "Éxito Est."
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 304,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-2xl font-black text-yellow-500 leading-none tracking-tighter",
                                                            children: prediction.mostViablePick.winProbability || '90%'
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 305,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 303,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 293,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-yellow-200/50 text-[10px] uppercase font-bold tracking-widest leading-none mb-1",
                                                            children: prediction.mostViablePick.market || 'Mercado de Puntos'
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 311,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white font-black text-2xl tracking-tighter",
                                                            children: [
                                                                prediction.mostViablePick.pick,
                                                                " ",
                                                                prediction.mostViablePick.line
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 312,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-12 w-12 flex items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 shadow-inner group-hover:scale-110 transition-transform",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                        className: "w-6 h-6 text-yellow-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 317,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 309,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-3 flex gap-3 p-3 bg-white/5 rounded-lg border border-white/5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                    className: "w-4 h-4 text-yellow-500 shrink-0"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[11px] text-yellow-100/70 font-medium leading-relaxed",
                                                    children: [
                                                        '"',
                                                        prediction.mostViablePick.rationale,
                                                        '"'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 323,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 321,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                    lineNumber: 292,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 291,
                                columnNumber: 29
                            }, this),
                            prediction.isValueBet && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gradient-to-br from-yellow-500/10 to-transparent p-5 rounded-2xl border border-yellow-500/20 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-2xl",
                                                        children: "💰"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 336,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-yellow-500 text-[10px] font-black uppercase tracking-tighter",
                                                                children: "Oportunidad de Mercado"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 338,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-white font-black text-lg",
                                                                children: "Casa de Apuestas"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 339,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 335,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-[10px] font-black",
                                                children: [
                                                    "+",
                                                    prediction.edge || '12.5',
                                                    "% EDGE"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 342,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 334,
                                        columnNumber: 33
                                    }, this),
                                    !showMasked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-2",
                                                children: (()=>{
                                                    const confidence = typeof prediction.confidence === 'number' ? prediction.confidence : 70;
                                                    const baseOdds = estimateOdds(confidence);
                                                    const houses = [
                                                        {
                                                            name: 'Bet365',
                                                            odds: (baseOdds * 1.01).toFixed(2)
                                                        },
                                                        {
                                                            name: 'Betplay',
                                                            odds: (baseOdds * 1.02).toFixed(2)
                                                        },
                                                        {
                                                            name: 'Rushbet',
                                                            odds: (baseOdds * 1.01).toFixed(2)
                                                        },
                                                        {
                                                            name: 'Wplay',
                                                            odds: (baseOdds * 0.99).toFixed(2)
                                                        }
                                                    ];
                                                    const bestOdds = Math.max(...houses.map((h)=>parseFloat(h.odds)));
                                                    return houses.map((house)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `p-3 rounded-xl border transition-all ${parseFloat(house.odds) === bestOdds ? 'bg-green-500/20 border-green-400/50 ring-2 ring-green-400/30' : 'bg-white/5 border-white/10'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest",
                                                                    children: house.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 364,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center justify-between",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-2xl font-black text-white italic",
                                                                            children: house.odds
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 366,
                                                                            columnNumber: 61
                                                                        }, this),
                                                                        parseFloat(house.odds) === bestOdds && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[9px] bg-green-500 text-black px-1.5 py-0.5 rounded-full font-black",
                                                                            children: "TOP"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 367,
                                                                            columnNumber: 101
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 365,
                                                                    columnNumber: 57
                                                                }, this)
                                                            ]
                                                        }, house.name, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 363,
                                                            columnNumber: 53
                                                        }, this));
                                                })()
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 350,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-black/40 p-4 rounded-xl border border-yellow-500/10",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] text-yellow-500 uppercase font-black mb-2 flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 377,
                                                                columnNumber: 49
                                                            }, this),
                                                            " Combinación Interna Genius"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 376,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-center text-xs",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-gray-400 font-medium",
                                                                        children: "Línea Principal (Market)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 381,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-white font-bold",
                                                                        children: estimateOdds(prediction.confidence || 70).toFixed(2)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 382,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 380,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between items-center text-xs",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-gray-400 font-medium",
                                                                        children: "Línea Interna (AI Edge)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 385,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-green-400 font-bold",
                                                                        children: [
                                                                            "+",
                                                                            ((prediction.edge || 12) / 100).toFixed(2)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 386,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 384,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "pt-2 mt-2 border-t border-white/5 flex justify-between items-center",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-yellow-500 font-black italic",
                                                                        children: "Probabilidad Real"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 389,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-lg font-black text-white italic",
                                                                        children: [
                                                                            "Cuota Meta: ",
                                                                            (estimateOdds(prediction.confidence || 70) * 1.1).toFixed(2)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 390,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 388,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 379,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[9px] text-gray-500 mt-3 italic leading-tight",
                                                        children: "* El cliente debe ingresar en la casa de apuesta y verificar si es una línea simple o una combinación interna detallada por el Oráculo."
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 393,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 375,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-black/40 p-6 rounded-2xl border border-yellow-500/20 text-center space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                className: "w-8 h-8 text-yellow-500 mx-auto opacity-20"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 400,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-400",
                                                children: "Las cuotas de valor y el desglose de estrategia están reservados para usuarios Premium."
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 401,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>window.location.href = '/pricing',
                                                className: "px-6 py-2 bg-yellow-500 text-black font-black rounded-full hover:bg-yellow-400 transition-all text-[10px] uppercase",
                                                children: "Ver Detalles de Valor"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 402,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 399,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 333,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-black/30 p-4 rounded-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-purple-300 text-xs uppercase font-bold mb-2",
                                        children: "Visión del Genio"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 411,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-200 leading-relaxed text-sm",
                                        children: prediction.reasoning
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 412,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 410,
                                columnNumber: 25
                            }, this),
                            prediction.predictions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-3 mt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 422,
                                                        columnNumber: 41
                                                    }, this),
                                                    " Análisis de Métricas (IA)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 421,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[8px] text-purple-400 font-black uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20",
                                                children: "Historial + Vivo"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 424,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 420,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-gradient-to-br from-green-900/40 to-green-800/20 p-3 rounded-xl border border-green-500/20 group hover:border-green-500/40 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-green-300 text-[10px] uppercase font-black mb-1",
                                                        children: sport === 'basketball' || sport.includes('nfl') || sport.includes('american') ? 'Puntos Totales' : sport === 'tennis' ? 'Juegos Totales' : sport === 'baseball' ? 'Carreras Totales' : 'Goles Proy.'
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 430,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-end justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-white font-black text-2xl italic",
                                                                children: [
                                                                    sport === 'basketball' || sport.includes('nfl') || sport.includes('american') ? prediction.predictions.totalPoints || prediction.predictions.totalPoints : sport === 'tennis' ? prediction.predictions.totalGames || prediction.predictions.totalGames : sport === 'baseball' ? prediction.predictions.totalRuns || prediction.predictions.totalRuns : prediction.predictions.totalGoals || prediction.predictions.totalGoals || '-',
                                                                    (prediction.predictions.overUnder?.pick || prediction.predictions.pick) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] ml-1 opacity-50 font-black italic",
                                                                        children: [
                                                                            "(",
                                                                            prediction.predictions.overUnder?.pick || prediction.predictions.pick,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 442,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 436,
                                                                columnNumber: 45
                                                            }, this),
                                                            prediction.predictions.overUnder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] bg-green-500/20 text-green-400 font-black px-1.5 py-0.5 rounded uppercase",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    suppressHydrationWarning: true,
                                                                    children: [
                                                                        "Generado: ",
                                                                        new Date(prediction.generatedAt).toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 447,
                                                                    columnNumber: 53
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 446,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 429,
                                                columnNumber: 37
                                            }, this),
                                            sport !== 'basketball' && (prediction.predictions.shots || prediction.predictions.yards) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-red-900/30 p-3 rounded-xl border border-red-500/20 group hover:border-red-500/40 transition-all",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-red-300 text-[10px] uppercase font-black mb-1",
                                                        children: sport.includes('nfl') || sport.includes('american') ? 'Yardas Totales' : sport === 'tennis' ? 'Aces Proyectados' : sport === 'baseball' ? 'Hits Proyectados' : 'Tiros al Arco'
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 454,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-end justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-white font-black text-2xl italic",
                                                                children: [
                                                                    sport.includes('nfl') || sport.includes('american') ? prediction.predictions.yards?.total || '-' : prediction.predictions.shots?.total || prediction.predictions.shots?.onTarget || '-',
                                                                    (prediction.predictions.yards?.pick || prediction.predictions.shots?.pick) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-[10px] ml-1 opacity-50 font-black italic",
                                                                        children: [
                                                                            "(",
                                                                            prediction.predictions.yards?.pick || prediction.predictions.shots?.pick,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                        lineNumber: 463,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 460,
                                                                columnNumber: 49
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[9px] text-red-400/50 font-bold italic",
                                                                children: "Expectativa"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                lineNumber: 466,
                                                                columnNumber: 49
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                        lineNumber: 459,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                lineNumber: 453,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 428,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[9px] text-gray-500 italic mt-1 px-1",
                                        children: [
                                            "* Proyecciones basadas en volumen histórico de partidos previos y ",
                                            sport === 'football' ? 'ritmo de ataques peligrosos' : 'ritmo de juego actual',
                                            "."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                        lineNumber: 471,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 419,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative mt-4",
                                children: prediction.predictions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-yellow-400 text-sm font-bold uppercase tracking-wider mt-6 mb-2 flex items-center gap-2",
                                            children: [
                                                "🌟 Detalles Premium",
                                                showMasked && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full",
                                                    children: "Locked"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 483,
                                                    columnNumber: 56
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 481,
                                            columnNumber: 37
                                        }, this),
                                        showMasked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-black/40 p-6 rounded-2xl border border-yellow-500/20 text-center space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                    className: "w-12 h-12 text-yellow-400 mx-auto opacity-20"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 488,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-white font-bold mb-1",
                                                            children: "Mercados de Alto Valor Bloqueados"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 490,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-gray-400 text-xs",
                                                            children: "Accede a Marcador Exacto, Tarjetas y Factores Clave con Premium."
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 491,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 489,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>window.location.href = '/pricing',
                                                    className: "w-full py-3 bg-yellow-400 text-black font-black rounded-xl text-xs hover:bg-yellow-300 transition-all",
                                                    children: "Pasar a Premium"
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                            lineNumber: 487,
                                            columnNumber: 41
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-2 gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-3 rounded-lg border border-blue-500/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-blue-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: sport === 'basketball' ? 'Est. Final' : sport === 'football' ? '🚩 Fueras de Juego' : sport.includes('hockey') || sport.includes('nhl') ? '🏒 Puck Line' : 'Marcador Exacto'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 501,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-white font-bold text-xl",
                                                                    children: [
                                                                        sport === 'football' ? prediction.predictions.offsides?.total || '-' : sport.includes('hockey') || sport.includes('nhl') ? prediction.predictions.puckLine?.line || prediction.predictions.spread?.line || '-' : prediction.predictions.finalScore || '-',
                                                                        prediction.predictions.offsides?.pick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[10px] ml-1 opacity-50 font-black italic",
                                                                            children: [
                                                                                "(",
                                                                                prediction.predictions.offsides.pick,
                                                                                ")"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 506,
                                                                            columnNumber: 99
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 504,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 500,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-3 rounded-lg border border-purple-500/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-purple-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: "Mercado O/U (Total)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 510,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-white font-bold text-xl",
                                                                    children: [
                                                                        prediction.predictions.overUnder?.line || prediction.predictions.totalPoints || prediction.predictions.totalGoals || '-',
                                                                        prediction.predictions.overUnder?.pick && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "block text-[10px] text-purple-400 font-black uppercase",
                                                                            children: [
                                                                                prediction.predictions.overUnder.pick,
                                                                                " ",
                                                                                prediction.predictions.overUnder.line
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 514,
                                                                            columnNumber: 61
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 511,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-[9px] text-purple-200/50 font-bold uppercase",
                                                                    children: "Proyección Genio"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 519,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 509,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 45
                                                }, this),
                                                !sport.includes('hockey') && !sport.includes('nhl') && (prediction.predictions.corners || prediction.predictions.cards || prediction.predictions.touchdowns) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-2 gap-3",
                                                    children: [
                                                        prediction.predictions.corners && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-emerald-900/30 p-3 rounded-lg border border-emerald-500/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-emerald-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: "⛳ Córners"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 528,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-white font-bold text-lg",
                                                                    children: [
                                                                        prediction.predictions.corners.total || prediction.predictions.corners.home + prediction.predictions.corners.away,
                                                                        (prediction.predictions.corners.pick || prediction.predictions.corners.line) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "block text-[10px] text-emerald-400 font-black uppercase",
                                                                            children: [
                                                                                prediction.predictions.corners.pick,
                                                                                " ",
                                                                                prediction.predictions.corners.line
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 532,
                                                                            columnNumber: 69
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 529,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 527,
                                                            columnNumber: 57
                                                        }, this),
                                                        prediction.predictions.cards && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-red-900/30 p-3 rounded-lg border border-red-500/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-red-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: "🟨 Tarjetas"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 541,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-white font-bold text-lg",
                                                                    children: [
                                                                        prediction.predictions.cards.yellowCards + (prediction.predictions.cards.redCards || 0),
                                                                        (prediction.predictions.cards.pick || prediction.predictions.cards.line) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "block text-[10px] text-red-400 font-black uppercase",
                                                                            children: [
                                                                                prediction.predictions.cards.pick,
                                                                                " ",
                                                                                prediction.predictions.cards.line
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 545,
                                                                            columnNumber: 69
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 542,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 540,
                                                            columnNumber: 57
                                                        }, this),
                                                        prediction.predictions.touchdowns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-blue-900/30 p-3 rounded-lg border border-blue-500/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-blue-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: "🏈 TD Totales"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 554,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-white font-bold text-lg",
                                                                    children: [
                                                                        prediction.predictions.touchdowns.total || prediction.predictions.touchdowns.home + prediction.predictions.touchdowns.away,
                                                                        (prediction.predictions.touchdowns.pick || prediction.predictions.touchdowns.line) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "block text-[10px] text-blue-400 font-black uppercase",
                                                                            children: [
                                                                                prediction.predictions.touchdowns.pick,
                                                                                " ",
                                                                                prediction.predictions.touchdowns.line
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 558,
                                                                            columnNumber: 69
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 555,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 553,
                                                            columnNumber: 57
                                                        }, this),
                                                        prediction.predictions.yards && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-orange-900/30 p-3 rounded-lg border border-orange-500/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-orange-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: "📏 Yardas Totales"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 567,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-white font-bold text-lg",
                                                                    children: [
                                                                        prediction.predictions.yards.total,
                                                                        (prediction.predictions.yards.pick || prediction.predictions.yards.line) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "block text-[10px] text-orange-400 font-black uppercase",
                                                                            children: [
                                                                                prediction.predictions.yards.pick,
                                                                                " ",
                                                                                prediction.predictions.yards.line
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 571,
                                                                            columnNumber: 69
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 568,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 566,
                                                            columnNumber: 57
                                                        }, this),
                                                        sport === 'tennis' && prediction.predictions.sets && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-blue-900/30 p-3 rounded-lg border border-blue-400/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-blue-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: "🎾 Marcador Sets"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 581,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between items-center",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: [
                                                                                prediction.predictions.sets.home,
                                                                                " - ",
                                                                                prediction.predictions.sets.away
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 583,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-black",
                                                                            children: "SETS"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 584,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 582,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 580,
                                                            columnNumber: 57
                                                        }, this),
                                                        sport === 'baseball' && prediction.predictions.first5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-orange-900/30 p-3 rounded-lg border border-orange-400/20",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-orange-300 text-[10px] uppercase font-bold mb-1",
                                                                    children: "⚾ Primeras 5 Entradas"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 592,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between items-center",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: prediction.predictions.first5.winner || prediction.predictions.first5.pick
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 594,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[8px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-black",
                                                                            children: "F5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 595,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 593,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 591,
                                                            columnNumber: 57
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 525,
                                                    columnNumber: 49
                                                }, this),
                                                prediction.predictions.alternativePicks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-4 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 p-4 rounded-xl border border-indigo-500/20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between items-center mb-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2",
                                                                    children: "🎯 Mercados de Valor Alternativos"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 606,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold",
                                                                    children: "BETPLAY STYLE"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 609,
                                                                    columnNumber: 57
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 605,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid grid-cols-1 gap-2",
                                                            children: prediction.predictions.alternativePicks.map((pick, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `flex items-center justify-between p-3 rounded-lg border transition-all hover:scale-[1.01] ${pick.type.includes('Bajo') ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`,
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex flex-col",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: `text-[9px] font-black uppercase tracking-tighter ${pick.type.includes('Bajo') ? 'text-green-400' : 'text-red-400'}`,
                                                                                    children: pick.type
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 615,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-2",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-white font-black text-lg",
                                                                                            children: [
                                                                                                pick.pick,
                                                                                                " ",
                                                                                                pick.line
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 619,
                                                                                            columnNumber: 73
                                                                                        }, this),
                                                                                        pick.type.includes('Alto') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                                                            className: "w-3 h-3 text-yellow-500 fill-yellow-500 animate-pulse"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 622,
                                                                                            columnNumber: 104
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 618,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 614,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-right flex items-center gap-3",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[10px] text-slate-400 italic max-w-xs block leading-tight",
                                                                                    children: [
                                                                                        '"',
                                                                                        pick.rationale,
                                                                                        '"'
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 626,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: `p-1.5 rounded-full ${pick.type.includes('Bajo') ? 'bg-green-500/20' : 'bg-red-500/20'}`,
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                                                        className: `w-3.5 h-3.5 ${pick.type.includes('Bajo') ? 'text-green-400' : 'text-red-400'}`
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                        lineNumber: 630,
                                                                                        columnNumber: 73
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 629,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 625,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, idx, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 613,
                                                                    columnNumber: 61
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 611,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 604,
                                                    columnNumber: 49
                                                }, this),
                                                sport === 'football' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-4 rounded-xl border border-green-500/20 space-y-3 mt-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-green-400 text-[10px] uppercase font-black mb-3 flex items-center gap-2",
                                                            children: "⚽ Mercados Secundarios (Fútbol Elite)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 642,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid grid-cols-2 gap-3",
                                                            children: [
                                                                prediction.predictions.bothTeamsScore && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-green-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-green-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Ambos Anotan"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 650,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: [
                                                                                prediction.predictions.bothTeamsScore.pick,
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[9px] ml-1 opacity-50",
                                                                                    children: [
                                                                                        "(",
                                                                                        prediction.predictions.bothTeamsScore.confidence,
                                                                                        ")"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 653,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 651,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 649,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.firstGoal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-yellow-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-yellow-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Primer Gol"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 663,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: prediction.predictions.firstGoal.team === 'Home' ? 'Local' : prediction.predictions.firstGoal.team === 'Away' ? 'Visitante' : 'Ninguno'
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 664,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 662,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.halftimeFulltime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-blue-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-blue-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "HT/FT"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 673,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-sm",
                                                                            children: prediction.predictions.halftimeFulltime.pick
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 674,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 672,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.totalCards && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-red-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-red-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Tarjetas Totales"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 683,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: [
                                                                                prediction.predictions.totalCards.total,
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[9px] ml-1 opacity-50",
                                                                                    children: [
                                                                                        "(",
                                                                                        prediction.predictions.totalCards.pick,
                                                                                        ")"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 686,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 684,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 682,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.penalties && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-purple-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-purple-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Penales"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 696,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: prediction.predictions.penalties.pick
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 697,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 695,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.cornersLeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-emerald-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-emerald-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Más Córners"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 706,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: [
                                                                                prediction.predictions.cornersLeader.team === 'Home' ? 'Local' : 'Visitante',
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[9px] ml-1 opacity-50",
                                                                                    children: [
                                                                                        "(",
                                                                                        prediction.predictions.cornersLeader.total,
                                                                                        ")"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 709,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 707,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 705,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 646,
                                                            columnNumber: 53
                                                        }, this),
                                                        prediction.predictions.goalsByHalf && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "bg-black/40 p-3 rounded-lg border border-orange-500/10",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-orange-300 text-[9px] uppercase font-bold mb-2",
                                                                    children: "Goles por Mitad"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 718,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-2 gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-[8px] text-gray-400 mb-1",
                                                                                    children: "Primera Mitad"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 721,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-white font-bold",
                                                                                    children: [
                                                                                        prediction.predictions.goalsByHalf.firstHalf.total,
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-[9px] ml-1 opacity-50",
                                                                                            children: [
                                                                                                "(",
                                                                                                prediction.predictions.goalsByHalf.firstHalf.pick,
                                                                                                ")"
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 724,
                                                                                            columnNumber: 73
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 722,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 720,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-[8px] text-gray-400 mb-1",
                                                                                    children: "Segunda Mitad"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 730,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-white font-bold",
                                                                                    children: [
                                                                                        prediction.predictions.goalsByHalf.secondHalf.total,
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "text-[9px] ml-1 opacity-50",
                                                                                            children: [
                                                                                                "(",
                                                                                                prediction.predictions.goalsByHalf.secondHalf.pick,
                                                                                                ")"
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 733,
                                                                                            columnNumber: 73
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 731,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 729,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 719,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 717,
                                                            columnNumber: 57
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 641,
                                                    columnNumber: 49
                                                }, this),
                                                sport === 'basketball' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-gradient-to-br from-orange-900/20 to-amber-900/20 p-4 rounded-xl border border-orange-500/20 space-y-3 mt-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-orange-400 text-[10px] uppercase font-black mb-3 flex items-center gap-2",
                                                            children: "🏀 Mercados Elite (Player Props & Quarters)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 747,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid grid-cols-2 gap-3",
                                                            children: [
                                                                prediction.predictions.playerProps?.threes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-orange-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-orange-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Triples (3PM)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 755,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-sm mb-1",
                                                                            children: prediction.predictions.playerProps.threes.player
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 756,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex justify-between items-center",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-orange-500 font-bold text-lg",
                                                                                    children: [
                                                                                        prediction.predictions.playerProps.threes.pick,
                                                                                        " ",
                                                                                        prediction.predictions.playerProps.threes.line
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 758,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[8px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded",
                                                                                    children: "3PT"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 759,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 757,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 754,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.playerProps?.pra && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-purple-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-purple-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "PRA (Pts+Reb+Ast)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 767,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-sm mb-1",
                                                                            children: prediction.predictions.playerProps.pra.player
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 768,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex justify-between items-center",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-purple-500 font-bold text-lg",
                                                                                    children: [
                                                                                        prediction.predictions.playerProps.pra.pick,
                                                                                        " ",
                                                                                        prediction.predictions.playerProps.pra.line
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 770,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded",
                                                                                    children: "COMBO"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 771,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 769,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 766,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.quarterMarkets?.raceTo20 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-blue-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-blue-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Carrera a 20 Puntos (Q1)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 779,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-lg",
                                                                            children: prediction.predictions.quarterMarkets.raceTo20.pick
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 780,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 778,
                                                                    columnNumber: 61
                                                                }, this),
                                                                prediction.predictions.quarterMarkets?.firstQuarter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-black/40 p-3 rounded-lg border border-green-500/10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-green-300 text-[9px] uppercase font-bold mb-1",
                                                                            children: "Ganador 1er Cuarto"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 789,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-white font-black text-sm",
                                                                            children: prediction.predictions.quarterMarkets.firstQuarter.pick
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 790,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 788,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 751,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 746,
                                                    columnNumber: 49
                                                }, this),
                                                prediction.predictions.projections && prediction.predictions.projections.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-black/40 p-4 rounded-xl border border-yellow-500/20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] text-yellow-500 uppercase font-black mb-3 flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                                    className: "w-3 h-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 803,
                                                                    columnNumber: 57
                                                                }, this),
                                                                " Proyecciones de Jugadores Pro"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 802,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "grid grid-cols-1 gap-2",
                                                            children: prediction.predictions.projections.map((p, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/5 p-3 rounded-lg border border-white/5 transition-all",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex justify-between items-center mb-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex items-center gap-2",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-white font-black text-sm italic",
                                                                                            children: p.name
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 810,
                                                                                            columnNumber: 73
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                            onClick: ()=>handleTogglePlayerFavorite(p.name),
                                                                                            className: `transition-all duration-300 ${isPlayerFavorite(p.name) ? 'text-yellow-500' : 'text-white/20 hover:text-white/60'}`,
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                                                className: `w-3 h-3 ${isPlayerFavorite(p.name) ? 'fill-current' : ''}`
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                                lineNumber: 815,
                                                                                                columnNumber: 77
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 811,
                                                                                            columnNumber: 73
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 809,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: `text-[8px] px-2 py-0.5 rounded-full font-black ${p.confidence === 'Alta' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`,
                                                                                    children: [
                                                                                        "CONF: ",
                                                                                        p.confidence
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 818,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 808,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        sport === 'basketball' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "grid grid-cols-3 gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-center p-1 bg-black/20 rounded",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-[7px] text-gray-500 font-bold uppercase",
                                                                                            children: "PTS"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 826,
                                                                                            columnNumber: 77
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-xs font-black text-yellow-500",
                                                                                            children: p.points
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 827,
                                                                                            columnNumber: 77
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 825,
                                                                                    columnNumber: 73
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-center p-1 bg-black/20 rounded",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-[7px] text-gray-500 font-bold uppercase",
                                                                                            children: "REB"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 830,
                                                                                            columnNumber: 77
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-xs font-black text-white",
                                                                                            children: p.rebounds || '-'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 831,
                                                                                            columnNumber: 77
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 829,
                                                                                    columnNumber: 73
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "text-center p-1 bg-black/20 rounded",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-[7px] text-gray-500 font-bold uppercase",
                                                                                            children: "AST"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 834,
                                                                                            columnNumber: 77
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-xs font-black text-white",
                                                                                            children: p.assists || '-'
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                            lineNumber: 835,
                                                                                            columnNumber: 77
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 833,
                                                                                    columnNumber: 73
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 824,
                                                                            columnNumber: 69
                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "bg-black/20 p-2 rounded flex justify-between items-center",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-[9px] text-gray-400 font-bold uppercase",
                                                                                    children: p.description || 'Pronóstico'
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 840,
                                                                                    columnNumber: 73
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "text-xs font-black text-yellow-500",
                                                                                    children: p.points
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                                    lineNumber: 841,
                                                                                    columnNumber: 73
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 839,
                                                                            columnNumber: 69
                                                                        }, this)
                                                                    ]
                                                                }, idx, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 807,
                                                                    columnNumber: 61
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 805,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 801,
                                                    columnNumber: 49
                                                }, this),
                                                prediction.keyFactors && prediction.keyFactors.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-black/40 p-4 rounded-lg border border-white/5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-purple-300 text-xs uppercase font-bold mb-2",
                                                            children: "🧠 Inteligencia Táctica"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 852,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: "space-y-2",
                                                            children: prediction.keyFactors.map((factor, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    className: "text-gray-300 text-sm flex items-start gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-green-400 mt-1 text-xs",
                                                                            children: "✓"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 856,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: factor
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                            lineNumber: 857,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, idx, true, {
                                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                                    lineNumber: 855,
                                                                    columnNumber: 61
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                            lineNumber: 853,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                                    lineNumber: 851,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                    lineNumber: 480,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 478,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center mt-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handlePredict,
                                    className: "text-xs text-purple-300 hover:text-white underline",
                                    children: "Actualizar Análisis"
                                }, void 0, false, {
                                    fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                    lineNumber: 870,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                                lineNumber: 869,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                        lineNumber: 214,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
                lineNumber: 161,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/ai/AIPredictionCard.tsx",
        lineNumber: 157,
        columnNumber: 9
    }, this);
}
_s(AIPredictionCard, "879BQm3HTeRwa28bGFhGHygOPac=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$BettingSlipContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBettingSlip"]
    ];
});
_c = AIPredictionCard;
var _c;
__turbopack_context__.k.register(_c, "AIPredictionCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ui/ErrorBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
'use client';
;
;
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    state = {
        hasError: false
    };
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 rounded-lg border border-red-500/20 bg-red-500/10 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-red-400 font-bold mb-2",
                        children: "Algo salió mal"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/ErrorBoundary.tsx",
                        lineNumber: 36,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-400 mb-4",
                        children: "No pudimos cargar este componente."
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/ErrorBoundary.tsx",
                        lineNumber: 37,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>this.setState({
                                hasError: false
                            }),
                        className: "px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-200 text-xs rounded transition-colors",
                        children: "Reintentar"
                    }, void 0, false, {
                        fileName: "[project]/web/components/ui/ErrorBoundary.tsx",
                        lineNumber: 40,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/ui/ErrorBoundary.tsx",
                lineNumber: 35,
                columnNumber: 17
            }, this);
        }
        return this.props.children;
    }
}
const __TURBOPACK__default__export__ = ErrorBoundary;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/sports/TopPlayersCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TopPlayersCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
'use client';
;
;
;
function TopPlayersCard({ title, players, sport, teamColor = 'purple', onPlayerClick }) {
    // Sort by rating and take top 5
    const topPlayers = [
        ...players
    ].sort((a, b)=>(b.statistics?.rating || b.rating || 0) - (a.statistics?.rating || a.rating || 0)).slice(0, 5);
    const getColorClasses = ()=>{
        // Keeping it subtle for the glass effect
        return 'border border-white/5 bg-white/[0.02]';
    };
    const getTeamColorHex = ()=>{
        switch(teamColor){
            case 'purple':
                return '#a855f7';
            case 'orange':
                return '#f97316';
            case 'blue':
                return '#3b82f6';
            case 'green':
                return '#22c55e';
            default:
                return '#a855f7';
        }
    };
    const renderStats = (player)=>{
        const stats = player.statistics || {};
        const pColor = getTeamColorHex();
        const sportKey = sport.toLowerCase();
        if (sportKey === 'basketball' || sportKey === 'nba') {
            if (stats.points === undefined && stats.rebounds === undefined) return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider opacity-80",
                children: [
                    stats.points !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white",
                        children: [
                            stats.points,
                            " PTS"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 53,
                        columnNumber: 52
                    }, this),
                    stats.rebounds !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/40",
                        children: "•"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 54,
                        columnNumber: 54
                    }, this),
                    stats.rebounds !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            stats.rebounds,
                            " REB"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 55,
                        columnNumber: 54
                    }, this),
                    stats.assists !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/40",
                        children: "•"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 56,
                        columnNumber: 53
                    }, this),
                    stats.assists !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            stats.assists,
                            " AST"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 57,
                        columnNumber: 53
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                lineNumber: 52,
                columnNumber: 17
            }, this);
        }
        if (sportKey === 'football' || sportKey === 'soccer') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider opacity-80",
                children: [
                    stats.goals !== undefined && stats.goals > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-green-400",
                        children: [
                            "⚽ ",
                            stats.goals,
                            " Goles"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 65,
                        columnNumber: 70
                    }, this),
                    stats.assists !== undefined && stats.assists > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-blue-400",
                        children: [
                            "👟 ",
                            stats.assists,
                            " Asist."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 66,
                        columnNumber: 74
                    }, this),
                    stats.rating !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Rating ",
                            stats.rating
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 67,
                        columnNumber: 52
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                lineNumber: 64,
                columnNumber: 17
            }, this);
        }
        if (sportKey === 'baseball' || sportKey === 'mlb') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider opacity-80",
                children: [
                    stats.homeRuns !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-orange-400",
                        children: [
                            stats.homeRuns,
                            " HR"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 75,
                        columnNumber: 54
                    }, this),
                    stats.runsBattedIn !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/40",
                        children: "•"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 76,
                        columnNumber: 58
                    }, this),
                    stats.runsBattedIn !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            stats.runsBattedIn,
                            " RBI"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 77,
                        columnNumber: 58
                    }, this),
                    stats.hits !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/40",
                        children: "•"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 78,
                        columnNumber: 50
                    }, this),
                    stats.hits !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            stats.hits,
                            " H"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 79,
                        columnNumber: 50
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                lineNumber: 74,
                columnNumber: 17
            }, this);
        }
        if (sportKey === 'american-football' || sportKey === 'nfl') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider opacity-80",
                children: [
                    stats.touchdowns !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-red-400",
                        children: [
                            stats.touchdowns,
                            " TD"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 87,
                        columnNumber: 56
                    }, this),
                    stats.passingYards !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/40",
                        children: "•"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 88,
                        columnNumber: 58
                    }, this),
                    stats.passingYards !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            stats.passingYards,
                            " Yds Pass"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 89,
                        columnNumber: 58
                    }, this),
                    stats.rushingYards !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/40",
                        children: "•"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 90,
                        columnNumber: 58
                    }, this),
                    stats.rushingYards !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            stats.rushingYards,
                            " Yds Rush"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 91,
                        columnNumber: 58
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                lineNumber: 86,
                columnNumber: 17
            }, this);
        }
        return null;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `glass-card overflow-hidden`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `px-4 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-1.5 h-4 rounded-full",
                                style: {
                                    backgroundColor: getTeamColorHex()
                                }
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                lineNumber: 104,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-white font-black text-xs uppercase tracking-widest",
                                children: title.replace('TOP PLAYERS', 'JUGADORES TOP')
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                lineNumber: 105,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 103,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[9px] font-black text-white/20 uppercase",
                        children: sport
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                lineNumber: 102,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "divide-y divide-white/5",
                children: [
                    topPlayers.map((player, index)=>{
                        const pData = player.player || player;
                        const imageUrl = pData.id ? `${__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/api/proxy/player-image/${pData.id}` : null;
                        const rating = (player.statistics?.rating || player.rating || 0).toFixed(1);
                        const isMvp = index === 0 && parseFloat(rating) >= 8.0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group active:scale-[0.99] duration-200",
                            onClick: ()=>onPlayerClick && onPlayerClick(player),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `font-black text-[10px] w-4 text-center ${index === 0 ? 'text-yellow-500 text-lg -ml-1 mr-1' : 'text-white/20'}`,
                                            children: index === 0 ? '👑' : index + 1
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                            lineNumber: 129,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `relative w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/30 transition-colors shrink-0 ${isMvp ? 'ring-2 ring-yellow-500/20' : ''}`,
                                            children: imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: imageUrl,
                                                alt: pData.name || 'Jugador',
                                                fill: true,
                                                className: "object-cover",
                                                unoptimized: true
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                                lineNumber: 135,
                                                columnNumber: 41
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full h-full flex items-center justify-center text-white/30 text-xs font-black",
                                                children: (pData.name || '?').substring(0, 1)
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                                lineNumber: 143,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                            lineNumber: 133,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white font-bold text-xs truncate group-hover:text-purple-400 transition-colors",
                                                    children: pData.name
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 37
                                                }, this),
                                                renderStats(player)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                            lineNumber: 149,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                    lineNumber: 128,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `
                                flex flex-col items-center justify-center w-10 h-8 rounded-lg border border-white/5
                                ${isMvp ? 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 text-yellow-500 border-yellow-500/30' : 'bg-white/5 text-white/80'}
                            `,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-black leading-none",
                                            children: rating
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                            lineNumber: 163,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[6px] uppercase opacity-50 font-bold",
                                            children: "Rtg"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                            lineNumber: 164,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                    lineNumber: 157,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, index, true, {
                            fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                            lineNumber: 123,
                            columnNumber: 25
                        }, this);
                    }),
                    topPlayers.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-10 text-center flex flex-col items-center justify-center space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 rounded-full bg-white/5 flex items-center justify-center relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                        lineNumber: 173,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xl grayscale opacity-60 group-hover:grayscale-0 transition-all",
                                        children: "📈"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                        lineNumber: 174,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                lineNumber: 172,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-white font-black text-xs uppercase tracking-widest mb-1 italic",
                                        children: "Calculando Rendimiento"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                        lineNumber: 177,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-500 text-[9px] font-bold uppercase tracking-tighter leading-tight max-w-[150px] mx-auto",
                                        children: [
                                            "Las estadísticas de jugadores ",
                                            sport === 'basketball' ? 'de NBA' : 'en vivo',
                                            " se actualizan al iniciar el encuentro."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                        lineNumber: 178,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                                lineNumber: 176,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                        lineNumber: 171,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                lineNumber: 113,
                columnNumber: 13
            }, this),
            topPlayers.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-0.5 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
            }, void 0, false, {
                fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
                lineNumber: 187,
                columnNumber: 39
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/sports/TopPlayersCard.tsx",
        lineNumber: 100,
        columnNumber: 9
    }, this);
}
_c = TopPlayersCard;
var _c;
__turbopack_context__.k.register(_c, "TopPlayersCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/ui/TeamLogo.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TeamLogo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function TeamLogo({ teamId, teamName, size = 'md', className = '' }) {
    _s();
    // When teamId changes, we want to reset error. 
    // We can simulate this by using a key on the Image or wrapping div.
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };
    // Use our internal proxy endpoint
    const imgSrc = `${__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/api/proxy/team-logo/${teamId}`;
    // Reset error when teamId changes by checking if prop changed (or rely on key upstream)
    // To fix lint error, we remove the sync setState in effect.
    // Instead we can use a key on the image component to force re-mount or just reset state in a harmless way?
    const handleImageError = ()=>{
        setError(true);
    };
    // Use key={teamId} on the wrapper div so that the entire component (including the error state) 
    // resets whenever the teamId changes. This avoids the need for an effect and fixes the lint error.
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${sizeClasses[size]} ${className} relative`,
        children: !error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            src: imgSrc,
            alt: `${teamName} logo`,
            fill: true,
            className: "object-contain",
            onError: handleImageError,
            unoptimized: true
        }, void 0, false, {
            fileName: "[project]/web/components/ui/TeamLogo.tsx",
            lineNumber: 41,
            columnNumber: 17
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center border-2 border-purple-400/30 shadow-lg",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-white font-black text-lg",
                children: teamName ? teamName.charAt(0).toUpperCase() : '?'
            }, void 0, false, {
                fileName: "[project]/web/components/ui/TeamLogo.tsx",
                lineNumber: 53,
                columnNumber: 21
            }, this)
        }, void 0, false, {
            fileName: "[project]/web/components/ui/TeamLogo.tsx",
            lineNumber: 50,
            columnNumber: 17
        }, this)
    }, teamId, false, {
        fileName: "[project]/web/components/ui/TeamLogo.tsx",
        lineNumber: 39,
        columnNumber: 9
    }, this);
}
_s(TeamLogo, "AvrsuJm02Cqlq6/LWpvA21zDecQ=");
_c = TeamLogo;
var _c;
__turbopack_context__.k.register(_c, "TeamLogo");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/sports/UniversalPlayerPropModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UniversalPlayerPropModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ReferenceLine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/cartesian/ReferenceLine.js [app-client] (ecmascript)");
'use client';
;
;
;
;
;
function UniversalPlayerPropModal({ player, isOpen, onClose, sport }) {
    if (!isOpen || !player) return null;
    const pId = player.id || player.player?.id;
    const pName = player.name || player.player?.name;
    const pRating = player.rating || player.player?.rating || 0;
    const imageUrl = pId ? `/api/proxy/player-image/${pId}` : null;
    // Mock Trend Data for "The Deep Dive"
    const trendData = [
        {
            game: 1,
            val: 24,
            line: 20
        },
        {
            game: 2,
            val: 18,
            line: 20
        },
        {
            game: 3,
            val: 28,
            line: 20
        },
        {
            game: 4,
            val: 22,
            line: 20
        },
        {
            game: 5,
            val: 21,
            line: 20
        }
    ];
    const getSportStats = ()=>{
        const stats = player.statistics || player;
        switch(sport){
            case 'football':
                return [
                    {
                        label: 'Goles',
                        val: stats.goals || 0
                    },
                    {
                        label: 'Asists',
                        val: stats.assists || 0
                    },
                    {
                        label: 'Tiros',
                        val: stats.totalShots || 0
                    }
                ];
            case 'basketball':
                return [
                    {
                        label: 'PTS',
                        val: stats.points || stats.pts || 0
                    },
                    {
                        label: 'REB',
                        val: stats.rebounds || stats.reb || 0
                    },
                    {
                        label: 'AST',
                        val: stats.assists || stats.ast || 0
                    }
                ];
            default:
                return [
                    {
                        label: 'Rating',
                        val: pRating
                    }
                ];
        }
    };
    const mainStats = getSportStats();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl",
            onClick: onClose,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.9,
                    y: 20
                },
                animate: {
                    opacity: 1,
                    scale: 1,
                    y: 0
                },
                exit: {
                    opacity: 0,
                    scale: 0.9,
                    y: 20
                },
                className: "relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,1)] overflow-hidden",
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-48 bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-transparent relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]"
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                lineNumber: 69,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white transition-all z-20",
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                lineNumber: 70,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                        lineNumber: 68,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-8 pb-10 -mt-24 relative z-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col md:flex-row gap-8 items-end mb-10",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition-all"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 83,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative w-32 h-32 rounded-[2rem] border-2 border-white/10 bg-gray-900 overflow-hidden",
                                                children: imageUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: imageUrl,
                                                    alt: pName,
                                                    fill: true,
                                                    className: "object-cover",
                                                    unoptimized: true
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                    lineNumber: 86,
                                                    columnNumber: 41
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full h-full flex items-center justify-center text-3xl font-black text-white/20 uppercase",
                                                    children: pName?.substring(0, 1)
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                    lineNumber: 88,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 84,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                        lineNumber: 82,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 pb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 98,
                                                        columnNumber: 37
                                                    }, this),
                                                    " PickGenius VIP Analysis"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 97,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-4xl font-black italic text-white leading-none uppercase tracking-tighter mb-2",
                                                children: pName
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 100,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest",
                                                        children: player.position || 'Player'
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 104,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                lineNumber: 108,
                                                                columnNumber: 41
                                                            }, this),
                                                            "RATING: ",
                                                            pRating
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 107,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 103,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                        lineNumber: 96,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                lineNumber: 80,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid md:grid-cols-2 gap-6 lg:gap-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4 lg:y-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                        className: "w-3 h-3 text-yellow-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 37
                                                    }, this),
                                                    " Rendimiento Live"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 119,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-3 gap-2 lg:gap-3",
                                                children: mainStats.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-3 lg:p-4 rounded-2xl lg:rounded-[1.5rem] bg-white/[0.03] border border-white/5 text-center",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[7px] lg:text-[8px] font-black text-gray-500 uppercase mb-1",
                                                                children: s.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                lineNumber: 125,
                                                                columnNumber: 45
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-lg lg:text-xl font-black italic text-white",
                                                                children: s.val
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                lineNumber: 126,
                                                                columnNumber: 45
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 124,
                                                        columnNumber: 41
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 122,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] lg:text-[11px] text-indigo-100/70 leading-relaxed font-medium",
                                                    children: [
                                                        "🚀 ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white font-bold",
                                                            children: "Insight AI:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                            lineNumber: 134,
                                                            columnNumber: 44
                                                        }, this),
                                                        " Este jugador está manteniendo un volumen de tiros un ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-blue-400 font-black",
                                                            children: "14% superior"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                            lineNumber: 134,
                                                            columnNumber: 155
                                                        }, this),
                                                        " a su promedio histórico. ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white/40",
                                                            children: "Recomendamos vigilar las líneas de Props para este encuentro."
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                            lineNumber: 134,
                                                            columnNumber: 243
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                    lineNumber: 133,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 132,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                        lineNumber: 118,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4 lg:y-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                                        className: "w-3 h-3 text-purple-400"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 37
                                                    }, this),
                                                    " Tendencia Últimos 5"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 141,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-[140px] lg:h-[180px] w-full bg-white/[0.02] border border-white/5 rounded-2xl lg:rounded-[2rem] p-4 lg:p-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                                        width: "100%",
                                                        height: "100%",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                                                            data: trendData,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                                    hide: true,
                                                                    domain: [
                                                                        0,
                                                                        'dataMax + 5'
                                                                    ]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                    lineNumber: 147,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                                    dataKey: "val",
                                                                    radius: [
                                                                        4,
                                                                        4,
                                                                        0,
                                                                        0
                                                                    ],
                                                                    children: trendData.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                                            fill: entry.val >= entry.line ? '#a855f7' : '#333'
                                                                        }, `cell-${index}`, false, {
                                                                            fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                            lineNumber: 150,
                                                                            columnNumber: 53
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                    lineNumber: 148,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ReferenceLine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReferenceLine"], {
                                                                    y: 20,
                                                                    stroke: "#444",
                                                                    strokeDasharray: "3 3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                    lineNumber: 156,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                            lineNumber: 146,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 145,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between mt-2 px-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-black text-gray-600 uppercase",
                                                                children: "Más antiguos"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                lineNumber: 160,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-black text-gray-600 uppercase",
                                                                children: "Último"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                                lineNumber: 161,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                        lineNumber: 159,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 144,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[9px] text-center text-gray-500 uppercase font-bold tracking-widest",
                                                children: "La línea punteada indica el promedio de mercado"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 164,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                        lineNumber: 140,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                lineNumber: 116,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                className: "w-4 h-4 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 173,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-bold text-gray-500 uppercase",
                                                children: "Estadio: Santiago Bernabéu"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                                lineNumber: 174,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                        lineNumber: 172,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)]",
                                        children: "Analizar Prop Completo"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                        lineNumber: 176,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                                lineNumber: 171,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                        lineNumber: 79,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
                lineNumber: 59,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
            lineNumber: 58,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/web/components/sports/UniversalPlayerPropModal.tsx",
        lineNumber: 57,
        columnNumber: 9
    }, this);
}
_c = UniversalPlayerPropModal;
var _c;
__turbopack_context__.k.register(_c, "UniversalPlayerPropModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/sports/MatchStatsSummary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MatchStatsSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/hooks/useMatchData.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function MatchStatsSummary({ match, sport, eventId }) {
    _s();
    const { data: statsData, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchStatistics"])(sport, eventId);
    // DEBUG: Ver qué llega de la API
    console.log(`📊 [StatsSummary] Data for ${eventId}:`, statsData);
    const isLiveOrFinished = match?.status?.type === 'inprogress' || match?.status?.type === 'finished';
    const isScheduled = match?.status?.type === 'notstarted';
    // Procesa las estadísticas reales de Sofascore
    const realStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MatchStatsSummary.useMemo[realStats]": ()=>{
            if (!statsData || !statsData.statistics) return null;
            // Sofascore puede devolver estadísticas en un objeto { statistics: [...] } 
            // o directamente el array dependiendo de cómo hayamos guardado en el proxy.
            const statsArray = Array.isArray(statsData.statistics) ? statsData.statistics : Array.isArray(statsData) ? statsData : null;
            if (!statsArray) return null;
            const allPeriodStats = statsArray.find({
                "MatchStatsSummary.useMemo[realStats].allPeriodStats": (p)=>p.period === 'ALL'
            }["MatchStatsSummary.useMemo[realStats].allPeriodStats"]);
            if (!allPeriodStats) return null;
            const processed = [];
            // Define stats based on sport (insensible a mayúsculas/minúsculas)
            const footballStats = [
                'ball possession',
                'total shots',
                'shots on target',
                'corner kicks',
                'fouls',
                'yellow cards',
                'red cards'
            ];
            const basketballStats = [
                'free throws %',
                '2-pointers %',
                '3-pointers %',
                'rebounds',
                'assists',
                'turnovers',
                'field goals %'
            ];
            const tennisStats = [
                'aces',
                'double faults',
                'service games won'
            ];
            const importantStats = sport === 'basketball' ? basketballStats : sport === 'tennis' ? tennisStats : footballStats;
            allPeriodStats.groups.forEach({
                "MatchStatsSummary.useMemo[realStats]": (group)=>{
                    group.statisticsItems.forEach({
                        "MatchStatsSummary.useMemo[realStats]": (item)=>{
                            if (importantStats.includes(item.name.toLowerCase())) {
                                const homeVal = parseFloat((item.home || "0").toString().replace('%', ''));
                                const awayVal = parseFloat((item.away || "0").toString().replace('%', ''));
                                const total = homeVal + awayVal;
                                processed.push({
                                    label: translateStatLabel(item.name),
                                    homeValue: item.home,
                                    awayValue: item.away,
                                    homePercent: total > 0 ? homeVal / total * 100 : 50
                                });
                            }
                        }
                    }["MatchStatsSummary.useMemo[realStats]"]);
                }
            }["MatchStatsSummary.useMemo[realStats]"]);
            return processed;
        }
    }["MatchStatsSummary.useMemo[realStats]"], [
        statsData,
        sport
    ]);
    // Fallback Mock Stats if No Real Data (Scheduled or API error)
    const mockStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MatchStatsSummary.useMemo[mockStats]": ()=>{
            if (!match) return [];
            // ... (resto del mockStats queda igual)
            const homeHash = match.homeTeam.name.split('').reduce({
                "MatchStatsSummary.useMemo[mockStats].homeHash": (acc, char)=>acc + char.charCodeAt(0)
            }["MatchStatsSummary.useMemo[mockStats].homeHash"], 0);
            const awayHash = match.awayTeam.name.split('').reduce({
                "MatchStatsSummary.useMemo[mockStats].awayHash": (acc, char)=>acc + char.charCodeAt(0)
            }["MatchStatsSummary.useMemo[mockStats].awayHash"], 0);
            if (sport === 'basketball') {
                const winProb = 45 + homeHash % 15;
                return [
                    {
                        label: 'Probabilidad de Victoria',
                        homeValue: `${winProb}%`,
                        awayValue: `${100 - winProb}%`,
                        homePercent: winProb
                    },
                    {
                        label: 'Eficiencia de Tiro',
                        homeValue: '48%',
                        awayValue: '45%',
                        homePercent: 52
                    },
                    {
                        label: 'Rebotes Proyectados',
                        homeValue: 42 + homeHash % 8,
                        awayValue: 40 + awayHash % 8,
                        homePercent: 50
                    },
                    {
                        label: 'Puntos Promedio (Season)',
                        homeValue: 112 + homeHash % 10,
                        awayValue: 108 + awayHash % 10,
                        homePercent: 51
                    }
                ];
            }
            // Football Fallback
            const winProb = 35 + homeHash % 25;
            return [
                {
                    label: 'Probabilidad de Victoria',
                    homeValue: `${winProb}%`,
                    awayValue: `${100 - winProb - 15}%`,
                    homePercent: winProb
                },
                {
                    label: 'Forma Reciente',
                    homeValue: 'G-E-G',
                    awayValue: 'P-G-E',
                    homePercent: 60
                },
                {
                    label: 'Goles Promedio',
                    homeValue: (1.2 + homeHash % 10 / 10).toFixed(1),
                    awayValue: (1.1 + awayHash % 10 / 10).toFixed(1),
                    homePercent: 50
                },
                {
                    label: 'Posesión Esperada',
                    homeValue: '52%',
                    awayValue: '48%',
                    homePercent: 52
                }
            ];
        }
    }["MatchStatsSummary.useMemo[mockStats]"], [
        match,
        sport
    ]);
    if (!match) return null;
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "glass-card p-4 animate-pulse",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-4 bg-white/10 w-24 mb-6 rounded-full"
                }, void 0, false, {
                    fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                    lineNumber: 120,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        1,
                        2,
                        3,
                        4
                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3 bg-white/5 w-8 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                            lineNumber: 125,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3 bg-white/10 w-24 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                            lineNumber: 126,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-3 bg-white/5 w-8 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                            lineNumber: 127,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                    lineNumber: 124,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-1.5 bg-white/5 w-full rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                    lineNumber: 129,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, i, true, {
                            fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                            lineNumber: 123,
                            columnNumber: 25
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                    lineNumber: 121,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
            lineNumber: 119,
            columnNumber: 13
        }, this);
    }
    const statsToDisplay = realStats && realStats.length > 0 ? realStats : mockStats;
    const title = realStats && realStats.length > 0 ? "Estadísticas Reales" : "Análisis Predictivo";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "glass-card p-4 transition-all duration-500",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6 border-b border-white/10 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                lineNumber: 144,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-black text-[10px] uppercase tracking-widest text-white/60",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                lineNumber: 145,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                        lineNumber: 143,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-bold text-white/20 uppercase",
                        children: sport
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                        lineNumber: 147,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                lineNumber: 142,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-6",
                children: statsToDisplay.map((stat, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-1 group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center text-[10px] font-black tracking-tighter mb-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-12 text-left text-white",
                                        children: stat.homeValue
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                        lineNumber: 154,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white/40 font-bold uppercase tracking-widest text-center flex-1 truncate px-2",
                                        children: stat.label
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                        lineNumber: 155,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-12 text-right text-white",
                                        children: stat.awayValue
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                        lineNumber: 158,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                lineNumber: 153,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gradient-to-r from-purple-600 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out",
                                        style: {
                                            width: `${stat.homePercent}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                        lineNumber: 162,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1"
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                        lineNumber: 166,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                                lineNumber: 161,
                                columnNumber: 25
                            }, this)
                        ]
                    }, idx, true, {
                        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                        lineNumber: 152,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                lineNumber: 150,
                columnNumber: 13
            }, this),
            isScheduled && !realStats && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-[9px] text-center text-white/30 italic",
                children: "* Datos basados en el historial de enfrentamientos y forma actual de los equipos."
            }, void 0, false, {
                fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
                lineNumber: 173,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/sports/MatchStatsSummary.tsx",
        lineNumber: 141,
        columnNumber: 9
    }, this);
}
_s(MatchStatsSummary, "z+8pzvi+6SKntTHLkWBaydzXf9o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchStatistics"]
    ];
});
_c = MatchStatsSummary;
function translateStatLabel(label) {
    const normalize = (s)=>s.toLowerCase().trim();
    const key = normalize(label);
    const mapping = {
        'ball possession': 'Posesión',
        'total shots': 'Tiros Totales',
        'shots on target': 'Tiros al Arco',
        'shots off target': 'Tiros Desviados',
        'corner kicks': 'Córners',
        'fouls': 'Faltas',
        'yellow cards': 'Tarjetas Amarillas',
        'red cards': 'Tarjetas Rojas',
        'offsides': 'Fueras de Juego',
        'goalkeeper saves': 'Atajadas',
        // Basketball
        'free throws': 'Tiros Libres',
        'free throws %': 'Tiros Libres %',
        '2 points': 'Tiros de 2',
        '2-pointers': 'Tiros de 2',
        '2-pointers %': 'Tiros de 2 %',
        '3 points': 'Triples',
        '3-pointers': 'Triples',
        '3-pointers %': 'Triples %',
        'field goals': 'Tiros de Campo',
        'field goals %': 'Tiros de Campo %',
        'rebounds': 'Rebotes',
        'assists': 'Asistencias',
        'turnovers': 'Pérdidas',
        'steals': 'Robos',
        'blocks': 'Bloqueos',
        'personal fouls': 'Faltas Personales',
        // Tennis
        'aces': 'Aces',
        'double faults': 'Dobles Faltas',
        'service games won': 'Juegos de Saque',
        'break points converted': 'Break Points',
        'winners': 'Tiros Ganadores',
        'unforced errors': 'Errores No Forzados'
    };
    return mapping[key] || label;
}
var _c;
__turbopack_context__.k.register(_c, "MatchStatsSummary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/lib/services/commentService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addComment",
    ()=>addComment,
    "subscribeToComments",
    ()=>subscribeToComments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/web/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
;
;
const addComment = async (matchId, userId, displayName, content, role, photoURL)=>{
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]) return;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'comments'), {
        matchId,
        userId,
        displayName,
        photoURL,
        content,
        role,
        timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
    });
};
const subscribeToComments = (matchId, callback)=>{
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]) return ()=>{};
    const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'comments'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('matchId', '==', matchId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('timestamp', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(50));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onSnapshot"])(q, (snapshot)=>{
        const comments = snapshot.docs.map((doc)=>({
                id: doc.id,
                ...doc.data()
            }));
        callback(comments.reverse()); // Show oldest first for chat flow
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/sports/MatchComments.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MatchComments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$commentService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/services/commentService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/crown.js [app-client] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$date$2d$fns$2f$formatDistanceToNow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/date-fns/formatDistanceToNow.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$date$2d$fns$2f$locale$2f$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/date-fns/locale/es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function MatchComments({ matchId }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [comments, setComments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [newComment, setNewComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sending, setSending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchComments.useEffect": ()=>{
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$commentService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subscribeToComments"])(matchId, {
                "MatchComments.useEffect.unsubscribe": (updatedComments)=>{
                    setComments(updatedComments);
                    setLoading(false);
                    // Scroll to bottom
                    setTimeout({
                        "MatchComments.useEffect.unsubscribe": ()=>{
                            if (scrollRef.current) {
                                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                            }
                        }
                    }["MatchComments.useEffect.unsubscribe"], 100);
                }
            }["MatchComments.useEffect.unsubscribe"]);
            return ({
                "MatchComments.useEffect": ()=>unsubscribe()
            })["MatchComments.useEffect"];
        }
    }["MatchComments.useEffect"], [
        matchId
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!user) {
            __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Debes iniciar sesión para comentar');
            return;
        }
        if (!newComment.trim()) return;
        try {
            setSending(true);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$services$2f$commentService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addComment"])(matchId, user.uid, user.displayName || user.email.split('@')[0], newComment.trim(), user.role === 'admin' ? 'admin' : user.isPremium ? 'premium' : 'user', user.photoURL);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Error al enviar el comentario');
        } finally{
            setSending(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[500px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-white/10 bg-white/5 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-bold text-white flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                className: "w-5 h-5 text-[var(--primary)]"
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                lineNumber: 70,
                                columnNumber: 21
                            }, this),
                            "Sala de Análisis en Vivo"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                        lineNumber: 69,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-gray-400 font-medium",
                        children: [
                            comments.length,
                            " Comentarios"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                        lineNumber: 73,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/MatchComments.tsx",
                lineNumber: 68,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: scrollRef,
                className: "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center justify-center h-full text-gray-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "w-8 h-8 animate-spin mb-2"
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                            lineNumber: 85,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm",
                            children: "Invocando el chat..."
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                            lineNumber: 86,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/web/components/sports/MatchComments.tsx",
                    lineNumber: 84,
                    columnNumber: 21
                }, this) : comments.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center justify-center h-full text-gray-500 text-center px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                className: "w-8 h-8 opacity-20"
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                lineNumber: 91,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                            lineNumber: 90,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: "¡Nadie ha comentado aún!"
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                            lineNumber: 93,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs opacity-60",
                            children: "Sé el primero en compartir tu veredicto."
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                            lineNumber: 94,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/web/components/sports/MatchComments.tsx",
                    lineNumber: 89,
                    columnNumber: 21
                }, this) : comments.map((comment)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-10 h-10 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5",
                                children: comment.photoURL ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: comment.photoURL,
                                    alt: comment.displayName,
                                    className: "w-full h-full object-cover"
                                }, void 0, false, {
                                    fileName: "[project]/web/components/sports/MatchComments.tsx",
                                    lineNumber: 101,
                                    columnNumber: 37
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                    className: "w-5 h-5 text-gray-500"
                                }, void 0, false, {
                                    fileName: "[project]/web/components/sports/MatchComments.tsx",
                                    lineNumber: 103,
                                    columnNumber: 37
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                lineNumber: 99,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-bold text-white truncate",
                                                children: comment.displayName
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                                lineNumber: 108,
                                                columnNumber: 37
                                            }, this),
                                            comment.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
                                                        className: "w-2.5 h-2.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                                                        lineNumber: 113,
                                                        columnNumber: 45
                                                    }, this),
                                                    " STAFF"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                                lineNumber: 112,
                                                columnNumber: 41
                                            }, this),
                                            comment.role === 'premium' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                        className: "w-2.5 h-2.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                                                        lineNumber: 118,
                                                        columnNumber: 45
                                                    }, this),
                                                    " PRO"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                                lineNumber: 117,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] text-gray-500",
                                                children: comment.timestamp ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$date$2d$fns$2f$formatDistanceToNow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistanceToNow"])(comment.timestamp.toDate(), {
                                                    addSuffix: true,
                                                    locale: __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$date$2d$fns$2f$locale$2f$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["es"]
                                                }) : 'ahora'
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                                lineNumber: 121,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                                        lineNumber: 107,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-200 leading-relaxed break-words",
                                            children: comment.content
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                                            lineNumber: 126,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                                        lineNumber: 125,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                lineNumber: 106,
                                columnNumber: 29
                            }, this)
                        ]
                    }, comment.id, true, {
                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                        lineNumber: 98,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/web/components/sports/MatchComments.tsx",
                lineNumber: 79,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 bg-white/5 border-t border-white/10",
                children: user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: newComment,
                            onChange: (e)=>setNewComment(e.target.value),
                            placeholder: "Escribe tu análisis...",
                            className: "flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all",
                            maxLength: 500
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                            lineNumber: 140,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: sending || !newComment.trim(),
                            className: "w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100",
                            children: sending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                className: "w-5 h-5 animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                lineNumber: 154,
                                columnNumber: 33
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                className: "w-5 h-5 ml-0.5"
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchComments.tsx",
                                lineNumber: 156,
                                columnNumber: 33
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchComments.tsx",
                            lineNumber: 148,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/web/components/sports/MatchComments.tsx",
                    lineNumber: 139,
                    columnNumber: 21
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-400",
                        children: "Ingresa para participar en la conversación."
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/MatchComments.tsx",
                        lineNumber: 162,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/web/components/sports/MatchComments.tsx",
                    lineNumber: 161,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/web/components/sports/MatchComments.tsx",
                lineNumber: 137,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/sports/MatchComments.tsx",
        lineNumber: 66,
        columnNumber: 9
    }, this);
}
_s(MatchComments, "W0/ajWg8IhzjUJDmYRdiNQtEDkw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = MatchComments;
var _c;
__turbopack_context__.k.register(_c, "MatchComments");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/web/components/sports/MatchLiveView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MatchLiveView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/hooks/useMatchData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$SkeletonLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ui/SkeletonLoader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ai$2f$AIPredictionCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ai/AIPredictionCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ui/ErrorBoundary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$TopPlayersCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/sports/TopPlayersCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$TeamLogo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/ui/TeamLogo.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$UniversalPlayerPropModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/sports/UniversalPlayerPropModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$MatchStatsSummary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/sports/MatchStatsSummary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/chart/AreaChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/node_modules/recharts/es6/cartesian/Area.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/web/node_modules/lucide-react/dist/esm/icons/bell.js [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$MatchComments$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/web/components/sports/MatchComments.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function MatchLiveView({ sport, eventId }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [selectedPlayer, setSelectedPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAlertsEnabled, setIsAlertsEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [now, setNow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "MatchLiveView.useState": ()=>Math.floor(Date.now() / 1000)
    }["MatchLiveView.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchLiveView.useEffect": ()=>{
            const interval = setInterval({
                "MatchLiveView.useEffect.interval": ()=>{
                    setNow(Math.floor(Date.now() / 1000));
                }
            }["MatchLiveView.useEffect.interval"], 30000); // 30s update
            return ({
                "MatchLiveView.useEffect": ()=>clearInterval(interval)
            })["MatchLiveView.useEffect"];
        }
    }["MatchLiveView.useEffect"], []);
    const { data: game, isLoading: gameLoading, error: gameError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchDetails"])(sport, eventId);
    const { data: bestPlayers, isLoading: playersLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchBestPlayers"])(sport, eventId);
    const { data: momentumData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchMomentum"])(sport, eventId);
    // Process real momentum data
    const chartData = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "MatchLiveView.useMemo[chartData]": ()=>{
            if (!momentumData?.items) {
                return Array.from({
                    length: 40
                }, {
                    "MatchLiveView.useMemo[chartData]": (_, i)=>({
                            minute: i,
                            homeValue: 0,
                            awayValue: 0
                        })
                }["MatchLiveView.useMemo[chartData]"]);
            }
            return momentumData.items.map({
                "MatchLiveView.useMemo[chartData]": (item)=>({
                        minute: item.minute,
                        homeValue: item.value > 0 ? item.value : 0,
                        awayValue: item.value < 0 ? Math.abs(item.value) : 0
                    })
            }["MatchLiveView.useMemo[chartData]"]);
        }
    }["MatchLiveView.useMemo[chartData]"], [
        momentumData
    ]);
    // Calculate danger levels based on last 5 minutes
    const dangerLevels = __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "MatchLiveView.useMemo[dangerLevels]": ()=>{
            if (!momentumData?.items || momentumData.items.length === 0) return {
                home: 'BAJO',
                away: 'BAJO'
            };
            const lastPoints = momentumData.items.slice(-5);
            const homeAvg = lastPoints.reduce({
                "MatchLiveView.useMemo[dangerLevels]": (acc, curr)=>acc + (curr.value > 0 ? curr.value : 0)
            }["MatchLiveView.useMemo[dangerLevels]"], 0) / Math.max(1, lastPoints.length);
            const awayAvg = lastPoints.reduce({
                "MatchLiveView.useMemo[dangerLevels]": (acc, curr)=>acc + (curr.value < 0 ? Math.abs(curr.value) : 0)
            }["MatchLiveView.useMemo[dangerLevels]"], 0) / Math.max(1, lastPoints.length);
            const getLevel = {
                "MatchLiveView.useMemo[dangerLevels].getLevel": (avg)=>{
                    if (avg > 40) return 'CRÍTICO';
                    if (avg > 25) return 'ALTO';
                    if (avg > 10) return 'MODERADO';
                    return 'BAJO';
                }
            }["MatchLiveView.useMemo[dangerLevels].getLevel"];
            return {
                home: getLevel(homeAvg),
                away: getLevel(awayAvg)
            };
        }
    }["MatchLiveView.useMemo[dangerLevels]"], [
        momentumData
    ]);
    // Derived state
    const loading = gameLoading;
    const isLive = game?.status?.type === 'inprogress';
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchLiveView.useEffect": ()=>{
            if (isLive && game) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('🤖 Análisis en Vivo Activado', {
                    description: `PickGenius AI está monitoreando el ${game.homeTeam.name} vs ${game.awayTeam.name} en tiempo real.`,
                    icon: '⚡',
                    duration: 5000
                });
            }
        }
    }["MatchLiveView.useEffect"], [
        isLive,
        game?.id
    ]);
    // SMART ALERTS: Monitor Danger Levels
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MatchLiveView.useEffect": ()=>{
            if (!isAlertsEnabled || !game) return;
            if (dangerLevels.home === 'CRÍTICO') {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('🔥 PELIGRO LOCAL CRÍTICO', {
                    description: `${game.homeTeam.name} está bajo presión máxima de gol.`,
                    icon: '⚽',
                    duration: 8000
                });
                // Try to use browser notification if permission granted
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`¡ALERTA DE GOL! - ${game.homeTeam.name}`, {
                        body: 'Presión crítica detectada por la IA.',
                        icon: '/logo.png'
                    });
                }
            }
            if (dangerLevels.away === 'CRÍTICO') {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])('🔥 PELIGRO VISITANTE CRÍTICO', {
                    description: `${game.awayTeam.name} está bajo presión máxima de gol.`,
                    icon: '⚽',
                    duration: 8000
                });
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`¡ALERTA DE GOL! - ${game.awayTeam.name}`, {
                        body: 'Presión crítica detectada por la IA.',
                        icon: '/logo.png'
                    });
                }
            }
        }
    }["MatchLiveView.useEffect"], [
        dangerLevels.home,
        dangerLevels.away,
        isAlertsEnabled,
        game
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#0b0b0b] pb-20",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container pt-24",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$SkeletonLoader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                    lineNumber: 129,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                lineNumber: 128,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
            lineNumber: 127,
            columnNumber: 13
        }, this);
    }
    if (!game) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#0b0b0b] pb-20 flex items-center justify-center text-center px-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass-card p-10 max-w-md w-full border border-red-500/20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-3xl text-red-500",
                            children: "⚠️"
                        }, void 0, false, {
                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                            lineNumber: 140,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                        lineNumber: 139,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-black text-white italic mb-2",
                        children: "PARTIDO NO ENCONTRADO"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                        lineNumber: 142,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-sm mb-8 leading-relaxed",
                        children: [
                            "No pudimos conectar con los terminales de Sofascore para este ID: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-400 font-mono",
                                children: eventId
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                lineNumber: 144,
                                columnNumber: 91
                            }, this),
                            ".",
                            gameError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block mt-2 p-2 bg-red-500/10 rounded text-[10px] text-red-300 font-mono",
                                children: [
                                    "ERROR: ",
                                    gameError.message || 'Unknown source error'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                lineNumber: 146,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                        lineNumber: 143,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.back(),
                        className: "w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-95",
                        children: "Volver al Panel"
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                        lineNumber: 151,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                lineNumber: 138,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
            lineNumber: 137,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#0b0b0b] pb-20",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container pt-24 md:pt-28",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center gap-3 mb-4",
                        children: [
                            game.tournament?.category?.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: `${__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/api/proxy/category-image/${game.tournament.category.id}`,
                                alt: game.tournament.category.name,
                                className: "w-6 h-4 object-cover rounded-sm shadow-sm",
                                onError: (e)=>{
                                    e.target.style.display = 'none';
                                }
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                lineNumber: 171,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-[10px] font-black uppercase tracking-[0.4em] text-gray-400",
                                children: game.tournament?.name
                            }, void 0, false, {
                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                lineNumber: 180,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                        lineNumber: 169,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "glass-card p-6 mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 flex flex-col items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$TeamLogo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            teamId: game.homeTeam.id,
                                            teamName: game.homeTeam.name,
                                            size: "xl"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 189,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-xl md:text-3xl font-bold mb-2",
                                                    children: game.homeTeam.name
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                    lineNumber: 191,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-4xl md:text-6xl font-black font-mono tracking-tighter",
                                                    children: game.homeScore?.current !== undefined ? game.homeScore.current : game.homeScore?.display !== undefined ? game.homeScore.display : game.status?.type === 'notstarted' ? '-' : 0
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 190,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                    lineNumber: 188,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "px-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `text-xs font-black uppercase tracking-widest mb-1 ${isLive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`,
                                            children: isLive ? (()=>{
                                                if (game.status?.description?.includes("'") || game.status?.description?.includes(":")) {
                                                    return game.status.description;
                                                }
                                                if (sport === 'football' && game.time?.currentPeriodStartTimestamp && now > 0) {
                                                    const elapsed = Math.floor((now - game.time.currentPeriodStartTimestamp) / 60);
                                                    const offset = game.status?.description?.toLowerCase().includes('2nd') || game.status?.description?.toLowerCase().includes('2a') ? 45 : 0;
                                                    return `${elapsed + offset}'`;
                                                }
                                                return game.status?.description || 'EN VIVO';
                                            })() : game.status?.description || 'PROGRAMADO'
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 201,
                                            columnNumber: 29
                                        }, this),
                                        isLive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[8px] font-black text-red-500/40 tracking-[0.3em] uppercase mb-2",
                                            children: "LIVE MONITORING"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 215,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[10px] text-gray-500 font-bold",
                                            children: new Date(game.startTimestamp * 1000).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 217,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                    lineNumber: 200,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 flex flex-col items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$TeamLogo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            teamId: game.awayTeam.id,
                                            teamName: game.awayTeam.name,
                                            size: "xl"
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 223,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-xl md:text-3xl font-bold mb-2",
                                                    children: game.awayTeam.name
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-4xl md:text-6xl font-black font-mono tracking-tighter",
                                                    children: game.awayScore?.current !== undefined ? game.awayScore.current : game.awayScore?.display !== undefined ? game.awayScore.display : game.status?.type === 'notstarted' ? '-' : 0
                                                }, void 0, false, {
                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                    lineNumber: 226,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 224,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                    lineNumber: 222,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                            lineNumber: 187,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                        lineNumber: 186,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-start",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-3 order-2 md:order-1 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$TopPlayersCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "TOP JUGADORES LOCAL",
                                            players: bestPlayers?.allPlayers?.home || [],
                                            sport: sport,
                                            teamColor: "purple",
                                            onPlayerClick: setSelectedPlayer
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 242,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 241,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$MatchStatsSummary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            match: game,
                                            sport: sport,
                                            eventId: eventId
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 252,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 251,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                lineNumber: 240,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-6 order-1 md:order-2 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ai$2f$AIPredictionCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            sport: sport,
                                            eventId: eventId,
                                            homeTeam: game?.homeTeam?.name,
                                            awayTeam: game?.awayTeam?.name
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 259,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 258,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "glass-card p-6 border border-white/5 bg-white/[0.02] rounded-[2rem] relative overflow-hidden group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-2 h-6 bg-emerald-500 rounded-full animate-pulse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 271,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-sm font-black italic uppercase tracking-widest text-white",
                                                                children: "Live Attack Momentum"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 272,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    const newState = !isAlertsEnabled;
                                                                    setIsAlertsEnabled(newState);
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"])(newState ? '🔔 Alertas Activadas' : '🔕 Alertas Desactivadas', {
                                                                        description: newState ? 'Te avisaremos cuando el peligro sea Crítico.' : 'No recibirás notificaciones tácticas.'
                                                                    });
                                                                },
                                                                className: `p-2 rounded-xl border transition-all ${isAlertsEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500'}`,
                                                                title: isAlertsEnabled ? 'Desactivar Alertas' : 'Activar Alertas de Gol',
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                    lineNumber: 286,
                                                                    columnNumber: 41
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 275,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full",
                                                                children: "Real-Time"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 288,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 274,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 269,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-[120px] w-full relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                                        width: "100%",
                                                        height: "100%",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AreaChart"], {
                                                            data: chartData,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                            id: "colorHome",
                                                                            x1: "0",
                                                                            y1: "0",
                                                                            x2: "0",
                                                                            y2: "1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                                    offset: "5%",
                                                                                    stopColor: "#a855f7",
                                                                                    stopOpacity: 0.4
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                                    lineNumber: 297,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                                    offset: "95%",
                                                                                    stopColor: "#a855f7",
                                                                                    stopOpacity: 0
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                                    lineNumber: 298,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                            lineNumber: 296,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                            id: "colorAway",
                                                                            x1: "0",
                                                                            y1: "0",
                                                                            x2: "0",
                                                                            y2: "1",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                                    offset: "5%",
                                                                                    stopColor: "#f97316",
                                                                                    stopOpacity: 0.4
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                                    lineNumber: 301,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                                    offset: "95%",
                                                                                    stopColor: "#f97316",
                                                                                    stopOpacity: 0
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                                    lineNumber: 302,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                            lineNumber: 300,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                    lineNumber: 295,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                                    type: "monotone",
                                                                    dataKey: "homeValue",
                                                                    stroke: "#a855f7",
                                                                    strokeWidth: 2,
                                                                    fillOpacity: 1,
                                                                    fill: "url(#colorHome)",
                                                                    animationDuration: 1000
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                    lineNumber: 305,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                                    type: "monotone",
                                                                    dataKey: "awayValue",
                                                                    stroke: "#f97316",
                                                                    strokeWidth: 2,
                                                                    fillOpacity: 1,
                                                                    fill: "url(#colorAway)",
                                                                    animationDuration: 1000,
                                                                    style: {
                                                                        transform: 'scaleY(-1)',
                                                                        transformOrigin: 'center'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                    lineNumber: 314,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                            lineNumber: 294,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 293,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-1/2 left-0 w-full h-px bg-white/10 border-t border-dashed border-white/5 pointer-events-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 328,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute inset-0 flex flex-col justify-between py-2 pointer-events-none",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between items-center px-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[7px] font-black text-purple-500/40 uppercase tracking-[0.2em]",
                                                                    children: [
                                                                        game.homeTeam.name,
                                                                        " Pressing"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                    lineNumber: 333,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[7px] font-black text-orange-500/40 uppercase tracking-[0.2em]",
                                                                    children: [
                                                                        game.awayTeam.name,
                                                                        " Pressing"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                    lineNumber: 334,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                            lineNumber: 332,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 331,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 292,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-4 p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-2xl border border-white/5 relative overflow-hidden group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                            className: "w-8 h-8 text-purple-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                            lineNumber: 342,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 341,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 mb-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-black text-purple-400 uppercase tracking-[0.2em]",
                                                                children: "Genius Insights"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 345,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-1 h-1 bg-gray-600 rounded-full"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 346,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-[8px] font-bold text-gray-500 uppercase italic",
                                                                children: "Análisis Táctico"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 347,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-[10px] font-bold text-gray-300 leading-relaxed italic",
                                                        children: dangerLevels.home === 'CRÍTICO' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-purple-400 font-black animate-pulse",
                                                            children: [
                                                                "⚠️ PRESIÓN ASFIXIANTE: ",
                                                                game.homeTeam.name,
                                                                " está volcando el campo. El gol local tiene alta probabilidad en los próximos minutos."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                            lineNumber: 351,
                                                            columnNumber: 41
                                                        }, this) : dangerLevels.away === 'CRÍTICO' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-orange-400 font-black animate-pulse",
                                                            children: [
                                                                "⚠️ ALERTA DE CONTRA: ",
                                                                game.awayTeam.name,
                                                                " está dominando el volumen de ataque. Cuidado con la defensa local."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                            lineNumber: 353,
                                                            columnNumber: 41
                                                        }, this) : dangerLevels.home === 'ALTO' ? `Dominio posicional de ${game.homeTeam.name}. Buscando espacios en zona de finalización.` : dangerLevels.away === 'ALTO' ? `Iniciativa visitante detectada. ${game.awayTeam.name} controla el ritmo del encuentro.` : "Fase de estudio y equilibrio táctico. Los equipos mantienen sus líneas compactas."
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 340,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-4 grid grid-cols-2 gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `text-center p-3 rounded-2xl border transition-all ${dangerLevels.home === 'CRÍTICO' || dangerLevels.home === 'ALTO' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/5 border-white/5'}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[8px] font-black text-gray-500 uppercase mb-1",
                                                                children: "Peligro Local"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 366,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `text-lg font-black italic ${dangerLevels.home === 'CRÍTICO' ? 'text-purple-400 animate-pulse' : 'text-purple-400'}`,
                                                                children: dangerLevels.home
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 367,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 365,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `text-center p-3 rounded-2xl border transition-all ${dangerLevels.away === 'CRÍTICO' || dangerLevels.away === 'ALTO' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/5'}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[8px] font-black text-gray-500 uppercase mb-1",
                                                                children: "Peligro Visitante"
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 372,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `text-lg font-black italic ${dangerLevels.away === 'CRÍTICO' ? 'text-orange-400 animate-pulse' : 'text-orange-400'}`,
                                                                children: dangerLevels.away
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 373,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 371,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 364,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 268,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "glass-card p-6 border border-white/5 bg-white/[0.02] rounded-3xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-[10px] font-black uppercase mb-6 border-b border-white/5 pb-3 tracking-widest text-gray-500",
                                                children: "Desglose de Periodos"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 382,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-black text-xs text-gray-300 uppercase italic tracking-tighter",
                                                                children: game.homeTeam.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 385,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-4 font-mono text-lg font-black text-white",
                                                                children: [
                                                                    game.homeScore?.period1 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "opacity-40",
                                                                        children: game.homeScore.period1
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 387,
                                                                        columnNumber: 83
                                                                    }, this),
                                                                    game.homeScore?.period2 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "opacity-40",
                                                                        children: game.homeScore.period2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 388,
                                                                        columnNumber: 83
                                                                    }, this),
                                                                    game.homeScore?.period3 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "opacity-40",
                                                                        children: game.homeScore.period3
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 389,
                                                                        columnNumber: 83
                                                                    }, this),
                                                                    game.homeScore?.period4 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]",
                                                                        children: game.homeScore.period4
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 390,
                                                                        columnNumber: 83
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 386,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 384,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-black text-xs text-gray-300 uppercase italic tracking-tighter",
                                                                children: game.awayTeam.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 394,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-4 font-mono text-lg font-black text-white",
                                                                children: [
                                                                    game.awayScore?.period1 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "opacity-40",
                                                                        children: game.awayScore.period1
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 396,
                                                                        columnNumber: 83
                                                                    }, this),
                                                                    game.awayScore?.period2 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "opacity-40",
                                                                        children: game.awayScore.period2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 397,
                                                                        columnNumber: 83
                                                                    }, this),
                                                                    game.awayScore?.period3 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "opacity-40",
                                                                        children: game.awayScore.period3
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 398,
                                                                        columnNumber: 83
                                                                    }, this),
                                                                    game.awayScore?.period4 !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]",
                                                                        children: game.awayScore.period4
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                        lineNumber: 399,
                                                                        columnNumber: 83
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 395,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 393,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 383,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 381,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$MatchComments$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            matchId: eventId
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 406,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 405,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                lineNumber: 257,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:col-span-3 order-3 md:order-3 space-y-4",
                                children: [
                                    bestPlayers?.mvp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "glass-card overflow-hidden relative group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-lg z-10",
                                                children: "MVP"
                                            }, void 0, false, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 415,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-4 flex flex-col gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "aspect-square w-full rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 relative overflow-hidden",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: `${__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/api/proxy/player-image/${bestPlayers.mvp.id || bestPlayers.mvp.player?.id}`,
                                                            alt: bestPlayers.mvp.name,
                                                            className: "w-full h-full object-cover"
                                                        }, void 0, false, {
                                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                            lineNumber: 418,
                                                            columnNumber: 41
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 417,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-yellow-500 text-[10px] font-black uppercase tracking-widest",
                                                                children: bestPlayers.ai?.title || 'DOMINIO'
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 425,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xl font-black text-white italic tracking-tighter mb-1",
                                                                children: bestPlayers.mvp.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 426,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-gray-400 text-[10px] leading-relaxed",
                                                                children: bestPlayers.ai?.description || 'Rendimiento superior esta jornada.'
                                                            }, void 0, false, {
                                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                                lineNumber: 427,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                                lineNumber: 416,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 414,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$ui$2f$ErrorBoundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$TopPlayersCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            title: "TOP JUGADORES VISITANTE",
                                            players: bestPlayers?.allPlayers?.away || [],
                                            sport: sport,
                                            teamColor: "orange",
                                            onPlayerClick: setSelectedPlayer
                                        }, void 0, false, {
                                            fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                            lineNumber: 434,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                        lineNumber: 433,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                                lineNumber: 411,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                        lineNumber: 237,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                lineNumber: 166,
                columnNumber: 13
            }, this),
            selectedPlayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$web$2f$components$2f$sports$2f$UniversalPlayerPropModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: !!selectedPlayer,
                onClose: ()=>setSelectedPlayer(null),
                player: selectedPlayer,
                sport: sport
            }, void 0, false, {
                fileName: "[project]/web/components/sports/MatchLiveView.tsx",
                lineNumber: 447,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/web/components/sports/MatchLiveView.tsx",
        lineNumber: 165,
        columnNumber: 9
    }, this);
}
_s(MatchLiveView, "4g3ORQu1tEtfJpg8zn90exZe3OE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchDetails"],
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchBestPlayers"],
        __TURBOPACK__imported__module__$5b$project$5d2f$web$2f$hooks$2f$useMatchData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMatchMomentum"]
    ];
});
_c = MatchLiveView;
var _c;
__turbopack_context__.k.register(_c, "MatchLiveView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=web_94b83ad8._.js.map