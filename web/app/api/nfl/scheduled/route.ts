import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

        const events = await sportsDataService.getScheduledEventsBySport('nfl', date);

        const transformedData = events.map((game: any) => ({
            id: game.id,
            tournament: {
                name: game.tournament?.name || 'NFL',
                uniqueTournament: {
                    name: 'NFL'
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
