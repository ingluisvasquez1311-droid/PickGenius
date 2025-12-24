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
                profile.email.toLowerCase() === 'ingluisvasquez1311@gmail.com'
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

        // 2. Filter by Sport AND Mode
        const allEventsRaw = [...footballEvents, ...basketballEvents, ...baseballEvents, ...nflEvents, ...nhlEvents, ...tennisEvents]
            .filter(e => {
                if (!e.status || e.status.type === 'finished') return false;

                // Match Mode Filtering (Live vs Pre-match)
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
            });

        let filteredEvents: any[] = [];
        if (sport === 'all') {
            const groups: { [key: string]: any[] } = {};
            allEventsRaw.forEach(e => {
                const sName = e.tournament.category.sport.slug || 'other';
                if (!groups[sName]) groups[sName] = [];
                groups[sName].push(e);
            });
            Object.values(groups).forEach(group => {
                filteredEvents.push(...group.sort((a, b) => a.startTimestamp - b.startTimestamp).slice(0, 15));
            });
            filteredEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);
        } else {
            filteredEvents = allEventsRaw.sort((a, b) => a.startTimestamp - b.startTimestamp).slice(0, 50);
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
            Eres un experto tipster profesional. Genera un parley de 2 a 5 selecciones.
            MODALIDAD: ${mode === 'live' ? 'PARTIDOS EN VIVO' : 'PARTIDOS PROXIMOS'}.
            DEPORTE: ${sport.toUpperCase()}.
            ESTRATEGIA: ${strategyPrompts[strategyIndex] || strategyPrompts[0]}
            
            DATOS:
            ${JSON.stringify(simplifiedEvents, null, 2)}

            ${!isPremiumUser ? 'BLOQUEO: SOLO mercados de equipo (ganador, goles, handicaps). NO PLAYER PROPS.' : 'PREMIUM: Incluye PLAYER PROPS de alto valor.'}

            JSON ÚNICAMENTE (Asegúrate de incluir 'startTime' para cada leg):
            {
              "title": "Título",
              "confidence": 85,
              "totalOdds": 5.45,
              "isValueParley": true,
              "valueAnalysis": "Razonamiento...",
              "legs": [{ 
                "matchName": "A vs B", 
                "pick": "Pick", 
                "odds": "1.85", 
                "confidence": 80, 
                "startTime": "Mier, 24 Dic 18:00",
                "reasoning": "Por qué..." 
              }],
              "analysis": "Análisis final...",
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
