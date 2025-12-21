import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: { playerId: string } }
) {
    const { playerId } = params;

    if (!playerId) {
        return new NextResponse('Player ID required', { status: 400 });
    }

    try {
        // Try multiple sources for player images
        const sources = [
            `https://www.sofascore.com/api/v1/player/${playerId}/image`,
            `https://api.sofascore.app/api/v1/player/${playerId}/image`
        ];

        let imageResponse: Response | null = null;

        for (const source of sources) {
            try {
                const response = await fetch(source, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.sofascore.com/',
                        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                    },
                    cache: 'force-cache'
                });

                if (response.ok) {
                    imageResponse = response;
                    break;
                }
            } catch (err) {
                console.warn(`Failed to fetch player image from ${source}`);
                continue;
            }
        }

        if (!imageResponse) {
            // Return a 1x1 transparent PNG as fallback
            const transparentPng = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                'base64'
            );
            return new NextResponse(transparentPng, {
                status: 200,
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=86400'
                }
            });
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('content-type') || 'image/png';

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, immutable'
            }
        });

    } catch (error) {
        console.error('Error proxying player image:', error);

        const transparentPng = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );
        return new NextResponse(transparentPng, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }
}
