const { OpenAI } = require('openai');

/**
 * Backend Groq API Rotator
 * Handles 30+ Groq keys for high-capacity betting analysis
 */
class GroqRotator {
    constructor() {
        this.keys = this.loadKeys();
        this.currentIndex = 0;
        this.instances = {};
        console.log(`🧙‍♂️ [Backend Rotator] Initialized with ${this.keys.length} keys`);
    }

    loadKeys() {
        const keys = [];
        // Support comma separated list in GROQ_API_KEYS
        if (process.env.GROQ_API_KEYS) {
            keys.push(...process.env.GROQ_API_KEYS.split(',').map(k => k.trim()).filter(k => k));
        }
        // Support legacy single key
        if (process.env.GROQ_API_KEY && !keys.includes(process.env.GROQ_API_KEY)) {
            keys.push(process.env.GROQ_API_KEY);
        }

        if (keys.length === 0) {
            console.warn('⚠️ No Groq API keys found in backend environment variables');
            return [];
        }
        return keys;
    }

    /**
     * Get the next available OpenAI instance for Groq
     */
    getNextInstance() {
        if (this.keys.length === 0) return null;

        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;

        if (!this.instances[key]) {
            this.instances[key] = new OpenAI({
                apiKey: key,
                baseURL: 'https://api.groq.com/openai/v1'
            });
        }

        return this.instances[key];
    }

    /**
     * Managed chat completion with automatic rotation and retry
     */
    async chatCompletion(params, maxRetries = 3) {
        let lastError = null;

        for (let attempt = 0; attempt < Math.min(maxRetries, this.keys.length || 1); attempt++) {
            const groq = this.getNextInstance();
            if (!groq) throw new Error('No Groq instances available');

            try {
                return await groq.chat.completions.create(params);
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Groq Key ${this.currentIndex} failed (Attempt ${attempt + 1}): ${error.message}`);

                // If it's a rate limit error, try the next key immediately
                if (error.status === 429) {
                    continue;
                }

                // Other errors might be transient, retry unless critical
                if (attempt < maxRetries - 1) {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }

        throw lastError;
    }
}

module.exports = new GroqRotator();
