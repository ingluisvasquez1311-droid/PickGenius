import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { groqService } from '@/lib/services/groqService';
import { globalCache, CACHE_STRATEGIES } from '@/lib/utils/api-manager';
import { getUserProfile, incrementPredictionsUsed } from '@/lib/userService';
import { oddsSyncService } from '@/lib/services/oddsSyncService';

export const maxDuration = 60; // Allow longer timeout for AI generation

export async function POST(request: NextRequest) {
    let fallbackHomeName = 'Equipo Local';
    let fallbackAwayName = 'Equipo Visitante';
    let sport = 'football';
    let gameId = '';

    try {
        const body = await request.json().catch(() => ({}));

        if (body.homeTeam || body.homeTeamName) fallbackHomeName = body.homeTeam || body.homeTeamName;
        if (body.awayTeam || body.awayTeamName) fallbackAwayName = body.awayTeam || body.awayTeamName;
        if (body.sport) sport = body.sport;
        if (body.gameId) gameId = body.gameId;
        const uid = body.uid;

        if (!gameId || !sport) {
            return NextResponse.json({ success: false, error: 'Missing gameId or sport' }, { status: 400 });
        }

        let isPremiumUser = false;
        if (uid) {
            const profile = await getUserProfile(uid);
            const isOwner = profile?.email && (
                profile.email.toLowerCase() === 'pickgenius@gmail.com' ||
                profile.email.toLowerCase() === 'ingluisvasquez1311@gmail.com' ||
                profile.email.toLowerCase() === 'luisvasquez1311@gmail.com'
            );
            isPremiumUser = profile?.isPremium || profile?.role === 'admin' || isOwner || false;
        }

        const cacheKey = `prediction:${sport}:${gameId}`;
        const cachedPrediction = await globalCache.get(cacheKey);
        const cacheAge = (cachedPrediction as any)?.generatedAt
            ? Date.now() - new Date((cachedPrediction as any).generatedAt).getTime()
            : Infinity;

        if (cachedPrediction && cacheAge < 5 * 60 * 1000) {
            return NextResponse.json(cachedPrediction);
        }

        const [gameRes, statsRes, oddsRes, h2hRes] = await Promise.all([
            sportsDataService.makeRequest(`/event/${gameId}`).catch(() => null),
            sportsDataService.makeRequest(`/event/${gameId}/statistics`).catch(() => null),
            sportsDataService.getMatchOdds(Number(gameId)).catch(() => null),
            sportsDataService.getMatchH2H(Number(gameId)).catch(() => null)
        ]);

        if (!gameRes) throw new Error("Game not found or provider blocked");

        const event = gameRes.event || gameRes;
        const statistics = statsRes || {};
        const odds = oddsRes?.markets || [];
        const h2h = h2hRes || {};

        const homeScore = event.homeScore?.current || 0;
        const awayScore = event.awayScore?.current || 0;

        const matchContext = {
            sport: sport.toUpperCase(),
            home: event.homeTeam?.name || fallbackHomeName,
            away: event.awayTeam?.name || fallbackAwayName,
            score: `${homeScore} - ${awayScore}`,
            status: event.status?.description || 'Scheduled',
            tournament: event.tournament?.name,
            timeElapsed: event.time?.played,
            h2hHistory: h2h.events?.slice(0, 5).map((e: any) => ({
                score: `${e.homeScore?.current}-${e.awayScore?.current}`,
                winner: e.winnerCode === 1 ? 'Home' : (e.winnerCode === 2 ? 'Away' : 'Draw'),
                date: new Date(e.startTimestamp * 1000).toLocaleDateString()
            })),
            statistics: statistics,
            marketOdds: odds.map((m: any) => ({
                marketName: m.marketName,
                choices: m.choices?.map((c: any) => ({ name: c.name, fraction: c.fraction }))
            })).slice(0, 5)
        };

        let realMarketLine = null;
        try {
            realMarketLine = await oddsSyncService.syncEventOdds(gameId, sport);
            if (!realMarketLine) realMarketLine = await oddsSyncService.getStoredMarketLine(gameId, sport);
        } catch (err) { console.error("Error fetching market line:", err); }

        const isLive = matchContext.status && !matchContext.status.includes('Not') && matchContext.status !== '0\'';
        let prompt = '';

        if (sport === 'basketball') {
            // Robust NBA detection
            const isNBA = matchContext.tournament?.toLowerCase().includes('nba') ||
                matchContext.home?.includes('Pacers') || // Check common teams as fallback
                matchContext.away?.includes('Celtics') ||
                matchContext.home?.includes('Warriors') ||
                matchContext.home?.includes('Lakers');

            const totalMinutes = isNBA ? 48 : 40;
            const currentTotal = homeScore + awayScore;
            const minutesPlayed = Math.floor((matchContext.timeElapsed || 0) / 60);

            const h2hTotals = matchContext.h2hHistory?.map((game: any) => {
                const scores = game.score?.split('-') || [];
                return parseInt(scores[0] || '0') + parseInt(scores[1] || '0');
            }).filter((total: number) => !isNaN(total)) || [];

            const h2hAverage = h2hTotals.length > 0
                ? Math.round(h2hTotals.reduce((a: number, b: number) => a + b, 0) / h2hTotals.length)
                : (isNBA ? 228 : 158);

            const projectedTotal = minutesPlayed > 5 && isLive
                ? Math.round((currentTotal / minutesPlayed) * totalMinutes)
                : h2hAverage;

            // DECISION LINES: Try to find Spread/Handicap from marketOdds too
            const mainOverUnder = realMarketLine?.line || (isNBA ? 226.5 : 158.5);
            const spreadMarket = matchContext.marketOdds?.find((m: any) => m.marketName?.toLowerCase().includes('spread') || m.marketName?.toLowerCase().includes('handicap'));
            const mainSpread = spreadMarket?.choices?.[0]?.name || (isNBA ? "-8.5" : "-4.5");

            prompt = `
            Eres el "Oráculo PickGenius", experto en Betplay Colombia.
            **TORNEO:** ${matchContext.tournament || 'Baloncesto'}
            **LÍNEAS LÍDERES:** O/U ${mainOverUnder}, Hándicap ${mainSpread}

            **OBJETIVO CRÍTICO:**
            Tu misión es dar al cliente la opción MÁS VIABLE para ganar. 
            Busca una línea con "cuota medio-baja" (Alta Probabilidad).

            **INSTRUCCIONES:**
            1. Analiza O/U ${mainOverUnder} y Hándicap ${mainSpread}.
            2. Identifica el "PICK DE ORO": La línea más segura (ej: si el O/U es ${mainOverUnder}, quizás un Over ${mainOverUnder - (isNBA ? 5 : 3)} sea el Pick de Oro).
            3. Proporciona alternativas de valor.

            RETURN JSON:
            {
                "winner": "${matchContext.home}",
                "confidence": 85,
                "reasoning": "...",
                "mostViablePick": {
                    "market": "Total Puntos",
                    "pick": "Más de",
                    "line": ${mainOverUnder + (isNBA ? -4.5 : -3.5)},
                    "rationale": "Esta es la línea más segura basada en el ritmo de anotación proyectado.",
                    "winProbability": "92%"
                },
                "predictions": {
                    "totalPoints": "${isLive ? projectedTotal : mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de/Menos de" },
                    "spread": { "line": "${mainSpread}", "pick": "Cubre" },
                    "alternativePicks": [
                        { "type": "Valor (Riesgo Alto)", "line": ${mainOverUnder + (isNBA ? 6 : 4)}, "pick": "Más de", "rationale": "Para una cuota más agresiva." }
                    ]
                }
            }
            `;
        } else if (sport === 'football') {
            const h2hGoals = matchContext.h2hHistory?.map((game: any) => {
                const scores = game.score?.split('-') || [];
                return parseInt(scores[0] || '0') + parseInt(scores[1] || '0');
            }).filter((total: number) => !isNaN(total)) || [];

            const h2hAvgGoals = h2hGoals.length > 0
                ? (h2hGoals.reduce((a: number, b: number) => a + b, 0) / h2hGoals.length).toFixed(1)
                : '2.5';

            const minutesPlayed = Math.floor((matchContext.timeElapsed || 0) / 60);
            const mainOverUnder = realMarketLine?.line || 2.5;
            const spreadMarket = matchContext.marketOdds?.find((m: any) => m.marketName?.toLowerCase().includes('handicap') || m.marketName?.toLowerCase().includes('asian'));
            const mainSpread = spreadMarket?.choices?.[0]?.name || "-0.5";

            const projectedGoals = minutesPlayed > 10 && isLive
                ? (((homeScore + awayScore) / minutesPlayed) * 90).toFixed(1)
                : h2hAvgGoals;

            prompt = `
            Eres un experto analista de Fútbol hablando en ESPAÑOL.
            **LÍNEAS REALES (BETPLAY COLOMBIA):** O/U: ${mainOverUnder}, Hándicap: ${mainSpread}

            **INSTRUCCIONES:**
            1. Analiza O/U ${mainOverUnder}, Hándicap ${mainSpread}, Córners y Tarjetas.

            RETURN JSON:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Análisis detallado...",
                "predictions": {
                    "totalGoals": "${projectedGoals}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" o "Menos de" },
                    "handicap": { "line": "${mainSpread}", "pick": "Cubre" },
                    "corners": { "total": 9.5, "pick": "Más de" },
                    "cards": { "yellowCards": 4, "pick": "Baja" },
                    "bothTeamsScore": { "pick": "Sí/No", "confidence": "Alta" }
                }
            }
            `;
        } else if (sport.toLowerCase().includes('nfl') || sport.toLowerCase().includes('american')) {
            const mainOverUnder = realMarketLine?.line || 44.5;
            prompt = `
            Analista ELITE de NFL. **LÍNEAS BETPLAY COLOMBIA:** O/U: ${mainOverUnder}.
            Analiza O/U ${mainOverUnder}, Spread y Yardas/Touchdowns.
            
            RETURN JSON:
            {
                "winner": "${matchContext.home}",
                "confidence": 80,
                "reasoning": "Basado en línea de ${mainOverUnder}...",
                "predictions": {
                    "totalPoints": "${mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "spread": { "line": "-3.5", "pick": "Cubre" },
                    "yards": { "total": 350, "pick": "Más de" },
                    "touchdowns": { "total": 4.5, "pick": "Under" }
                }
            }
            `;
        } else if (sport.toLowerCase().includes('nhl') || sport.toLowerCase().includes('hockey')) {
            const mainOverUnder = realMarketLine?.line || 6.0;
            prompt = `
            Experto NHL. **MATCH:** ${matchContext.home} vs ${matchContext.away}.
            **LÍNEAS REALES (BETPLAY COLOMBIA):** O/U: ${mainOverUnder}. Analiza Over/Under ${mainOverUnder} y Puck Line.
            
            RETURN JSON:
            {
                "winner": "${matchContext.home}",
                "confidence": 78,
                "reasoning": "Análisis...",
                "predictions": {
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" o "Menos de" },
                    "puckLine": { "line": "-1.5", "pick": "Cubre" }
                }
            }
            `;
        } else if (sport.toLowerCase().includes('baseball') || sport.toLowerCase().includes('mlb')) {
            const mainOverUnder = realMarketLine?.line || 8.5;
            prompt = `
            Analista MLB. **LÍNEAS BETPLAY COLOMBIA:** O/U: ${mainOverUnder}.
            Analiza Over/Under ${mainOverUnder}, Run Line y First 5 Innings.
            
            RETURN JSON:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Análisis...",
                "predictions": {
                    "totalRuns": "${mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "runLine": { "line": "-1.5", "pick": "Cubre" },
                    "first5": { "pick": "${matchContext.home}", "winner": "${matchContext.home}" }
                }
            }
            `;
        } else if (sport.toLowerCase().includes('tennis')) {
            const mainOverUnder = realMarketLine?.line || 22.5;
            prompt = `
            Experto en Tenis (ATP/WTA). **MATCH:** ${matchContext.home} vs ${matchContext.away}.
            **LÍNEAS BETPLAY COLOMBIA:** Total Juegos (O/U): ${mainOverUnder}. Analiza ganador y sets.
            
            RETURN JSON:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Análisis...",
                "predictions": {
                    "totalGames": "${mainOverUnder}",
                    "overUnder": { "line": ${mainOverUnder}, "pick": "Más de" },
                    "sets": { "home": 2, "away": 0, "pick": "Gana 2-0" }
                }
            }
            `;
        } else {
            prompt = `Analista deportivo experto. Analiza ${matchContext.home} vs ${matchContext.away}.`;
        }

        const prediction = await groqService.createPrediction({
            messages: [
                { role: "system", content: "Responde SIEMPRE en JSON válido y en ESPAÑOL." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const finalResponse = {
            ...prediction,
            generatedAt: new Date().toISOString(),
            isRealTime: isLive,
            sourceVerification: {
                provider: 'Betplay Colombia',
                isVerified: !!realMarketLine,
                lastSync: realMarketLine?.updatedAt || new Date().toISOString(),
                marketMatched: realMarketLine ? 'Confirmado con cuotas locales de Betplay' : 'Línea de referencia Betplay'
            }
        };

        await globalCache.set(cacheKey, finalResponse, isLive ? 120000 : 600000);

        if (!isPremiumUser) {
            return NextResponse.json({ ...finalResponse, bettingTip: '🔒 Premium Only', isMasked: true });
        }

        return NextResponse.json(finalResponse);

    } catch (error: any) {
        return NextResponse.json({
            winner: fallbackHomeName,
            confidence: 50,
            reasoning: "Error en la generación. Fallback activado.",
            predictions: { overUnder: { line: 2.5, pick: "Más de" } }
        });
    }
}
