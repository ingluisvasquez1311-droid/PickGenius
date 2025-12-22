import { NextRequest, NextResponse } from 'next/server';
import { scraperService } from '@/lib/services/scraperService';

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

        const scraperOptions = {
            render: false,
            country_code: 'us',
            useCache: true,
            cacheTTL: revalidate * 1000 // scraperService uses ms
        };

        let data: any = null;

        // ATTEMPT 1: Managed ScraperService (Rotation + Retries)
        try {
            console.log(`🌐 [Proxy Route] Using Managed ScraperService for: ${path}`);
            data = await scraperService.makeRequest(targetUrl, scraperOptions);
        } catch (scraperError: any) {
            console.warn(`⚠️ [Proxy Route] ScraperService failed: ${scraperError.message}. Falling back to Stealth Mode...`);

            // FALLBACK: Direct Stealth Mode (Direct to Sofascore)
            const directUrl = `https://api.sofascore.com/api/v1/${path}${query}`;

            const stealthResponse = await fetch(directUrl, {
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

            if (stealthResponse.ok) {
                data = await stealthResponse.json();
                console.log(`🕵️ [Proxy Route] Stealth Mode SUCCESS (${stealthResponse.status})`);
            } else {
                const errorBody = await stealthResponse.text().catch(() => "Unknown error");
                console.error(`❌ [Proxy Route] All bypass methods failed for ${path}. Final status: ${stealthResponse.status}`);
                return NextResponse.json(
                    { error: `Upstream error: ${stealthResponse.status}`, details: errorBody.substring(0, 100) },
                    { status: stealthResponse.status }
                );
            }
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
