/**
 * PickGenius Professional API Utilities
 * Handles request rotation, mimetic headers, and smart caching to avoid bans.
 */

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
 * Supports Home-IP Bridge: redirects requests to a local proxy via Ngrok if running in production.
 */
export async function sofafetch(url: string, options: FetchOptions = {}) {
    const { revalidate = 0, referer = 'https://www.sofascore.com/' } = options;

    // --- HOME-IP BRIDGE LOGIC ---
    const bridgeUrl = process.env.NEXT_PUBLIC_API_URL;
    const isVercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL;

    if (isVercel && bridgeUrl && !url.includes('/api/proxy') && url.includes('sofascore')) {
        try {
            const proxiedUrl = `${bridgeUrl.replace(/\/$/, '')}/api/proxy?url=${encodeURIComponent(url)}`;
            console.log(`[Bridge] Routing request via tunnel: ${proxiedUrl}`);

            const response = await fetch(proxiedUrl, {
                headers: { 'Cache-Control': 'no-cache' },
                next: { revalidate }
            });

            if (response.ok) {
                return await response.json();
            }
            console.error(`[Bridge Error] Status ${response.status} from tunnel. Falling back to direct fetch.`);
        } catch (bridgeError) {
            console.error(`[Bridge Critical] Tunnel unreachable:`, bridgeError);
        }
    }
    // ----------------------------

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        attempt++;
        // Pick a random user agent
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        // Mimetic headers
        const headers = {
            'User-Agent': userAgent,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Origin': 'https://www.sofascore.com',
            'Referer': referer,
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
                next: { revalidate }
            });

            if (response.status === 429 || response.status >= 500) {
                if (attempt === MAX_RETRIES) throw new Error(`External API responded with ${response.status} after ${MAX_RETRIES} attempts`);
                // Exponential backoff: 500ms, 1000ms, 2000ms
                const backoff = Math.pow(2, attempt - 1) * 500;
                console.warn(`[SofaFetch Warning] Attempt ${attempt} failed with ${response.status}. Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                continue;
            }

            if (!response.ok) {
                console.error(`[SofaFetch Error] ${response.status} for ${url}`);
                throw new Error(`External API responded with ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt === MAX_RETRIES) {
                console.error(`[SofaFetch Critical] Max retries reached for ${url}`, error);
                throw error;
            }
            const backoff = Math.pow(2, attempt - 1) * 500;
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
