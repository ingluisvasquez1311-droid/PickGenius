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
            `https://img.sofascore.com/api/v1/team/${teamId}/image`, // CDN (Faster & more reliable)
            `https://www.sofascore.com/api/v1/team/${teamId}/image`,
            `https://api.sofascore.app/api/v1/team/${teamId}/image`,
            `https://api.sofascore.app/api/v1/player/${teamId}/image` // For tennis players
        ];

        let imageResponse: Response | null = null;

        for (const source of sources) {
            try {
                const response = await fetch(source, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': 'https://www.sofascore.com/',
                        'Origin': 'https://www.sofascore.com',
                        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Sec-Fetch-Dest': 'image',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Site': 'cross-site'
                    },
                    cache: 'force-cache' // Cache images for 1 hour
                });

                if (response.ok) {
                    imageResponse = response;
                    break;
                }
            } catch (err) {
                console.warn(`Failed to fetch from ${source}`);
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
                    'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
                }
            });
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
