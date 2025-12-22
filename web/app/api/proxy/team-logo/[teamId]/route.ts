import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ teamId: string }> }
) {
    const { teamId } = await params;

    if (!teamId) {
        return new NextResponse('Team ID required', { status: 400 });
    }

    try {
        // Try multiple sources for team logos
        const sources = [
            `https://api.sofascoreapp.com/api/v1/team/${teamId}/image`,
            `https://img.sofascore.com/api/v1/team/${teamId}/image`,
            `https://www.sofascore.com/api/v1/team/${teamId}/image`,
            `https://api.sofascore.app/api/v1/team/${teamId}/image`,
            `https://api.sofascore.app/api/v1/player/${teamId}/image`
        ];

        let imageResponse: Response | null = null;

        for (const source of sources) {
            try {
                console.log(`🖼️ [Logo Proxy] Fetching from: ${source}`);
                const response = await fetch(source, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': 'https://www.sofascore.com/',
                    },
                    cache: 'no-store'
                });

                if (response.ok) {
                    imageResponse = response;
                    console.log(`✅ [Logo Proxy] Success from: ${source}`);
                    break;
                }
            } catch (err) {
                console.warn(`⚠️ [Logo Proxy] Error fetching from ${source}`);
                continue;
            }
        }

        if (!imageResponse) {
            return new NextResponse('Image not found', { status: 404 });
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('content-type') || 'image/png';

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, immutable' // Cache for 24 hours
            }
        });

    } catch (error) {
        console.error('Error proxying team logo:', error);

        // Return transparent PNG on error
        // Return 404 on error to trigger frontend fallback (Initials)
        return new NextResponse('Error fetching image', { status: 404 });
    }
}
