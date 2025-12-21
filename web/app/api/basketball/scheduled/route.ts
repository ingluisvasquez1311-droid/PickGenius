import { NextRequest, NextResponse } from 'next/server';
import { basketballDataService } from '@/lib/services/basketballDataService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

        const response = await basketballDataService.getScheduledEvents(date);

        if (!response.success || !response.data) {
            return NextResponse.json(response, { status: 500 });
        }

        const events = response.data.events || [];
        const transformedData = events.map((game: any) => ({
            id: game.id,
            tournament: {
                name: game.tournament?.name || 'Unknown League',
                uniqueTournament: {
                    name: game.tournament?.uniqueTournament?.name || game.tournament?.name || 'Unknown'
                },
                category: {
                    name: game.tournament?.category?.name || 'International',
                    flag: game.tournament?.category?.flag || '',
                    id: game.tournament?.category?.id
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
            data: {
                events: transformedData
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
