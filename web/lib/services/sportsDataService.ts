// Determinar la URL base dependiendo del entorno (Servidor vs Cliente)
const BASE_URL = typeof window === 'undefined'
    ? '' // En el servidor, usamos URLs relativas si es posible o configuramos el host completo
    : ''; // En el cliente es relativo al dominio actual

import { logApiCall } from '@/lib/adminService';
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
    isEnriched?: boolean;
}

export interface SportsDataResponse {
    events: SportsDataEvent[];
}

/**
 * Servicio para obtener datos deportivos
 * Centraliza las peticiones a Redis y Firebase
 */
class SportsDataService {
    private headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    };

    /**
     * Método genérico para peticiones que antes iban al Bridge.
     * Ahora mapea directamente a nuestras API routes internas.
     */
    async makeRequest<T = any>(endpoint: string): Promise<T | null> {
        try {
            // Mapeo Inteligente: Bridge -> Local API
            let localRoute = endpoint;

            if (endpoint.includes('/events/live')) {
                const sport = endpoint.split('/')[2];
                localRoute = `/api/${sport}/live`;
            } else if (endpoint.includes('/scheduled-events/')) {
                const parts = endpoint.split('/');
                const sport = parts[2];
                const date = parts[4];
                localRoute = `/api/${sport}/scheduled?date=${date}`;
            } else if (endpoint.startsWith('/event/')) {
                // Peticiones de detalle de evento
                const eventId = endpoint.split('/')[2];
                localRoute = `/api/events/${eventId}`;
            } else {
                // Si ya empieza por /api, lo dejamos, si no, lo añadimos
                localRoute = endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
            }

            return await fetchAPI(localRoute, {
                headers: this.headers
            });
        } catch (error: any) {
            const errorMsg = error.message || '';
            const is404 = error.status === 404;

            if (!is404) {
                console.error(`❌ [SportsDataService] Local API Error for ${endpoint}:`, errorMsg);
            }
            return null;
        }
    }

    async getLiveFootballMatches(): Promise<SportsDataEvent[]> {
        const res = await this.makeRequest<SportsDataResponse>('/sport/football/events/live');
        return res?.events || [];
    }

    async getScheduledFootballMatches(date: string): Promise<SportsDataEvent[]> {
        return this.getScheduledEventsBySport('football', date);
    }

    async getScheduledEventsBySport(sport: string, date?: string): Promise<SportsDataEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];
        const res = await this.makeRequest<any>(`/sport/${sport}/scheduled-events/${today}`);
        return res?.events || res?.data || [];
    }

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

    async getLiveBasketballGames(): Promise<SportsDataEvent[]> {
        const res = await this.makeRequest<SportsDataResponse>('/sport/basketball/events/live');
        return res?.events || [];
    }

    async getScheduledBasketballGames(date: string): Promise<SportsDataEvent[]> {
        return this.getScheduledEventsBySport('basketball', date);
    }

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

    async getEventById(eventId: string | number): Promise<SportsDataEvent | null> {
        return await this.makeRequest<SportsDataEvent>(`/event/${eventId}`);
    }

    async getMatchBestPlayers(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/best-players`);
    }

    async getMatchMomentum(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/attack-momentum`);
    }

    async getMatchStatistics(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/statistics`);
    }

    async getMatchOdds(eventId: number, marketId: number = 1): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/odds/${marketId}/all`);
    }

    async getMatchLineups(eventId: number): Promise<any> {
        return await this.makeRequest(`/event/${eventId}/lineups`);
    }

    async getEventsBySport(sport: string, date?: string): Promise<SportsDataEvent[]> {
        const today = date || new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0];

        const [liveData, scheduledToday, scheduledTomorrow] = await Promise.all([
            this.makeRequest<SportsDataResponse>(`/sport/${sport}/events/live`),
            this.getScheduledEventsBySport(sport, today),
            this.getScheduledEventsBySport(sport, tomorrow)
        ]);

        const liveEvents = liveData?.events || [];
        const liveIds = new Set(liveEvents.map((e: any) => e.id));

        const cleanToday = (Array.isArray(scheduledToday) ? scheduledToday : [])
            .filter(e => !liveIds.has(e.id));

        const cleanTomorrow = (Array.isArray(scheduledTomorrow) ? scheduledTomorrow : [])
            .filter(e => !liveIds.has(e.id));

        const allEvents = [...liveEvents, ...cleanToday, ...cleanTomorrow];

        const uniqueEvents = allEvents.filter((event, index, self) =>
            index === self.findIndex(e => e.id === event.id)
        );

        const now = Date.now() / 1000;
        const twelveHoursAgo = now - (12 * 60 * 60);
        const fortyEightHoursFromNow = now + (48 * 60 * 60);

        return uniqueEvents.filter((event) => {
            if (event.status?.type === 'finished') {
                return event.startTimestamp > twelveHoursAgo;
            }
            if (event.status?.type === 'notstarted' || event.status?.type === 'scheduled') {
                return event.startTimestamp <= fortyEightHoursFromNow;
            }
            return true;
        });
    }
}

export const sportsDataService = new SportsDataService();
