import axios, { AxiosError } from 'axios';

/**
 * Servicio centralizado para manejar múltiples API keys de ScraperAPI
 * con rotación automática y fallback inteligente
 */

interface ScraperConfig {
    keys: string[];
    currentKeyIndex: number;
    lastRotation: number;
    rateLimitCooldown: Map<string, number>;
}

class ScraperService {
    private config: ScraperConfig;

    constructor() {
        const keys = this.loadApiKeys();

        this.config = {
            keys,
            currentKeyIndex: 0,
            lastRotation: Date.now(),
            rateLimitCooldown: new Map()
        };

        console.log(`🔑 [ScraperService] Initialized with ${keys.length} API key(s)`);
    }

    /**
     * Carga API keys desde múltiples fuentes
     */
    private loadApiKeys(): string[] {
        const keys: string[] = [];

        // 1. Prioridad: SCRAPER_API_KEYS (múltiples keys separadas por comas)
        if (process.env.SCRAPER_API_KEYS) {
            const multiKeys = process.env.SCRAPER_API_KEYS.split(',').map(k => k.trim()).filter(k => k);
            keys.push(...multiKeys);
            console.log(`✅ Loaded ${multiKeys.length} keys from SCRAPER_API_KEYS`);
        }

        // 2. Fallback: SCRAPER_API_KEY (key única)
        if (process.env.SCRAPER_API_KEY && !keys.includes(process.env.SCRAPER_API_KEY)) {
            keys.push(process.env.SCRAPER_API_KEY);
            console.log('✅ Loaded 1 key from SCRAPER_API_KEY');
        }

        // Validar que al menos haya una key configurada
        if (keys.length === 0) {
            console.error('❌ No ScraperAPI keys configured!');
            console.error('Please set SCRAPER_API_KEY or SCRAPER_API_KEYS in environment variables');
            throw new Error('No ScraperAPI keys available');
        }

        return keys;
    }

    /**
     * Obtiene la próxima API key disponible
     */
    private getAvailableKey(): string {
        const now = Date.now();

        // Buscar una key que no esté en cooldown
        for (let i = 0; i < this.config.keys.length; i++) {
            const index = (this.config.currentKeyIndex + i) % this.config.keys.length;
            const key = this.config.keys[index];
            const cooldownUntil = this.config.rateLimitCooldown.get(key) || 0;

            if (now > cooldownUntil) {
                this.config.currentKeyIndex = index;
                return key;
            }
        }

        // Si todas están en cooldown, usar la actual
        console.warn('⚠️ All ScraperAPI keys in cooldown, using current');
        return this.config.keys[this.config.currentKeyIndex];
    }

    /**
     * Marca una key como en rate limit
     */
    private handleRateLimit(apiKey: string): void {
        const cooldownMinutes = 5; // 5 minutos de cooldown
        const cooldownUntil = Date.now() + (cooldownMinutes * 60 * 1000);

        this.config.rateLimitCooldown.set(apiKey, cooldownUntil);
        console.warn(`⏰ [ScraperService] Key marked as rate limited for ${cooldownMinutes}min`);

        this.rotateToNextKey();
    }

    /**
     * Rota a la siguiente API key
     */
    private rotateToNextKey(): void {
        this.config.currentKeyIndex = (this.config.currentKeyIndex + 1) % this.config.keys.length;
        this.config.lastRotation = Date.now();
        console.log(`🔄 [ScraperService] Rotated to key #${this.config.currentKeyIndex + 1}`);
    }

    /**
     * Hace una request a través de ScraperAPI con rotación automática
     */
    async makeRequest(url: string, options: {
        render?: boolean;
        country_code?: string;
        premium?: boolean;
    } = {}): Promise<any> {
        const maxRetries = this.config.keys.length;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const apiKey = this.getAvailableKey();

                const scraperUrl = new URL('https://api.scraperapi.com');
                scraperUrl.searchParams.set('api_key', apiKey);
                scraperUrl.searchParams.set('url', url);
                scraperUrl.searchParams.set('render', options.render ? 'true' : 'false');

                if (options.country_code) {
                    scraperUrl.searchParams.set('country_code', options.country_code);
                }
                if (options.premium) {
                    scraperUrl.searchParams.set('premium', 'true');
                }

                console.log(`🌍 [ScraperService] Attempt ${attempt + 1}/${maxRetries} with key #${this.config.currentKeyIndex + 1}`);

                const response = await axios.get(scraperUrl.toString(), {
                    timeout: 30000,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                console.log('✅ [ScraperService] Request successful');
                return response.data;

            } catch (error: any) {
                lastError = error;
                console.error(`❌ [ScraperService] Attempt ${attempt + 1} failed:`, error.message);

                // Detectar rate limit o errores 429/403
                if (error.response?.status === 429 || error.response?.status === 403) {
                    const currentKey = this.config.keys[this.config.currentKeyIndex];
                    this.handleRateLimit(currentKey);
                    continue;
                }

                // Para otros errores, rotar y reintentar
                if (attempt < maxRetries - 1) {
                    this.rotateToNextKey();
                }
            }
        }

        console.error('❌ [ScraperService] All API keys failed');
        throw lastError || new Error('All ScraperAPI keys failed');
    }

    /**
     * Obtiene estadísticas del servicio
     */
    getStats() {
        return {
            totalKeys: this.config.keys.length,
            currentKeyIndex: this.config.currentKeyIndex,
            keysInCooldown: Array.from(this.config.rateLimitCooldown.entries())
                .filter(([_, cooldownUntil]) => Date.now() < cooldownUntil)
                .length
        };
    }
}

// Exportar instancia singleton
export const scraperService = new ScraperService();
