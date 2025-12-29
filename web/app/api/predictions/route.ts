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
import { PredictionResponseSchema } from '@/lib/schemas/prediction-schemas';

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
            // Intentar ID prefijado primero (formato Robot: sport_id), luego ID crudo
            firebaseReadService.getEventById(`${sport}_${gameId}`)
                .then(res => res || firebaseReadService.getEventById(gameId))
                .catch(() => null),
            oddsSyncService.getStoredMarketLine(gameId, sport).catch(() => null)
        ]);

        const statsRes = await sportsDataService.makeRequest(`/event/${gameId}/statistics`).catch(() => null);


        let event = firebaseEvent;
        if (!event) {
            const gameRes = await sportsDataService.makeRequest(`/event/${gameId}`).catch(() => null);
            event = gameRes?.event || gameRes;
        }

        if (!event) throw new Error("Evento no encontrado en Bridge ni Firebase");

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

        const prompt = `ERES PICKGENIUS ORACLE (EL ORÁCULO), UN ANALISTA DE APUESTAS PROFESIONAL DE ÉLITE CON ACCESO A GPT-OSS 120B.
        TU MISIÓN: ENTREGAR UN ANÁLISIS TÉCNICO, BRUTALMENTE HONESTO Y QUE MAXIMICE EL VALOR (VALUE BETS).

        DATOS DEL ENCUENTRO DE ${matchContext.sport}:
        - EQUIPOS: ${matchContext.home} vs ${matchContext.away}
        - LIGA/TORNEO: ${matchContext.tournament}
        - MARCADOR ACTUAL: ${matchContext.score} (${matchContext.status})
        - HISTORIAL RECIENTE (H2H): ${JSON.stringify(matchContext.h2hHistory)}
        - DATOS BETPLAY (MERCADOS REALES): ${JSON.stringify(matchContext.betplayData)}
        - ESTADÍSTICAS EN VIVO/PREVIAS: ${JSON.stringify(matchContext.statistics)}

        INSTRUCCIONES CRÍTICAS POR DEPORTE:
        1. FÚTBOL (FOOTBALL): Habla de Goles, SE DEBE proyectar Córners (Over/Under) y Tarjetas Amarillas/Rojas.
        2. BALONCESTO (BASKETBALL): Habla de Puntos, SE DEBE proyectar Puntos del Primer Tiempo y mercados PRA (Pts+Reb+Ast).
        3. NFL/AMER. FOOTBALL: ¡PROHIBIDO hablar de "Goles"! Habla de Touchdowns, Yardas Totales y Yardas por Tierra/Aire.
        4. BÉISBOL (BASEBALL): Habla de Carreras, Hits y proyecciones de las primeras 5 entradas (F5).
        5. TENIS (TENNIS): Habla de Sets y Games. Proyecta Aces y dobles faltas si es posible.
        6. NHL / HOCKEY: Habla de Goles y Puck Line (-1.5/+1.5). Proyecta goles por periodo (P1, P2, P3).

        REGLAS DE ORO:
        - VALUE BET: Identifica si la cuota de BetPlay tiene "Edge" (valor) comparando con tu modelo.
        - MOST VIABLE PICK: El pick con mayor probabilidad (ej: +8.5 Córners en fútbol o -1.5 Puck Line en NHL).
        - IDIOMA: Español latino profesional de apostador.

        RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO CON ESTA ESTRUCTURA (Ajusta 'predictions' según el deporte):
        {
          "winner": "ELEGIDO",
          "confidence": 0-100,
          "reasoning": "ANÁLISIS TACTICO PROFUNDO (Menciona hándicaps y condiciones físicas)",
          "bettingTip": "PICK ESPECÍFICO (Ej: Gana Local y Over 2.5)",
          "isValueBet": true/false,
          "edge": 0-20,
          "mostViablePick": {
            "pick": "TEXTO DEL PICK",
            "line": 0.0,
            "market": "NOMBRE DEL MERCADO (Ej: Córners, Yardas, Hándicap)",
            "winProbability": 0-100,
            "rationale": "POR QUÉ ES EL MÁS SEGURO"
          },
          "predictions": {
            /* CAMPOS SEGÚN EL DEPORTE - Ver Esquemas Zod */
          },
          "keyFactors": ["FACTOR 1", "FACTOR 2", "FACTOR 3"]
        }`;

        let prediction;
        // DANIEL: MODO DIOS ACTIVADO - Usando OpenAI GPT-OSS 120B (El más potente de tu arsenal)
        if (provider === 'groq' || provider === 'gemini') {
            try {
                prediction = await groqService.createPrediction({
                    messages: [{ role: "user", content: prompt }],
                    model: "openai/gpt-oss-120b",
                    temperature: 0.7,
                    schema: PredictionResponseSchema
                });
            } catch (err) {
                console.warn("⚠️ GPT-OSS 120B falló para el Oráculo, usando Llama 3.3 como respaldo...");
                prediction = await groqService.createPrediction({
                    messages: [{ role: "user", content: prompt }],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    schema: PredictionResponseSchema
                }).catch(() => null);
            }
        }

        const finalResponse = {
            ...prediction,
            generatedAt: new Date().toISOString(),
            isVerified: !!firebaseMarketLine?.isVerified,
            dataSource: firebaseMarketLine?.marketSource || 'Hybrid AI Model',
            marketMatched: firebaseMarketLine ? 'Confirmado con Betplay' : 'Referencia IA',
            aiModel: prediction.modelUsed || (provider === 'gemini' ? 'Gemini 1.5 Pro' : 'Llama 3.3 70B')
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
