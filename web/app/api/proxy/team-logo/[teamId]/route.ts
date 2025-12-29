import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    const { teamId } = await params;

    if (!teamId || teamId === 'undefined') {
        return new NextResponse('Invalid Team ID', { status: 400 });
    }

    // List of sources to try
    const baseUrls = [
        `https://api.sofascore.app/api/v1/team/${teamId}/image`,
        `https://api.sofascore.com/api/v1/team/${teamId}/image`
    ];

    for (const url of baseUrls) {
        try {
            const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=120&h=120&fit=contain&output=webp&q=80`;
            const response = await fetch(proxyUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                next: { revalidate: 86400 }
            });

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'image/webp',
                        'Cache-Control': 'public, max-age=86400, immutable'
                    }
                });
            }
        } catch (e) {
            console.warn(`⚠️ [TeamLogoProxy] Error fetching from ${url}`);
        }
    }

    return new NextResponse('Image not found', { status: 404 });
}