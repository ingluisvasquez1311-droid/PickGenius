// Configuración centralizada de la API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchAPI(endpoint: string, options?: RequestInit, retries = 3, backoff = 1000) {
    // Ensure endpoint starts with / if it's not an absolute URL
    const isAbsolute = endpoint.startsWith('http');
    const url = isAbsolute ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    console.log(`🔍 [API] Fetching: ${url} (Retries left: ${retries})`);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'bypass-tunnel-reminder': 'true',
                ...options?.headers,
            },
        });

        // Handle Rate Limiting (429) or Service Unavailable (503)
        if ((response.status === 429 || response.status === 503) && retries > 0) {
            const waitTime = backoff * (4 - retries); // Exponential backoff: 1s, 2s, 3s
            console.warn(`⚠️ [API] HTTP ${response.status} detected. Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return fetchAPI(endpoint, options, retries - 1, backoff);
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (retries > 0) {
            console.warn(`⚠️ [API] Fetch error, retrying (${retries} left):`, error);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchAPI(endpoint, options, retries - 1, backoff);
        }
        console.error('❌ [API] Final error fetching:', url, error);
        throw error;
    }
}

