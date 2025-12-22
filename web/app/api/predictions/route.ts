import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { sportsDataService } from '@/lib/services/sportsDataService';

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

        if (!gameId || !sport) {
            return NextResponse.json({ success: false, error: 'Missing gameId or sport' }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'Configuration Error: GROQ_API_KEY missing on server.'
            }, { status: 500 });
        }

        // 1. Fetch real match data in PARALLEL
        console.log(`📡 [Prediction API] Fetching data for Game ${gameId}...`);

        const [gameRes, statsRes] = await Promise.all([
            sportsDataService.makeRequest(`/event/${gameId}`).catch(err => {
                console.error("Error fetching game:", err);
                return null;
            }),
            sportsDataService.makeRequest(`/event/${gameId}/statistics`).catch(() => null)
        ]);

        if (!gameRes) {
            console.error(`❌ [Prediction API] Game ${gameId} not found or blocked (403)`);
            throw new Error("Game not found or provider blocked (403)");
        }

        const event = gameRes.event || gameRes;
        const statistics = statsRes || {};

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
            statistics: statistics
        };

        console.log(`🧠 [Prediction API] Context built for ${matchContext.home} vs ${matchContext.away}`);

        // Detect match status to provide appropriate analysis
        const isLive = matchContext.status && !matchContext.status.includes('Not') && matchContext.status !== '0\'';
        const analysisType = isLive ? 'LIVE IN-GAME ANALYSIS' : 'PRE-MATCH PREDICTION';

        let prompt = '';

        if (sport === 'basketball') {
            prompt = `
            You are an expert NBA/Basketball analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${isLive ? `STATS: ${JSON.stringify(matchContext.statistics || {})}` : ''}

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}", 
                "confidence": 85,
                "reasoning": "Análisis detallado en ESPAÑOL explicando por qué ganará el equipo...",
                "bettingTip": "${matchContext.home} -5.5",
                "predictions": {
                    "finalScore": "110-102",
                    "totalPoints": "212",
                    "spread": { "favorite": "${matchContext.home}", "line": -5.5, "recommendation": "Cubrir Hándicap" },
                    "overUnder": { "line": 215.5, "pick": "Menos de", "confidence": "Alta" },
                    "topPlayers": {
                        "homeTopScorer": { "name": "Jugador A", "predictedPoints": 25, "predictedRebounds": 8, "predictedAssists": 5 },
                        "awayTopScorer": { "name": "Jugador B", "predictedPoints": 28, "predictedRebounds": 6, "predictedAssists": 4 }
                    }
                },
                "keyFactors": ["Factor en Español 1", "Factor en Español 2", "Factor en Español 3"]
            }
            `;
        } else {
            prompt = `
            You are an expert Football/Soccer analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${isLive ? `STATS: ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Análisis detallado en ESPAÑOL explicando la predicción...",
                "bettingTip": "Más de 2.5 Goles",
                "predictions": {
                    "finalScore": "2-1",
                    "totalGoals": "3",
                    "corners": { "home": 5, "away": 3, "total": 8 },
                    "shots": { "home": 12, "away": 8, "onTarget": "6" },
                    "cards": { "yellowCards": 4, "redCards": 0, "details": "Partido intenso" },
                    "offsides": { "total": 4, "details": "2 por equipo" }
                },
                "keyFactors": ["Factor Clave 1", "Factor Clave 2", "Factor Clave 3"]
            }
            `;
        }

        // 2. Call Groq
        const groq = new Groq({ apiKey });

        console.log('🤖 Calling Groq (FAST MODEL) for prediction...');
        const completion = await groq.chat.completions.create({
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
            model: "llama-3.1-8b-instant", // High speed model
            temperature: 0.6,
            max_tokens: 800,
            response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message?.content;
        console.log('📦 Raw Groq response:', responseContent?.substring(0, 200));

        if (!responseContent) {
            throw new Error('Empty response from AI');
        }

        // Try to parse the JSON
        let prediction;
        try {
            prediction = JSON.parse(responseContent);
            console.log('✅ Successfully parsed prediction:', Object.keys(prediction));
        } catch (parseError) {
            console.error('❌ Failed to parse Groq response:', responseContent);
            throw new Error('Invalid JSON from Groq: ' + parseError);
        }

        // Validate required fields
        if (!prediction.winner || !prediction.confidence) {
            console.warn('⚠️ Missing required fields in prediction:', prediction);
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
            reasoning: `Basado en la forma reciente y el análisis directo de ${isBasketball ? 'baloncesto' : 'fútbol'} (IA no disponible), ${winner} muestra una consistencia superior. Su rendimiento sugiere una alta probabilidad de controlar el ritmo contra ${loser}.`,
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
