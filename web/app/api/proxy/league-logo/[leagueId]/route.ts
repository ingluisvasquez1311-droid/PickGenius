import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ leagueId: string }> }
) {
    const { leagueId } = await params;

    if (!leagueId || leagueId === 'undefined') {
        return new NextResponse('Invalid League ID', { status: 400 });
    }

    const sources = [
        `https://api.sofascore.app/api/v1/unique-tournament/${leagueId}/image`,
        `https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/image`,
        `https://api.sofascore.app/api/v1/tournament/${leagueId}/image`,
        `https://api.sofascore.com/api/v1/tournament/${leagueId}/image`
    ];

    for (const url of sources) {
        try {
            const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=100&h=100&fit=contain&output=webp&q=80`;
            const response = await fetch(proxyUrl);

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'image/webp',
                        'Cache-Control': 'public, max-age=86400, immutable'
                    }
                });
            }
        } catch (e) { }
    }

    return new NextResponse('Logo not found', { status: 404 });
}
