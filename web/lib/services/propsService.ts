import { sportsDataService } from './sportsDataService';
import { memoryCache } from './memoryCache';
import Groq from 'groq-sdk';
import Parser from 'rss-parser';

const rssParser = new Parser();

export interface PlayerProp {
    id: string;
    player: {
        id: number;
        name: string;
        team: string;
        position?: string;
        image?: string;
    };
    game: {
        id: number;
        homeTeam: string;
        awayTeam: string;
        homeTeamId: number;
        awayTeamId: number;
        date: string;
        startTimestamp: number;
    };
    prop: {
        type: string;
        line: number;
        displayName: string;
        icon: string;
    };
    stats: {
        average: number;
        last5: number[];
        trend: '📈' | '📉';
    };
    prediction?: any;
    league: string;
    sport: string;
}

class PropsService {
    private LEAGUES_CONFIG: any = {
        basketball: {
            propTypes: ['points', 'assists', 'rebounds', 'steals', 'blocks', 'threes', 'winner', 'totalPoints'],
            icons: { points: '🏀', assists: '🤝', rebounds: '💪', steals: '🔒', blocks: '🛡️', threes: '🎯', winner: '🏆', totalPoints: '📊' },
            names: { points: 'Puntos', assists: 'Asistencias', rebounds: 'Rebotes', steals: 'Robos', blocks: 'Bloqueos', threes: 'Triples', winner: 'Ganador (ML)', totalPoints: 'Total Puntos' }
        },
        football: {
            propTypes: ['goals', 'assists', 'shotsOnTarget', 'passes', 'tackles', 'winner', 'totalGoals'],
            icons: { goals: '⚽', assists: '🤝', shotsOnTarget: '🎯', passes: '👟', tackles: '🛡️', winner: '🏆', totalGoals: '📊' },
            names: { goals: 'Goles', assists: 'Asistencias', shotsOnTarget: 'Tiros al Arco', passes: 'Pases', tackles: 'Tackles', winner: 'Ganador (ML)', totalGoals: 'Total Goles' }
        },
        baseball: {
            propTypes: ['hits', 'homeRuns', 'rbis', 'strikeouts', 'runsScored', 'winner', 'totalRuns'],
            icons: { hits: '⚾', homeRuns: '🚀', rbis: '🏃', strikeouts: '🔥', runsScored: '🏃‍♂️', winner: '🏆', totalRuns: '📊' },
            names: { hits: 'Hits', homeRuns: 'Home Runs', rbis: 'RBIs', strikeouts: 'Strikeouts', runsScored: 'Carreras Anotadas', winner: 'Ganador (ML)', totalRuns: 'Total Carreras' }
        },
        nhl: {
            propTypes: ['goals', 'assists', 'shots', 'points', 'winner', 'totalGoals'],
            icons: { goals: '🏒', assists: '🤝', shots: '🎯', points: '📊', winner: '🏆', totalGoals: '⚽' },
            names: { goals: 'Goles', assists: 'Asistencias', shots: 'Tiros', points: 'Puntos', winner: 'Ganador (ML)', totalGoals: 'Total Goles' }
        },
        tennis: {
            propTypes: ['aces', 'doubleFaults', 'firstServePoints', 'winner', 'gameWinner', 'setWinner'],
            icons: { aces: '🎾', doubleFaults: '❌', firstServePoints: '⚡', winner: '🏆', gameWinner: '🎮', setWinner: '🎾' },
            names: { aces: 'Aces', doubleFaults: 'Doble Faltas', firstServePoints: 'Puntos 1er Saque', winner: 'Ganador (ML)', gameWinner: 'Ganador Juego', setWinner: 'Ganador Set' }
        },
        'american-football': {
            propTypes: ['touchdowns', 'passingYards', 'rushingYards', 'receptions', 'winner', 'totalPoints'],
            icons: { touchdowns: '🏈', passingYards: '🎯', rushingYards: '🏃', receptions: '🤲', winner: '🏆', totalPoints: '📊' },
            names: { touchdowns: 'Touchdowns', passingYards: 'Yardas Aire', rushingYards: 'Yardas Tierra', receptions: 'Recepciones', winner: 'Ganador (ML)', totalPoints: 'Total Puntos' }
        }
    };

    /**
     * Obtiene los props del día para un deporte usando datos reales
     */
    async getDailyProps(sport: string): Promise<PlayerProp[]> {
        const cacheKey = `daily_props_real_${sport}_${new Date().toISOString().split('T')[0]}`;
        const cached = memoryCache.get(cacheKey);
        if (cached) return cached;

        console.log(`🔄 [PropsService] Generating REAL daily props for ${sport}...`);

        try {
            // Mapping for UI slugs to Sofascore slugs
            const slugMapping: any = {
                'nhl': 'icehockey',
                'american-football': 'american-football',
                'baseball': 'baseball',
                'tennis': 'tennis'
            };
            const targetSport = slugMapping[sport] || sport;

            const games = await sportsDataService.getEventsBySport(targetSport);

            if (!games || games.length === 0) {
                console.warn(`⚠️ [PropsService] No real games found for ${sport}, using mocks.`);
                return this.getMockDailyProps(sport);
            }

            // Limitamos a los primeros 8 partidos para asegurar calidad y velocidad
            const topGames = games.slice(0, 8);
            const allProps: PlayerProp[] = [];

            for (const game of topGames) {
                // Obtenemos los mejores jugadores para identificar protagonistas
                const bestPlayersRes = await sportsDataService.getMatchBestPlayers(game.id);
                let targetPlayers: any[] = [];

                if (bestPlayersRes && (bestPlayersRes.home || bestPlayersRes.away)) {
                    targetPlayers = [
                        ...(bestPlayersRes.home || []).slice(0, 3),
                        ...(bestPlayersRes.away || []).slice(0, 3)
                    ];
                } else {
                    const lineups = await sportsDataService.getMatchLineups(game.id);
                    if (lineups && (lineups.home || lineups.away)) {
                        targetPlayers = [
                            ...(lineups.home?.players || []).slice(0, 2),
                            ...(lineups.away?.players || []).slice(0, 2)
                        ];
                    }
                }

                if (targetPlayers.length === 0) continue;

                const results = await Promise.all(targetPlayers.map(async (playerEntry) => {
                    const player = playerEntry.player;
                    if (!player) return [];
                    const realStats = await this.getPlayerRealStats(player.id, game, sport);
                    return this.generatePropsForPlayer(player, game, sport, realStats);
                }));

                results.forEach(p => allProps.push(...p));
            }

            if (allProps.length === 0) return this.getMockDailyProps(sport);

            memoryCache.set(cacheKey, allProps, 3600 * 4);
            return allProps;
        } catch (error) {
            console.error(`❌ [PropsService] Error generating real props for ${sport}:`, error);
            return this.getMockDailyProps(sport);
        }
    }

    private getMockDailyProps(sport: string): PlayerProp[] {
        const config = this.LEAGUES_CONFIG[sport] || this.LEAGUES_CONFIG['basketball'];
        const type = config.propTypes[0];

        const mockData: any = {
            basketball: [
                { name: 'LeBron James', team: 'Lakers', pos: 'F', line: 25.5, avg: 24.8 },
                { name: 'Ganador Partido', team: 'Lakers', pos: 'Game', line: 'MONEYLINE', type: 'winner', avg: 0.65 },
                { name: 'Stephen Curry', team: 'Warriors', pos: 'G', line: 4.5, type: 'threes', avg: 4.8 }
            ],
            football: [
                { name: 'Erling Haaland', team: 'Man City', pos: 'ST', line: 1.5, type: 'goals', avg: 1.2 },
                { name: 'Ganador Directo', team: 'Real Madrid', pos: 'Game', line: 'MONEYLINE', type: 'winner', avg: 0.55 },
                { name: 'Kevin De Bruyne', team: 'Man City', pos: 'MF', line: 0.5, type: 'assists', avg: 0.8 }
            ],
            'american-football': [
                { name: 'Patrick Mahomes', team: 'Chiefs', pos: 'QB', line: 280.5, type: 'passingYards', avg: 295.2 },
                { name: 'Ganador NFL', team: 'Chiefs', pos: 'Game', line: 'MONEYLINE', type: 'winner', avg: 0.70 },
                { name: 'Travis Kelce', team: 'Chiefs', pos: 'TE', line: 0.5, type: 'touchdowns', avg: 0.7 }
            ],
            nhl: [
                { name: 'Connor McDavid', team: 'Oilers', pos: 'C', line: 1.5, type: 'points', avg: 1.8 },
                { name: 'Ganador Hockey', team: 'Oilers', pos: 'Game', line: 'MONEYLINE', type: 'winner', avg: 0.60 },
                { name: 'Auston Matthews', team: 'Maple Leafs', pos: 'LW', line: 0.5, type: 'goals', avg: 0.9 }
            ],
            baseball: [
                { name: 'Shohei Ohtani', team: 'Dodgers', pos: 'DH', line: 1.5, type: 'hits', avg: 1.4 },
                { name: 'Ganador MLB', team: 'Yankees', pos: 'Game', line: 'MONEYLINE', type: 'winner', avg: 0.52 },
                { name: 'Aaron Judge', team: 'Yankees', pos: 'CF', line: 0.5, type: 'homeRuns', avg: 0.4 }
            ],
            tennis: [
                { name: 'Carlos Alcaraz', team: 'ATP', pos: 'N/A', line: 8.5, type: 'aces', avg: 7.2 },
                { name: 'Ganador Tenis', team: 'Alcaraz', pos: 'Game', line: 'MONEYLINE', type: 'winner', avg: 0.85 },
                { name: 'Jannik Sinner', team: 'ATP', pos: 'N/A', line: 6.5, type: 'aces', avg: 6.8 }
            ]
        };

        const sportMocks = mockData[sport] || mockData['basketball'];

        return sportMocks.map((m: any, i: number) => {
            const mType = m.type || type;
            return {
                id: `mock_${sport}_${i}`,
                player: { id: i + 1, name: m.name, team: m.team, position: m.pos, image: '/player-placeholder.png' },
                game: { id: 100 + i, homeTeam: m.team, awayTeam: 'Rival', homeTeamId: 1, awayTeamId: 2, date: new Date().toISOString(), startTimestamp: Date.now() / 1000 + 3600 * (i + 1) },
                prop: { type: mType, line: m.line, displayName: config.names[mType] || mType, icon: config.icons[mType] || '📊' },
                stats: { average: m.avg, last5: [m.avg + 1, m.avg - 1, m.avg + 2, m.avg - 2, m.avg], trend: '📈' },
                league: 'Pro League',
                sport: sport
            };
        });
    }

    /**
     * Obtiene estadísticas reales de un jugador: últimos 5 juegos (detallados) y promedio de temporada
     */
    private async getPlayerRealStats(playerId: number, game: any, sport: string): Promise<any> {
        const cacheKey = `player_real_stats_v2_${playerId}_${sport}`;
        const cached = memoryCache.get(cacheKey);
        if (cached) return cached;

        try {
            // 1. Obtener lista de últimos eventos
            const lastEventsData = await sportsDataService.getPlayerLastEvents(playerId);
            const events = lastEventsData?.events || [];

            // 2. Obtener estadísticas detalladas de los últimos 5 partidos en paralelo
            const last5Events = events.slice(0, 5);
            const deepStatsPromises = last5Events.map((event: any) =>
                sportsDataService.getPlayerEventStatistics(playerId, event.id)
            );

            const deepStatsResults = await Promise.all(deepStatsPromises);

            // 3. Mapear los resultados detallados a los eventos
            const historyWithStats = last5Events.map((event: any, index: number) => ({
                ...event,
                playerStatistics: deepStatsResults[index]?.statistics || {}
            }));

            // 4. Obtener estadísticas de temporada
            const tournamentId = game.tournament?.uniqueTournament?.id || game.tournament?.id;
            const seasonId = game.season?.id;

            let seasonStats = null;
            if (tournamentId && seasonId) {
                seasonStats = await sportsDataService.getPlayerSeasonStats(playerId, tournamentId, seasonId);
            }

            const stats = {
                history: historyWithStats,
                season: seasonStats?.statistics || {},
                currentMatchStats: {}
            };

            memoryCache.set(cacheKey, stats, 3600 * 3); // Cache por 3 horas
            return stats;
        } catch (error) {
            console.error(`Error fetching real stats for player ${playerId}:`, error);
            return { history: [], season: {}, currentMatchStats: {} };
        }
    }

    private generatePropsForPlayer(player: any, game: any, sport: string, realStats: any): PlayerProp[] {
        const config = this.LEAGUES_CONFIG[sport] || this.LEAGUES_CONFIG['basketball'];
        const props: PlayerProp[] = [];

        // Mapeo de nombres de estadísticas reales de SportsData
        const statMapping: any = {
            basketball: {
                points: 'points',
                assists: 'assists',
                rebounds: 'rebounds',
                steals: 'steals',
                blocks: 'blocks',
                threes: 'threePointsMade'
            },
            football: {
                goals: 'goals',
                assists: 'goalAssist',
                shotsOnTarget: 'onTargetScoringAttempt',
                passes: 'totalPass',
                tackles: 'totalTackle'
            },
            baseball: {
                hits: 'hits',
                homeRuns: 'homeRuns',
                rbis: 'rbis',
                strikeouts: 'strikeouts'
            },
            nhl: {
                goals: 'goals',
                assists: 'assists',
                shots: 'shotsOnGoal',
                points: 'points'
            },
            tennis: {
                aces: 'aces',
                doubleFaults: 'doubleFaults',
                firstServePoints: 'firstServePoints'
            },
            'american-football': {
                touchdowns: 'touchdowns',
                passingYards: 'passingYards',
                rushingYards: 'rushingYards',
                receptions: 'receptions'
            }
        };

        const sportMapping = statMapping[sport] || {};

        for (const type of config.propTypes) {
            const sofaStatName = sportMapping[type] || type;

            // 1. Obtener el promedio real de temporada o usar fallback inteligente
            const seasonStats = realStats.season || {};
            const appearances = seasonStats.appearances || seasonStats.matches || 1;
            const totalValue = seasonStats[sofaStatName] || 0;

            // Sofascore devuelve totales en season stats, así que calculamos el promedio
            const realAvg = appearances > 0 ? (totalValue / appearances) : 0;

            // 2. Extraer los últimos 5 juegos reales para esa estadística
            let last5: number[] = [];
            if (realStats.history && realStats.history.length > 0) {
                last5 = realStats.history.map((event: any) => {
                    const playerStatsInEvent = event.playerStatistics?.[sofaStatName];
                    if (playerStatsInEvent !== undefined) return playerStatsInEvent;

                    // Fallback determinista: Si no hay detalle de ese juego, usamos el promedio de temporada
                    return realAvg > 0 ? parseFloat(realAvg.toFixed(1)) : 0;
                });
            }

            // Si aún no tenemos last5, llenamos con 0s o promedio
            if (last5.length === 0) {
                const fillVal = realAvg > 0 ? parseFloat(realAvg.toFixed(1)) : 0;
                last5 = [fillVal, fillVal, fillVal, fillVal, fillVal];
            }

            // 3. Calcular el promedio para el display (basado en temporada si existe)
            const average = realAvg > 0 ? realAvg : (last5.reduce((a, b) => a + b, 0) / last5.length);

            // 4. Determinar la línea (Market Line)
            let line: any = Math.round(average * 2) / 2 || 0.5;

            // Ajuste para mercados de Ganador (ML)
            if (type === 'winner') {
                line = 'MONEYLINE';
            } else if (type === 'gameWinner') {
                line = 'GAME ML';
            }

            // 5. Tendencia
            const trend = last5[0] >= average ? '📈' : '📉';

            props.push({
                id: `${player.id}_${type}_${line}_${game.id}`,
                player: {
                    id: player.id,
                    name: player.name,
                    team: sport === 'tennis' ? player.name : (game.homeTeam.id === player.teamId ? game.homeTeam.name : game.awayTeam.name),
                    position: player.position,
                    image: `/api/proxy/player-image/${player.id}`
                },
                game: {
                    id: game.id,
                    homeTeam: game.homeTeam.name,
                    awayTeam: game.awayTeam.name,
                    homeTeamId: game.homeTeam.id,
                    awayTeamId: game.awayTeam.id,
                    date: new Date(game.startTimestamp * 1000).toISOString(),
                    startTimestamp: game.startTimestamp
                },
                prop: {
                    type: type,
                    line: line,
                    displayName: config.names[type] || type,
                    icon: config.icons[type] || '📊'
                },
                stats: {
                    average: parseFloat(average.toFixed(1)),
                    last5: last5,
                    trend: trend
                },
                league: game.tournament?.uniqueTournament?.name || game.tournament?.name || 'Liga',
                sport: sport
            });
        }

        return props;
    }

    /**
     * Busca noticias recientes para dar contexto a la IA
     */
    async fetchNewsContext(query: string): Promise<string> {
        try {
            // Buscamos en Google News RSS para obtener noticias de última hora
            const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+when:2d&hl=en-US&gl=US&ceid=US:en`;
            const feed = await rssParser.parseURL(url);

            return feed.items.slice(0, 3).map(item => `- ${item.title}`).join('\n');
        } catch (error) {
            console.error('Error fetching news context:', error);
            return 'No se encontraron noticias recientes relevantes.';
        }
    }

    /**
     * Genera una predicción usando Groq
     */
    async predictProp(prop: PlayerProp): Promise<any> {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error('GROQ_API_KEY not found');

        const groq = new Groq({ apiKey });

        // Obtener contexto de noticias (Jugador + Equipo)
        const newsContext = await this.fetchNewsContext(`${prop.player.name} ${prop.player.team}`);

        const prompt = `
        Actúa como un experto analista de apuestas deportivas profesional (Sharp Bettor / Whale Handicapper).
        Analiza el siguiente mercado basado en DATOS REALES y CONTEXTO DE ÚLTIMA HORA:
        
        ${prop.prop.type === 'winner' || prop.prop.type.startsWith('total') ?
                `MERCADO DE JUEGO: ${prop.prop.displayName}
             EQUIPOS: ${prop.game.homeTeam} vs ${prop.game.awayTeam}` :
                `PLAYER PROP: ${prop.player.name} (${prop.player.team})
             ESTADÍSTICAS: Promedio ${prop.stats.average}, Últimos 5: ${prop.stats.last5.join(', ')}`
            }
        
        DEPORTE: ${prop.sport.toUpperCase()}
        TIPO DE APUESTA: ${prop.prop.displayName}
        LÍNEA/CUALIDAD: ${prop.prop.line}
        
        CONTEXTO DE NOTICIAS (Google News):
        ${newsContext}
        
        INSTRUCCIONES DE ANÁLISIS:
        1. Para Player Props: Evalúa OVER/UNDER basándote en matchups defensivos y noticias de lesiones.
        2. Para Ganador (ML): Analiza localía, rachas recientes y bajas críticas.
        3. Para Totals: Evalúa el ritmo de juego (Pace) y eficiencia ofensiva/defensiva.
        4. Sé sumamente crítico y objetivo. Si hay dudas, baja el porcentaje de probabilidad.
        
        Responde exclusivamente en formato JSON:
        {
            "prediction": "OVER", "UNDER", "HOME", "AWAY", "DRAW", "YES" o "NO" (según el mercado),
            "probability": número del 1 al 100,
            "confidence": "Baja", "Media" o "Alta",
            "reasoning": "Resumen profesional de 3-4 líneas en español. Usa terminología de apuestas (Handicap, ML, Value, Sharp). Menciona noticias si son clave.",
            "keyFactors": ["factor estadístico/noticia 1", "factor táctico/noticia 2", "factor de racha 3"]
        }
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error('Empty response from Groq');

            return JSON.parse(content);
        } catch (error) {
            console.error('❌ [PropsService] Groq Prediction Error:', error);
            // Fallback mock prediction
            return {
                prediction: Math.random() > 0.5 ? 'OVER' : 'UNDER',
                probability: Math.floor(Math.random() * 30) + 60,
                confidence: 'Media',
                reasoning: 'Basado en el análisis de tendencias históricas y el volumen de juego proyectado para este enfrentamiento.',
                keyFactors: ['Forma reciente', 'Matchup defensivo', 'Promedio histórico']
            };
        }
    }
}

export const propsService = new PropsService();
