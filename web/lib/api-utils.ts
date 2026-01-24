import Logger from './logger';
// Sentry temporarily disabled
// import * as Sentry from "@sentry/nextjs";

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
];

interface FetchOptions {
    revalidate?: number;
    referer?: string;
    binary?: boolean;
    skipBridge?: boolean;
}

/**
 * Performs a highly-stealthed fetch request to Sofascore with automatic retry logic.
 */
export async function sofafetch(url: string, options: FetchOptions = {}) {
    const { revalidate = 0, referer = 'https://www.sofascore.com/', skipBridge = false } = options;

    // --- HOME-IP BRIDGE LOGIC ---
    // If we are on Vercel or have a bridge URL configured, we use it to avoid 403s.
    const bridgeUrl = process.env.NEXT_PUBLIC_API_URL;
    const isVercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL;

    // Only use bridge if we are NOT already inside the proxy route to avoid loops
    if (!skipBridge && bridgeUrl && !url.includes('/api/proxy') && url.includes('sofascore')) {
        try {
            // We use the local API/Proxy as a relay if configured
            const proxiedUrl = `${bridgeUrl.replace(/\/$/, '')}/api/proxy?url=${encodeURIComponent(url)}`;
            // Logger.info(`[Bridge] Routing request via tunnel`, { url: proxiedUrl });

            const response = await fetch(proxiedUrl, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'ngrok-skip-browser-warning': '1'
                },
                next: { revalidate }
            });

            if (response.ok) {
                if (options.binary) return response;
                return await response.json();
            }
            // Logger.warn(`[Bridge Error] Status ${response.status}. Falling back.`);
        } catch (bridgeError: any) {
            // Logger.error(`[Bridge Critical] Tunnel unreachable.`);
        }
    }

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        attempt++;

        // Select a random UA and generate matching Sec-Ch-Ua
        const uaIndex = Math.floor(Math.random() * USER_AGENTS.length);
        const selectedUA = USER_AGENTS[uaIndex];

        // Basic mapping for Chrome-based UAs in our list
        const isEdge = selectedUA.includes('Edg/');
        const chromeVersion = selectedUA.includes('Chrome/120') ? '120' : '119';
        const brandStr = isEdge
            ? `"Not_A Brand";v="8", "Chromium";v="${chromeVersion}", "Microsoft Edge";v="${chromeVersion}"`
            : `"Not_A Brand";v="24", "Chromium";v="${chromeVersion}", "Google Chrome";v="${chromeVersion}"`;

        // MOBILE APP SIMULATION: Mimic official Android app headers
        const headers: Record<string, string> = {
            'User-Agent': 'Sofascore/858 (Android 14; Pixel 7 Pro)', // Fake App UA
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'X-Sofascore-App-Ver': '6.4.2', // Fake current version
            'X-Sofascore-Platform': 'android',
        };

        // INTEGRATION: Standard Fetch with Rotation
        // We rely on Home-IP Bridge (Ngrok) or direct fetch.

        try {
            const response = await fetch(url, {
                headers,
                next: { revalidate },
                signal: AbortSignal.timeout(30000)
            });

            if (response.status === 429 || response.status === 403 || response.status >= 500) {
                if (attempt === MAX_RETRIES) {
                    // FALLBACK: Try Public Proxy (AllOrigins) as a last resort for 403/429
                    try {
                        Logger.warn(`[SofaFetch] Max retries reached. Attempting fallback proxy for: ${url}`);
                        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                        const proxyRes = await fetch(proxyUrl);
                        const proxyData = await proxyRes.json();
                        if (proxyData.contents) {
                            return JSON.parse(proxyData.contents);
                        }
                    } catch (proxyError) {
                        Logger.error(`[SofaFetch Proxy] Fallback failed`, { url });
                    }

                    trackRequest(false, `External API Error: ${response.status}`);
                    throw new Error(`External API responded with ${response.status} after ${MAX_RETRIES} attempts`);
                }

                const jitter = Math.random() * 500;
                const backoff = Math.pow(2, attempt - 1) * 1000 + jitter;

                Logger.warn(`[SofaFetch] Retrying after ${response.status} (Identity rotated)`, { url, attempt, backoff });
                await new Promise(resolve => setTimeout(resolve, backoff));
                continue;
            }

            if (!response.ok) {
                trackRequest(false, `HTTP ${response.status}`);
                Logger.error(`[SofaFetch Error] ${response.status}`, { url });

                if (response.status === 404) {
                    throw new Error(`External API responded with ${response.status}`);
                }

                throw new Error(`External API responded with ${response.status}`);
            }

            trackRequest(true);
            if (options.binary) return response;
            return await response.json();
        } catch (error: any) {
            if (attempt === MAX_RETRIES) {
                trackRequest(false, error.message);
                Logger.error(`[SofaFetch Critical] Max retries reached`, { url, error: error.message });
                // Sentry.captureException(error, { tags: { source: 'sofafetch', url } });
                throw error;
            }
            const backoff = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, backoff));
        }
    }
}

/**
 * Status store for the connectivity dashboard
 */
export const apiStats = {
    start_time: Date.now(),
    requests_total: 0,
    requests_success: 0,
    requests_failed: 0,
    last_request_time: null as number | null,
    errors: [] as string[]
};

export function trackRequest(success: boolean, errorMsg?: string) {
    apiStats.requests_total++;
    apiStats.last_request_time = Date.now();
    if (success) {
        apiStats.requests_success++;
    } else {
        apiStats.requests_failed++;
        if (errorMsg) {
            apiStats.errors = [errorMsg, ...apiStats.errors].slice(0, 10);
        }
    }
}
