import { NextResponse } from 'next/server';
import { scraperService } from '@/lib/services/scraperService';

export const dynamic = 'force-dynamic';

export async function GET() {
    const vars = {
        SCRAPER_API_KEYS: process.env.SCRAPER_API_KEYS || null,
        SCRAPER_API_KEY: process.env.SCRAPER_API_KEY || null,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
        NODE_ENV: process.env.NODE_ENV,
    };

    const testUrl = 'https://www.sofascore.com/api/v1/sport/football/events/live';
    let testResult = null;
    let testError = null;

    try {
        const start = Date.now();
        console.log(`🧪 [Debug] Testing connection to ${testUrl} with ${vars.SCRAPER_API_KEYS ? 'keys' : 'NO KEYS'}...`);
        const data = await scraperService.makeRequest(testUrl, {
            render: false,
            country_code: 'us',
            useCache: false
        });
        testResult = {
            success: true,
            latency: Date.now() - start,
            events_count: data?.events?.length || 0
        };
    } catch (e: any) {
        testError = e.message;
        console.error(`❌ [Debug] Test Failed:`, e.message);
    }

    // 3. Bridge/Tunnel Test
    const bridgeUrl = vars.NEXT_PUBLIC_API_URL;
    let bridgeResult = null;
    let bridgeError = null;

    if (bridgeUrl) {
        try {
            const startBridge = Date.now();
            console.log(`🔌 [Debug] Testing Bridge: ${bridgeUrl}/api/health`);

            const bridgeResponse = await fetch(`${bridgeUrl}/api/health`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'User-Agent': 'Vercel-Debug-Bot'
                },
                signal: AbortSignal.timeout(5000)
            });

            bridgeResult = {
                url: bridgeUrl,
                status: bridgeResponse.status,
                ok: bridgeResponse.ok,
                latency: Date.now() - startBridge,
                headers: Object.fromEntries(bridgeResponse.headers.entries())
            };

            if (!bridgeResponse.ok) {
                bridgeError = `HTTP ${bridgeResponse.status} ${bridgeResponse.statusText}`;
            }
        } catch (e: any) {
            bridgeError = e.message;
            console.error(`❌ [Debug] Bridge Test Failed:`, e.message);
        }
    }

    const diagnostics = {
        timestamp: new Date().toISOString(),
        tests: {
            scraper_api: {
                url: testUrl,
                success: !testError,
                error: testError,
                details: testResult
            },
            bridge_tunnel: {
                configured: !!bridgeUrl,
                url: bridgeUrl,
                success: bridgeUrl ? !bridgeError : false,
                error: bridgeError,
                details: bridgeResult
            }
        },
        keys_status: {
            SCRAPER_API_KEYS: {
                present: !!vars.SCRAPER_API_KEYS,
                length: vars.SCRAPER_API_KEYS ? vars.SCRAPER_API_KEYS.length : 0,
                preview: vars.SCRAPER_API_KEYS ? `${vars.SCRAPER_API_KEYS.substring(0, 5)}...` : 'N/A'
            },
            SCRAPER_API_KEY: {
                present: !!vars.SCRAPER_API_KEY,
                length: vars.SCRAPER_API_KEY ? vars.SCRAPER_API_KEY.length : 0
            }
        },
        env_dump: {
            has_api_url: !!vars.NEXT_PUBLIC_API_URL,
            api_url: vars.NEXT_PUBLIC_API_URL,
            node_env: vars.NODE_ENV
        }
    };

    return NextResponse.json(diagnostics, { status: 200 });
}
