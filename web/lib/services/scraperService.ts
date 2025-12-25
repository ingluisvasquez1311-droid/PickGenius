import { SmartAPIRotator } from './smartAPIRotator';
import {
    CacheManager,
    RequestQueue,
    CircuitBreaker,
    Logger,
    BudgetMonitor,
    Analytics,
    globalCache,
    globalLogger,
    globalBudget,
    globalAnalytics,
    CACHE_STRATEGIES,
    API_COSTS
} from '../utils/api-manager';

/**
 * Servicio robusto para ScraperAPI/Sofascore
 * Integrado con SmartAPIRotator y API Management Kit
 */

interface ScraperOptions extends RequestInit {
    render?: boolean;
    country_code?: string;
    premium?: boolean;
    keep_headers?: boolean;
    device_type?: string;
    useCache?: boolean;
    cacheTTL?: number;
}

class ScraperService {
    private rotator: SmartAPIRotator;
    private keys: string[];

    // Componentes de gestión
    private cache: CacheManager;
    private queue: RequestQueue;
    private breaker: CircuitBreaker;
    private logger: Logger;
    private budget: BudgetMonitor;
    private analytics: Analytics;

    constructor() {
        this.keys = this.loadApiKeys();
        this.rotator = new SmartAPIRotator(this.keys);

        // Inyectar dependencias globales
        this.cache = globalCache;
        this.logger = globalLogger;
        this.budget = globalBudget;
        this.analytics = globalAnalytics;

        // Componentes locales (por servicio)
        this.queue = new RequestQueue(5); // Concurrencia local
        this.breaker = new CircuitBreaker(10, 60000);

        // Enhanced logging for ScraperAPI keys
        console.log(`\n🔑 [ScraperService] Initialized with ${this.keys.length} API keys`);
        this.keys.forEach((key, idx) => {
            console.log(`   Key ${idx + 1}: ${key.substring(0, 8)}...${key.substring(key.length - 4)} (${key.length} chars)`);
        });
        this.logger.info(`🔑 [ScraperService] Ready with ${this.keys.length} keys`);
    }

    private loadApiKeys(): string[] {
        const keys: string[] = [];
        if (typeof process === 'undefined') return [];

        console.log('🔍 [ScraperService] Diagnostic: Loading Keys...');

        // Helper for strict cleaning (Alphanumeric only)
        const cleanKey = (k: string) => k ? k.trim().replace(/[^a-zA-Z0-9]/g, '') : '';

        // 1. Check SCRAPER_API_KEYS
        const rawListEnv = process.env.SCRAPER_API_KEYS;
        if (rawListEnv) {
            console.log(`   Found SCRAPER_API_KEYS (Length: ${rawListEnv.length})`);
            const list = rawListEnv.split(',')
                .map(k => {
                    const clean = cleanKey(k);
                    if (clean.length !== 32) {
                        console.warn(`   ⚠️ Warning: Key segment length ${clean.length} (expected 32). Content: ${clean.substring(0, 5)}...`);
                    }
                    return clean;
                })
                .filter(k => k && k.length >= 20); // Allow verifying even if slightly weird, but filter mostly garbage

            keys.push(...list);
            console.log(`   ✅ Loaded ${list.length} valid keys from list.`);
        } else {
            console.log('   ❌ SCRAPER_API_KEYS not found in environment.');
        }

        // 2. Check SCRAPER_API_KEY
        const rawSingleEnv = process.env.SCRAPER_API_KEY;
        if (rawSingleEnv) {
            console.log(`   Found SCRAPER_API_KEY (Length: ${rawSingleEnv.length})`);
            const singleKey = cleanKey(rawSingleEnv);
            if (singleKey && !keys.includes(singleKey)) {
                keys.push(singleKey);
                console.log(`   ✅ Added primary SCRAPER_API_KEY.`);
            }
        } else {
            console.log('   ❌ SCRAPER_API_KEY not found in environment.');
        }

        if (keys.length === 0) {
            console.error('🚨 [ScraperService] CRITICAL: No ScraperAPI keys found! Check Render/Vercel Env Vars.');
            // Add a placeholder to prevent immediate crash, but requests will fail.
            return [];
        }

        // Deduplicate
        return Array.from(new Set(keys));
    }

    // DEBUG METHOD: Expose key status (masked)
    public getKeysDebugInfo() {
        return this.keys.map(k => `${k.substring(0, 4)}...${k.substring(k.length - 4)} (len: ${k.length})`);
    }

    // Headers de navegador real para pasar desapercibido
    private getStealthHeaders(): HeadersInit {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': 'https://www.sofascore.com/',
            'Origin': 'https://www.sofascore.com',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };
    }

    /**
     * Ejecuta una petición gestionada (Cache -> Queue -> Breaker -> (Direct/Rotator) -> Analytics -> Budget)
     */
    async makeRequest(url: string, options: ScraperOptions = {}): Promise<any> {
        // MODO DIRECTO (Stealth) - Para uso local o VPS propio
        const useDirect = process.env.USE_DIRECT_FETCH === 'true';

        if (!useDirect && this.keys.length === 0) {
            throw new Error('ScraperService not configured (No API Keys)');
        }

        const { useCache = true, cacheTTL = CACHE_STRATEGIES.MATCH_DATA.ttl, ...reqOptions } = options;
        const cacheKey = `scraper:${url}:${JSON.stringify(reqOptions)}`;
        const start = Date.now();

        const fetchFn = async () => {
            return this.breaker.execute(async () => {
                return this.queue.add(async () => {
                    try {
                        let result;

                        if (useDirect) {
                            // 🚀 MODO DIRECTO: Sin intermediarios, con headers reales
                            try {
                                const headers = this.getStealthHeaders();
                                const response = await fetch(url, {
                                    method: 'GET',
                                    headers: headers
                                });

                                if (!response.ok) {
                                    throw new Error(`Direct Fetch Failed: ${response.status} ${response.statusText}`);
                                }

                                const data = await response.json();
                                result = { success: true, data };

                                this.logger.info(`🥷 [StealthMode] Success: ${url}`);
                            } catch (err: any) {
                                result = { success: false, error: err.message };
                            }
                        } else {
                            // 🔄 MODO PROXY: Usando ScraperAPI
                            result = await this.rotator.makeRequest(url, reqOptions);
                        }

                        if (result.success) {
                            // Registrar éxito, costo (0 si es directo) y métricas
                            if (!useDirect) this.budget.trackCost(API_COSTS.SCRAPER_REQUEST);

                            this.analytics.track({
                                service: useDirect ? 'DirectStealth' : 'ScraperAPI',
                                endpoint: url,
                                success: true,
                                latency: Date.now() - start
                            });
                            return result.data;
                        } else {
                            throw new Error(result.error || 'Request failed');
                        }
                    } catch (err: any) {
                        this.analytics.track({
                            service: useDirect ? 'DirectStealth' : 'ScraperAPI',
                            endpoint: url,
                            success: false,
                            latency: Date.now() - start,
                            metadata: { error: err.message }
                        });
                        throw err;
                    }
                });
            });
        };

        try {
            if (useCache) {
                return await this.cache.getOrFetch(cacheKey, fetchFn, cacheTTL);
            } else {
                return await fetchFn();
            }
        } catch (error: any) {
            this.logger.error(`❌ [ScraperService] Failed: ${url}`, { error: error.message });
            throw error;
        }
    }

    getStats() {
        return {
            mode: process.env.USE_DIRECT_FETCH === 'true' ? '🥷 Stealth Direct' : '🔄 Proxy Rotator',
            rotator: this.rotator.getStats(),
            analytics: this.analytics.getDashboard(),
            budget: this.budget.getReport(),
            circuit: this.breaker.getState()
        };
    }

    reset(): void {
        this.rotator.reset();
    }
}

export const scraperService = new ScraperService();
