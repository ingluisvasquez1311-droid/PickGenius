// src/services/nbaPlayerPropsService.js
const { db } = require('../config/firebase');
const sofaScoreBasketballService = require('./basketball/sofaScoreBasketballService');

class NBAPlayerPropsService {
    constructor() {
        this.CACHE_COLLECTION = 'nba_player_props';
        this.CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas
    }

    /**
     * Obtener estadísticas recientes de un jugador desde Sofascore
     */
    async getPlayerStats(playerId, gamesCount = 10) {
        try {
            const cacheKey = `sofa_player_stats_${playerId}_${gamesCount}`;

            // Verificar cache
            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                console.log(`✅ Stats de jugador ${playerId} (SofaScore) desde cache`);
                return cached;
            }

            // 1. Obtener eventos recientes (Game Log)
            // El endpoint /player/{id}/events/last/0 devuelve los últimos partidos
            const eventsRes = await sofaScoreBasketballService.makeRequest(
                `/player/${playerId}/events/last/0`,
                `player_events_${playerId}`,
                3600 // 1 hora de cache en memoria
            );

            if (!eventsRes.success || !eventsRes.data.events) {
                throw new Error('No se pudieron obtener los eventos del jugador');
            }

            // 2. Para cada evento, necesitamos las estadísticas detalladas
            // Nota: Esto puede ser costoso en términos de requests. 
            // Sofascore a veces tiene un endpoint de 'last-statistics' o similar.
            // Por ahora, tomaremos los últimos 'gamesCount' eventos.
            const recentEvents = eventsRes.data.events.slice(0, gamesCount);

            const statsPromises = recentEvents.map(async (event) => {
                const statsRes = await sofaScoreBasketballService.makeRequest(
                    `/event/${event.id}/lineups`,
                    `event_lineups_${event.id}`,
                    86400 // Cache largo para partidos ya jugados
                );

                if (statsRes.success && statsRes.data) {
                    // Buscar al jugador en las alineaciones local o visitante
                    const allPlayers = [
                        ...(statsRes.data.home?.players || []),
                        ...(statsRes.data.away?.players || [])
                    ];

                    const playerStats = allPlayers.find(p => p.player.id == playerId);
                    if (playerStats && playerStats.statistics) {
                        return {
                            game: {
                                id: event.id,
                                date: { start: new Date(event.startTimestamp * 1000).toISOString() },
                            },
                            team: { name: event.homeTeam.id == playerStats.teamId ? event.homeTeam.name : event.awayTeam.name },
                            opponent: event.homeTeam.id == playerStats.teamId ? event.awayTeam.name : event.homeTeam.name,
                            ...playerStats.statistics
                        };
                    }
                }
                return null;
            });

            const fullStats = (await Promise.all(statsPromises)).filter(s => s !== null);

            // Guardar en cache
            await this.saveToCache(cacheKey, fullStats);

            return fullStats;
        } catch (error) {
            console.error(`❌ Error obteniendo stats del jugador ${playerId} (SofaScore):`, error.message);
            throw error;
        }
    }

    /**
     * Calcular promedios de un jugador basado en últimos partidos
     */
    calculateAverages(playerStats, lastGames = 5) {
        if (!playerStats || playerStats.length === 0) {
            return null;
        }

        const recentGames = playerStats.slice(0, lastGames);

        const totals = recentGames.reduce((acc, game) => {
            return {
                points: acc.points + (game.points || 0),
                assists: acc.assists + (game.assists || 0),
                rebounds: acc.rebounds + (game.reboundsTotal || game.totReb || 0),
                steals: acc.steals + (game.steals || 0),
                blocks: acc.blocks + (game.blocks || 0),
                turnovers: acc.turnovers + (game.turnovers || 0),
                minutes: acc.minutes + Math.round((game.secondsPlayed || 0) / 60)
            };
        }, {
            points: 0,
            assists: 0,
            rebounds: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            minutes: 0
        });

        const games = recentGames.length;

        return {
            gamesAnalyzed: games,
            averages: {
                points: (totals.points / games).toFixed(1),
                assists: (totals.assists / games).toFixed(1),
                rebounds: (totals.rebounds / games).toFixed(1),
                steals: (totals.steals / games).toFixed(1),
                blocks: (totals.blocks / games).toFixed(1),
                turnovers: (totals.turnovers / games).toFixed(1),
                minutes: (totals.minutes / games).toFixed(1)
            },
            lastGames: recentGames.map(game => ({
                date: game.game.date.start,
                opponent: game.opponent,
                points: game.points,
                assists: game.assists,
                rebounds: game.reboundsTotal || game.totReb || 0,
                minutes: Math.round((game.secondsPlayed || 0) / 60)
            }))
        };
    }

    /**
     * Generar predicción con IA para un jugador
     */
    async generatePlayerPropPrediction(playerId, playerName, propType, line) {
        try {
            const stats = await this.getPlayerStats(playerId);
            const averages = this.calculateAverages(stats, 10);

            if (!averages) {
                throw new Error('No hay suficientes datos recientes para este jugador');
            }

            // Traducir propType para el prompt
            const propNames = {
                points: 'puntos',
                assists: 'asistencias',
                rebounds: 'rebotes',
                steals: 'robos',
                blocks: 'bloqueos'
            };

            const prompt = this.buildPredictionPrompt(
                playerName,
                propNames[propType] || propType,
                line,
                averages
            );

            const prediction = await this.callGeminiAPI(prompt);

            return {
                player: playerName,
                playerId,
                propType,
                line,
                averages: averages.averages,
                lastGames: averages.lastGames,
                prediction: prediction,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error generando predicción para ${playerName}:`, error.message);
            throw error;
        }
    }

    /**
     * Construir prompt para la IA en Español
     */
    buildPredictionPrompt(playerName, propName, line, averages) {
        const avg = averages.averages;
        const lastGames = averages.lastGames;

        return `
Eres un experto analista deportivo de la NBA. Tu tarea es analizar si el jugador ${playerName} superará (OVER) o no (UNDER) la línea de ${line} ${propName} en su próximo partido.

DATOS RECIENTES DEL JUGADOR (Promedios últimos 10 juegos):
- ${propName.toUpperCase()} promedio: ${avg[propName] || avg.points}
- Puntos promedio: ${avg.points}
- Asistencias promedio: ${avg.assists}
- Rebotes promedio: ${avg.rebounds}
- Minutos promedio: ${avg.minutes}

ÚLTIMOS 5 PARTIDOS JUGADOS:
${lastGames.slice(0, 5).map((game, i) =>
            `${i + 1}. Fecha: ${game.date.split('T')[0]}, Rival: ${game.opponent}, PTS: ${game.points}, AST: ${game.assists}, REB: ${game.rebounds}, MIN: ${game.minutes}`
        ).join('\n')}

INSTRUCCIONES DE ANÁLISIS:
1. Evalúa la tendencia actual del jugador.
2. Compara el promedio reciente contra la línea de ${line}.
3. Considera la consistencia en los últimos partidos.
4. Determina si es más probable que supere (OVER) o quede por debajo (UNDER).

RESPONDE ÚNICAMENTE EN FORMATO JSON EN ESPAÑOL:
{
  "prediction": "OVER" o "UNDER",
  "probability": número del 1 al 100,
  "confidence": "Baja", "Media" o "Alta",
  "reasoning": "explicación detallada en español de por qué se tomó la decisión",
  "keyFactors": ["factor clave 1", "factor clave 2", "factor clave 3"]
}
`;
    }

    async callGeminiAPI(prompt) {
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return {
                prediction: 'DESCONOCIDO',
                probability: 50,
                confidence: 'Baja',
                reasoning: text,
                keyFactors: []
            };
        } catch (error) {
            console.error('❌ Error llamando a Gemini:', error.message);
            throw error;
        }
    }

    /**
     * Obtener jugadores destacados (IDs de Sofascore)
     */
    async getTodayTopPlayers() {
        try {
            const cacheKey = 'sofa_today_top_players';

            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                return cached;
            }

            // Lista de IDs de jugadores reales en Sofascore
            const topPlayers = [
                { id: 15152, name: 'LeBron James' },
                { id: 33796, name: 'Stephen Curry' },
                { id: 24391, name: 'Kevin Durant' },
                { id: 191316, name: 'Giannis Antetokounmpo' },
                { id: 825121, name: 'Luka Doncic' },
                { id: 341015, name: 'Nikola Jokic' },
                { id: 341014, name: 'Joel Embiid' },
                { id: 835260, name: 'Jayson Tatum' }
            ];

            const playersData = await Promise.all(
                topPlayers.map(async (player) => {
                    try {
                        const stats = await this.getPlayerStats(player.id, 5);
                        const averages = this.calculateAverages(stats, 5);
                        return {
                            ...player,
                            averages: averages ? averages.averages : null,
                            gamesAnalyzed: averages ? averages.gamesAnalyzed : 0
                        };
                    } catch (error) {
                        console.error(`Error con jugador ${player.name}:`, error.message);
                        return { ...player, averages: null, gamesAnalyzed: 0 };
                    }
                })
            );

            const result = playersData.filter(p => p.averages !== null);
            await this.saveToCache(cacheKey, result, 3600000); // 1 hora

            return result;
        } catch (error) {
            console.error('❌ Error obteniendo jugadores top:', error.message);
            throw error;
        }
    }

    async getFromCache(key) {
        try {
            if (!db) return null;
            const doc = await db.collection(this.CACHE_COLLECTION).doc(key).get();
            if (!doc.exists) return null;
            const data = doc.data();
            if (Date.now() - data.timestamp > this.CACHE_TTL) {
                await doc.ref.delete();
                return null;
            }
            return data.data;
        } catch (error) {
            return null;
        }
    }

    async saveToCache(key, data, ttl) {
        try {
            if (!db) return;
            await db.collection(this.CACHE_COLLECTION).doc(key).set({
                data,
                timestamp: Date.now(),
                ttl: ttl || this.CACHE_TTL
            });
        } catch (error) {
            console.error('Error guardando en cache:', error.message);
        }
    }
}

module.exports = new NBAPlayerPropsService();
