import { NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId'); // NBA: 132, Euroleague: 7
    const seasonId = searchParams.get('seasonId'); // Current season
    const category = searchParams.get('category') || 'points'; // points, rebounds, assists

    if (!tournamentId || !seasonId) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        // Sofascore endpoint for top players
        const data = await sofafetch(
            `https://api.sofascore.com/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/top-players/${category}`
        );

        const topPlayers = data?.topPlayers?.map((item: any) => {
            if (!item.player || !item.team || !item.statistics) return null;
            return {
                player: {
                    id: item.player.id,
                    name: item.player.name,
                    slug: item.player.slug,
                    shortName: item.player.shortName,
                    position: item.player.position
                },
                team: {
                    id: item.team.id,
                    name: item.team.name,
                    slug: item.team.slug
                },
                statisticsValue: item.statistics.value,
                statisticsRank: item.statistics.rank
            };
        }).filter(Boolean) || [];

        return NextResponse.json({
            category,
            topPlayers
        });

    } catch (error: any) {
        console.error("Top Players API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
