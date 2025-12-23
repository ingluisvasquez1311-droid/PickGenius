import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { groqService } from '@/lib/services/groqService';
import { getUserProfile, saveParleyPrediction } from '@/lib/userService';
import { globalCache } from '@/lib/utils/api-manager';
import { ParleyResponseSchema } from '@/lib/schemas/prediction-schemas';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        let strategyIndex = 0;
        const { uid, sport = 'all' } = body;
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

        // 2. Filter and Diversify
        const allEventsRaw = [...footballEvents, ...basketballEvents, ...baseballEvents, ...nflEvents, ...nhlEvents, ...tennisEvents]
            .filter(e => {
                if (!e.status || e.status.type === 'finished') return false;

                // Sport filtering - be flexible with names
                if (sport !== 'all') {
                    const eSport = e.tournament?.category?.sport?.name?.toLowerCase() || '';
                    const isFútbol = eSport === 'football' || eSport === 'soccer';

                    if (sport === 'football' && !isFútbol) return false;
                    if (sport === 'basketball' && eSport !== 'basketball') return false;
                    if (sport === 'baseball' && eSport !== 'baseball') return false;
                    if (sport === 'tennis' && eSport !== 'tennis') return false;
                    if (sport === 'american-football' && (eSport !== 'american-football' && eSport !== 'nfl' && eSport !== 'american football')) return false;
                    if (sport === 'icehockey' && (eSport !== 'icehockey' && eSport !== 'ice hockey' && eSport !== 'nhl')) return false;
                }
                return true;
            });

        // If sport is "all", let's make sure we have a mix, not just the first 40 by time
        let filteredEvents = [];
        if (sport === 'all') {
            // Group by sport to ensure variety
            const groups: { [key: string]: any[] } = {};
            allEventsRaw.forEach(e => {
                const sName = e.tournament.category.sport.slug || 'other';
                if (!groups[sName]) groups[sName] = [];
                groups[sName].push(e);
            });

            // Take top 15 from each major sport, then sort result by time
            Object.values(groups).forEach(group => {
                const sortedGroup = group.sort((a, b) => a.startTimestamp - b.startTimestamp);
                filteredEvents.push(...sortedGroup.slice(0, 15));
            });

            filteredEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);
        } else {
            filteredEvents = allEventsRaw
                .sort((a, b) => a.startTimestamp - b.startTimestamp)
                .slice(0, 60); // More room for the specific sport
        }

        if (filteredEvents.length < 2) {
            console.log(`❌ [Parley API] Not enough events for ${sport}. Total found before final filter: ${allEventsRaw.length}`);
            return NextResponse.json({
                success: false,
                error: `No hay suficientes eventos de ${sport === 'all' ? 'deporte mixto' : sport} activos en este momento.`
            });
        }

        const simplifiedEvents = await Promise.all(filteredEvents.map(async (e, idx) => {
            const oddsRes = await sportsDataService.getMatchOdds(e.id).catch(() => null);

            // Fetch history for top events only to avoid overhead
            let historyContext = "";
            if (idx < 10 && e.homeTeam && e.awayTeam) {
                try {
                    const [homeHistory, awayHistory] = await Promise.all([
                        sportsDataService.getTeamLastResults(e.homeTeam.id),
                        sportsDataService.getTeamLastResults(e.awayTeam.id)
                    ]);

                    const formatResults = (events: any[]) => events.slice(0, 3).map(ev =>
                        `${ev.homeTeam.name} ${ev.homeScore?.current || 0}-${ev.awayScore?.current || 0} ${ev.awayTeam.name}`
                    ).join(", ");

                    historyContext = `Últimos de local: ${formatResults(homeHistory || [])} | Últimos de visita: ${formatResults(awayHistory || [])}`;
                } catch (err) {
                    console.warn(`[Parley API] History fetch failed for ${e.homeTeam.name}:`, err);
                }
            }

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
                recentResults: historyContext,
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
            FOCO DEL USUARIO: El usuario desea un parley de ${sport === 'all' ? 'VARIOS DEPORTES (MIXTO)' : sport.toUpperCase()}.
            ESTRATEGIA REQUERIDA: ${strategyPrompts[strategyIndex] || strategyPrompts[0]}
            
            EVENTOS DISPONIBLES EN ${sport.toUpperCase()}:
            ${JSON.stringify(simplifiedEvents, null, 2)}

            INSTRUCCIONES CRÍTICAS PARA BALONCESTO:
            - Si el torneo es NBA: Los partidos duran 48 min y los puntos totales suelen estar entre 200 y 240.
            - Si NO es NBA (EuroLeague, ACB, LNB, etc.): Los partidos duran 40 min. El total de puntos suele oscilar entre 150 y 175. NO asumas automáticamente el "Under"; analiza si los equipos tienen tendencias ofensivas o defensivas basándote en las cuotas de mercado proporcionadas.
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
            temperature: 0.7,
            schema: ParleyResponseSchema // Use the correct schema for Parley
        });

        // 4. Save to history (if uid provided)
        if (uid) {
            await saveParleyPrediction(uid, {
                ...parleyResult,
                strategyIndex,
                sport
            }).catch(err => console.error('❌ Failed to save parley history:', err));
        }

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
