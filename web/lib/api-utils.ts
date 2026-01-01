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
}

/**
 * Performs a highly-stealthed fetch request to Sofascore with automatic retry logic.
 */
export async function sofafetch(url: string, options: FetchOptions = {}) {
    const { revalidate = 0, referer = 'https://www.sofascore.com/' } = options;

    // --- HOME-IP BRIDGE LOGIC ---
    const bridgeUrl = process.env.NEXT_PUBLIC_API_URL;
    const isVercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL;

    if (isVercel && bridgeUrl && !url.includes('/api/proxy') && url.includes('sofascore')) {
        try {
            const proxiedUrl = `${bridgeUrl.replace(/\/$/, '')}/api/proxy?url=${encodeURIComponent(url)}`;
            Logger.info(`[Bridge] Routing request via tunnel`, { url: proxiedUrl });

            const response = await fetch(proxiedUrl, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'ngrok-skip-browser-warning': '1' // Bypass ngrok warning page
                },
                next: { revalidate }
            });

            if (response.ok) {
                return await response.json();
            }
            Logger.warn(`[Bridge Error] Status ${response.status} from tunnel. Falling back to direct fetch.`);
        } catch (bridgeError: any) {
            Logger.error(`[Bridge Critical] Tunnel unreachable: ${bridgeError.message}. Falling back.`);
            // Sentry.captureException(bridgeError, { tags: { source: 'bridge' } });
        }
    }

    const MAX_RETRIES = 3;
    let attempt = 0;

    // Fixed Chrome User-Agent to match Client Hints perfectly
    const STEALTH_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    while (attempt < MAX_RETRIES) {
        attempt++;

        const headers = {
            'User-Agent': STEALTH_UA,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Origin': 'https://www.sofascore.com',
            'Referer': 'https://www.sofascore.com/',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
        };

        try {
            const response = await fetch(url, {
                headers,
                next: { revalidate },
                signal: AbortSignal.timeout(10000)
            });

            if (response.status === 429 || response.status >= 500) {
                if (attempt === MAX_RETRIES) {
                    trackRequest(false, `External API Error: ${response.status}`);
                    throw new Error(`External API responded with ${response.status} after ${MAX_RETRIES} attempts`);
                }

                const jitter = Math.random() * 200;
                const backoff = Math.pow(2, attempt - 1) * 1000 + jitter;

                Logger.warn(`[SofaFetch] Retrying after ${response.status}`, { url, attempt, backoff });
                await new Promise(resolve => setTimeout(resolve, backoff));
                continue;
            }

            if (!response.ok) {
                trackRequest(false, `HTTP ${response.status}`);
                Logger.error(`[SofaFetch Error] ${response.status}`, { url });
                throw new Error(`External API responded with ${response.status}`);
            }

            trackRequest(true);
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
