import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { groqService } from '@/lib/services/groqService';
import { getUserProfile } from '@/lib/userService';
import { globalCache } from '@/lib/utils/api-manager';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        let strategyIndex = 0;
        const { uid } = body;
        if (body.strategyIndex !== undefined) strategyIndex = body.strategyIndex;

        // --- AUTH/TIER CHECK ---
        let isPremiumUser = false;
        if (uid) {
            const profile = await getUserProfile(uid);
            isPremiumUser = profile?.isPremium || profile?.role === 'admin' || false;
        }

        // Force "Safe" strategy for Free users
        if (!isPremiumUser) {
            console.log('🔒 [Parley API] Free user detected. Forcing SAFE strategy.');
            strategyIndex = 0; // 0 is likely the safest
        }

        // 1. Fetch data from sportsDataService
        // Fetching Football, Basketball, Baseball, NFL, NHL and Tennis
        const [footballEvents, basketballEvents, baseballEvents, nflEvents, nhlEvents, tennisEvents] = await Promise.all([
            sportsDataService.getEventsBySport('football').catch(() => []),
            sportsDataService.getEventsBySport('basketball').catch(() => []),
            sportsDataService.getEventsBySport('baseball').catch(() => []),
            sportsDataService.getEventsBySport('american-football').catch(() => []),
            sportsDataService.getEventsBySport('icehockey').catch(() => []),
            sportsDataService.getEventsBySport('tennis').catch(() => [])
        ]);

        const allEvents = [...footballEvents, ...basketballEvents, ...baseballEvents, ...nflEvents, ...nhlEvents, ...tennisEvents]
            .filter(e => e.status.type !== 'finished')
            .slice(0, 30); // Increased to 30 to cover all sports

        if (allEvents.length < 2) {
            return NextResponse.json({
                success: false,
                error: 'No hay suficientes eventos activos para generar un parley.'
            });
        }

        const simplifiedEvents = await Promise.all(allEvents.map(async e => {
            const oddsRes = await sportsDataService.getMatchOdds(e.id).catch(() => null);
            const topMarkets = oddsRes?.markets?.slice(0, 3).map((m: any) => ({
                name: m.marketName,
                odds: m.choices?.map((c: any) => `${c.name}: ${c.fraction}`)
            })) || [];

            return {
                id: e.id,
                match: `${e.homeTeam.name} vs ${e.awayTeam.name}`,
                score: `${e.homeScore?.current || 0}-${e.awayScore?.current || 0}`,
                status: e.status.description,
                tournament: e.tournament.name,
                sport: e.tournament.category.sport.name,
                realMarketOdds: topMarkets,
                hasPlayerProps: oddsRes?.markets?.some((m: any) => m.marketName.toLowerCase().includes('player') || m.marketName.toLowerCase().includes('prop'))
            };
        }));

        const strategyPrompts = [
            "CORRELACIÓN DE PROPS: Busca 3 eventos donde un favorito sólido tenga ventaja clara.",
            "HEDGE DE VOLATILIDAD: Combina 2 apuestas seguras con 1 de alto valor.",
            "DETECCIÓN DE RACHAS: Enfócate en equipos con rachas ganadoras recientes."
        ];

        const aiSystemContent = `
            Eres un experto en parleys y apuestas deportivas.
            ${!isPremiumUser ? 'BLOQUEO: NO incluyas Player Props (apuestas de jugadores) en este parley, solo mercados de equipo (ganador, goles, etc).' : ''}
            Genera un parley de 2 a 5 selecciones basado en los eventos proporcionados.
        `;

        const prompt = `
            Eres un experto tipster profesional de apuestas deportivas.
            ESTRATEGIA REQUERIDA: ${strategyPrompts[strategyIndex] || strategyPrompts[0]}
            
            EVENTOS DISPONIBLES:
            ${JSON.stringify(simplifiedEvents, null, 2)}

            INSTRUCCIONES CRÍTICAS PARA BALONCESTO:
            - Si el torneo es NBA: Los partidos duran 48 min y los puntos totales suelen estar entre 200 y 240.
            - Si NO es NBA (EuroLeague, ACB, LNB, etc.): Los partidos duran 40 min y el total de puntos CASI NUNCA supera los 180.
            - CONSIDERAR MERCADOS: Puntos en 1er Cuarto, Hándicaps y Over/Under.

            INSTRUCCIONES CRÍTICAS PARA FÚTBOL:
            - ANALIZAR MERCADOS AVANZADOS: Córners, Remates (Shots on target), Fuera de juego, Goles Under/Over y Apuesta sin Empate (Draw No Bet).

            INSTRUCCIONES CRÍTICAS PARA BÉISBOL (MLB):
            - ANALIZAR MERCADOS DE VALOR: Total de Carreras (Under/Over), Hándicap (Run Line), y especialmente PLAYER PROPS (Strikeouts del pitcher, Hits de bateadores).

            INSTRUCCIONES CRÍTICAS PARA NFL:
            - ANALIZAR MERCADOS DE ALTO IMPACTO: Touchdowns, Yardas de Pase/Rushing, Recepciones y Pases de Touchdown.

            INSTRUCCIONES CRÍTICAS PARA NHL (HOCKEY):
            - ANALIZAR MERCADOS: Ganador (60 min), Puck Line, Total de Goles (Over/Under) y Tiros a puerta de jugadores clave.

            INSTRUCCIONES CRÍTICAS PARA TENIS:
            - ANALIZAR MERCADOS: Ganador del partido, Ganador de Set, Hándicap de Juegos y Total de Juegos.

            INSTRUCCIONES DE PLAYER PROPS (MÁXIMO ATRACTIVO):
            - Los usuarios buscan picks de jugadores estrellas (Puntos en NBA, Goles en Fútbol, Home Runs en MLB, Touchdowns en NFL, Tiros en NHL).
            - Si detectas valor en un Player Prop, PRIORÍZALO en el parley.

            INSTRUCCIONES GENERALES:
            1. Selecciona EXACTAMENTE 3 eventos de la lista para formar un PARLEY.
            2. Proporciona un pick específico para cada uno (Prioriza Ganadores, Over/Under o Props de jugadores estrella como "Player X: 2+ remates" o "QB Y: 2+ pases TD").
            3. Explica brevemente por qué estos 3 eventos juntos maximizan el valor según la estrategia.
            4. Asigna un nivel de riesgo (Bajo, Medio, Alto, Extremo).

            RETORNA ÚNICAMENTE UN OBJETO JSON EN ESPAÑOL:
            {
                "title": "Nombre Creativo del Parley",
                "totalOdds": 4.50,
                "legs": [
                    { "matchName": "Team A vs Team B", "pick": "Gana Team A", "confidence": 85 },
                    { "matchName": "Team C vs Team D", "pick": "Más de 210.5 puntos", "confidence": 78 },
                    { "matchName": "Team E vs Team F", "pick": "Hándicap -1.5 Team E", "confidence": 72 }
                ],
                "analysis": "Explicación breve de la combinación...",
                "riskLevel": "Medio"
            }
        `;

        const parleyResult = await groqService.createPrediction({
            messages: [
                { role: "system", content: "Experto en análisis de parleys y apuestas combinadas." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7
        });

        return NextResponse.json({
            success: true,
            data: parleyResult
        });

    } catch (error: any) {
        console.error('❌ Parley Optimizer Error:', error);
        return NextResponse.json({
            success: false,
            error: "Error al generar el parley optimizado."
        }, { status: 500 });
    }
}
