import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { sofaScoreBasketballService } from '@/lib/services/sofaScoreBasketballService';
import { sofaScoreFootballService } from '@/lib/services/sofaScoreFootballService';

export const maxDuration = 60; // Allow longer timeout for AI generation

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
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

        // 1. Fetch real match data using our Official API services
        let matchContext: any = null;
        let homeTeamName = '';
        let awayTeamName = '';

        // Determine API Keys based on sport logic below

        const NBA_API_KEY = process.env.NBA_API_KEY || process.env.NEXT_PUBLIC_NBA_API_KEY;
        const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY_1 || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;

        if (sport === 'basketball') {
            if (!NBA_API_KEY) throw new Error("NBA API Key missing");
            const response = await fetch(`https://api-nba-v1.p.rapidapi.com/games?id=${gameId}`, {
                headers: { 'x-rapidapi-key': NBA_API_KEY, 'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com' }
            });
            const data = await response.json();
            const game = data.response?.[0];
            if (!game) throw new Error("Game not found in NBA API");

            matchContext = {
                sport: 'Basketball (NBA)',
                home: game.teams.home.name,
                away: game.teams.visitors.name,
                score: `${game.scores.home.points} - ${game.scores.visitors.points}`,
                status: `${game.periods.current}Q - ${game.clock}`,
                // Add more stats if available in this endpoint or fetch stats endpoint
            };
        } else if (sport === 'football') {
            if (!FOOTBALL_API_KEY) throw new Error("Football API Key missing");
            const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${gameId}`, {
                headers: { 'x-apisports-key': FOOTBALL_API_KEY }
            });
            const data = await response.json();
            const game = data.response?.[0];
            if (!game) throw new Error("Game not found in Football API");

            matchContext = {
                sport: 'Football',
                home: game.teams.home.name,
                away: game.teams.away.name,
                score: `${game.goals.home} - ${game.goals.away}`,
                status: `${game.fixture.status.elapsed}'`,
                statistics: game.statistics // might need separate call if not in fixture details
            };
        } else {
            return NextResponse.json({ success: false, error: 'Sport not supported' }, { status: 400 });
        }

        // Detect match status to provide appropriate analysis
        const isLive = matchContext.status && !matchContext.status.includes('Not') && matchContext.status !== '0\'';
        const analysisType = isLive ? 'LIVE IN-GAME ANALYSIS' : 'PRE-MATCH PREDICTION';

        const prompt = `
        You are an expert sports analyst with deep knowledge of ${matchContext.sport}.
        
        **ANALYSIS TYPE: ${analysisType}**
        
        **MATCH INFO:**
        - Teams: ${matchContext.home} vs ${matchContext.away}
        - Current Score: ${matchContext.score}
        - Match Status: ${matchContext.status}
        ${isLive ? `- Live Statistics: ${JSON.stringify(matchContext.statistics || {})}` : ''}
        
        ${isLive ? `
        **LIVE MATCH INSTRUCTIONS:**
        This match is CURRENTLY PLAYING. Analyze the CURRENT game flow and statistics.
        - Focus on how the match is ACTUALLY developing RIGHT NOW
        - Reference the current score and live statistics
        - Predict how the match will END based on current momentum
        - Adjust predictions based on what's happening in real-time
        ` : `
        **PRE-MATCH INSTRUCTIONS:**
        This match HAS NOT STARTED yet. Provide a PREDICTION based on:
        - Team form and recent performance
        - Head-to-head history
        - Tactical matchup analysis
        - Expected lineups and key players
        - Statistical trends and betting value
        `}
        
        **IMPORTANT:** Return ONLY valid JSON (no markdown, no code blocks). Use this EXACT structure:
        {
            "winner": "${matchContext.home} or ${matchContext.away} (the team most likely to win)",
            "confidence": 75,
            "reasoning": "${isLive ?
                'Detailed 3-4 sentence analysis explaining the CURRENT game situation. Reference live stats like possession, shots, momentum shifts. Explain why one team is likely to complete the victory based on HOW THE MATCH IS GOING.' :
                'Detailed 3-4 sentence PRE-MATCH analysis. Explain why one team is favored based on form, tactics, historical performance. Be specific about matchup advantages.'
            }",
            "bettingTip": "Specific betting recommendation ${isLive ? '(e.g., Live bet: Over 2.5 Goals @ +130)' : '(e.g., Pre-match: ${matchContext.home} -1 @ -110)'}",
            "predictions": {
                "finalScore": "Predicted final score (e.g., '2-1')",
                "totalGoals": "Expected total goals ${isLive ? 'at full time' : 'in the match'} (e.g., '3 goals')",
                "corners": {
                    "home": 6,
                    "away": 4,
                    "total": 10
                },
                "shots": {
                    "home": 15,
                    "away": 10,
                    "onTarget": "${isLive ? 'Expected shots on target by full time' : 'Expected total shots on target'}"
                },
                "cards": {
                    "yellowCards": 4,
                    "redCards": 0,
                    "details": "Expected cards ${isLive ? 'for the remainder and full match' : 'for the full match'}"
                },
                "offsides": {
                    "total": 3,
                    "details": "Expected offsides ${isLive ? 'by full time' : 'in the match'}"
                }
            },
            "keyFactors": [
                "${isLive ? 'Factor 1: Current game momentum or tactical shift happening' : 'Factor 1: Team form or historical advantage'}",
                "${isLive ? 'Factor 2: Key stat from live game (e.g., shot dominance)' : 'Factor 2: Tactical matchup or key player advantage'}",
                "${isLive ? 'Factor 3: Second half expectations based on first half' : 'Factor 3: Expected game plan or strategic advantage'}"
            ]
        }
        
        ${isLive ?
                'CRITICAL: You are analyzing a LIVE match. Base your predictions on the CURRENT statistics and game flow. If one team is dominating possession and shots, reflect that clearly.' :
                'CRITICAL: This is a PRE-MATCH prediction. Base your analysis on team quality, form, and tactical expectations. Do NOT reference live stats since the match has not started.'
            }
        `;

        // 2. Call Groq
        const groq = new Groq({ apiKey });

        console.log('🤖 Calling Groq for prediction...');
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        const rawContent = completion.choices[0]?.message?.content;
        console.log('📦 Raw Groq response:', rawContent?.substring(0, 200));

        if (!rawContent) {
            throw new Error('Empty response from Groq');
        }

        // Try to parse the JSON
        let predictionJson;
        try {
            predictionJson = JSON.parse(rawContent);
            console.log('✅ Successfully parsed prediction:', Object.keys(predictionJson));
        } catch (parseError) {
            console.error('❌ Failed to parse Groq response:', rawContent);
            throw new Error('Invalid JSON from Groq: ' + parseError);
        }

        // Validate required fields
        if (!predictionJson.winner || !predictionJson.confidence) {
            console.warn('⚠️ Missing required fields in prediction:', predictionJson);
        }

        return NextResponse.json(predictionJson);

    } catch (error: any) {
        console.error('❌ Prediction API Error:', error.message);
        console.error('Full error:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            winner: 'Error generando predicción',
            confidence: 0,
            reasoning: 'Hubo un error al contactar el servicio de IA. Por favor intenta de nuevo.',
            bettingTip: 'No disponible',
            isFallback: true
        }, { status: 500 });
    }
}
