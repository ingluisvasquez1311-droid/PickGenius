import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { MatchParamsSchema, validateParams } from '@/lib/validators';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sport: string; eventId: string; path?: string[] }> }
) {
    try {
        const { sport, eventId } = await validateParams(params, MatchParamsSchema);
        const resolvedParams = await params;
        const subPath = resolvedParams.path ? resolvedParams.path.join('/') : '';

        console.log(`🌐 [Match Proxy] Hit: /${sport}/match/${eventId}/${subPath}`);

        let data;

        // Routing Logic based on subPath
        if (subPath === 'best-player') {
            data = await sportsDataService.getMatchBestPlayers(parseInt(eventId));
        } else if (subPath === 'statistics') {
            data = await sportsDataService.getMatchStatistics(parseInt(eventId));
            console.log(`📊 [Match Proxy] Statistics for ${eventId}:`, data ? 'FOUND' : 'NOT FOUND');
        } else if (subPath === 'attack-momentum') {
            data = await sportsDataService.getMatchMomentum(parseInt(eventId));
            console.log(`⚡ [Match Proxy] Momentum for ${eventId}:`, data ? 'FOUND' : 'NOT FOUND');
        } else if (subPath === 'lineups') {
            data = await sportsDataService.getMatchLineups(parseInt(eventId));
            console.log(`📋 [Match Proxy] Lineups for ${eventId}:`, data ? 'FOUND' : 'NOT FOUND');
        } else if (subPath === '') {
            // Default: Match Details
            console.log(`🔍 [Match Proxy] Fetching basic details for ${eventId}...`);
            const response = await sportsDataService.makeRequest(`/event/${eventId}`);

            if (response) {
                // Sofascore usually returns { event: {...} }
                // But some proxies or versions might return the event object directly.
                if (response.event) {
                    data = response.event;
                    console.log(`✅ [Match Proxy] Event found in response.event`);
                } else if (response.id && response.id.toString() === eventId) {
                    data = response;
                    console.log(`✅ [Match Proxy] Event found in root of response`);
                } else {
                    console.warn(`⚠️ [Match Proxy] Response received but structure unknown:`, Object.keys(response));
                    // Fallback: if it has an id, use it
                    if (response.id) data = response;
                }
            }
        } else {
            // Generic Fallback via makeRequest
            data = await sportsDataService.makeRequest(`/event/${eventId}/${subPath}`);
        }

        if (!data) {
            console.warn(`❌ [Match Proxy] No data found for ${eventId}/${subPath}`);
            // Return empty stats/data structure to prevent frontend crash if it's a subpath
            if (subPath === 'best-player') return NextResponse.json({ success: true, data: { homeTeam: [], awayTeam: [] } });
            if (subPath === 'statistics') return NextResponse.json({ success: true, data: { statistics: [] } });

            return NextResponse.json({ success: false, error: 'Match or data not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: data
        });

    } catch (error: any) {
        console.error(`❌ [Match Proxy] Exception:`, error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}