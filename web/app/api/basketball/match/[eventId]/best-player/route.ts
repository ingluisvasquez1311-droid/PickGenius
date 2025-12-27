import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { groqService } from '@/lib/services/groqService';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;

    if (!eventId) {
        return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    try {
        console.log(`🤖 [Legacy AI Bridge] Analyzing Best Players for Basketball Match ${eventId}...`);

        // Use the universal service which handles ScraperAPI bypass
        const bestPlayers = await sportsDataService.getMatchBestPlayers(parseInt(eventId));

        if (!bestPlayers || (!bestPlayers.bestHomeTeamPlayer && !bestPlayers.bestAwayTeamPlayer)) {
            return NextResponse.json({ success: false, error: 'No stats available' });
        }

        const bestHome = bestPlayers.bestHomeTeamPlayer;
        const bestAway = bestPlayers.bestAwayTeamPlayer;

        // Determine Overall MVP
        let mvp = bestHome;
        let mvpTeam = 'home';

        if (bestAway && (!bestHome || (bestAway.statistics?.rating || 0) > (bestHome.statistics?.rating || 0))) {
            mvp = bestAway;
            mvpTeam = 'away';
        }

        if (!mvp) {
            return NextResponse.json({ success: false, error: 'No player stats found' });
        }

        // 2. AI Analysis of the MVP usando groqService
        const statsStr = `${mvp.player?.name} (${mvp.position || 'N/A'}): ${JSON.stringify(mvp.statistics || {})}. Sport: basketball.`;

        const aiContent = await groqService.createPrediction({
            messages: [
                {
                    role: "system",
                    content: `You are a sports commentator with a 'cyberpunk/brutal' style.
                    Analyze the player stats for the sport: basketball.
                    Output JSON with:
                    - shortTitle: Max 3 words (e.g. "PURE DOMINANCE", "SNIPER ALERT").
                    - impactDescription: Max 8 words description of their game style today.`
                },
                {
                    role: "user",
                    content: `Stats: ${statsStr}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        return NextResponse.json({
            success: true,
            data: {
                mvp: {
                    name: mvp.player?.name,
                    slug: mvp.player?.slug,
                    position: mvp.position,
                    rating: mvp.statistics?.rating || 0,
                    stats: mvp.statistics || {},
                    team: mvpTeam,
                    imageUrl: `/api/proxy/player-image/${mvp.player?.id}`
                },
                ai: {
                    title: aiContent.shortTitle || "ON FIRE",
                    description: aiContent.impactDescription || "Managing the game with pure tactical efficiency."
                },
                allPlayers: {
                    home: bestPlayers.homeTeamPlayers || [],
                    away: bestPlayers.awayTeamPlayers || []
                }
            }
        });

    } catch (error: any) {
        console.error(`❌ Legacy Best Player API Error:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}