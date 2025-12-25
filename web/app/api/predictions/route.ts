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
            Eres un analista ELITE de la NFL/Fútbol Americano (American Football) hablando en ESPAÑOL.
            IMPORTANTE: Estás analizando FÚTBOL AMERICANO. 
            PROHIBIDO: No menciones "Goles", "Corners", "Pelota de cristal", ni términos de soccer.
            USA TÉRMINOS TÉCNICOS: Touchdowns (TD), field goals, yardas aéreas/terrestres, intercepciones, fumbles, sacks, conversión de 3ra down.

            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            **MARKET ODDS (Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS ACTUALES:** ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            ANALYZE ELITE NFL MARKETS:
            - PUNTOS TOTALES (UNDER/OVER): Analiza el volumen de puntos esperado. Indica SIEMPRE si es 'Más de' o 'Menos de' y la línea (ej: 44.5).
            - PROP DE JUGADOR (QB/RB/WR): Basado en el match-up secundario.
            - SPREAD (HÁNDICAP): ¿Cubrirá el favorito la línea de puntos?
            - COMBINACIÓN GANADORA: Ejemplo: 'Ganador Local y Over 45.5 Puntos'.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 82,
                "reasoning": "Análisis basado en la presión al QB rival y la debilidad en la defensa secundaria...",
                "bettingTip": "${matchContext.home} y Más de 44.5 Puntos",
                "advancedMarkets": { "touchdowns": "Más de 4.5", "yards": "QB: Más de 265.5 yardas aéreas" },
                "predictions": {
                    "totalPoints": "48",
                    "yards": { "total": 660, "pick": "Más de", "line": 640.5 },
                    "spread": { "favorite": "${matchContext.home}", "line": -3.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 47.5, "pick": "Más de", "confidence": "Alta" },
                    "projections": [
                        { "name": "Jugador Clave 1", "team": "Home", "points": "250.5+", "description": "Yardas de Pase", "confidence": "Alta" },
                        { "name": "Jugador Clave 2", "team": "Away", "points": "85.5+", "description": "Yardas de Carrera", "confidence": "Media" }
                    ],
                    "touchdowns": { "total": 5, "pick": "Más de", "line": 4.5 }
                },
                "keyFactors": ["Presión al Quarterback (Pass Rush)", "Eficiencia en Zona Roja (Red Zone)", "Control del Reloj (Time of Possession)"]
            }
            `;
        } else if (sport.toLowerCase().includes('hockey') || sport.toLowerCase().includes('nhl')) {
            prompt = `
            Eres un analista experto de la NHL y Hockey sobre hielo hablando en ESPAÑOL.
            IMPORTANTE: Estás analizando HOCKEY. 
            PROHIBIDO: No menciones "Fútbol", "Corners" o "Penalties" de fútbol.
            USA TÉRMINOS TÉCNICOS: Puck, Power Play, Penalty Kill, Shot on Goal (SOG), Save Percentage, Periodos (no tiempos), Vacíos (Empty Net).

            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${matchContext.h2hHistory ? `**HISTORIAL H2H:** ${JSON.stringify(matchContext.h2hHistory)}` : ''}
            **MARKET ODDS (Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS ACTUALES:** ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            ANALYZE NHL PERFORMANCE:
            - GOLES TOTALES (UNDER/OVER): Típicamente línea 5.5 o 6.5. Indica 'Más de' o 'Menos de'.
            - PUCK LINE: Hándicap de -1.5 o +1.5.
            - TIROS A PUERTA (SOG): Basado en el volumen ofensivo.
            - COMBINACIÓN GANADORA: Ejemplo: 'Local gana y Under 6.5 Goles'.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 78,
                "reasoning": "Sólido Power Play y un portero que mantiene un .920 de porcentaje de paradas...",
                "bettingTip": "Local y Más de 5.5 Goles",
                "advancedMarkets": { "totalGoals": "Más de 5.5", "shots": "SOG: Más de 31.5" },
                "predictions": {
                    "totalGoals": "6",
                    "puckLine": { "favorite": "${matchContext.home}", "line": -1.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 5.5, "pick": "Más de", "confidence": "Media" },
                    "projections": [
                        { "name": "Jugador Estrella", "team": "Home", "points": "3.5+", "description": "Tiros (Más de)", "confidence": "Alta" },
                        { "name": "Portero", "team": "Away", "points": "28.5+", "description": "Atajadas (Más de)", "confidence": "Media" }
                    ],
                    "shots": { "total": 62, "pick": "Más de", "line": 58.5 }
                },
                "keyFactors": ["Efectividad en Power Play", "Forma del Portero (GAA)", "Fuerza del Penalty Kill"]
            }
            `;
        } else if (sport.toLowerCase().includes('tennis')) {
            prompt = `
            Eres un analista ELITE de Tenis (ATP/WTA/ITF) hablando en ESPAÑOL.
            IMPORTANTE: Análisis profesional de pista.
            PROHIBIDO: No menciones "Goles" o "Minutos".
            USA TÉRMINOS TÉCNICOS: Sets, juegos, breaks, doble falta, ace, match points, superficie (arcilla/dura/hierba).

            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status}
            **TORNEO:** ${matchContext.tournament}
            **MARKET ODDS (Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${matchContext.h2hHistory ? `**H2H:** ${JSON.stringify(matchContext.h2hHistory)}` : ''}
            
            ANALYZE TENNIS PERFORMANCE:
            - GANADOR DEL PARTIDO: Probabilidad de victoria.
            - TOTAL JUEGOS: Indica 'Más de' o 'Menos de' y la línea (ej: 21.5).
            - SET BETTING: Predice el resultado exacto en sets (ej: 2-0 o 2-1).
            - COMBINACIÓN GANADORA: Ejemplo: 'Local gana y Over 20.5 Juegos'.
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 85,
                "reasoning": "Gran dominio del primer servicio y alta efectividad en puntos de quiebre...",
                "bettingTip": "Local y Menos de 21.5 Juegos",
                "advancedMarkets": { "setBetting": "2-0", "totalGames": "Menos de 21.5" },
                "predictions": {
                    "finalScore": "2-0",
                    "totalGames": "20",
                    "sets": { "home": 2, "away": 0 },
                    "spread": { "favorite": "${matchContext.home}", "line": -3.5, "recommendation": "Ganador Directo" },
                    "overUnder": { "line": 21.5, "pick": "Menos de", "confidence": "Alta" }
                },
                "keyFactors": ["Potencia de primer saque", "Adaptación a la superficie", "Gestión de momentos bajo presión"]
            }
            `;
        } else if (sport.toLowerCase().includes('baseball') || sport.toLowerCase().includes('mlb')) {
            prompt = `
            Eres un analista ELITE de la MLB y Béisbol hablando en ESPAÑOL.
            IMPORTANTE: Estás analizando BÉISBOL.
            PROHIBIDO: No menciones "Goles", "Córners" o "Canastas".
            USA TÉRMINOS TÉCNICOS: Innings (entradas), carreras, hits, errores, bullpen, abridor, ERA, WHIP, Home Runs, Run Line.

            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status}
            **MARKET ODDS (Real):** ${JSON.stringify(matchContext.marketOdds)}
            
            ANALYZE DIAMOND PERFORMANCE:
            - RUN LINE (HÁNDICAP): Línea de -1.5 o +1.5. ¿Puede el favorito ganar por 2 o más?
            - CARRERAS TOTALES: Indica 'Más de' o 'Menos de' y la línea (ej: 8.5).
            - PRIMERAS 5 ENTRADAS (F5): ¿Quién domina al inicio con el abridor?
            - COMBINACIÓN GANADORA: Ejemplo: 'Local gana y Over 7.5 Carreras'.
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Superioridad del abridor local frente a un bullpen cansado del equipo visitante...",
                "bettingTip": "${matchContext.home} gana (Moneyline)",
                "advancedMarkets": { "runLine": "-1.5", "totalRuns": "Más de 7.5" },
                "predictions": {
                    "finalScore": "6-3",
                    "totalRuns": "9",
                    "runLine": { "favorite": "${matchContext.home}", "line": -1.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 8.5, "pick": "Más de", "confidence": "Media" },
                    "first5": { "winner": "${matchContext.home}", "pick": "Local" }
                },
                "keyFactors": ["Duelo de Abridores (ERA)", "Profundidad del Bullpen", "Clima y dirección del viento"]
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

        // --- PROACTIVE QA: Validate AI Content ---
        const validateAI = (p: any) => {
            if (!p.winner || !p.confidence || !p.reasoning) return false;
            if (p.reasoning.includes('[') || p.reasoning.includes('INSERT')) return false;
            if (p.confidence < 10 || p.confidence > 100) return false;
            return true;
        };

        if (!validateAI(prediction)) {
            console.warn('⚠️ [QA Failed] AI prediction contains placeholders or invalid data. Triggering fallback.');
            throw new Error("AI Content QA Failed");
        }

        // 3. Increment prediction count for the user
        if (uid) {
            incrementPredictionsUsed(uid).catch((err: any) => console.error('❌ Error incrementing usage:', err));
        }

        // 4. CACHE the result
        const ttl = isLive ? (3 * 60 * 1000) : (60 * 60 * 1000); // 3m for live, 1h for pre-match
        await globalCache.set(cacheKey, prediction, ttl).catch(err => {
            console.error('❌ [Prediction API] Cache set error:', err);
        });

        // SMART RANKING: Detect Value
        let isValueBet = false;
        let valueScore = 0;

        try {
            const homeOdds = matchContext.marketOdds?.find((m: any) => m.marketName === '1x2' || m.marketName === 'Full Time')?.choices?.find((c: any) => c.name === '1')?.fraction;
            const awayOdds = matchContext.marketOdds?.find((m: any) => m.marketName === '1x2' || m.marketName === 'Full Time')?.choices?.find((c: any) => c.name === '2')?.fraction;

            const winningTeam = (prediction as any).winner;
            const confidence = (prediction as any).confidence || 0;

            // Attempt to derive odds from context if possible
            const targetOdds = winningTeam === matchContext.home ? homeOdds : awayOdds;

            if (targetOdds && targetOdds > 1 && confidence > 0) {
                const marketProb = (1 / targetOdds) * 100;
                // Si la IA tiene un 12% más de confianza que el mercado (Value Hunter)
                if (confidence > (marketProb + 12)) {
                    isValueBet = true;
                    valueScore = Math.round(confidence - marketProb);
                }
            }
        } catch (e) {
            console.error("Error calculating value:", e);
        }

        const finalResponse: any = {
            ...prediction,
            isValueBet,
            valueScore,
            aiModel: 'Groq-Llama3-Premium',
            isRealTime: isLive,
            generatedAt: new Date().toISOString()
        };

        // 4. MASKING FOR FREE USERS
        if (!isPremiumUser) {
            console.log('🔒 [Prediction API] Masking ELITE content for free user');
            const maskedPrediction = {
                ...finalResponse,
                bettingTip: '🔒 Desbloquea con Premium',
                advancedMarkets: {
                    message: "🔒 Mercados de alto valor disponibles en Premium",
                    locked: true
                },
                predictions: {
                    ...finalResponse.predictions,
                    topPlayers: undefined // Premium only
                },
                isMasked: true
            };
            return NextResponse.json(maskedPrediction);
        }

        return NextResponse.json(finalResponse);

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
            // NEW: Christmas Props Mock - GENERIC FALLBACK
            mockPrediction.predictions.playerProps = {
                threes: { player: "Jugador Estrella (Local)", line: 2.5, pick: "Más de" },
                pra: { player: "Jugador Estrella (Visitante)", line: 20.5, pick: "Menos de" }
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
