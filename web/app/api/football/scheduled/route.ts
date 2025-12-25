import { NextRequest, NextResponse } from 'next/server';
import { footballDataService } from '@/lib/services/footballDataService';
import { dateParamSchema } from '@/lib/schemas/paramSchema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateRaw = searchParams.get('date') || new Date().toISOString().split('T')[0];

        const dateValidation = dateParamSchema.safeParse(dateRaw);
        if (!dateValidation.success) {
            return NextResponse.json({ success: false, message: 'Formato de fecha inválido' }, { status: 400 });
        }

        const date = dateValidation.data;

        const response = await footballDataService.getFilteredScheduledEvents(date);

        if (!response.success || !response.data) {
            return NextResponse.json({
                success: true,
                data: [],
                source: 'no_data'
            });
        }

        const events = response.data.events || [];

        // Transform for consistency
        const transformedData = events.map((game: any) => {
            const leagueCategory = {
                name: game.tournament?.category?.name || 'International',
                flag: game.tournament?.category?.flag || '',
                id: game.tournament?.category?.id
            };

            return {
                id: game.id,
                tournament: {
                    name: game.tournament?.name || 'Unknown League',
                    category: leagueCategory,
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
                    display: game.homeScore?.display || 0
                },
                awayScore: {
                    current: game.awayScore?.current || 0,
                    display: game.awayScore?.display || 0
                },
                category: leagueCategory,
                status: {
                    type: game.status?.type || 'notstarted',
                    description: game.status?.description || 'Scheduled',
                    code: game.status?.code
                },
                roundInfo: game.roundInfo,
                startTimestamp: game.startTimestamp
            };
        });

        return NextResponse.json({
            success: true,
            data: transformedData,
            count: transformedData.length,
            source: 'sofascore'
        });
    } catch (error: any) {
        console.error('❌ Football Scheduled API Critical Error:', error);
        // CRITICAL FAILOVER
        return NextResponse.json({
            success: true,
            data: [],
            source: 'critical_fallback'
        });
    }
}
