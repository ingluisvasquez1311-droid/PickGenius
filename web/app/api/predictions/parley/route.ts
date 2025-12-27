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
        const [footballEvents, basketballEvents, baseballEvents, nflEvents, nhlEvents, tennisEvents] = await Promise.all([
            sportsDataService.getEventsBySport('football').catch(() => []),
            sportsDataService.getEventsBySport('basketball').catch(() => []),
            sportsDataService.getEventsBySport('baseball').catch(() => []),
            sportsDataService.getEventsBySport('american-football').catch(() => []),
            sportsDataService.getEventsBySport('icehockey').catch(() => []),
            sportsDataService.getEventsBySport('tennis').catch(() => [])
        ]);

        const BIG_LEAGUES = [
            'Premier League', 'LaLiga', 'Serie A', 'Bundesliga', 'Ligue 1',
            'Eredivisie', 'Brasileirão', 'Primera División', 'Liga Profesional',
            'NBA', 'NBA Cup', 'EuroLeague', 'Champions League', 'Libertadores', 'Sudamericana',
            'MLB', 'NFL', 'NHL'
        ];

        // 2. Filter by Sport AND Mode AND Priority Leagues
        const allEventsRaw = [...footballEvents, ...basketballEvents, ...baseballEvents, ...nflEvents, ...nhlEvents, ...tennisEvents]
            .filter(e => {
                if (!e.status || e.status.type === 'finished') return false;

                // Match Mode Filtering
                if (mode === 'live' && e.status.type !== 'inprogress') return false;
                if (mode === 'pre' && e.status.type === 'inprogress') return false;

                // Sport filtering
                if (sport !== 'all') {
                    const eSport = e.tournament?.category?.sport?.name?.toLowerCase() || '';
                    const isFútbol = eSport === 'football' || eSport === 'soccer';

                    if (sport === 'football' && !isFútbol) return false;
                    if (sport === 'basketball' && eSport !== 'basketball') return false;
                    if (sport === 'baseball' && eSport !== 'baseball') return false;
                    if (sport === 'tennis' && eSport !== 'tennis') return false;
                    if (sport === 'american-football' && (eSport !== 'american-football' && eSport !== 'nfl')) return false;
                    if (sport === 'icehockey' && (eSport !== 'icehockey' && eSport !== 'nhl')) return false;
                }

                return true;
            })
            .map(e => ({
                ...e,
                isPriority: BIG_LEAGUES.some(bl =>
                    e.tournament.name.toLowerCase().includes(bl.toLowerCase()) ||
                    e.tournament.category.name.toLowerCase().includes(bl.toLowerCase())
                )
            }));

        // Prioritize Big Leagues in the final selection
        let filteredEvents: any[] = [];
        const priorityEvents = allEventsRaw.filter(e => e.isPriority);
        const secondaryEvents = allEventsRaw.filter(e => !e.isPriority);

        if (sport === 'all') {
            const groups: { [key: string]: any[] } = {};
            // Take up to 20 priority events first
            const baseEvents = priorityEvents.length >= 10 ? priorityEvents : [...priorityEvents, ...secondaryEvents];

            baseEvents.forEach(e => {
                const sName = e.tournament.category.sport.slug || 'other';
                if (!groups[sName]) groups[sName] = [];
                groups[sName].push(e);
            });
            Object.values(groups).forEach(group => {
                filteredEvents.push(...group.sort((a, b) => a.startTimestamp - b.startTimestamp).slice(0, 15));
            });
            filteredEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);
        } else {
            // Specific sport: Priority first
            filteredEvents = [...priorityEvents, ...secondaryEvents.slice(0, 30)]
                .sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0) || a.startTimestamp - b.startTimestamp)
                .slice(0, 60);
        }

        if (filteredEvents.length < 2) {
            return NextResponse.json({
                success: false,
                error: `No hay suficientes eventos ${mode === 'live' ? 'en vivo' : 'por comenzar'} de ${sport === 'all' ? 'deporte mixto' : sport} actualmente.`
            });
        }

        // Simplified data for AI
        const simplifiedEvents = await Promise.all(filteredEvents.map(async (e, idx) => {
            const oddsRes = await sportsDataService.getMatchOdds(e.id).catch(() => null);
            let historyContext = "";
            if (idx < 8) { // Only for top matches to save performance
                try {
                    const [homeH, awayH] = await Promise.all([
                        sportsDataService.getTeamLastResults(e.homeTeam.id),
                        sportsDataService.getTeamLastResults(e.awayTeam.id)
                    ]);
                    historyContext = `Local: ${homeH.slice(0, 2).map((ev: any) => ev.homeScore?.current + "-" + ev.awayScore?.current).join(", ")} | Visita: ${awayH.slice(0, 2).map((ev: any) => ev.homeScore?.current + "-" + ev.awayScore?.current).join(", ")}`;
                } catch (err) { }
            }

            return {
                id: e.id,
                match: `${e.homeTeam.name} vs ${e.awayTeam.name}`,
                score: `${e.homeScore?.current || 0}-${e.awayScore?.current || 0}`,
                status: e.status.description,
                startTime: new Date(e.startTimestamp * 1000).toLocaleString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                tournament: e.tournament.name,
                sport: e.tournament.category.sport.name,
                recentResults: historyContext,
                realMarketOdds: oddsRes?.markets?.slice(0, 3).map((m: any) => ({
                    name: m.marketName,
                    odds: m.choices?.map((c: any) => `${c.name}: ${c.fraction}`)
                })) || []
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