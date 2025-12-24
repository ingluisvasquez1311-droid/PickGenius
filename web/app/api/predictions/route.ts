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
            - PUNTOS (TOTALES): Indica SIEMPRE si es 'Más de' (Over) o 'Menos de' (Under).
            - ANALIZA EL "PACE" (RITMO): Calcula la proyección final basándote en los puntos actuales vs tiempo transcurrido.
            - COMBINACIÓN GANADORA (TICKET): Crea un 'bettingTip' profesional que combine varios factores si tiene sentido (ej: 'Ganador Local y Más de 220.5 Puntos').
            - VALUE BET ANALYSIS: Si el mercado ofrece una línea desajustada con el ritmo actual, indícalo.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}", 
                "confidence": 85,
                "reasoning": "Análisis táctico resaltando el ritmo (pace) actual y la proyección de puntos...",
                "bettingTip": "Local y Más de 222.5 Puntos",
                "advancedMarkets": { "totalPoints": "Más de 220.5", "playerProp": "Estrella: Más de 25.5 Puntos" },
                "isValueBet": true,
                "valueAnalysis": "El ritmo de anotación proyectado es superior a la línea de apuesta...",
                "predictions": {
                    "finalScore": "${isNBA ? '112-105' : '82-78'}",
                    "totalPoints": "${isNBA ? '217' : '160'}",
                    "spread": { "favorite": "${matchContext.home}", "line": -5.5, "recommendation": "Cubrir Hándicap" },
                    "overUnder": { "line": ${isLive ? (currentTotal + 50) : (isNBA ? 222.5 : 158.5)}, "pick": "Más de", "confidence": "Alta" },
                    "projections": [
                        { "name": "Jugador Estrella 1", "team": "Home", "points": "22.5+", "description": "Puntos (Más de)", "confidence": "Alta" },
                        { "name": "Jugador Estrella 2", "team": "Away", "points": "28.5+", "description": "Puntos (Más de)", "confidence": "Media" }
                    ]
                },
                "keyFactors": ["Dominio en Puntos (PTS)", "Ritmo de Juego (PACE)", "Control de Rebotes (REB)"]
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
            
            ANALYZE SPECIAL MARKETS (FOOTBALL ELITE - MERCADOS SECUNDARIOS):
            - GOLES (UNDER/OVER): Analiza la línea de goles. Indica SIEMPRE si es 'Más de' (Over) o 'Menos de' (Under) y la línea (ej: 2.5).
            - AMBOS EQUIPOS ANOTAN (BTTS): Predice si ambos equipos anotarán al menos 1 gol (Sí/No).
            - PRIMER GOL: Predice qué equipo anotará primero (Local/Visitante/Ninguno).
            - RESULTADO AL DESCANSO/FINAL (HT/FT): Combinación de resultado.
            - TARJETAS TOTALES: Total de tarjetas. Indica SIEMPRE si es 'Más de' o 'Menos de' y la línea (ej: 4.5).
            - CÓRNERS: Proyecta el total. Indica SIEMPRE si es 'Más de' o 'Menos de' y la línea (ej: 9.5).
            - COMBINACIÓN GANADORA (TICKET): Crea una recomendación de ALTO VALOR.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Resumen táctico...",
                "bettingTip": "Local + Más de 2.5 Goles",
                "advancedMarkets": { "corners": "Más de 9.5", "cards": "Menos de 4.5" },
                "predictions": {
                    "totalGoals": "3",
                    "offsides": { "total": 4, "pick": "Más de" },
                    "overUnder": { "line": 2.5, "pick": "Más de", "confidence": "Alta" },
                    "bothTeamsScore": { "pick": "Sí", "confidence": "Media" },
                    "corners": { "total": 10, "pick": "Más de", "line": 9.5 },
                    "cards": { "yellowCards": 4, "redCards": 0, "pick": "Menos de", "line": 4.5, "details": "Árbitro permisivo" }
                },
                "keyFactors": ["Volumen de Remates", "Historial de Córners"]
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
            - PUNTOS TOTALES (UNDER/OVER): Analiza el volumen de puntos esperado. Indica SIEMPRE si es 'Más de' (Over) o 'Menos de' (Under).
            - YARDAS TOTALES: Proyecta yardas de pase/carrera. Indica SIEMPRE si es 'Más de' o 'Menos de'.
            - TOUCHDOWNS: Total de anotaciones. Indica SIEMPRE si es 'Más de' o 'Menos de'.
            - COMBINACIÓN GANADORA (TICKET): Ejemplo: 'Ganador Local y Más de 45.5 Puntos'.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 82,
                "reasoning": "Análisis táctico basado en la ofensiva aérea y eficiencia en Zona Roja...",
                "bettingTip": "${matchContext.home} y Más de 44.5 Puntos",
                "advancedMarkets": { "touchdowns": "Más de 4.5", "yards": "QB: Más de 250.5 yardas" },
                "predictions": {
                    "totalPoints": "48",
                    "yards": { "total": 660, "pick": "Más de" },
                    "spread": { "favorite": "${matchContext.home}", "line": -3.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 47.5, "pick": "Más de", "confidence": "Alta" },
                    "projections": [
                        { "name": "Quarterback Estrella", "team": "Home", "points": "250.5+", "description": "Yardas de Pase (Más de)", "confidence": "Alta" },
                        { "name": "Corredor Principal", "team": "Away", "points": "85.5+", "description": "Yardas Carrera (Más de)", "confidence": "Media" }
                    ],
                    "touchdowns": { "total": 5, "pick": "Más de" }
                },
                "keyFactors": ["Protección del QB", "Eficiencia en 3ra oportunidad", "Estrategia de juego terrestre"]
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
            - GOLES (UNDER/OVER): Indica SIEMPRE si es 'Más de' (Over) o 'Menos de' (Under).
            - TIROS A PUERTA: Proyecta el total. Indica SIEMPRE si es 'Más de' o 'Menos de'.
            - COMBINACIÓN GANADORA (TICKET): Ejemplo: 'Ganador Local y Más de 5.5 Goles'.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 78,
                "reasoning": "Análisis basado en Power Play y eficiencia del portero...",
                "bettingTip": "Local y Más de 5.5 Goles",
                "advancedMarkets": { "totalGoals": "Más de 5.5", "shots": "Más de 30.5" },
                "predictions": {
                    "totalGoals": "6",
                    "puckLine": { "favorite": "${matchContext.home}", "line": -1.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 5.5, "pick": "Más de", "confidence": "Media" },
                    "projections": [
                        { "name": "Jugador Estrella", "team": "Home", "points": "3.5+", "description": "Tiros (Más de)", "confidence": "Alta" },
                        { "name": "Portero Titular", "team": "Away", "points": "28.5+", "description": "Atajadas (Más de)", "confidence": "Media" }
                    ],
                    "shots": { "total": 60, "pick": "Más de" }
                },
                "keyFactors": ["Power Play", "Estadísticas del portero", "Ritmo de juego"]
            }
            `;
        } else if (sport.toLowerCase().includes('tennis')) {
            prompt = `
            You are an expert Tennis analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            
            ANALYZE SPECIAL MARKETS (TENNIS ELITE):
            - TOTAL GAMES (OVER/UNDER): Indica SIEMPRE si es 'Más de' (Over) o 'Menos de' (Under).
            - COMBINACIÓN GANADORA (TICKET): Ejemplo: 'Ganador Local y Más de 20.5 Juegos'.
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 85,
                "reasoning": "Análisis de superficie y momento actual...",
                "bettingTip": "Local y Menos de 21.5 Juegos",
                "advancedMarkets": { "setBetting": "2-0", "totalGames": "Menos de 21.5" },
                "predictions": {
                    "finalScore": "2-0",
                    "totalGames": "20",
                    "spread": { "favorite": "${matchContext.home}", "line": -3.5, "recommendation": "Ganador" },
                    "overUnder": { "line": 21.5, "pick": "Menos de", "confidence": "Alta" }
                },
                "keyFactors": ["Servicio", "Adaptación a superficie", "H2H"]
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
            // NEW: Christmas Props Mock
            mockPrediction.predictions.playerProps = {
                threes: { player: "Stephen Curry", line: 4.5, pick: "Más de" },
                pra: { player: "LeBron James", line: 42.5, pick: "Menos de" }
            };
            mockPrediction.predictions.quarterMarkets = {
                raceTo20: { pick: winner, confidence: "Media" },
                firstQuarter: { pick: `${winner} -1.5`, confidence: "Alta" }
            };
        } else {
            mockPrediction.predictions.corners = { home: 6, away: 4, total: 10, pick: 'Más de', line: 9.5 };
            mockPrediction.predictions.shots = { home: 14, away: 11, onTarget: '5' };
            mockPrediction.predictions.cards = { yellowCards: 3, redCards: 0, pick: 'Menos de', line: 4.5, details: 'Partido intenso' };
            mockPrediction.predictions.offsides = { total: 4, details: 'Promedio' };
        }

        return NextResponse.json(mockPrediction);
    }
}
