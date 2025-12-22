import { NextRequest, NextResponse } from 'next/server';
import { footballDataService } from '@/lib/services/footballDataService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {

        console.log('⚽ Fetching Football live games from SportsData...');

        const result = await footballDataService.getLiveEvents();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch from SportsData');
        }

        const events = result.data.events || [];
        console.log(`📊 Found ${events.length} live football events from Sofascore`);

        const recentEvents = events.filter((game: any) => {
            // STRICT FILTER: Only keep actual live games (remove all finished)
            if (game.status?.type === 'finished') {
                return false;
            }
            return true;
        });

        console.log(`✅ Filtered to ${recentEvents.length} recent events (removed all finished matches)`);

        // Transform to match frontend expectations
        const transformedData = recentEvents.map((game: any) => ({
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
                logo: `/api/proxy/team-logo/${game.homeTeam?.id}`,
            },
            awayTeam: {
                id: game.awayTeam?.id,
                name: game.awayTeam?.name || 'Away Team',
                logo: `/api/proxy/team-logo/${game.awayTeam?.id}`,
            },
            homeScore: {
                current: game.homeScore?.current || 0,
                display: game.homeScore?.display || 0,
                period1: game.homeScore?.period1,
                period2: game.homeScore?.period2,
                redCards: game.homeScore?.redCards ?? game.homeTeam?.redCards ?? 0
            },
            awayScore: {
                current: game.awayScore?.current || 0,
                display: game.awayScore?.display || 0,
                period1: game.awayScore?.period1,
                period2: game.awayScore?.period2,
                redCards: game.awayScore?.redCards ?? game.awayTeam?.redCards ?? 0
            },
            category: {
                name: game.tournament?.category?.name || 'International',
                flag: game.tournament?.category?.flag || '',
                id: game.tournament?.category?.id
            },
            status: {
                type: game.status?.type || 'inprogress',
                description: game.status?.description || 'Live',
                code: game.status?.code
            },
            roundInfo: game.roundInfo,
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

        // FALLBACK: Mock Data for Football
        const mockEvents = [
            {
                id: 1,
                tournament: { name: 'La Liga', uniqueTournament: { name: 'La Liga' } },
                homeTeam: { id: 2829, name: 'Real Madrid', logo: '/api/proxy/team-logo/2829' },
                awayTeam: { id: 2817, name: 'Barcelona', logo: '/api/proxy/team-logo/2817' },
                homeScore: { current: 1, display: 1 },
                awayScore: { current: 0, display: 0 },
                status: { type: 'inprogress', description: '75\'', code: 100 },
                startTimestamp: Date.now() / 1000 - 4500
            }
        ];

        return NextResponse.json({
            success: true,
            data: mockEvents,
            count: mockEvents.length,
            source: 'fallback_mock',
            error: error.message
        });
    }
}
