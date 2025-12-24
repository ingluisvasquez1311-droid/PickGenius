import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { groqService } from '@/lib/services/groqService';
import { globalCache, CACHE_STRATEGIES } from '@/lib/utils/api-manager';
import { getUserProfile, incrementPredictionsUsed } from '@/lib/userService';

export const maxDuration = 60; // Allow longer timeout for AI generation

export async function POST(request: NextRequest) {
    let fallbackHomeName = 'Equipo Local';
    let fallbackAwayName = 'Equipo Visitante';
    let sport = 'football';
    let gameId = '';

    try {
        const body = await request.json().catch(() => ({}));

        // Update variables if body is available
        if (body.homeTeam || body.homeTeamName) fallbackHomeName = body.homeTeam || body.homeTeamName;
        if (body.awayTeam || body.awayTeamName) fallbackAwayName = body.awayTeam || body.awayTeamName;
        if (body.sport) sport = body.sport;
        if (body.gameId) gameId = body.gameId;
        const uid = body.uid; // User ID from request

        if (!gameId || !sport) {
            return NextResponse.json({ success: false, error: 'Missing gameId or sport' }, { status: 400 });
        }

        // --- AUTH/TIER CHECK ---
        let isPremiumUser = false;
        if (uid) {
            const profile = await getUserProfile(uid);
            // OWNER/ADMIN is always premium regardless of Firestore flags
            const isOwner = profile?.email && (
                profile.email.toLowerCase() === 'pickgenius@gmail.com' ||
                profile.email.toLowerCase() === 'ingluisvasquez1311@gmail.com' ||
                profile.email.toLowerCase() === 'luisvasquez1311@gmail.com'
            );
            isPremiumUser = profile?.isPremium || profile?.role === 'admin' || isOwner || false;
            console.log(`👤 [Prediction API] User ${uid} | isPremium: ${isPremiumUser} | Role: ${profile?.role}`);
        }

        // --- CACHE LAYER ---
        const cacheKey = `prediction:${sport}:${gameId}`;
        const cachedPrediction = await globalCache.get(cacheKey);

        if (cachedPrediction) {
            console.log(`🎯 [Prediction API] Returning CACHED prediction for ${gameId}`);
            return NextResponse.json(cachedPrediction);
        }

        // 1. Fetch real match data in PARALLEL
        console.log(`📡 [Prediction API] Fetching data for Game ${gameId}...`);

        const [gameRes, statsRes, oddsRes, h2hRes] = await Promise.all([
            sportsDataService.makeRequest(`/event/${gameId}`).catch(err => {
                console.error("Error fetching game:", err);
                return null;
            }),
            sportsDataService.makeRequest(`/event/${gameId}/statistics`).catch(() => null),
            sportsDataService.getMatchOdds(Number(gameId)).catch(() => null),
            sportsDataService.getMatchH2H(Number(gameId)).catch(() => null)
        ]);

        if (!gameRes) {
            console.error(`❌ [Prediction API] Game ${gameId} not found or blocked (403)`);
            throw new Error("Game not found or provider blocked (403)");
        }

        const event = gameRes.event || gameRes;
        const statistics = statsRes || {};
        const odds = oddsRes?.markets || [];
        const h2h = h2hRes || {};

        console.log(`✅ [Prediction API] Data fetched for:`, event.name || gameId);

        const homeScore = event.homeScore?.current || 0;
        const awayScore = event.awayScore?.current || 0;

        const matchContext = {
            sport: `${sport.toUpperCase()} (Unified)`,
            home: event.homeTeam?.name || fallbackHomeName || 'Equipo Local',
            away: event.awayTeam?.name || fallbackAwayName || 'Equipo Visitante',
            score: `${homeScore} - ${awayScore}`,
            status: event.status?.description || 'Scheduled',
            startTime: event.startTimestamp,
            tournament: event.tournament?.name,
            lastPeriod: event.lastPeriod,
            timeElapsed: event.time?.played,
            remainingTime: (event.time?.max || 0) - (event.time?.played || 0),
            periodScores: {
                home: event.homeScore,
                away: event.awayScore
            },
            h2hHistory: h2h.events?.slice(0, 5).map((e: any) => ({
                score: `${e.homeScore?.current}-${e.awayScore?.current}`,
                winner: e.winnerCode === 1 ? 'Home' : (e.winnerCode === 2 ? 'Away' : 'Draw'),
                date: new Date(e.startTimestamp * 1000).toLocaleDateString()
            })),
            statistics: statistics,
            marketOdds: odds.map((m: any) => ({
                marketName: m.marketName,
                choices: m.choices?.map((c: any) => ({ name: c.name, fraction: c.fraction }))
            })).slice(0, 5) // Limit to top 5 markets for brevity
        };

        console.log(`🧠 [Prediction API] Context built for ${matchContext.home} vs ${matchContext.away}`);

        // Detect match status to provide appropriate analysis
        const isLive = matchContext.status && !matchContext.status.includes('Not') && matchContext.status !== '0\'';
        const analysisType = isLive ? 'LIVE IN-GAME ANALYSIS' : 'PRE-MATCH PREDICTION';

        let prompt = '';

        if (sport === 'basketball') {
            const isNBA = matchContext.tournament?.toLowerCase().includes('nba');
            const totalMinutes = isNBA ? 48 : 40;
            const currentTotal = homeScore + awayScore;

            prompt = `
            Eres un experto analista de NBA y Baloncesto Internacional (FIBA) hablando en ESPAÑOL.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **TORNEO:** ${matchContext.tournament}
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${matchContext.h2hHistory ? `**HISTORIAL H2H (Últimos 5):** ${JSON.stringify(matchContext.h2hHistory)}` : ''}
            ${isLive ? `**TIEMPO JUGADO:** ${Math.floor((matchContext.timeElapsed || 0) / 60)} min de ${totalMinutes}
            **PROGRESIÓN POR PERIODOS:**
            Local: Q1:${matchContext.periodScores.home?.period1 || 0}, Q2:${matchContext.periodScores.home?.period2 || 0}, Q3:${matchContext.periodScores.home?.period3 || 0}, Q4:${matchContext.periodScores.home?.period4 || 0}
            Visitante: Q1:${matchContext.periodScores.away?.period1 || 0}, Q2:${matchContext.periodScores.away?.period2 || 0}, Q3:${matchContext.periodScores.away?.period3 || 0}, Q4:${matchContext.periodScores.away?.period4 || 0}` : ''}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}

            CRITICAL CONTEXT & MARKETS:
            - ANÁLISIS DE VOLUMEN (PRE-MATCH): Observa el historial H2H. Si los enfrentamientos previos suelen superar los 220 puntos (NBA) o 160 (FIBA), mantén esa tendencia a menos que haya bajas clave.
            - SI ES NBA: Partidos de 48 min. Si el marcador actual ya es alto (ej. 120 total a mitad del partido), el "Under" es muy arriesgado a menos que el ritmo baje drásticamente.
            - SI ES FIBA/LIGAS EUROPEAS: Partidos de 40 min. Ritmo más pausado.
            - ANALIZA EL "PACE" (RITMO): Calcula la proyección final basándote en los puntos actuales vs tiempo transcurrido. NO predigas un total final menor al marcador actual.
            - VALUE BET ANALYSIS: Si el mercado (Odds) ofrece una línea que no coincide con tu análisis de ritmo y volumen histórico, identifícalo como Value Bet.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}", 
                "confidence": 85,
                "reasoning": "Análisis táctico en ESPAÑOL resaltando el ritmo (pace) actual y la proyección de puntos...",
                "bettingTip": "Pick recomendado ajustado al ritmo",
                "advancedMarkets": { "firstQuarter": "...", "drawNoBet": "N/A" },
                "isValueBet": true,
                "valueAnalysis": "Explicación del valor comparando el ritmo actual con las cuotas del mercado...",
                "predictions": {
                    "finalScore": "${isNBA ? '112-105' : '82-78'}",
                    "totalPoints": "${isNBA ? '217' : '160'}",
                    "spread": { "favorite": "${matchContext.home}", "line": -5.5, "recommendation": "Cubrir Hándicap" },
                    "overUnder": { "line": ${isLive ? (currentTotal + 50) : (isNBA ? 222.5 : 158.5)}, "pick": "...", "confidence": "Alta" },
                    "projections": [
                        { "name": "Jugador Estrella 1", "team": "Home", "points": "22.5+", "rebounds": "8.5+", "assists": "5.5+", "confidence": "Alta" },
                        { "name": "Jugador Estrella 2", "team": "Away", "points": "28.5+", "rebounds": "4.5+", "assists": "4.5+", "confidence": "Media" }
                    ],
                    "topPlayers": {
                        "homeTopScorer": { "name": "...", "predictedPoints": ${isNBA ? 25 : 18}, "rebounds": 8, "assists": 5 },
                        "awayTopScorer": { "name": "...", "predictedPoints": ${isNBA ? 28 : 16}, "rebounds": 6, "assists": 4 }
                    }
                },
                "keyFactors": ["Dominio en Puntos (PTS)", "Volumen de Asistencias (AST)", "Control de Rebotes (REB)"]
            }
            `;
        } else if (sport === 'football') {
            prompt = `
            Eres un analista experto de Fútbol/Soccer hablando en ESPAÑOL.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${matchContext.h2hHistory ? `**HISTORIAL H2H (Últimos 5):** ${JSON.stringify(matchContext.h2hHistory)}` : ''}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS ACTUALES:** ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            ANALYZE SPECIAL MARKETS (MAX VALUE):
            - GOLES (UNDER/OVER): Analiza la línea de goles. Si es LIVE, considera el ritmo de juego y ataques peligrosos. Si es PRE, usa el promedio de goles en el H2H. Determina si el valor está en el Over o el Under.
            - REMATES/TIROS: Basado en partidos anteriores (H2H) y estadísticas de temporada, proyecta el total de remates a puerta esperados.
            - ANÁLISIS DE VOLUMEN: Prioriza mercado de "Ambos Anotan" o "Línea de Goles" si los datos muestran alta frecuencia.
            - VALUE BET ANALYSIS: Compara tu probabilidad calculada con el volumen histórico y las cuotas del mercado.
            - DEFINE DETALLES PREMIUM: Incluye proyecciones de jugadores (Goles o Tiros) específicamente masticadas.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Resumen táctico resaltando la tendencia de fueras de juego por la línea defensiva y el volumen de tiros...",
                "bettingTip": "Más de 2.5 Goles y Ambos Anotan",
                "advancedMarkets": { "corners": "Benfica: Mayor número", "shots": "Luis Suarez: 2+ a puerta", "offsides": "Over 3.5 fueras de juego" },
                "isValueBet": false,
                "valueAnalysis": "Por qué la cuota de fueras de juego o tiros tiene valor hoy...",
                "predictions": {
                    "totalGoals": "3",
                    "offsides": { "home": 2, "away": 2, "total": 4 },
                    "overUnder": { "line": 2.5, "pick": "Más de", "confidence": "Alta" },
                    "projections": [
                        { "name": "Delantero Estrella", "team": "Home", "points": "1+", "description": "Goles", "confidence": "Alta" },
                        { "name": "Volante Ofensivo", "team": "Away", "points": "1.5+", "description": "Remates a puerta", "confidence": "Media" }
                    ],
                    "corners": { "home": 5, "away": 3, "total": 8 },
                    "shots": { "home": 12, "away": 8, "onTarget": "6" },
                    "cards": { "yellowCards": 4, "redCards": 0, "details": "Partido con tendencia a faltas tácticas" }
                },
                "keyFactors": ["Volumen de Remates a puerta", "Línea defensiva adelantada (Fueras de juego)", "Historial de remates H2H"]
            }
            `;
        } else if (sport.toLowerCase().includes('american') || sport.toLowerCase().includes('nfl')) {
            prompt = `
            Eres un analista experto de la NFL/Fútbol Americano hablando en ESPAÑOL.
            IMPORTANTE: Estás analizando FÚTBOL AMERICANO. No menciones "Goles", "Corners" ni use términos de fútbol (soccer).
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS ACTUALES:** ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            ANALYZE SPECIAL MARKETS (NFL ELITE):
            - PUNTOS TOTALES (UNDER/OVER): Analiza el volumen de puntos esperado.
            - YARDAS TOTALES: Proyecta el avance ofensivo (Passing + Rushing) basado en el historial y defensa rival.
            - TOUCHDOWNS: Expectativa de anotaciones por equipo.
            - PLAYER PROPS: Yardas de pase (QB), recepción o carrera.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 82,
                "reasoning": "Análisis táctico basado en la ofensiva aérea, protección del QB y eficiencia en Zona Roja...",
                "bettingTip": "${matchContext.home} -3.5 Hándicap",
                "advancedMarkets": { "touchdowns": "Jugador X anotará", "yards": "QB Y Over 250.5 yardas pase", "handicap": "${matchContext.home} -3.5" },
                "predictions": {
                    "totalPoints": "48",
                    "yards": { "home": 350, "away": 310, "total": 660 },
                    "spread": { "favorite": "${matchContext.home}", "line": -3.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 47.5, "pick": "Más de", "confidence": "Alta" },
                    "projections": [
                        { "name": "Quarterback Estrella", "team": "Home", "points": "250.5+", "description": "Yardas de Pase", "confidence": "Alta" },
                        { "name": "Corredor Principal", "team": "Away", "points": "85.5+", "description": "Yardas Carrera", "confidence": "Media" }
                    ],
                    "touchdowns": { "home": 3, "away": 2, "total": 5 }
                },
                "keyFactors": ["Protección del QB", "Eficiencia en 3ra oportunidad", "Estrategia de juego terrestre"]
            }
            `;
        } else if (sport === 'baseball') {
            prompt = `
            You are an expert MLB/Baseball analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS: ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            ANALYZE SPECIAL MARKETS:
            - Run Line (Hándicap)
            - Total Runs (Over/Under)
            - Player Props: Pitcher Strikeouts, Batter Hits/Home Runs.
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 80,
                "reasoning": "Análisis detallado en ESPAÑOL resaltando el pitcheo y bateo...",
                "bettingTip": "Under 8.5 Carreras",
                "advancedMarkets": { "strikeouts": "Pitcher A Over 5.5", "homeRuns": "Player B to hit a Home Run", "runLine": "${matchContext.home} -1.5" },
                "predictions": {
                    "finalScore": "5-3",
                    "totalRuns": "8",
                    "spread": { "favorite": "${matchContext.home}", "line": -1.5, "recommendation": "Win by 2+" },
                    "overUnder": { "line": 8.5, "pick": "Menos de", "confidence": "Media" },
                    "projections": [
                        { "name": "Pitcher A", "team": "Home", "points": "6.5+", "description": "Strikeouts", "confidence": "Alta" },
                        { "name": "Bateador X", "team": "Away", "points": "1.5+", "description": "Hits/Bases Totales", "confidence": "Media" }
                    ]
                },
                "keyFactors": ["Factor MLB 1", "Factor MLB 2", "Factor MLB 3"]
            }
            `;
        } else if (sport.toLowerCase().includes('hockey') || sport.toLowerCase().includes('nhl')) {
            prompt = `
            Eres un analista experto de la NHL/Hockey sobre hielo hablando en ESPAÑOL.
            IMPORTANTE: Estás analizando HOCKEY SOBRE HIELO. No menciones "Fútbol" ni use términos de fútbol como corners o tarjetas.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${matchContext.h2hHistory ? `**HISTORIAL H2H (Últimos 5):** ${JSON.stringify(matchContext.h2hHistory)}` : ''}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS ACTUALES:** ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            ANALYZE SPECIAL MARKETS (NHL ELITE):
            - GOLES (UNDER/OVER): Analiza la línea de goles totales. Considera la eficiencia del Portero y situaciones de Power Play.
            - TIROS A PUERTA (SHOTS ON GOAL): Proyecta el volumen de tiros a puerta basado en el historial H2H y el ritmo ofensivo.
            - Puck Line (-1.5 / +1.5).
            - PLAYER PROPS: Goles o Puntos de jugadores clave.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 78,
                "reasoning": "Resumen basado en el Power Play, tendencia de porteros y ritmo del puck...",
                "bettingTip": "Puck Line ${matchContext.home} -1.5",
                "advancedMarkets": { "shots": "Jugador X Over 3.5 tiros", "puckLine": "${matchContext.home} -1.5", "totalGoals": "Over 5.5" },
                "predictions": {
                    "totalGoals": "6",
                    "puckLine": { "favorite": "${matchContext.home}", "line": -1.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 5.5, "pick": "Más de", "confidence": "Media" },
                    "projections": [
                        { "name": "Jugador Estrella", "team": "Home", "points": "3.5+", "description": "Tiros a puerta", "confidence": "Alta" },
                        { "name": "Portero Titular", "team": "Away", "points": "28.5+", "description": "Atajadas", "confidence": "Media" }
                    ],
                    "shots": { "home": 32, "away": 28, "onTarget": "30" }
                },
                "keyFactors": ["Eficacia en Power Play", "Historial de remates H2H", "Estadísticas del portero"]
            }
            `;
        } else if (sport.toLowerCase().includes('tennis')) {
            prompt = `
            You are an expert Tennis analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            
            ANALYZE SPECIAL MARKETS (TENNIS ELITE):
            - Match Winner (Ganador)
            - Set Betting (Marcador exacto de sets)
            - Game Handicap (Hándicap de juegos)
            - Total Games (Over/Under juegos)
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 85,
                "reasoning": "Análisis de superficie, h2h y momento actual en ESPAÑOL...",
                "bettingTip": "${matchContext.home} gana 2-0",
                "advancedMarkets": { "setBetting": "2-0", "gameHandicap": "${matchContext.home} -3.5", "totalGames": "Under 21.5" },
                "predictions": {
                    "finalScore": "2-0",
                    "totalGames": "20",
                    "spread": { "favorite": "${matchContext.home}", "line": -3.5, "recommendation": "Ganador sólido" },
                    "overUnder": { "line": 21.5, "pick": "Menos de", "confidence": "Alta" }
                },
                "keyFactors": ["Efectividad del primer servicio", "Estadísticas de Break Points", "Adaptación a la superficie"]
            }
            `;
        } else {
            prompt = `
            You are an expert Sports analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status}
            **TOURNAMENT:** ${matchContext.tournament}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}

            RETURN JSON ONLY in SPANISH using standard PredictionResponseSchema.
            `;
        }

        // 2. Call Groq using centralized service
        console.log('🤖 Calling Groq (FAST MODEL) for prediction...');

        const prediction = await groqService.createPrediction({
            messages: [
                {
                    role: "system",
                    content: "Eres un experto analista deportivo. Responde SIEMPRE en JSON válido y en ESPAÑOL. Sé breve, preciso y profesional."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.6,
            max_tokens: 800,
            response_format: { type: "json_object" }
        });

        console.log('✅ Successfully received prediction:', Object.keys(prediction));

        // 3. Increment prediction count for the user
        if (uid) {
            incrementPredictionsUsed(uid).catch((err: any) => console.error('❌ Error incrementing usage:', err));
        }

        // 4. CACHE the result
        const ttl = isLive ? (3 * 60 * 1000) : (60 * 60 * 1000); // 3m for live, 1h for pre-match
        await globalCache.set(cacheKey, prediction, ttl).catch(err => {
            console.error('❌ [Prediction API] Cache set error:', err);
        });

        // 4. MASKING FOR FREE USERS
        if (!isPremiumUser) {
            console.log('🔒 [Prediction API] Masking ELITE content for free user');
            const maskedPrediction = {
                ...prediction,
                bettingTip: '🔒 Desbloquea con Premium',
                advancedMarkets: {
                    message: "🔒 Mercados de alto valor disponibles en Premium",
                    locked: true
                },
                predictions: {
                    ...prediction.predictions,
                    topPlayers: undefined // Premium only
                },
                isMasked: true
            };
            return NextResponse.json(maskedPrediction);
        }

        return NextResponse.json(prediction);

    } catch (error: any) {
        console.error('❌ Prediction API Error:', error.message);
        console.error('Full error:', error);

        // FALLBACK: Generate Realistic Mock Prediction if API fails
        console.log(`⚠️ Falling back to Mock Prediction for ${sport} due to API error`);

        const hName = fallbackHomeName;
        const aName = fallbackAwayName;

        const isHomeFavored = Math.random() > 0.5;
        const winner = isHomeFavored ? hName : aName;
        const loser = isHomeFavored ? aName : hName;

        const isBasketball = sport === 'basketball';

        const mockPrediction: any = {
            winner: winner,
            confidence: 82,
            reasoning: `Basado en la forma reciente y el análisis directo de ${isBasketball ? 'baloncesto' : 'fútbol'}, ${winner} muestra una consistencia superior. Su rendimiento sugiere una alta probabilidad de controlar el ritmo contra ${loser}.`,
            bettingTip: isBasketball
                ? `${winner} ${Math.random() > 0.5 ? '-4.5' : '+2.5'}`
                : (isHomeFavored ? `${winner} gana` : `${winner} +0.5 Hándicap`),
            predictions: {
                finalScore: isBasketball
                    ? `${Math.floor(Math.random() * 20) + 100}-${Math.floor(Math.random() * 20) + 95}`
                    : (isHomeFavored ? '2-1' : '1-2'),
                totalPoints: isBasketball ? '212' : undefined,
                totalGoals: !isBasketball ? '3' : undefined,
            },
            keyFactors: [
                `Forma reciente sólida de ${winner}`,
                isBasketball ? "Ventaja táctica en transición y pick-and-roll" : "Ventaja táctica en transiciones ofensivas",
                "Dominio histórico en este enfrentamiento"
            ],
            isMock: true
        };

        // Add sport-specific stats to mock
        if (isBasketball) {
            mockPrediction.predictions.spread = { favorite: winner, line: -4.5, recommendation: 'Cubrir Hándicap' };
            mockPrediction.predictions.overUnder = { line: 215.5, pick: 'Más de', confidence: 'Media' };
            mockPrediction.predictions.topPlayers = {
                homeTopScorer: { name: 'Jugador Estrella (Local)', predictedPoints: 24, predictedRebounds: 8, predictedAssists: 5 },
                awayTopScorer: { name: 'Jugador Estrella (Visitante)', predictedPoints: 26, predictedRebounds: 6, predictedAssists: 4 }
            };
        } else {
            mockPrediction.predictions.corners = { home: 6, away: 4, total: 10 };
            mockPrediction.predictions.shots = { home: 14, away: 11, onTarget: '5' };
            mockPrediction.predictions.cards = { yellowCards: 3, redCards: 0, details: 'Partido intenso' };
            mockPrediction.predictions.offsides = { total: 4, details: 'Promedio' };
        }

        return NextResponse.json(mockPrediction);
    }
}
