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

        // --- CACHE LAYER (REDUCED FOR VARIABILITY) ---
        // NOTE: Cache reduced to allow AI to generate fresh predictions more frequently
        const cacheKey = `prediction:${sport}:${gameId}`;
        const cachedPrediction = await globalCache.get(cacheKey);

        // Only use cache if it's very recent (< 5 minutes) to ensure fresh AI analysis
        const cacheAge = (cachedPrediction as any)?.generatedAt
            ? Date.now() - new Date((cachedPrediction as any).generatedAt).getTime()
            : Infinity;

        if (cachedPrediction && cacheAge < 5 * 60 * 1000) { // 5 minutes
            console.log(`🎯 [Prediction API] Returning CACHED prediction for ${gameId} (age: ${Math.round(cacheAge / 1000)}s)`);
            return NextResponse.json(cachedPrediction);
        } else if (cachedPrediction) {
            console.log(`🔄 [Prediction API] Cache expired for ${gameId}, generating fresh prediction`);
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
            const minutesPlayed = Math.floor((matchContext.timeElapsed || 0) / 60);

            // Calculate H2H average total points
            const h2hTotals = matchContext.h2hHistory?.map((game: any) => {
                const scores = game.score?.split('-') || [];
                return parseInt(scores[0] || '0') + parseInt(scores[1] || '0');
            }).filter((total: number) => !isNaN(total)) || [];

            const h2hAverage = h2hTotals.length > 0
                ? Math.round(h2hTotals.reduce((a: number, b: number) => a + b, 0) / h2hTotals.length)
                : (isNBA ? 215 : 160);

            // Projected final score based on current pace
            const projectedTotal = minutesPlayed > 5 && isLive
                ? Math.round((currentTotal / minutesPlayed) * totalMinutes)
                : h2hAverage;

            prompt = `
            Eres un experto analista de NBA y Baloncesto Internacional (FIBA) hablando en ESPAÑOL.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **TORNEO:** ${matchContext.tournament}
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            
            **ANÁLISIS HISTÓRICO (H2H - ÚLTIMOS ${matchContext.h2hHistory?.length || 0} ENFRENTAMIENTOS):**
            ${matchContext.h2hHistory ? JSON.stringify(matchContext.h2hHistory) : 'No disponible'}
            **PROMEDIO DE PUNTOS TOTALES EN H2H:** ${h2hAverage} puntos
            **TOTALES INDIVIDUALES EN H2H:** ${h2hTotals.join(', ')} puntos
            
            ${isLive ? `
            **ANÁLISIS EN VIVO - RITMO DE JUEGO (PACE):**
            - **Tiempo Jugado:** ${minutesPlayed} min de ${totalMinutes}
            - **Puntos Actuales:** ${currentTotal} (${homeScore}-${awayScore})
            - **Ritmo de Puntos por Minuto:** ${(currentTotal / Math.max(minutesPlayed, 1)).toFixed(2)} pts/min
            - **PROYECCIÓN FINAL (basada en ritmo actual):** ${projectedTotal} puntos totales
            - **COMPARACIÓN CON PROMEDIO H2H:** ${projectedTotal > h2hAverage ? `+${projectedTotal - h2hAverage}` : projectedTotal - h2hAverage} puntos vs histórico
            
            **PROGRESIÓN POR PERIODOS:**
            Local: Q1:${matchContext.periodScores.home?.period1 || 0}, Q2:${matchContext.periodScores.home?.period2 || 0}, Q3:${matchContext.periodScores.home?.period3 || 0}, Q4:${matchContext.periodScores.home?.period4 || 0}
            Visitante: Q1:${matchContext.periodScores.away?.period1 || 0}, Q2:${matchContext.periodScores.away?.period2 || 0}, Q3:${matchContext.periodScores.away?.period3 || 0}, Q4:${matchContext.periodScores.away?.period4 || 0}
            ` : ''}
            
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}

            **INSTRUCCIONES CRÍTICAS PARA OVER/UNDER:**
            
            1. **VERIFICACIÓN OBLIGATORIA DE RESULTADOS PREVIOS:**
               - Analiza CADA resultado del H2H
               - Identifica si estos equipos tienden a juegos de MUCHOS o POCOS puntos
               - Considera el promedio histórico: ${h2hAverage} puntos
            
            2. **CÁLCULO DE RITMO (PACE) ${isLive ? '- EN VIVO' : ''}:**
               ${isLive ? `
               - Ritmo actual: ${(currentTotal / Math.max(minutesPlayed, 1)).toFixed(2)} pts/min
               - Proyección final: ${projectedTotal} puntos
               - Si la proyección es >10 puntos MAYOR que el promedio H2H → Tendencia OVER
               - Si la proyección es >10 puntos MENOR que el promedio H2H → Tendencia UNDER
               ` : `
               - Usa el promedio H2H como base: ${h2hAverage} puntos
               - Ajusta según forma reciente y estadísticas defensivas
               `}
            
            3. **DECISIÓN FINAL OVER/UNDER:**
               - Indica SIEMPRE si es 'Más de' (Over) o 'Menos de' (Under)
               - La línea típica es: ${Math.round(h2hAverage / 5) * 5 - 2.5} puntos
               - Justifica tu decisión con el análisis H2H y el ritmo actual
            
            4. **COMBINACIÓN GANADORA (TICKET):**
               - Crea un 'bettingTip' profesional que combine ganador + OVER/UNDER si tiene sentido
               - Ejemplo: 'Local gana y Más de 220.5 Puntos'

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}", 
                "confidence": 85,
                "reasoning": "Análisis táctico MENCIONANDO OBLIGATORIAMENTE: 1) Promedio H2H de ${h2hAverage} puntos, 2) ${isLive ? `Ritmo actual proyecta ${projectedTotal} puntos` : 'Tendencia histórica de estos equipos'}, 3) Recomendación OVER/UNDER justificada...",
                "bettingTip": "Local y Más de 222.5 Puntos",
                "advancedMarkets": { "totalPoints": "Más de 220.5", "playerProp": "Estrella: Más de 25.5 Puntos" },
                "h2hAnalysis": {
                    "averageTotalPoints": ${h2hAverage},
                    "recentTotals": ${JSON.stringify(h2hTotals)},
                    "trend": "OVER" o "UNDER",
                    "confidence": "Alta/Media/Baja"
                },
                ${isLive ? `"liveAnalysis": {
                    "currentPace": ${(currentTotal / Math.max(minutesPlayed, 1)).toFixed(2)},
                    "projectedTotal": ${projectedTotal},
                    "recommendation": "Basado en el ritmo actual..."
                },` : ''}
                "isValueBet": true,
                "valueAnalysis": "El ritmo de anotación proyectado es superior/inferior a la línea de apuesta...",
                "predictions": {
                    "finalScore": "${isNBA ? '112-105' : '82-78'}",
                    "totalPoints": "${projectedTotal}",
                    "spread": { "favorite": "${matchContext.home}", "line": -5.5, "recommendation": "Cubrir Hándicap" },
                    "overUnder": { 
                        "line": ${Math.round(h2hAverage / 5) * 5 - 2.5}, 
                        "pick": "Más de" o "Menos de" (DECIDE basándote en H2H y ritmo), 
                        "confidence": "Alta/Media",
                        "rationale": "El promedio H2H es ${h2hAverage}, ${isLive ? `y el ritmo actual proyecta ${projectedTotal}` : 'y la forma reciente sugiere...'}"
                    },
                    "projections": [
                        { "name": "Jugador Estrella 1", "team": "Home", "points": "22.5+", "description": "Puntos (Más de)", "confidence": "Alta" },
                        { "name": "Jugador Estrella 2", "team": "Away", "points": "28.5+", "description": "Puntos (Más de)", "confidence": "Media" }
                    ]
                },
                "keyFactors": ["Promedio H2H: ${h2hAverage} pts", ${isLive ? `"Ritmo Actual: ${(currentTotal / Math.max(minutesPlayed, 1)).toFixed(2)} pts/min"` : '"Análisis Defensivo"'}, "Tendencia Over/Under en Enfrentamientos Directos"]
            }
            `;
        } else if (sport === 'football') {
            // Calculate H2H average goals
            const h2hGoals = matchContext.h2hHistory?.map((game: any) => {
                const scores = game.score?.split('-') || [];
                return parseInt(scores[0] || '0') + parseInt(scores[1] || '0');
            }).filter((total: number) => !isNaN(total)) || [];

            const h2hAvgGoals = h2hGoals.length > 0
                ? (h2hGoals.reduce((a: number, b: number) => a + b, 0) / h2hGoals.length).toFixed(1)
                : '2.5';

            const currentGoals = homeScore + awayScore;
            const minutesPlayed = Math.floor((matchContext.timeElapsed || 0) / 60);
            const projectedGoals = minutesPlayed > 10 && isLive
                ? ((currentGoals / minutesPlayed) * 90).toFixed(1)
                : h2hAvgGoals;

            prompt = `
            Eres un analista experto de Fútbol/Soccer hablando en ESPAÑOL.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            
            **ANÁLISIS HISTÓRICO H2H:**
            ${matchContext.h2hHistory ? JSON.stringify(matchContext.h2hHistory) : 'No disponible'}
            **PROMEDIO DE GOLES EN H2H:** ${h2hAvgGoals} goles
            **GOLES INDIVIDUALES EN H2H:** ${h2hGoals.join(', ')}
            
            ${isLive ? `**ANÁLISIS EN VIVO:**
            - Minutos: ${minutesPlayed}'
            - Goles actuales: ${currentGoals}
            - Ritmo: ${(currentGoals / Math.max(minutesPlayed, 1) * 90).toFixed(2)} goles/90min
            - **PROYECCIÓN:** ${projectedGoals} goles totales
            - **VS PROMEDIO H2H:** ${parseFloat(projectedGoals) > parseFloat(h2hAvgGoals) ? 'OVER' : 'UNDER'} tendencia
            ` : ''}
            **MARKET ODDS:** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `**STATS:** ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            **INSTRUCCIONES CRÍTICAS:**
            1. **VERIFICAR H2H:** Promedio ${h2hAvgGoals} goles → tendencia histórica
            2. **GOLES OVER/UNDER:** Línea típica 2.5. Decide basándote en H2H ${isLive ? `y ritmo actual (${projectedGoals} proyectados)` : ''}
            3. **CÓRNERS:** Analiza histórico y proyecta total
            4. **AMBOS ANOTAN (BTTS):** Verifica patrones en H2H

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "MENCIONAR: 1) Promedio H2H ${h2hAvgGoals} goles, 2) ${isLive ? `Proyección ${projectedGoals} goles` : 'Tendencia histórica'}, 3) Justificación OVER/UNDER...",
                "bettingTip": "Local + Más de 2.5 Goles",
                "h2hAnalysis": {
                    "averageGoals": ${h2hAvgGoals},
                    "recentTotals": ${JSON.stringify(h2hGoals)},
                    "trend": "OVER o UNDER"
                },
                "advancedMarkets": { "corners": "Más de 9.5", "cards": "Menos de 4.5" },
                "predictions": {
                    "totalGoals": "${projectedGoals}",
                    "overUnder": { 
                        "line": 2.5, 
                        "pick": "Decide basado en ${h2hAvgGoals} (H2H) ${isLive ? `y ${projectedGoals} (proyección)` : ''}", 
                        "confidence": "Alta/Media",
                        "rationale": "Promedio H2H: ${h2hAvgGoals}, ${isLive ? `Proyección actual: ${projectedGoals}` : 'tendencia sugiere...'}"
                    },
                    "bothTeamsScore": { "pick": "Sí/No", "confidence": "Media" },
                    "corners": { "total": 10, "pick": "Más de", "line": 9.5 },
                    "cards": { "yellowCards": 4, "redCards": 0, "pick": "Menos de", "line": 4.5 }
                },
                "keyFactors": ["Promedio H2H: ${h2hAvgGoals} goles", ${isLive ? `"Ritmo: ${(currentGoals / Math.max(minutesPlayed, 1) * 90).toFixed(1)} goles/90'"` : '"Análisis Ofensivo"'}, "Tendencia Over/Under Histórica"]
            }
            `;
        } else if (sport.toLowerCase().includes('american') || sport.toLowerCase().includes('nfl')) {
            // Calculate H2H average points for NFL
            const h2hPoints = matchContext.h2hHistory?.map((game: any) => {
                const scores = game.score?.split('-') || [];
                return parseInt(scores[0] || '0') + parseInt(scores[1] || '0');
            }).filter((total: number) => !isNaN(total)) || [];

            const h2hAvgPoints = h2hPoints.length > 0
                ? Math.round(h2hPoints.reduce((a: number, b: number) => a + b, 0) / h2hPoints.length)
                : 45;

            const currentPoints = homeScore + awayScore;
            const projectedPoints = isLive && currentPoints > 0
                ? Math.round((currentPoints / ((matchContext.timeElapsed || 0) / 3600)) * 1) // 1 hour game
                : h2hAvgPoints;

            prompt = `
            Eres un analista ELITE de la NFL/Fútbol Americano hablando en ESPAÑOL.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            
            **ANÁLISIS H2H:**
            ${matchContext.h2hHistory ? JSON.stringify(matchContext.h2hHistory) : 'No disponible'}
            **PROMEDIO PUNTOS H2H:** ${h2hAvgPoints} puntos
            **TOTALES H2H:** ${h2hPoints.join(', ')}
            ${isLive ? `**PROYECCIÓN ACTUAL:** ${projectedPoints} puntos` : ''}
            
            **INSTRUCCIONES:**
            1. Verificar H2H: ${h2hAvgPoints} puntos promedio
            2. OVER/UNDER: Línea típica 44.5-47.5, decidir con H2H ${isLive ? `+ proyección (${projectedPoints})` : ''}
            3. Prohibido mencionar "Goles" o "Corners"

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 82,
                "reasoning": "INCLUIR: 1) Promedio H2H ${h2hAvgPoints} pts, 2) ${isLive ? `Proyección ${projectedPoints} pts` : 'Análisis defensivo'}, 3) Recomendación...",
                "bettingTip": "${matchContext.home} y Más de 44.5 Puntos",
                "h2hAnalysis": {
                    "averagePoints": ${h2hAvgPoints},
                    "recentTotals": ${JSON.stringify(h2hPoints)},
                    "trend": "OVER o UNDER"
                },
                "advancedMarkets": { "touchdowns": "Más de 4.5", "yards": "QB: Más de 265.5 yardas" },
                "predictions": {
                    "totalPoints": "${projectedPoints}",
                    "overUnder": { 
                        "line": ${Math.round(h2hAvgPoints / 5) * 5 - 2.5}, 
                        "pick": "Decide con H2H (${h2hAvgPoints}) ${isLive ? `+ proyección (${projectedPoints})` : ''}", 
                        "confidence": "Alta",
                        "rationale": "H2H: ${h2hAvgPoints} pts${isLive ? `, proyección: ${projectedPoints} pts` : ''}"
                    },
                    "touchdowns": { "total": 5, "pick": "Más de", "line": 4.5 }
                },
                "keyFactors": ["Promedio H2H: ${h2hAvgPoints} pts", "Presión al QB", "Eficiencia Zona Roja"]
            }
            `;
        } else if (sport.toLowerCase().includes('hockey') || sport.toLowerCase().includes('nhl')) {
            // Calculate H2H average goals for Hockey
            const h2hGoals = matchContext.h2hHistory?.map((game: any) => {
                const scores = game.score?.split('-') || [];
                return parseInt(scores[0] || '0') + parseInt(scores[1] || '0');
            }).filter((total: number) => !isNaN(total)) || [];

            const h2hAvgGoals = h2hGoals.length > 0
                ? (h2hGoals.reduce((a: number, b: number) => a + b, 0) / h2hGoals.length).toFixed(1)
                : '5.5';

            const currentGoals = homeScore + awayScore;
            const projectedGoals = isLive && currentGoals > 0
                ? (currentGoals * 1.2).toFixed(1) // Simple projection
                : h2hAvgGoals;

            prompt = `
            Eres un analista experto de la NHL y Hockey sobre hielo hablando en ESPAÑOL.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            
            **ANÁLISIS H2H:**
            ${matchContext.h2hHistory ? JSON.stringify(matchContext.h2hHistory) : 'No disponible'}
            **PROMEDIO GOLES H2H:** ${h2hAvgGoals} goles
            **TOTALES H2H:** ${h2hGoals.join(', ')}
            ${isLive ? `**PROYECCIÓN:** ${projectedGoals} goles` : ''}
            
            **INSTRUCCIONES:**
            1. Verificar H2H: ${h2hAvgGoals} goles promedio
            2. OVER/UNDER: Línea típica 5.5-6.5, decidir con H2H ${isLive ? `+ proyección (${projectedGoals})` : ''}
            3. Prohibido mencionar "Fútbol" o "Corners"

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 78,
                "reasoning": "INCLUIR: 1) Promedio H2H ${h2hAvgGoals} goles, 2) ${isLive ? `Proyección ${projectedGoals}` : 'Power Play'}, 3) Recomendación...",
                "bettingTip": "Local y Más de 5.5 Goles",
                "h2hAnalysis": {
                    "averageGoals": ${h2hAvgGoals},
                    "recentTotals": ${JSON.stringify(h2hGoals)},
                    "trend": "OVER o UNDER"
                },
                "advancedMarkets": { "totalGoals": "Más de 5.5", "shots": "SOG: Más de 31.5" },
                "predictions": {
                    "totalGoals": "${projectedGoals}",
                    "puckLine": { "favorite": "${matchContext.home}", "line": -1.5, "recommendation": "Cubrir" },
                    "overUnder": { 
                        "line": ${parseFloat(h2hAvgGoals) > 6 ? 6.5 : 5.5}, 
                        "pick": "Decide con H2H (${h2hAvgGoals})${isLive ? ` + proyección (${projectedGoals})` : ''}", 
                        "confidence": "Media",
                        "rationale": "H2H: ${h2hAvgGoals} goles${isLive ? `, proyección: ${projectedGoals}` : ''}"
                    },
                    "shots": { "total": 62, "pick": "Más de", "line": 58.5 }
                },
                "keyFactors": ["Promedio H2H: ${h2hAvgGoals} goles", "Power Play", "Forma del Portero"]
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

        // 2. Call Groq using centralized service with INCREASED VARIABILITY
        console.log('🤖 Calling Groq (FAST MODEL) for prediction...');

        // Add temporal context for uniqueness in each request
        const requestTimestamp = new Date().toISOString();
        const enhancedPrompt = `${prompt}\n\n**ANALYSIS TIMESTAMP:** ${requestTimestamp}\n**INSTRUCTION:** Provide a UNIQUE and FRESH analysis. Vary your perspective and betting recommendations even for the same match.`;

        const prediction = await groqService.createPrediction({
            messages: [
                {
                    role: "system",
                    content: "Eres un experto analista deportivo. Responde SIEMPRE en JSON válido y en ESPAÑOL. Sé breve, preciso y profesional. IMPORTANTE: Genera análisis ÚNICOS y VARIADOS incluso para el mismo partido, considerando diferentes ángulos tácticos y factores contextuales."
                },
                {
                    role: "user",
                    content: enhancedPrompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.8, // Increased from 0.6 for more variation
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

        // SMART RANKING: Detect Value (BEFORE finalResponse creation)
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

        // 4. CACHE the result (REDUCED TTL for more variability)
        const ttl = isLive ? (2 * 60 * 1000) : (10 * 60 * 1000); // 2m for live, 10m for pre-match
        await globalCache.set(cacheKey, finalResponse, ttl).catch(err => {
            console.error('❌ [Prediction API] Cache set error:', err);
        });

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
