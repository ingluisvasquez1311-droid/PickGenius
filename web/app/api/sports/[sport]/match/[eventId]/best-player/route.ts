import { NextRequest, NextResponse } from 'next/server';
import { sofascoreService } from '@/lib/services/sofascoreService';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'gsk_45l2t3CJRILOERRz6fOBWGdyb3FY1VBWD3iGnlc8p1V3TVYVKXa'
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sport: string; eventId: string }> }
) {
    const { sport, eventId } = await params;

    if (!eventId || !sport) {
        return NextResponse.json({ success: false, error: 'Sport and Event ID required' }, { status: 400 });
    }

    try {
        console.log(`🤖 [Universal AI] Analyzing Best Players for ${sport} match ${eventId}...`);

        // 1. Fetch Real Stats from Sofascore via Universal Service
        const bestPlayers = await sofascoreService.getMatchBestPlayers(parseInt(eventId));

        if (!bestPlayers || (!bestPlayers.bestHomeTeamPlayer && !bestPlayers.bestAwayTeamPlayer)) {
            // Fallback: Try lineups if best-players endpoint returns nothing
            const lineups = await sofascoreService.getMatchLineups(parseInt(eventId));
            if (!lineups) {
                return NextResponse.json({ success: false, error: 'No stats available' });
            }
            // Simple logic to find top player from lineups if needed could go here
            return NextResponse.json({ success: false, error: 'No summarized best players available' });
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

        // 2. AI Analysis of the MVP
        const statsStr = `${mvp.player?.name} (${mvp.position || 'N/A'}): ${JSON.stringify(mvp.statistics || {})}. Sport: ${sport}.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a sports commentator with a 'cyberpunk/brutal' style.
                    Analyze the player stats for the sport: ${sport}.
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

        const aiContent = JSON.parse(completion.choices[0].message.content || '{}');

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
                    imageUrl: `https://images.weserv.nl/?url=${encodeURIComponent(`https://api.sofascore.app/api/v1/player/${mvp.player?.id}/image`)}`
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
        console.error(`❌ Universal Best Player API Error (${sport}):`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
