import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreFootballService } from '@/lib/services/sofaScoreFootballService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        console.log('⚽ Fetching Football live games from Sofascore...');

        const result = await sofaScoreFootballService.getLiveEvents();

        if (!result.success || !result.data) {
            // Fallback or error
            throw new Error(result.error || 'Failed to fetch from Sofascore');
        }

        const events = result.data.events || [];
        console.log(`📊 Found ${events.length} live football events`);

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
                period2: game.homeScore?.period2
            },
            awayScore: {
                current: game.awayScore?.current || 0,
                display: game.awayScore?.display || 0,
                period1: game.awayScore?.period1,
                period2: game.awayScore?.period2
            },
            status: {
                type: 'inprogress',
                description: game.status?.description || 'Live',
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
        console.error('❌ Football API Route Error:', error);
        return NextResponse.json({ success: false, data: [], error: error.message });
    }
}
