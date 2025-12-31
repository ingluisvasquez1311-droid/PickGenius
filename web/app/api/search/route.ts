import { NextResponse } from 'next/server';
import { sofafetch, trackRequest } from '@/lib/api-utils';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        console.log(`🔍 Global Search Query: ${query}`);
        // Sofascore search endpoint
        const data = await sofafetch(`https://api.sofascore.com/api/v1/search/all?q=${encodeURIComponent(query)}`, {
            revalidate: 3600 // Cache search results for 1 hour
        });

        trackRequest(true);
        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Search Error:', error);
        trackRequest(false, error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
