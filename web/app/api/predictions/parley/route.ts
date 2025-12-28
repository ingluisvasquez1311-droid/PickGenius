import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { groqService } from '@/lib/services/groqService';
import { getUserProfile, saveParleyPrediction } from '@/lib/userService';
import { ParleyResponseSchema } from '@/lib/schemas/prediction-schemas';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        let strategyIndex = 0;
        const { uid, sport = 'all', mode = 'pre' } = body;
        if (body.strategyIndex !== undefined) strategyIndex = body.strategyIndex;

        console.log(`📡 [Parley API] Mode: ${mode} | Sport: ${sport} | Strategy: ${strategyIndex}`);

        // --- AUTH/TIER CHECK ---
        let isPremiumUser = false;
        if (uid) {
            const profile = await getUserProfile(uid);
            const isOwner = profile?.email && (
                profile.email.toLowerCase() === 'pickgenius@gmail.com' ||
                profile.email.toLowerCase() === 'ingluisvasquez1311@gmail.com' ||
                profile.email.toLowerCase() === 'luisvasquez1311@gmail.com'
            );
            isPremiumUser = profile?.isPremium || profile?.role === 'admin' || isOwner || false;
            console.log(`👤 [Parley API] User ${uid} | isPremium: ${isPremiumUser}`);
        }

        if (!isPremiumUser) {
            console.log('🔒 [Parley API] Free user detected. Forcing SAFE strategy.');
            strategyIndex = 0;
        }

        // 1. Fetch data
        const [footballEvents, basketballEvents, baseballEvents, nflEvents, nhlEvents, tennisEvents, valueBets] = await Promise.all([
            sportsDataService.getEventsBySport('football').catch(() => []),
            sportsDataService.getEventsBySport('basketball').catch(() => []),
            sportsDataService.getEventsBySport('baseball').catch(() => []),
            sportsDataService.getEventsBySport('american-football').catch(() => []),
            sportsDataService.getEventsBySport('icehockey').catch(() => []),
            sportsDataService.getEventsBySport('tennis').catch(() => []),
            import('@/lib/services/valueBetsService').then(m => m.valueBetsService.getValueBets()).catch(() => [])
        ]);

        const BIG_LEAGUES = [
            'Premier League', 'LaLiga', 'Serie A', 'Bundesliga', 'Ligue 1',
            'NBA', 'NBA Cup', 'EuroLeague', 'Champions League', 'MLB', 'NFL', 'NHL'
        ];

        // 2. Filter and Map with Value Detection
        const allEventsRaw = [...footballEvents, ...basketballEvents, ...baseballEvents, ...nflEvents, ...nhlEvents, ...tennisEvents]
            .filter(e => {
                if (!e.status || e.status.type === 'finished') return false;
                if (mode === 'live' && e.status.type !== 'inprogress') return false;
                if (mode === 'pre' && e.status.type === 'inprogress') return false;

                if (sport !== 'all') {
                    const eSport = e.tournament?.category?.sport?.name?.toLowerCase() || '';
                    if (sport === 'football' && !(eSport === 'football' || eSport === 'soccer')) return false;
                    if (sport === 'basketball' && eSport !== 'basketball') return false;
                    if (sport === 'baseball' && eSport !== 'baseball') return false;
                    if (sport === 'tennis' && eSport !== 'tennis') return false;
                    if (sport === 'american-football' && (eSport !== 'american-football' && eSport !== 'nfl')) return false;
                    if (sport === 'icehockey' && (eSport !== 'icehockey' && eSport !== 'nhl')) return false;
                }
                return true;
            })
            .map(e => {
                // Check if this event is a Value Bet
                const valueBet = valueBets.find(vb =>
                    vb.homeTeam === e.homeTeam.name ||
                    String(vb.id).includes(String(e.id))
                );

                return {
                    ...e,
                    isPriority: BIG_LEAGUES.some(bl =>
                        e.tournament.name.toLowerCase().includes(bl.toLowerCase()) ||
                        e.tournament.category.name.toLowerCase().includes(bl.toLowerCase())
                    ),
                    valueHint: valueBet ? {
                        edge: valueBet.edge,
                        market: valueBet.market,
                        selection: valueBet.selection,
                        odds: valueBet.odds
                    } : null
                };
            });

        // 3. Prioritization Logic: Value Hits > Big Leagues > Others
        const filteredEvents = allEventsRaw
            .sort((a, b) => {
                // 1. Value First
                if (a.valueHint && !b.valueHint) return -1;
                if (!a.valueHint && b.valueHint) return 1;
                // 2. Big Leagues Second
                if (a.isPriority && !b.isPriority) return -1;
                if (!a.isPriority && b.isPriority) return 1;
                // 3. Start time
                return a.startTimestamp - b.startTimestamp;
            })
            .slice(0, 50);

        if (filteredEvents.length < 2) {
            return NextResponse.json({
                success: false,
                error: `No hay suficientes eventos ${mode === 'live' ? 'en vivo' : 'por comenzar'} de ${sport === 'all' ? 'deporte mixto' : sport} actualmente.`
            });
        }

        // Simplified data for AI with Value Context
        const simplifiedEvents = await Promise.all(filteredEvents.map(async (e) => {
            const oddsRes = e.valueHint ? null : await sportsDataService.getMatchOdds(e.id).catch(() => null);

            return {
                id: e.id,
                match: `${e.homeTeam.name} vs ${e.awayTeam.name}`,
                status: e.status.description,
                sport: e.tournament.category.sport.name,
                league: e.tournament.name,
                startTime: new Date(e.startTimestamp * 1000).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                // INYECCIÓN DE VALOR: El secreto del éxito
                valueAnalysis: e.valueHint ? `VALOR DETECTADO: El mercado ${e.valueHint.market} tiene un Edge del ${e.valueHint.edge}% en Betplay.` : null,
                realMarketOdds: e.valueHint ? [{ name: e.valueHint.market, odds: [`${e.valueHint.selection}: ${e.valueHint.odds}`] }] :
                    (oddsRes?.markets?.slice(0, 2).map((m: any) => ({
                        name: m.marketName,
                        odds: m.choices?.slice(0, 3).map((c: any) => `${c.name}: ${c.fraction}`)
                    })) || [])
            };
        }));

        const strategyPrompts = [
            "CORRELACIÓN DE PROPS: Busca 3 eventos donde un favorito sólido tenga ventaja clara.",
            "HEDGE DE VOLATILIDAD: Combina apuestas seguras con alto valor.",
            "DETECCIÓN DE RACHAS: Enfócate en equipos con momentum actual."
        ];

        const prompt = `
            Eres un experto tipster profesional de apuestas de alto nivel.
            MODALIDAD: ${mode === 'live' ? 'PARTIDOS EN VIVO' : 'PARTIDOS PROXIMOS'}.
            DEPORTE: ${sport.toUpperCase()}.
            ESTRATEGIA: ${strategyPrompts[strategyIndex] || strategyPrompts[0]}
            
            INSTRUCCIÓN DE FILTRADO (CRÍTICO):
            - He filtrado los datos para priorizar las GRANDES LIGAS: Premier League, LaLiga, Serie A, Bundes, Eredivisie, Brasileirao, Liga Argentina y la NBA (incluyendo NBA Cup).
            - PRIORIDAD MÁXIMA PARA NBA: Si hay juegos de NBA, enfócate en PLAYER PROPS de estrellas (más de X puntos, rebotes, etc).
            - PRIORIDAD FÚTBOL: Enfócate en las ligas de élite mencionadas. Prefiere mercados de Córners o Goles en estas ligas antes que ganar/perder en ligas menores.

            DATOS (Ordenados por relevancia y liga):
            ${JSON.stringify(simplifiedEvents, null, 2)}

            ${!isPremiumUser ? 'BLOQUEO: SOLO mercados de equipo (ganador, goles, handicaps). NO PLAYER PROPS.' : 'PREMIUM: Incluye PLAYER PROPS de estrellas de NBA y Fútbol.'}

            INSTRUCCIONES DE FORMATO (JSON ÚNICAMENTE):
            {
              "title": "Título del Parley Élite",
              "confidence": 85,
              "totalOdds": 5.45,
              "isValueParley": true,
              "valueAnalysis": "Por qué estas ligas principales tienen valor...",
              "legs": [{ 
                "matchName": "A vs B", 
                "pick": "Pick", 
                "odds": "1.85", 
                "confidence": 80, 
                "startTime": "Mier, 24 Dic 18:00",
                "reasoning": "Breve análisis basado en el nivel de la liga..." 
              }],
              "analysis": "Resumen de por qué elegiste estas ligas...",
              "riskLevel": "Medio"
            }
        `;

        const parleyResult = await groqService.createPrediction({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 2000,
            schema: ParleyResponseSchema
        });

        if (uid) {
            await saveParleyPrediction(uid, { ...parleyResult, strategyIndex, sport }).catch(() => { });
        }

        return NextResponse.json({ success: true, data: parleyResult });

    } catch (error: any) {
        console.error('❌ Parley API Error:', error);
        return NextResponse.json({ success: false, error: "Error interno al generar el parley." }, { status: 500 });
    }
}