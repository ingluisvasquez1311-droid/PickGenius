import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { groqService } from '@/lib/services/groqService';
import { globalCache } from '@/lib/utils/api-manager';
import { getUserProfile } from '@/lib/userService';
import { firebaseReadService } from '@/lib/FirebaseReadService';
import { oddsSyncService } from '@/lib/services/oddsSyncService';
import { archivePredictionOnServer } from '@/lib/services/predictionArchiveService';

export async function GET() {
    return NextResponse.json({
        status: 'online',
        service: 'PickGenius Oracle AI',
        version: '3.0.0 (Dual Robot Bridge)',
        managed_by: 'Antigravity'
    });
}

export const maxDuration = 60;

import { geminiService } from '@/lib/services/geminiService';

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
        if (body.gameId) gameId = String(body.gameId);
        const uid = body.uid;
        const provider = body.provider || 'gemini';

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

        const cacheKey = `prediction:${sport}:${gameId}:${provider}`;
        const cachedPrediction = await globalCache.get(cacheKey);

        if (cachedPrediction) {
            const cacheAge = Date.now() - new Date((cachedPrediction as any).generatedAt || 0).getTime();
            if (cacheAge < 5 * 60 * 1000) {
                return NextResponse.json(cachedPrediction);
            }
        }

        const [firebaseEvent, firebaseMarketLine] = await Promise.all([
            firebaseReadService.getEventById(gameId).catch(() => null),
            oddsSyncService.getStoredMarketLine(gameId, sport).catch(() => null)
        ]);

        const [statsRes, h2hRes] = await Promise.all([
            sportsDataService.makeRequest(`/event/${gameId}/statistics`).catch(() => null),
            sportsDataService.getMatchH2H(Number(gameId)).catch(() => null)
        ]);

        let event = firebaseEvent;
        if (!event) {
            const gameRes = await sportsDataService.makeRequest(`/event/${gameId}`).catch(() => null);
            event = gameRes?.event || gameRes;
        }

        if (!event) throw new Error("Evento no encontrado");

        const homeScore = event.homeScore?.current || 0;
        const awayScore = event.awayScore?.current || 0;

        const matchContext = {
            sport: sport.toUpperCase(),
            home: event.homeTeam?.name || fallbackHomeName,
            away: event.awayTeam?.name || fallbackAwayName,
            score: `${homeScore} - ${awayScore}`,
            status: event.status?.description || 'Scheduled',
            tournament: event.tournament?.name,
            h2hHistory: h2hRes?.events?.slice(0, 5).map((e: any) => ({
                score: `${e.homeScore?.current}-${e.awayScore?.current}`,
                winner: e.winnerCode === 1 ? 'Local' : (e.winnerCode === 2 ? 'Visitante' : 'Empate'),
                date: new Date(e.startTimestamp * 1000).toLocaleDateString()
            })),
            statistics: statsRes || "No disponibles",
            betplayData: firebaseMarketLine ? {
                mainLine: firebaseMarketLine.line,
                marketName: firebaseMarketLine.marketName,
                odds: firebaseMarketLine.odds,
                playerProps: firebaseMarketLine.props?.playerProps?.slice(0, 3) || []
            } : "Línea de referencia estándar"
        };

        const isLive = matchContext.status && !matchContext.status.includes('Not') && matchContext.status !== '0\'';

        const prompt = `Eres PickGenius Oracle, el analista deportivo más avanzado. 
        Analiza este encuentro de ${matchContext.sport}:
        EQUIPOS: ${matchContext.home} vs ${matchContext.away}
        MARCADOR ACTUAL: ${matchContext.score} (${matchContext.status})
        HISTORIAL RECIENTE (H2H): ${JSON.stringify(matchContext.h2hHistory)}
        DATOS BETPLAY (MERCADOS REALES): ${JSON.stringify(matchContext.betplayData)}
        ESTADÍSTICAS: ${JSON.stringify(matchContext.statistics)}

        INSTRUCCIONES:
        1. Tu pronóstico DEBE basarse en la línea de BetPlay proporcionada.
        2. Si el deporte es baloncesto, estima puntos de jugadores estrella si los datos están disponibles.
        3. El reasoning debe ser técnico y brutalmente honesto.
        4. Devuelve un JSON válido en ESPAÑOL con esta estructura:
        {
          "winner": "Nombre equipo",
          "confidence": 0-100,
          "reasoning": "Explicación técnica",
          "bettingTip": "Pick recomendado",
          "keyFactors": ["Factor 1", "Factor 2", "Factor 3"],
          "predictions": { ... }
        }`;

        let prediction;
        if (provider === 'gemini') {
            try {
                prediction = await geminiService.createPrediction({
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7
                });
            } catch (err) {
                console.warn("⚠️ Gemini principal falló, intentando con Groq...");
                prediction = await groqService.createPrediction({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.1-8b-instant"
                });
            }
        } else {
            try {
                prediction = await groqService.createPrediction({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.1-8b-instant"
                });
            } catch (err) {
                console.warn("⚠️ Groq falló, recurriendo a Gemini...");
                prediction = await geminiService.createPrediction({
                    messages: [{ role: "user", content: prompt }]
                });
            }
        }

        const finalResponse = {
            ...prediction,
            generatedAt: new Date().toISOString(),
            isVerified: !!firebaseMarketLine?.isVerified,
            dataSource: firebaseMarketLine?.marketSource || 'Hybrid AI Model',
            marketMatched: firebaseMarketLine ? 'Confirmado con Betplay' : 'Referencia IA',
            aiModel: prediction.modelUsed || (provider === 'gemini' ? 'Gemini 1.5 Pro' : 'Llama 3.1 70B')
        };

        await globalCache.set(cacheKey, finalResponse, isLive ? 120000 : 600000);

        if (!isLive) {
            archivePredictionOnServer(uid || 'guest', {
                gameId,
                sport,
                winner: prediction.winner,
                bettingTip: prediction.bettingTip || 'Veredicto IA',
                confidence: prediction.confidence,
                reasoning: prediction.reasoning
            }).catch(e => console.error("Archive error:", e));
        }

        if (!isPremiumUser) {
            return NextResponse.json({ ...finalResponse, bettingTip: '🔒 Premium Only', isMasked: true });
        }

        return NextResponse.json(finalResponse);

    } catch (error: any) {
        console.error(`❌ Error en predicción:`, error);
        return NextResponse.json({
            error: true,
            message: "Error generando predicción",
            winner: fallbackHomeName,
            confidence: 50,
            reasoning: "El Oráculo está en mantenimiento técnico.",
            predictions: { overUnder: { line: 2.5, pick: "Más de" } }
        });
    }
}
