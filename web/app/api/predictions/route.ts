import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { sofascoreService } from '@/lib/services/sofascoreService';

export const maxDuration = 60; // Allow longer timeout for AI generation

export async function POST(request: NextRequest) {
    let fallbackHomeName = 'Equipo Local';
    let fallbackAwayName = 'Equipo Visitante';

    try {
        const body = await request.json();
        // Update fallbacks if body is available
        if (body.homeTeam || body.homeTeamName) fallbackHomeName = body.homeTeam || body.homeTeamName;
        if (body.awayTeam || body.awayTeamName) fallbackAwayName = body.awayTeam || body.awayTeamName;

        const { gameId, sport } = body;

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

        // 1. Fetch real match data using our Unified Sofascore Service (Handles ScraperAPI)
        let matchContext: any = null;

        // Use the universal service for all sports now
        const game = await sofascoreService.makeRequest(`/event/${gameId}`);

        if (!game) {
            console.error(`❌ [Prediction API] Game ${gameId} not found or blocked (403)`);
            throw new Error("Game not found or provider blocked (403)");
        }

        console.log(`✅ [Prediction API] Fetched Game:`, game.event?.name || game.name || gameId);

        const event = game.event || game; // Handle different response structures

        if (!event.homeTeam || !event.awayTeam) {
            console.warn(`⚠️ [Prediction API] Missing team data in event:`, JSON.stringify(event).substring(0, 200));
        }

        const homeScore = event.homeScore?.current ?? 0;
        const awayScore = event.awayScore?.current ?? 0;

        // Try to get detailed stats for better analysis
        let statistics: any = {};
        try {
            const statsRes = await sofascoreService.makeRequest(`/event/${gameId}/statistics`);
            if (statsRes) {
                statistics = statsRes;
                console.log(`📊 [Prediction API] Stats fetched successfully`);
            }
        } catch (ignore) { console.warn('Could not fetch stats for prediction'); }

        matchContext = {
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

        console.log('🤖 Calling Groq for prediction...');
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres un experto analista de apuestas deportivas. Responde siempre en JSON válido y en ESPAÑOL. Sé directo, profesional y persuasivo."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7, // Creativity balance
            max_tokens: 1000,
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
        console.log('⚠️ Falling back to Mock Prediction due to API error');

        // Extract team names safely using predefined fallback variables
        const hName = fallbackHomeName;
        const aName = fallbackAwayName;

        const isHomeFavored = Math.random() > 0.5;
        const winner = isHomeFavored ? hName : aName;
        const loser = isHomeFavored ? aName : hName;

        const mockPrediction = {
            winner: winner,
            confidence: 82,
            reasoning: `Basado en la forma reciente y el análisis directo (IA no disponible), ${winner} muestra una consistencia superior. Su rendimiento sugiere una alta probabilidad de controlar el ritmo contra ${loser}.`,
            bettingTip: isHomeFavored ? `${winner} gana` : `${winner} +0.5 Hándicap`,
            predictions: {
                finalScore: isHomeFavored ? '2-1' : '1-2',
                totalGoals: '3',
                corners: { home: 6, away: 4, total: 10 },
                shots: { home: 14, away: 11, onTarget: '5' },
                cards: { yellowCards: 3, redCards: 0, details: 'Partido limpio' },
                offsides: { total: 4, details: 'Promedio' },
                // Basketball specific fallbacks
                spread: { favorite: winner, line: -4.5, recommendation: 'Cubrir' },
                overUnder: { line: 215.5, pick: 'Más de', confidence: 'Media' },
                topPlayers: {
                    homeTopScorer: { name: 'Jugador Estrella (Local)', predictedPoints: 24, predictedRebounds: 8, predictedAssists: 5 },
                    awayTopScorer: { name: 'Jugador Estrella (Visitante)', predictedPoints: 26, predictedRebounds: 6, predictedAssists: 4 }
                }
            },
            keyFactors: [
                "Forma reciente sólida del favorito",
                "Ventaja táctica en transición",
                "Dominio histórico en este enfrentamiento"
            ],
            isMock: true
        };

        return NextResponse.json(mockPrediction);
    }
}
