import { NextRequest, NextResponse } from 'next/server';
import { footballDataService } from '@/lib/services/footballDataService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ success: false, error: 'Match ID required' }, { status: 400 });
    }

    try {
        console.log(`⚽ Fetching Football Match Details for ID ${id} from Sofascore...`);

        // Parallel fetch for all details
        const [detailsRes, statsRes, lineupsRes, incidentsRes] = await Promise.all([
            footballDataService.getEventDetails(id),
            footballDataService.getEventStatistics(id),
            footballDataService.getLineups(id),
            footballDataService.getIncidents(id)
        ]);

        if (!detailsRes.success || !detailsRes.data) {
            return NextResponse.json({ success: false, error: 'Match not found in Sofascore' }, { status: 404 });
        }

        const event = detailsRes.data.event;

        // Normalizar estructura para el frontend
        const normalizedData = {
            event: {
                id: event.id,
                tournament: event.tournament,
                season: event.season,
                homeTeam: event.homeTeam,
                awayTeam: event.awayTeam,
                homeScore: event.homeScore || { current: 0 },
                awayScore: event.awayScore || { current: 0 },
                status: event.status,
                startTimestamp: event.startTimestamp
            },
            statistics: statsRes.success ? statsRes.data : { statistics: [] }, // Sofascore stats structure is already generic
            lineups: lineupsRes.success ? lineupsRes.data : null,
            incidents: incidentsRes.success ? incidentsRes.data.incidents : [] // Sofascore returns { incidents: [...] }
        };

        // If incidents need transformation (Sofascore incidents are already rich, but let's ensure text/type mapping if needed)
        // Frontend likely expects: text, time, isHome, type.
        // Sofascore incidents usually have: text, time, isHome, incidentType.
        if (normalizedData.incidents) {
            normalizedData.incidents = normalizedData.incidents.map((inc: any) => ({
                id: inc.id?.toString() || Math.random().toString(),
                text: inc.text || inc.incidentType, // Fallback
                time: inc.time,
                isHome: inc.isHome,
                type: inc.incidentType,
                player: inc.player
            }));
        }

        return NextResponse.json(normalizedData);

    } catch (error: any) {
        console.error('Match Details API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
