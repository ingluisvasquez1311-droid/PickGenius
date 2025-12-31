import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '../../../../lib/api-utils';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        // Sofascore search API
        const data = await sofafetch(`https://api.sofascore.com/api/v1/search/${encodeURIComponent(query)}`);

        let results = data.results || [];

        // Filter for players only and map to our structure
        const players = results
            .filter((item: any) => item.type === 'player' || (item.entity && item.entity.type === 'player'))
            .map((item: any) => {
                const p = item.entity || item;
                return {
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    sport: p.sport ? p.sport.slug : 'unknown',
                    team: p.team ? p.team.name : (p.teamName || 'Free Agent'),
                    position: p.position,
                    image: `https://api.sofascore.app/api/v1/player/${p.id}/image`,
                    country: p.country ? p.country.name : ''
                };
            })
            .slice(0, 10); // Limit to top 10 results

        trackRequest(true);
        return NextResponse.json({ results: players });

    } catch (error) {
        trackRequest(false, error instanceof Error ? error.message : 'Search Failed');
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
