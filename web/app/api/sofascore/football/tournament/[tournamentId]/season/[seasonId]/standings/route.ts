import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreFootballService } from '@/lib/services/sofaScoreFootballService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tournamentId: string; seasonId: string }> }
) {
    try {
        const { tournamentId, seasonId } = await params;
        const result = await sofaScoreFootballService.getStandings(tournamentId, seasonId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
