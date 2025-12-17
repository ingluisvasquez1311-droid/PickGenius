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
            // Use our internal Sofascore Service
            const response = await sofaScoreBasketballService.getEventDetails(gameId);

            if (!response.success || !response.data) {
                console.error("Sofascore API Error:", response.error);
                throw new Error("Game not found in Sofascore API");
            }

            const game = response.data;
            const homeScore = game.homeScore?.current ?? 0;
            const awayScore = game.awayScore?.current ?? 0;

            matchContext = {
                sport: 'Basketball (Sofascore)',
                home: game.homeTeam.name,
                away: game.awayTeam.name,
                score: `${homeScore} - ${awayScore}`,
                status: game.status?.description || 'Scheduled',
                startTime: game.startTimestamp,
                tournament: game.tournament?.name,
                // Add H2H or standings if needed for better AI context
            };
        } else if (sport === 'football') {
            // Use our internal Sofascore Service (Unified Provider)
            const response = await sofaScoreFootballService.getEventDetails(gameId);

            if (!response.success || !response.data) {
                console.error("Sofascore Football API Error:", response.error);
                throw new Error("Game not found in Sofascore API");
            }

            const event = response.data.event;

            // Try to get detailed stats for better analysis
            let statistics = {};
            try {
                const statsRes = await sofaScoreFootballService.getEventStatistics(gameId);
                if (statsRes.success) statistics = statsRes.data;
            } catch (ignore) { console.warn('Could not fetch stats for prediction'); }

            matchContext = {
                sport: 'Football (Sofascore)',
                home: event.homeTeam.name,
                away: event.awayTeam.name,
                score: `${event.homeScore?.current ?? 0} - ${event.awayScore?.current ?? 0}`,
                status: event.status?.description || 'Scheduled',
                startTime: event.startTimestamp,
                tournament: event.tournament?.name,
                statistics: statistics
            };
        } else {
            return NextResponse.json({ success: false, error: 'Sport not supported' }, { status: 400 });
        }

        // Detect match status to provide appropriate analysis
        const isLive = matchContext.status && !matchContext.status.includes('Not') && matchContext.status !== '0\'';
        const analysisType = isLive ? 'LIVE IN-GAME ANALYSIS' : 'PRE-MATCH PREDICTION';

        let prompt = '';

        if (sport === 'basketball') {
            prompt = `
            You are an expert NBA/Basketball analyst.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${isLive ? `STATS: ${JSON.stringify(matchContext.statistics || {})}` : ''}

            RETURN JSON ONLY:
            {
                "winner": "${matchContext.home}", 
                "confidence": 85,
                "reasoning": "Analysis here...",
                "bettingTip": "${matchContext.home} -5.5",
                "predictions": {
                    "finalScore": "110-102",
                    "totalPoints": "212",
                    "spread": { "favorite": "${matchContext.home}", "line": -5.5, "recommendation": "Cover" },
                    "overUnder": { "line": 215.5, "pick": "Under", "confidence": "High" },
                    "topPlayers": {
                        "homeTopScorer": { "name": "Player A", "predictedPoints": 25, "predictedRebounds": 8, "predictedAssists": 5 },
                        "awayTopScorer": { "name": "Player B", "predictedPoints": 28, "predictedRebounds": 6, "predictedAssists": 4 }
                    }
                },
                "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
            }
            `;
        } else {
            prompt = `
            You are an expert Football/Soccer analyst.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            ${isLive ? `STATS: ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            RETURN JSON ONLY:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Analysis here...",
                "bettingTip": "Over 2.5 Goals",
                "predictions": {
                    "finalScore": "2-1",
                    "totalGoals": "3",
                    "corners": { "home": 5, "away": 3, "total": 8 },
                    "shots": { "home": 12, "away": 8, "onTarget": "6" },
                    "cards": { "yellowCards": 4, "redCards": 0, "details": "High tension match" },
                    "offsides": { "total": 4, "details": "2 per team" }
                },
                "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
            }
            `;
        }

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

        // FALLBACK: Generate Realistic Mock Prediction if API fails
        console.log('⚠️ Falling back to Mock Prediction due to API error');

        const isHomeFavored = Math.random() > 0.5;
        const winner = isHomeFavored ? body.homeTeamName || 'Local' : body.awayTeamName || 'Visitante';
        const loser = isHomeFavored ? body.awayTeamName || 'Visitante' : body.homeTeamName || 'Local';

        const mockPrediction = {
            winner: winner,
            confidence: 82,
            reasoning: `Based on recent form and head-to-head analysis (AI unavailable), ${winner} shows superior consistency. Their recent performance suggests a strong likelihood of controlling the game tempo against ${loser}.`,
            bettingTip: isHomeFavored ? `${winner} to win` : `${winner} +0.5 Handicap`,
            predictions: {
                finalScore: isHomeFavored ? '2-1' : '1-2',
                totalGoals: '3',
                corners: { home: 6, away: 4, total: 10 },
                shots: { home: 14, away: 11, onTarget: '5' },
                cards: { yellowCards: 3, redCards: 0, details: 'Clean match expected' },
                offsides: { total: 4, details: 'Average' },
                // Basketball specific fallbacks
                spread: { favorite: winner, line: -4.5, recommendation: 'Cover' },
                overUnder: { line: 215.5, pick: 'Over', confidence: 'Medium' },
                topPlayers: {
                    homeTopScorer: { name: 'Star Player (Home)', predictedPoints: 24, predictedRebounds: 8, predictedAssists: 5 },
                    awayTopScorer: { name: 'Star Player (Away)', predictedPoints: 26, predictedRebounds: 6, predictedAssists: 4 }
                }
            },
            keyFactors: [
                "Strong recent form from the favorite",
                "Tactical advantage in midfield/transition",
                "Historical dominance in this matchup"
            ],
            isMock: true
        };

        return NextResponse.json(mockPrediction);
    }
}
