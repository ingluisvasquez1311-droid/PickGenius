import { NextRequest, NextResponse } from 'next/server';
import { footballDataService } from '@/lib/services/footballDataService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

        const response = await footballDataService.getScheduledEvents(date);

        if (!response.success || !response.data) {
            console.warn('⚠️ Football Scheduled API Failed, returning mock data:', response.error);
            // FAILOVER: Return Mock Data
            return NextResponse.json({
                success: true,
                data: [
                    {
                        id: 112233,
                        tournament: {
                            name: 'Premier League',
                            category: { name: 'England', id: 1 },
                            uniqueTournament: { name: 'Premier League' }
                        },
                        homeTeam: { name: 'Manchester City', id: 17, logo: '/api/proxy/team-logo/17' },
                        awayTeam: { name: 'Liverpool', id: 44, logo: '/api/proxy/team-logo/44' },
                        status: { description: '20:00', type: 'notstarted' },
                        startTimestamp: Math.floor(Date.now() / 1000) + 3600
                    },
                    {
                        id: 445566,
                        tournament: {
                            name: 'La Liga',
                            category: { name: 'Spain', id: 32 },
                            uniqueTournament: { name: 'La Liga' }
                        },
                        homeTeam: { name: 'Real Madrid', id: 2829, logo: '/api/proxy/team-logo/2829' },
                        awayTeam: { name: 'Barcelona', id: 2817, logo: '/api/proxy/team-logo/2817' },
                        status: { description: '22:00', type: 'notstarted' },
                        startTimestamp: Math.floor(Date.now() / 1000) + 7200
                    }
                ],
                source: 'fallback_mock'
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
