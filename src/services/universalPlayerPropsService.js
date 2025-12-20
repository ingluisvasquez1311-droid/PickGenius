// src/services/universalPlayerPropsService.js
const { db } = require('../config/firebase');
const generalizedSofaScoreService = require('./generalizedSofaScoreService');

class UniversalPlayerPropsService {
    constructor() {
        this.CACHE_COLLECTION = 'universal_player_props';
        this.CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

        this.topPlayersBySport = {
            'basketball': [
                { id: 15152, name: 'LeBron James' },
                { id: 816960, name: 'Giannis Antetokounmpo' },
                { id: 825121, name: 'Luka Doncic' },
                { id: 341015, name: 'Nikola Jokic' },
                { id: 33796, name: 'Stephen Curry' },
                { id: 835260, name: 'Jayson Tatum' }
            ],
            'baseball': [
                { id: 832962, name: 'Shohei Ohtani' },
                { id: 792742, name: 'Aaron Judge' },
                { id: 794354, name: 'Bryce Harper' },
                { id: 834571, name: 'Juan Soto' },
                { id: 831267, name: 'Ronald Acuña Jr.' }
            ],
            'nhl': [
                { id: 792817, name: 'Connor McDavid' },
                { id: 341018, name: 'Nathan MacKinnon' },
                { id: 792823, name: 'Auston Matthews' },
                { id: 24376, name: 'Alex Ovechkin' },
                { id: 20281, name: 'Sidney Crosby' }
            ],
            'tennis': [
                { id: 14882, name: 'Novak Djokovic' },
                { id: 1042571, name: 'Carlos Alcaraz' },
                { id: 902404, name: 'Jannik Sinner' },
                { id: 10609, name: 'Rafael Nadal' },
                { id: 799049, name: 'Iga Swiatek' }
            ]
        };
    }

    async getPlayerStats(playerId, sport, gamesCount = 10) {
        try {
            const cacheKey = `uni_stats_${sport}_${playerId}_${gamesCount}`;
            const cached = await this.getFromCache(cacheKey);
            if (cached) return cached;

            const eventsRes = await generalizedSofaScoreService.getPlayerLastEvents(playerId);
            if (!eventsRes.success || !eventsRes.data.events) {
                throw new Error('No se pudieron obtener eventos del jugador');
            }

            const recentEvents = eventsRes.data.events.slice(0, gamesCount);
            const statsPromises = recentEvents.map(async (event) => {
                const statsRes = await generalizedSofaScoreService.getEventLineups(event.id);
                if (statsRes.success && statsRes.data) {
                    const allPlayers = [
                        ...(statsRes.data.home?.players || []),
                        ...(statsRes.data.away?.players || [])
                    ];
                    const playerStats = allPlayers.find(p => p.player.id == playerId);
                    if (playerStats && playerStats.statistics) {
                        return {
                            game: { id: event.id, date: new Date(event.startTimestamp * 1000).toISOString() },
                            team: event.homeTeam.id == playerStats.teamId ? event.homeTeam.name : event.awayTeam.name,
                            opponent: event.homeTeam.id == playerStats.teamId ? event.awayTeam.name : event.homeTeam.name,
                            ...playerStats.statistics
                        };
                    }
                }
                return null;
            });

            const fullStats = (await Promise.all(statsPromises)).filter(s => s !== null);
            await this.saveToCache(cacheKey, fullStats);
            return fullStats;
        } catch (error) {
            console.error(`❌ Error en getPlayerStats (${sport}):`, error.message);
            throw error;
        }
    }

    calculateAverages(playerStats, sport, lastGames = 5) {
        if (!playerStats || playerStats.length === 0) return null;
        const recentGames = playerStats.slice(0, lastGames);

        // Generalizar mapeo de estadísticas por deporte
        const mapper = {
            'basketball': (g) => ({
                points: g.points || 0,
                assists: g.assists || 0,
                rebounds: g.reboundsTotal || g.totReb || 0,
                minutes: Math.round((g.secondsPlayed || 0) / 60)
            }),
            'baseball': (g) => ({
                hits: g.hits || 0,
                homeRuns: g.homeRuns || 0,
                rbis: g.rbis || 0,
                strikeouts: g.strikeouts || 0
            }),
            'nhl': (g) => ({
                goals: g.goals || 0,
                assists: g.assists || 0,
                shots: g.shots || 0,
                minutes: Math.round((g.secondsPlayed || 0) / 60)
            }),
            'tennis': (g) => ({
                aces: g.aces || 0,
                doubleFaults: g.doubleFaults || 0,
                firstServePoints: g.firstServePoints || 0
            })
        };

        const mapFunc = mapper[sport] || mapper['basketball'];
        const totals = recentGames.reduce((acc, game) => {
            const stats = mapFunc(game);
            Object.keys(stats).forEach(key => {
                acc[key] = (acc[key] || 0) + stats[key];
            });
            return acc;
        }, {});

        const games = recentGames.length;
        const averages = {};
        Object.keys(totals).forEach(key => {
            averages[key] = (totals[key] / games).toFixed(1);
        });

        return {
            gamesAnalyzed: games,
            averages,
            lastGames: recentGames.map(g => ({
                date: g.game.date,
                opponent: g.opponent,
                ...mapFunc(g)
            }))
        };
    }

    async generatePrediction(playerId, playerName, sport, propType, line) {
        try {
            const stats = await this.getPlayerStats(playerId, sport);
            const averages = this.calculateAverages(stats, sport, 10);
            if (!averages) throw new Error('Datos insuficientes');

            const prompt = this.buildUniversalPrompt(playerName, sport, propType, line, averages);
            const prediction = await this.callAI(prompt);

            return {
                player: playerName,
                sport,
                propType,
                line,
                averages: averages.averages,
                lastGames: averages.lastGames,
                prediction: prediction,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Error en generatePrediction:`, error.message);
            throw error;
        }
    }

    buildUniversalPrompt(playerName, sport, propType, line, averages) {
        const sportNames = { 'basketball': 'Baloncesto (NBA)', 'baseball': 'Béisbol (MLB)', 'nhl': 'Hockey (NHL)', 'tennis': 'Tenis (ATP/WTA)' };
        return `
Eres un analista experto en ${sportNames[sport] || sport}. Analiza si ${playerName} superará (OVER) o no (UNDER) la línea de ${line} en ${propType} para su próximo encuentro.

DATOS:
- Promedios recientes: ${JSON.stringify(averages.averages)}
- Historial últimos partidos: ${JSON.stringify(averages.lastGames.slice(0, 5))}

RESPONDE ÚNICAMENTE JSON EN ESPAÑOL:
{
  "prediction": "OVER" o "UNDER",
  "probability": 1-100,
  "confidence": "Alta/Media/Baja",
  "reasoning": "explicación profesional",
  "keyFactors": ["factor 1", "factor 2"]
}
`;
    }

    async callAI(prompt) {
        // 1. Intentar con Groq primero (Preferido por el usuario)
        if (process.env.GROQ_API_KEY) {
            try {
                const { OpenAI } = require('openai');
                const groq = new OpenAI({
                    apiKey: process.env.GROQ_API_KEY,
                    baseURL: 'https://api.groq.com/openai/v1'
                });

                const completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "Eres un analista deportivo experto. Responde siempre en formato JSON válido en español." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                });

                const text = completion.choices[0].message.content;
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) return JSON.parse(jsonMatch[0]);
            } catch (error) {
                console.warn(`⚠️ Groq failed in Universal Service: ${error.message}. Trying Gemini...`);
            }
        }

        // 2. Fallback a Gemini
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            const text = (await result.response).text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { prediction: 'DESCONOCIDO', reasoning: text };
        } catch (error) {
            console.error('❌ All AI providers failed in Universal Service');
            throw error;
        }
    }

    async getTopPlayers(sport) {
        const cacheKey = `top_players_${sport}`;
        const cached = await this.getFromCache(cacheKey);
        if (cached) return cached;

        const players = this.topPlayersBySport[sport] || [];
        const results = await Promise.all(players.map(async (p) => {
            try {
                const stats = await this.getPlayerStats(p.id, sport, 5);
                const averages = this.calculateAverages(stats, sport, 5);
                return { ...p, averages: averages ? averages.averages : null };
            } catch { return { ...p, averages: null }; }
        }));

        const final = results.filter(r => r.averages);
        await this.saveToCache(cacheKey, final, 3600000);
        return final;
    }

    async getFromCache(key) {
        if (!db) return null;
        const doc = await db.collection(this.CACHE_COLLECTION).doc(key).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return (Date.now() - data.timestamp > this.CACHE_TTL) ? null : data.data;
    }

    async saveToCache(key, data, ttl) {
        if (!db) return;
        await db.collection(this.CACHE_COLLECTION).doc(key).set({ data, timestamp: Date.now(), ttl: ttl || this.CACHE_TTL });
    }
}

module.exports = new UniversalPlayerPropsService();
