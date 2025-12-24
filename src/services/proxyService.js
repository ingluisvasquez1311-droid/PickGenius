const axios = require('axios');

/**
 * Proxy Service for Sofascore requests
 * Uses ScraperAPI to bypass 403 blocking on production servers
 */
class ProxyService {
    constructor() {
        this.scraperApiKeys = this.loadScraperKeys();
        this.currentKeyIndex = 0;
        this.useProxy = process.env.USE_PROXY === 'true'; // Only if explicitly enabled
        this.requestCount = 0;
        this.maxFreeRequests = 1000; // Total expected limit per key
    }

    loadScraperKeys() {
        const keys = [];
        if (process.env.SCRAPER_API_KEYS) {
            keys.push(...process.env.SCRAPER_API_KEYS.split(',').map(k => k.trim()).filter(k => k));
        }
        if (process.env.SCRAPER_API_KEY && !keys.includes(process.env.SCRAPER_API_KEY)) {
            keys.push(process.env.SCRAPER_API_KEY);
        }
        return keys;
    }

    getNextScraperKey() {
        if (this.scraperApiKeys.length === 0) return null;
        const key = this.scraperApiKeys[this.currentKeyIndex];
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.scraperApiKeys.length;
        return key;
    }

    async makeRequest(url, options = {}) {
        // Priority 1: Home-IP Bridge (If running on Render, call Local Ngrok)
        const localBridgeUrl = process.env.LOCAL_BRIDGE_URL; // e.g. https://xxxx.ngrok-free.app
        if (process.env.NODE_ENV === 'production' && localBridgeUrl && !url.includes(localBridgeUrl)) {
            try {
                console.log('🌉 Bridging request through Home-IP (Ngrok):', url);
                const bridgeResponse = await axios.get(`${localBridgeUrl}/api/sofascore/proxy${new URL(url).pathname}${new URL(url).search}`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                    timeout: 8000
                });
                if (bridgeResponse.data) return bridgeResponse;
            } catch (err) {
                console.warn('⚠️ Bridge failed, trying alternative methods...');
            }
        }

        // Priority 2: ScraperAPI (If enabled and keys exist)
        const currentApiKey = this.getNextScraperKey();
        if (this.useProxy && currentApiKey) {
            try {
                console.log(`🔒 Proxied request via ScraperAPI (Key index: ${this.currentKeyIndex}):`, url);
                const proxyUrl = 'http://api.scraperapi.com';
                const response = await axios.get(proxyUrl, {
                    params: {
                        api_key: currentApiKey,
                        url: url,
                        render: false,
                        country_code: 'us'
                    },
                    headers: options.headers || {},
                    timeout: 10000
                });
                this.requestCount++;
                return response;
            } catch (error) {
                console.error('❌ ScraperAPI request failed:', error.message);
            }
        }

        // Priority 3: Direct Request (Default fallback)
        console.log('🔗 Direct request:', url);
        return axios.get(url, options);
    }

    /**
     * Make a request with retry logic and exponential backoff
     * @param {string} url - Target URL
     * @param {object} options - Request options
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise<object>} Response data
     */
    async makeRequestWithRetry(url, options = {}, maxRetries = 3) {
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await this.makeRequest(url, options);
                return response;
            } catch (error) {
                lastError = error;

                // Don't retry on 404 or 401
                if (error.response?.status === 404 || error.response?.status === 401) {
                    throw error;
                }

                // Calculate exponential backoff delay
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds

                console.log(`⏳ Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    /**
     * Get current usage statistics
     * @returns {object} Usage stats
     */
    getUsageStats() {
        return {
            requestCount: this.requestCount,
            maxRequests: this.maxFreeRequests,
            percentageUsed: ((this.requestCount / this.maxFreeRequests) * 100).toFixed(2),
            proxyEnabled: this.useProxy,
            hasApiKey: !!this.scraperApiKey
        };
    }

    /**
     * Reset request counter (for testing)
     */
    resetCounter() {
        this.requestCount = 0;
    }
}

module.exports = new ProxyService();
