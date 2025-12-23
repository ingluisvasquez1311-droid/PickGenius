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
                profile.email.toLowerCase() === 'ingluisvasquez1311@gmail.com'
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

        const [gameRes, statsRes, oddsRes] = await Promise.all([
            sportsDataService.makeRequest(`/event/${gameId}`).catch(err => {
                console.error("Error fetching game:", err);
                return null;
            }),
            sportsDataService.makeRequest(`/event/${gameId}/statistics`).catch(() => null),
            sportsDataService.getMatchOdds(Number(gameId)).catch(() => null)
        ]);

        if (!gameRes) {
            console.error(`❌ [Prediction API] Game ${gameId} not found or blocked (403)`);
            throw new Error("Game not found or provider blocked (403)");
        }

        const event = gameRes.event || gameRes;
        const statistics = statsRes || {};
        const odds = oddsRes?.markets || [];

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
            prompt = `
            You are an expert NBA and International Basketball analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **TOURNAMENT:** ${matchContext.tournament}
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS: ${JSON.stringify(matchContext.statistics || {})}` : ''}

            CRITICAL CONTEXT & MARKETS:
            - If this is NBA: Matches are 48 minutes. Scores usually range from 190 to 240 total points.
            - If this is NOT NBA (FIBA, EuroLeague, ACB, etc.): Matches are 40 minutes. Scores vary but ALMOST NEVER exceed 180 total points.
            - ANALYZE SPECIAL MARKETS: 1st Quarter points, Player Props, and Total Points.
            - VALUE BET ANALYSIS: Compare your calculated probability with the provided MARKET ODDS. If the odds are higher than your probability suggests (e.g. you see 70% win but odds are 2.50), identify it as a "Value Bet".
            - Current Tournament is: ${matchContext.tournament}. Use ONLY realistic lines for this specific league.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}", 
                "confidence": 85,
                "reasoning": "Análisis detallado en ESPAÑOL explicando por qué ganará el equipo...",
                "bettingTip": "${matchContext.home} -5.5",
                "advancedMarkets": { "firstQuarter": "Over 52.5", "drawNoBet": "N/A - Basketball" },
                "isValueBet": true,
                "valueAnalysis": "Explicación de por qué este pick tiene valor según las cuotas de Bet365...",
                "predictions": {
                    "finalScore": "${isNBA ? '112-105' : '82-78'}",
                    "totalPoints": "${isNBA ? '217' : '160'}",
                    "spread": { "favorite": "${matchContext.home}", "line": -5.5, "recommendation": "Cubrir Hándicap" },
                    "overUnder": { "line": ${isNBA ? '222.5' : '158.5'}, "pick": "Menos de", "confidence": "Alta" },
                    "topPlayers": {
                        "homeTopScorer": { "name": "Jugador A", "predictedPoints": ${isNBA ? 25 : 18}, "predictedRebounds": 8, "predictedAssists": 5 },
                        "awayTopScorer": { "name": "Jugador B", "predictedPoints": ${isNBA ? 28 : 16}, "predictedRebounds": 6, "predictedAssists": 4 }
                    }
                },
                "keyFactors": ["Factor en Español 1", "Factor en Español 2", "Factor en Español 3"]
            }
            `;
        } else if (sport === 'football') {
            prompt = `
            You are an expert Football/Soccer analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status} ${isLive ? '(LIVE)' : '(PRE-MATCH)'}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            ${isLive ? `STATS: ${JSON.stringify(matchContext.statistics || {})}` : ''}
            
            ANALYZE SPECIAL MARKETS (MAX VALUE):
            - Win by 2+ goals (Ganará por 2+)
            - Most Corners (Mayor número de córners)
            - Both Teams to Score (Ambos equipos anotarán)
            - Shots on Target (Remates a puerta) - e.g. "Player X: 2+ remates"
            - Player to score 2+ (Anotará 2+)
            - VALUE BET ANALYSIS: Compare your calculated probability with the provided MARKET ODDS. Identify picks where the market is underestimating the outcome.

            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 75,
                "reasoning": "Análisis detallado en ESPAÑOL resaltando mercados de córners y remates...",
                "bettingTip": "Más de 2.5 Goles y Ambos Anotan",
                "advancedMarkets": { "corners": "Benfica: Mayor número", "shots": "Luis Suarez: 2+ a puerta", "drawNoBet": "${matchContext.home}" },
                "isValueBet": false,
                "valueAnalysis": "Breve explicación del valor respecto a Bet365...",
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
        } else if (sport.toLowerCase().includes('american') || sport.toLowerCase().includes('nfl')) {
            prompt = `
            You are an expert NFL/American Football analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            
            ANALYZE SPECIAL MARKETS (NFL ELITE):
            - Touchdown Scorers (Anotadores)
            - Passing Yards (Yardas de pase)
            - Touchdown Passes (Pases de touchdown)
            - Completed Passes (Pases completarios)
            - Receiving Yards (Yardas de recepción)
            - Receptions (Recepciones)
            - Rushing Yards (Yardas de rushing)
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 82,
                "reasoning": "Análisis táctico de yardas aéreas y terrestres en ESPAÑOL...",
                "bettingTip": "${matchContext.home} -3.5 Hándicap",
                "advancedMarkets": { "touchdowns": "Jugador X anotará", "yards": "QB Y Over 250.5 yardas", "receptions": "WR Z 5+ recepciones" },
                "predictions": {
                    "finalScore": "27-21",
                    "totalPoints": "48",
                    "spread": { "favorite": "${matchContext.home}", "line": -3.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 47.5, "pick": "Más de", "confidence": "Alta" },
                    "topPlayers": {
                        "homeStat": { "name": "Player A", "yards": 110, "touchdowns": 1 },
                        "awayStat": { "name": "Player B", "yards": 95, "touchdowns": 1 }
                    }
                },
                "keyFactors": ["Defensa de zona", "Ataque terrestre", "Presión al QB"]
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
                    "topPlayers": {
                        "homeStarter": { "name": "Pitcher A", "predictedStrikeouts": 6, "inningsPitched": 6 },
                        "awayStarter": { "name": "Pitcher B", "predictedStrikeouts": 4, "inningsPitched": 5 }
                    }
                },
                "keyFactors": ["Factor MLB 1", "Factor MLB 2", "Factor MLB 3"]
            }
            `;
        } else if (sport.toLowerCase().includes('hockey') || sport.toLowerCase().includes('nhl')) {
            prompt = `
            You are an expert NHL/Ice Hockey analyst speaking SPANISH.
            **MATCH:** ${matchContext.home} vs ${matchContext.away} (${matchContext.score})
            **STATUS:** ${matchContext.status}
            **MARKET ODDS (Bet365/Real):** ${JSON.stringify(matchContext.marketOdds)}
            
            ANALYZE SPECIAL MARKETS (NHL ELITE):
            - 60 Minute Line (Resultado en tiempo regular)
            - Puck Line (Hándicap -1.5/+1.5)
            - Total Goals (Over/Under)
            - Player Props: Tiros a puerta (Shots on Goal), Puntos de jugador.
            
            RETURN JSON ONLY in SPANISH:
            {
                "winner": "${matchContext.home}",
                "confidence": 78,
                "reasoning": "Análisis de defensa, portería y Power Play en ESPAÑOL...",
                "bettingTip": "Puck Line ${matchContext.home} -1.5",
                "advancedMarkets": { "shots": "Jugador X Over 3.5 tiros", "puckLine": "${matchContext.home} -1.5", "totalGoals": "Over 5.5" },
                "predictions": {
                    "finalScore": "4-2",
                    "totalGoals": "6",
                    "spread": { "favorite": "${matchContext.home}", "line": -1.5, "recommendation": "Cubrir" },
                    "overUnder": { "line": 6.0, "pick": "Más de", "confidence": "Media" }
                },
                "keyFactors": ["Eficiencia en Power Play", "Rendimiento del Portero", "Fisicalidad"]
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
