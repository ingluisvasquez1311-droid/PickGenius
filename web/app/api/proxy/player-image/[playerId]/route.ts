import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ playerId: string }> }
) {
    const { playerId } = await params;

    if (!playerId || playerId === 'undefined') {
        return new NextResponse('Invalid Player ID', { status: 400 });
    }

    const sources = [
        `https://api.sofascore.app/api/v1/player/${playerId}/image`,
        `https://api.sofascore.com/api/v1/player/${playerId}/image`
    ];

    for (const url of sources) {
        try {
            const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=150&h=150&fit=face&output=webp&q=80`;
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

    return new NextResponse('Image not found', { status: 404 });
}