import { NextRequest, NextResponse } from 'next/server';

// Standard Node.js runtime for stability.

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
            // Synchronize with SportsDataService parameters
            fetchUrl = `https://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render=false&country_code=us`;
            fetchHeaders = {};
        } else {
            console.log(`[Proxy] Forwarding Direct to: ${targetUrl}`);
        }

        // Determine Cache TTL based on path
        let revalidate = 3600;

        if (path.includes('/events/live')) {
            revalidate = 120;
        } else if (path.includes('/scheduled-events/')) {
            revalidate = 600;
        } else if (path.includes('/statistics')) {
            revalidate = 86400;
        }

        // ATTEMPT 1: Primary Method
        let response = await fetch(fetchUrl, {
            headers: fetchHeaders,
            next: { revalidate: revalidate },
            signal: AbortSignal.timeout(30000)
        });

        // FALLBACK: If ScraperAPI fails with 403 or server error, try Direct Stealth Mode
        if (!response.ok) {
            console.warn(`⚠️ [Proxy Route] Primary Fetch FAILED (${response.status}). Falling back to Stealth Mode...`);

            // Direct call to Sofascore (api.sofascore.com is often more stable for bypass)
            const directUrl = `https://api.sofascore.com/api/v1/${path}${query}`;

            response = await fetch(directUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.sofascore.com/',
                    'Origin': 'https://www.sofascore.com',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                next: { revalidate: revalidate },
                signal: AbortSignal.timeout(30000)
            });

            console.log(`🕵️ [Proxy Route] Stealth Mode Response: ${response.status}`);
        }

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "Unknown error");
            console.error(`❌ Proxy Upstream Error: ${response.status} for ${path}. Body: ${errorBody.substring(0, 100)}`);
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
