import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '../../../../lib/api-utils';

// Helper to normalize sport slugs to our internal keys
const normalizeSport = (slug: string) => {
    const map: Record<string, string> = {
        'american-football': 'nfl',
        'baseball': 'mlb',
        'ice-hockey': 'hockey',
        'basketball': 'basketball',
        'football': 'football',
        'tennis': 'tennis'
    };
    return map[slug] || slug;
};

// Internal ID -> Sofascore Slug Mapping
const SPORT_MAPPING: Record<string, string> = {
    'basketball': 'basketball',
    'football': 'football', // Soccer
    'nfl': 'american-football',
    'mlb': 'baseball',
    'hockey': 'ice-hockey',
    'tennis': 'tennis'
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const targetSport = searchParams.get('sport');

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const url = `https://api.sofascore.com/api/v1/search/${encodeURIComponent(query)}`;
        console.log(`[SearchAPI] Querying: ${url} (Sport: ${targetSport})`);

        const data = await sofafetch(url);

        if (!data || !data.results) {
            console.log(`[SearchAPI] No data or results from Sofascore`);
            return NextResponse.json({ results: [] });
        }

        const rawResults = data.results || [];
        const requiredSlug = targetSport ? SPORT_MAPPING[targetSport] : null;

        const players = rawResults
            .filter((item: any) => {
                try {
                    // Check if it's a player
                    const isPlayer = item.type === 'player' || (item.entity && item.entity.type === 'player');
                    if (!isPlayer) return false;

                    // Sport filter
                    if (requiredSlug) {
                        const p = item.entity || item;
                        const itemSlug = p.sport?.slug || item.sport?.slug;
                        return itemSlug === requiredSlug;
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            })
            .map((item: any) => {
                try {
                    const p = item.entity || item;
                    return {
                        id: p.id,
                        name: p.name || 'Unknown Player',
                        slug: p.slug || '',
                        sport: p.sport ? normalizeSport(p.sport.slug) : 'unknown',
                        team: p.team ? p.team.name : (p.teamName || 'Free Agent'),
                        position: p.position || '',
                        image: `/api/image-proxy?path=player/${p.id}/image`,
                        country: p.country ? p.country.name : ''
                    };
                } catch (e) {
                    return null;
                }
            })
            .filter((p: any) => p !== null)
            .slice(0, 10);

        trackRequest(true);
        return NextResponse.json({ results: players });

    } catch (error: any) {
        trackRequest(false, error?.message || 'Search Failed');
        console.error("Search API Error:", error);
        return NextResponse.json({
            error: "Search failed",
            message: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
