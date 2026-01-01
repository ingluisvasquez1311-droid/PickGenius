
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
        return new NextResponse('Missing path parameter', { status: 400 });
    }

    // Construct target URL (using .com as it's standard for assets, or .app)
    const targetUrl = `https://api.sofascore.com/api/v1/${path}`;

    // Stealth Headers (Same as sofafetch)
    const STEALTH_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    const headers = {
        'User-Agent': STEALTH_UA,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'image', // Important for images
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
    };

    try {
        const response = await sofafetch(targetUrl, {
            binary: true,
            revalidate: 86400
        });

        if (!(response instanceof Response)) {
            console.error(`[ImageProxy] sofafetch did not return a Response instance for ${targetUrl}`);
            return new NextResponse('Internal Error', { status: 500 });
        }

        if (!response.ok) {
            console.error(`[ImageProxy] Failed to fetch ${targetUrl}: ${response.status}`);
            return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
        }

        const blob = await response.blob();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        console.error(`[ImageProxy] Error fetching ${targetUrl}:`, error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
