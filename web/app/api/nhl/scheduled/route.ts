import { NextRequest, NextResponse } from 'next/server';
import { firebaseReadService } from '@/lib/services/firebaseReadService';
import { batchSyncService } from '@/lib/services/batchSyncService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        console.log(`[API] Fetching SCHEDULED NHL games for ${date} (Firebase-First)...`);

        let events = await firebaseReadService.getScheduledGames('ice-hockey', date);

        if (events.length === 0) {
            console.warn(`[API] No scheduled NHL games for ${date}. Triggering sync...`);
            await batchSyncService.syncSport('ice-hockey');
            events = await firebaseReadService.getScheduledGames('ice-hockey', date);
        }

        const transformedData = events.map((game: any) => ({
            id: game.id,
            tournament: {
                name: game.tournament?.name || 'NHL',
                uniqueTournament: {
                    name: 'NHL'
                },
                category: {
                    name: 'USA',
                    flag: 'usa',
                }
            },
            homeTeam: {
                id: game.homeTeam?.id,
                name: game.homeTeam?.name || 'Home Team',
                logo: `/api/proxy/team-logo/${game.homeTeam?.id}`,
            },
            awayTeam: {
                id: game.awayTeam?.id,
                name: game.awayTeam?.name || 'Away Team',
                logo: `/api/proxy/team-logo/${game.awayTeam?.id}`,
            },
            status: {
                type: 'notstarted',
                description: new Date(game.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                code: game.status?.code
            },
            startTimestamp: game.startTimestamp
        }));

        return NextResponse.json({
            success: true,
            data: transformedData,
            count: transformedData.length
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}