
import { NextRequest, NextResponse } from 'next/server';
import { sofaScoreBasketballService } from '@/lib/services/sofaScoreBasketballService';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'gsk_45l2t3CJRILOERRz6fOBWGdyb3FY1VBWD3iGnlc8p1V3TVYVKXa'
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;

    if (!eventId) {
        return NextResponse.json({ success: false, error: 'Event ID required' }, { status: 400 });
    }

    try {
        // 1. Fetch Real Stats from Sofascore
        const result = await sofaScoreBasketballService.getBestPlayers(eventId);

        if (!result.success || !result.data || !result.data.bestPlayers) {
            return NextResponse.json({ success: false, error: 'No stats available' });
        }

        const bestHome = result.data.bestPlayers.homeTeamPlayers?.[0]; // Top Home Player
        const bestAway = result.data.bestPlayers.awayTeamPlayers?.[0]; // Top Away Player

        // Determine Overall MVP (Highest Rating)
        let mvp = bestHome;
        let mvpTeam = 'home';

        if (bestAway && (!bestHome || bestAway.statistics.rating > bestHome.statistics.rating)) {
            mvp = bestAway;
            mvpTeam = 'away';
        }

        if (!mvp) {
            return NextResponse.json({ success: false, error: 'No player stats found' });
        }

        // 2. AI Analysis of the MVP
        // We generate a "Brutal" one-liner about their performance
        const statsStr = `${mvp.player.name} (${mvp.position}): ${mvp.statistics.points || 0} PTS, ${mvp.statistics.assists || 0} AST, ${mvp.statistics.rebounds || 0} REB. Rating: ${mvp.statistics.rating}.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a sports commentator with a 'cyberpunk/brutal' style.
                    Analyze the player stats.
                    Output JSON with:
                    - shortTitle: Max 3 words (e.g. "PURE DOMINANCE", "SNIPER ALERT").
                    - impactDescription: Max 8 words description of their game style today.`
                },
                {
                    role: "user",
                    content: `Stats: ${statsStr}`
                }
            ],
            model: "llama3-70b-8192",
            response_format: { type: "json_object" }
        });

        const aiContent = JSON.parse(completion.choices[0].message.content || '{}');

        return NextResponse.json({
            success: true,
            data: {
                mvp: {
                    name: mvp.player.name,
                    slug: mvp.player.slug,
                    position: mvp.position,
                    rating: mvp.statistics.rating,
                    stats: {
                        pts: mvp.statistics.points || 0,
                        ast: mvp.statistics.assists || 0,
                        reb: mvp.statistics.rebounds || 0
                    },
                    team: mvpTeam,
                    imageUrl: `https://api.sofascore.app/api/v1/player/${mvp.player.id}/image`
                },
                ai: {
                    title: aiContent.shortTitle || "ON FIRE",
                    description: aiContent.impactDescription || "Leading the charge efficiently."
                }
            }
        });

    } catch (error: any) {
        console.error('Error in Best Player API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
