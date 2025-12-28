import { NextRequest, NextResponse } from 'next/server';
import { firebaseReadService } from '@/lib/FirebaseReadService';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

try {
    initializeFirebaseAdmin();
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    try {
        console.log(`[API] Fetching SCHEDULED NHL games for ${date} (Firebase-First)...`);

        const events = await firebaseReadService.getScheduledGames('ice-hockey');

        if (events.length === 0) {
            console.warn(`[API] No scheduled NHL games for ${date}. Triggering sync...`);
            fetch(`http://localhost:3001/api/trigger/sofascore`, { method: 'POST' })
                .catch(err => console.error('Sync trigger failed:', err));
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
            events: transformedData,
            count: transformedData.length
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}