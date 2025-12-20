import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Optional: Use edge runtime for speed if supported, or remove. Sticking to default Node for now is safer for stability.
// Actually, let's keep it standard Node.js runtime for broad compatibility on Render.

const BASE_URL = 'https://www.sofascore.com/api/v1';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathArray } = await params;
        const path = pathArray.join('/');
        const query = request.nextUrl.search; // Keep query parameters
        const targetUrl = `${BASE_URL}/${path}${query}`;

        const useProxy = process.env.USE_PROXY === 'true' && !!process.env.SCRAPER_API_KEY;

        let fetchUrl = targetUrl;
        let fetchHeaders: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.sofascore.com/',
            'Accept': 'application/json, text/plain, */*'
        };

        if (useProxy) {
            const apiKey = process.env.SCRAPER_API_KEY?.trim();
            console.log(`🔒 [Proxy Route] Using ScraperAPI for: ${path}`);
            fetchUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}`;
            fetchHeaders = {};
        } else {
            console.log(`[Proxy] Forwarding Direct to: ${targetUrl}`);
        }

        const response = await fetch(fetchUrl, {
            headers: fetchHeaders,
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            console.error(`❌ Proxy Upstream Error: ${response.status} for ${path}`);
            return NextResponse.json(
                { error: `Upstream error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
