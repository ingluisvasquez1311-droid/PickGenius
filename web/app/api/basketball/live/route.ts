import { NextRequest, NextResponse } from 'next/server';
import { basketballDataService } from '@/lib/services/basketballDataService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {

        console.log('🏀 Fetching Basketball live games from SportsData...');

        // Fetch using our service which handles headers and caching
        const result = await basketballDataService.getLiveEvents();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch from SportsData');
        }

        const events = result.data.events || [];

        // STRICT FILTER: Only matches currently in progress
        const liveEvents = events.filter((game: unknown) => {
            const g = game as Record<string, any>;
            return g.status?.type === 'inprogress' ||
                (g.status?.type === 'notstarted' && g.status?.description === 'Scheduled');
        });

        console.log(`✅ Filtered to ${liveEvents.length} live/scheduled basketball events`);

        // Transform to match frontend expectations
        const transformedData = liveEvents.map((game: unknown) => {
            const g = game as Record<string, any>;
            const leagueCategory = {
                name: g.tournament?.category?.name || 'International',
                flag: g.tournament?.category?.flag || '',
                id: g.tournament?.category?.id
            };

            return {
                id: g.id,
                tournament: {
                    name: g.tournament?.name || 'Unknown League',
                    category: leagueCategory,
                    uniqueTournament: {
                        name: g.tournament?.uniqueTournament?.name || g.tournament?.name || 'Unknown'
                    }
                },
                homeTeam: {
                    id: g.homeTeam?.id,
                    name: g.homeTeam?.name || 'Home Team',
                    logo: `/api/proxy/team-logo/${g.homeTeam?.id}`,
                },
                awayTeam: {
                    id: g.awayTeam?.id,
                    name: g.awayTeam?.name || 'Away Team',
                    logo: `/api/proxy/team-logo/${g.awayTeam?.id}`,
                },
                homeScore: {
                    current: g.homeScore?.current || 0,
                    display: g.homeScore?.display || 0,
                    period1: g.homeScore?.period1,
                    period2: g.homeScore?.period2,
                    period3: g.homeScore?.period3,
                    period4: g.homeScore?.period4
                },
                awayScore: {
                    current: g.awayScore?.current || 0,
                    display: g.awayScore?.display || 0,
                    period1: g.awayScore?.period1,
                    period2: g.awayScore?.period2,
                    period3: g.awayScore?.period3,
                    period4: g.awayScore?.period4
                },
                category: leagueCategory,
                status: {
                    type: g.status?.type || 'inprogress',
                    description: g.status?.description || 'Live',
                    code: g.status?.code
                },
                roundInfo: g.roundInfo,
                startTimestamp: g.startTimestamp
            };
        });

        return NextResponse.json({
            success: true,
            data: transformedData,
            count: transformedData.length,
            source: 'sofascore'
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('❌ Basketball API Route Error:', err);

        // Return actual error state to avoid misleading "NBA Mock Games"
        return NextResponse.json({
            success: false,
            data: [],
            count: 0,
            source: 'error_fallback',
            error: err.message || 'Internal Server Error'
        }, { status: 500 });
    }
}

function getDescription(game: unknown): string {
    const g = game as Record<string, any>;
    const status = g.status?.description;
    // Try to construct Q4 - 2:30 format if data allows
    return status || 'Live';
}
