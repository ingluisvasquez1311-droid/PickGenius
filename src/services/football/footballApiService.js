/**
 * Football API Service
 * Integración con API-Football usando cache inteligente
 * Minimiza llamadas API almacenando datos en Firestore
 */

const axios = require('axios');
const cacheManager = require('../cacheManager');
const apiRateLimiter = require('../apiRateLimiter');

class FootballApiService {
    constructor() {
        this.baseUrl = 'https://v3.football.api-sports.io';
        this.provider = 'api-football';

        // IDs de ligas principales
        this.leagues = {
            premierLeague: 39,
            laLiga: 140,
            serieA: 135,
            bundesliga: 78,
            ligue1: 61
        };
    }

    /**
     * Obtiene partidos próximos con cache inteligente
     * Cache: 6 horas
     */
    async getUpcomingFixtures(leagueId, options = {}) {
        try {
            const {
                date = new Date().toISOString().split('T')[0],
                next = 10
            } = options;

            const cacheKey = `upcoming_fixtures_${leagueId}_${date}`;
            const cacheFilters = { leagueId, date };

            // 1. Intentar obtener clave API (verifica cache automáticamente)
            const keyResult = await apiRateLimiter.getAvailableKey(
                this.provider,
                cacheKey,
                cacheFilters
            );

            // 2. Si viene del cache, retornar directamente
            if (keyResult.fromCache) {
                return this.formatFixturesResponse(keyResult.data);
            }

            // 3. No hay cache válido, llamar API
            console.log(`🌐 Calling API-Football for league ${leagueId}...`);

            const response = await axios.get(`${this.baseUrl}/fixtures`, {
                headers: {
                    'x-rapidapi-key': keyResult.apiKey,
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                },
                params: {
                    league: leagueId,
                    next,
                    timezone: 'America/New_York'
                }
            });

            // 4. Registrar la llamada API
            await apiRateLimiter.recordCall(keyResult.apiKey, this.provider);

            const fixtures = response.data.response || [];

            // 5. Guardar cada fixture en cache (6 horas)
            for (const fixture of fixtures) {
                const fixtureData = this.formatFixture(fixture);
                await cacheManager.set('football', cacheKey, fixtureData, {
                    ttl: 6 * 60 * 60 // 6 horas
                });
            }

            console.log(`✅ Fetched and cached ${fixtures.length} fixtures`);

            return {
                success: true,
                count: fixtures.length,
                fixtures: fixtures.map(f => this.formatFixture(f)),
                fromCache: false
            };

        } catch (error) {
            console.error('Error getting upcoming fixtures:', error.message);
            return {
                success: false,
                error: error.message,
                fixtures: []
            };
        }
    }

    /**
     * Obtiene predicciones para un partido específico
     * Cache: 12 horas
     */
    async getFixturePredictions(fixtureId) {
        try {
            const cacheKey = `predictions_${fixtureId}`;
            const cacheFilters = { fixtureId };

            // 1. Verificar cache
            const keyResult = await apiRateLimiter.getAvailableKey(
                this.provider,
                cacheKey,
                cacheFilters
            );

            if (keyResult.fromCache) {
                return keyResult.data;
            }

            // 2. Llamar API
            console.log(`🌐 Calling API-Football predictions for fixture ${fixtureId}...`);

            const response = await axios.get(`${this.baseUrl}/predictions`, {
                headers: {
                    'x-rapidapi-key': keyResult.apiKey,
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                },
                params: { fixture: fixtureId }
            });

            await apiRateLimiter.recordCall(keyResult.apiKey, this.provider);

            const predictions = response.data.response?.[0] || null;

            // 3. Guardar en cache (12 horas)
            if (predictions) {
                const predictionData = this.formatPredictions(predictions, fixtureId);
                await cacheManager.set('football', cacheKey, predictionData, {
                    ttl: 12 * 60 * 60 // 12 horas
                });
            }

            return {
                success: true,
                predictions,
                fromCache: false
            };

        } catch (error) {
            console.error('Error getting predictions:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene tabla de posiciones
     * Cache: 24 horas
     */
    async getLeagueStandings(leagueId, season = new Date().getFullYear()) {
        try {
            const cacheKey = `standings_${leagueId}_${season}`;
            const cacheFilters = { leagueId, season };

            const keyResult = await apiRateLimiter.getAvailableKey(
                this.provider,
                cacheKey,
                cacheFilters
            );

            if (keyResult.fromCache) {
                return keyResult.data;
            }

            console.log(`🌐 Calling API-Football standings for league ${leagueId}...`);

            const response = await axios.get(`${this.baseUrl}/standings`, {
                headers: {
                    'x-rapidapi-key': keyResult.apiKey,
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                },
                params: {
                    league: leagueId,
                    season
                }
            });

            await apiRateLimiter.recordCall(keyResult.apiKey, this.provider);

            const standings = response.data.response?.[0]?.league?.standings?.[0] || [];

            // Guardar en cache (24 horas)
            const standingsData = {
                cacheKey,
                leagueId,
                season,
                standings,
                updatedAt: new Date().toISOString()
            };

            await cacheManager.set('football', cacheKey, standingsData, {
                ttl: 24 * 60 * 60 // 24 horas
            });

            return {
                success: true,
                standings,
                fromCache: false
            };

        } catch (error) {
            console.error('Error getting standings:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene estadísticas head-to-head
     */
    async getH2HStats(team1Id, team2Id) {
        try {
            const cacheKey = `h2h_${team1Id}_${team2Id}`;
            const cacheFilters = { team1Id, team2Id };

            const keyResult = await apiRateLimiter.getAvailableKey(
                this.provider,
                cacheKey,
                cacheFilters
            );

            if (keyResult.fromCache) {
                return keyResult.data;
            }

            console.log(`🌐 Calling API-Football H2H for ${team1Id} vs ${team2Id}...`);

            const response = await axios.get(`${this.baseUrl}/fixtures/headtohead`, {
                headers: {
                    'x-rapidapi-key': keyResult.apiKey,
                    'x-rapidapi-host': 'v3.football.api-sports.io'
                },
                params: {
                    h2h: `${team1Id}-${team2Id}`
                }
            });

            await apiRateLimiter.recordCall(keyResult.apiKey, this.provider);

            const matches = response.data.response || [];

            const h2hData = {
                cacheKey,
                team1Id,
                team2Id,
                totalMatches: matches.length,
                matches: matches.slice(0, 10), // Últimos 10 partidos
                updatedAt: new Date().toISOString()
            };

            await cacheManager.set('football', cacheKey, h2hData, {
                ttl: 24 * 60 * 60 // 24 horas
            });

            return {
                success: true,
                h2h: h2hData,
                fromCache: false
            };

        } catch (error) {
            console.error('Error getting H2H stats:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Formatea un fixture para almacenamiento
     */
    formatFixture(fixture) {
        return {
            fixtureId: fixture.fixture.id,
            leagueId: fixture.league.id,
            league: fixture.league.name,
            homeTeam: fixture.teams.home.name,
            homeTeamId: fixture.teams.home.id,
            awayTeam: fixture.teams.away.name,
            awayTeamId: fixture.teams.away.id,
            matchDate: fixture.fixture.date,
            status: this.mapStatus(fixture.fixture.status.short),
            venue: fixture.fixture.venue?.name,
            referee: fixture.fixture.referee,
            round: fixture.league.round
        };
    }

    /**
     * Formatea predicciones
     */
    formatPredictions(predictions, fixtureId) {
        return {
            fixtureId,
            winner: predictions.predictions?.winner,
            winOrDraw: predictions.predictions?.win_or_draw,
            goalsHome: predictions.predictions?.goals?.home,
            goalsAway: predictions.predictions?.goals?.away,
            advice: predictions.predictions?.advice,
            percentages: {
                home: predictions.predictions?.percent?.home,
                draw: predictions.predictions?.percent?.draw,
                away: predictions.predictions?.percent?.away
            },
            comparison: predictions.comparison
        };
    }

    /**
     * Mapea estados de API-Football a nuestro formato
     */
    mapStatus(apiStatus) {
        const statusMap = {
            'TBD': 'scheduled',
            'NS': 'scheduled',
            '1H': 'live',
            'HT': 'live',
            '2H': 'live',
            'ET': 'live',
            'P': 'live',
            'FT': 'finished',
            'AET': 'finished',
            'PEN': 'finished',
            'PST': 'postponed',
            'CANC': 'cancelled',
            'ABD': 'abandoned'
        };

        return statusMap[apiStatus] || 'scheduled';
    }

    /**
     * Formatea respuesta de fixtures
     */
    formatFixturesResponse(cacheData) {
        return {
            success: true,
            count: 1,
            fixtures: [cacheData],
            fromCache: true
        };
    }

    /**
     * Sincroniza partidos próximos para todas las ligas principales
     */
    async syncAllLeagues() {
        console.log('🔄 Syncing upcoming fixtures for all major leagues...');

        const results = [];

        for (const [name, leagueId] of Object.entries(this.leagues)) {
            console.log(`\n📊 Processing ${name} (ID: ${leagueId})...`);

            const result = await this.getUpcomingFixtures(leagueId, { next: 10 });
            results.push({
                league: name,
                leagueId,
                ...result
            });

            // Pequeña pausa entre ligas para no saturar
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const totalFixtures = results.reduce((sum, r) => sum + (r.count || 0), 0);
        const apiCalls = results.filter(r => !r.fromCache).length;

        console.log('\n✅ Sync completed:');
        console.log(`   Total fixtures: ${totalFixtures}`);
        console.log(`   API calls made: ${apiCalls}`);
        console.log(`   Cache hits: ${results.length - apiCalls}`);

        return {
            success: true,
            totalFixtures,
            apiCalls,
            cacheHits: results.length - apiCalls,
            results
        };
    }
}

module.exports = new FootballApiService();
