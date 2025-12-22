const axios = require('axios');

/**
 * Proxy Service for Sofascore requests
 * Uses ScraperAPI to bypass 403 blocking on production servers
 */
class ProxyService {
    constructor() {
        this.scraperApiKey = process.env.SCRAPER_API_KEY;
        this.useProxy = process.env.USE_PROXY === 'true' || process.env.NODE_ENV === 'production';
        this.requestCount = 0;
        this.maxFreeRequests = 1000; // ScraperAPI free tier limit
    }

    /**
     * Make a proxied request through ScraperAPI
     * @param {string} url - Target URL to scrape
     * @param {object} options - Axios options (headers, etc.)
     * @returns {Promise<object>} Response data
     */
    async makeRequest(url, options = {}) {
        // If proxy is disabled or no API key, make direct request
        if (!this.useProxy || !this.scraperApiKey) {
            console.log('🔗 Direct request (proxy disabled):', url);
            return axios.get(url, options);
        }

        // Check if we're approaching free tier limit
        if (this.requestCount >= this.maxFreeRequests * 0.9) {
            console.warn(`⚠️ Approaching ScraperAPI limit: ${this.requestCount}/${this.maxFreeRequests}`);
        }

        try {
            console.log('🔒 Proxied request via ScraperAPI:', url);

            // ScraperAPI endpoint
            const proxyUrl = 'http://api.scraperapi.com';

            const response = await axios.get(proxyUrl, {
                params: {
                    api_key: this.scraperApiKey,
                    url: url,
                    render: false, // Don't render JavaScript (faster & cheaper)
                    country_code: 'us' // Use US proxy
                },
                headers: options.headers || {},
                timeout: 10000 // 10 second timeout for faster fallbacks
            });

            this.requestCount++;
            return response;

        } catch (error) {
            console.error('❌ ScraperAPI request failed:', error.message);

            // Fallback to direct request
            console.log('🔄 Falling back to direct request...');
            return axios.get(url, options);
        }
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
