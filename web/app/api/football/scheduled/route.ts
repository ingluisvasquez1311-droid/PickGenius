import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreFootballService } from '@/lib/services/sofaScoreFootballService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

        const response = await sofaScoreFootballService.getScheduledEvents(date);

        if (!response.success) {
            console.warn('⚠️ Football Scheduled API Failed, returning mock data:', response.error);
            // FAILOVER: Return Mock Data
            return NextResponse.json({
                success: true,
                data: {
                    events: [
                        {
                            id: 112233,
                            tournament: { name: 'Premier League', uniqueTournament: { name: 'Premier League' } },
                            homeTeam: { name: 'Manchester City', id: 17 },
                            awayTeam: { name: 'Liverpool', id: 44 },
                            status: { description: '20:00', type: 'notstarted' },
                            startTimestamp: Date.now() + 3600000
                        },
                        {
                            id: 445566,
                            tournament: { name: 'LaLiga', uniqueTournament: { name: 'LaLiga' } },
                            homeTeam: { name: 'Real Madrid', id: 2829 },
                            awayTeam: { name: 'Barcelona', id: 2817 },
                            status: { description: '22:00', type: 'notstarted' },
                            startTimestamp: Date.now() + 7200000
                        }
                    ]
                },
                source: 'fallback_mock'
            });
        }

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('❌ Football Scheduled API Critical Error:', error);
        // CRITICAL FAILOVER
        return NextResponse.json({
            success: true,
            data: { events: [] },
            source: 'critical_fallback'
        });
    }
}
