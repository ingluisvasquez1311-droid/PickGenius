import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreBasketballService } from '@/lib/services/sofaScoreBasketballService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        console.log('🏀 Fetching Basketball live games from SofaScore...');

        // Fetch using our service which handles headers and caching
        const result = await sofaScoreBasketballService.getLiveEvents();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch from Sofascore');
        }

        const events = result.data.events || [];

        console.log(`📊 Found ${events.length} live basketball events`);

        // Transform to match frontend expectations
        const transformedData = events.map((game: any) => ({
            id: game.id,
            tournament: {
                name: game.tournament?.name || 'Unknown League',
                uniqueTournament: {
                    name: game.tournament?.uniqueTournament?.name || game.tournament?.name || 'Unknown'
                }
            },
            homeTeam: {
                id: game.homeTeam?.id,
                name: game.homeTeam?.name || 'Home Team',
                logo: `https://api.sofascore.app/api/v1/team/${game.homeTeam?.id}/image`
            },
            awayTeam: {
                id: game.awayTeam?.id,
                name: game.awayTeam?.name || 'Away Team',
                logo: `https://api.sofascore.app/api/v1/team/${game.awayTeam?.id}/image`
            },
            homeScore: {
                current: game.homeScore?.current || 0,
                display: game.homeScore?.display || 0,
                period1: game.homeScore?.period1,
                period2: game.homeScore?.period2,
                period3: game.homeScore?.period3,
                period4: game.homeScore?.period4
            },
            awayScore: {
                current: game.awayScore?.current || 0,
                display: game.awayScore?.display || 0,
                period1: game.awayScore?.period1,
                period2: game.awayScore?.period2,
                period3: game.awayScore?.period3,
                period4: game.awayScore?.period4
            },
            status: {
                type: 'inprogress', // Sofascore live events are generally in progress
                description: getDescription(game),
                code: game.status?.code
            },
            startTimestamp: game.startTimestamp
        }));

        return NextResponse.json({
            success: true,
            data: transformedData,
            count: transformedData.length,
            source: 'sofascore'
        });

    } catch (error: any) {
        console.error('❌ Basketball API Route Error:', error);

        // Return Empty 200 OK instead of 500 to prevent UI crash
        return NextResponse.json({
            success: false,
            data: [],
            error: error.message
        });
    }
}

function getDescription(game: any): string {
    const status = game.status?.description;
    const period = game.status?.type === 'inprogress' ? 'Live' : status;

    // Try to construct Q4 - 2:30 format if data allows
    return status || 'Live';
}
