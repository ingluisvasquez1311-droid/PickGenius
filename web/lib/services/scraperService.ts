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

        this.logger.info(`🔑 [ScraperService] Ready with ${this.keys.length} keys`);
    }

    private loadApiKeys(): string[] {
        const keys: string[] = [];
        if (typeof process === 'undefined') return [];

        // Prioritize SCRAPER_API_KEYS (comma separated list)
        if (process.env.SCRAPER_API_KEYS) {
            const list = process.env.SCRAPER_API_KEYS.split(',')
                .map(k => k.replace(/["']/g, '').trim())
                .filter(k => k && k.length > 10); // Basic validation (ScraperAPI keys are usually long)
            keys.push(...list);
            console.log(`🔑 [ScraperService] Loaded ${list.length} keys from SCRAPER_API_KEYS`);
        }

        // Add SCRAPER_API_KEY if not already present
        if (process.env.SCRAPER_API_KEY) {
            const singleKey = process.env.SCRAPER_API_KEY.replace(/["']/g, '').trim();
            if (singleKey && !keys.includes(singleKey)) {
                keys.push(singleKey);
                console.log(`🔑 [ScraperService] Added primary SCRAPER_API_KEY`);
            }
        }

        if (keys.length === 0) {
            console.warn('⚠️ [ScraperService] No API keys found! Data fetching will likely fail.');
            return [];
        }

        // Deduplicate
        return Array.from(new Set(keys));
    }

    /**
     * Ejecuta una petición gestionada (Cache -> Queue -> Breaker -> Rotator -> Analytics -> Budget)
     */
    async makeRequest(url: string, options: ScraperOptions = {}): Promise<any> {
        if (this.keys.length === 0) {
            throw new Error('ScraperService not configured (No API Keys)');
        }

        const { useCache = true, cacheTTL = CACHE_STRATEGIES.MATCH_DATA.ttl, ...reqOptions } = options;
        const cacheKey = `scraper:${url}:${JSON.stringify(reqOptions)}`;
        const start = Date.now();

        const fetchFn = async () => {
            return this.breaker.execute(async () => {
                return this.queue.add(async () => {
                    try {
                        const result = await this.rotator.makeRequest(url, reqOptions);

                        if (result.success) {
                            // Registrar éxito, costo y métricas
                            this.budget.trackCost(API_COSTS.SCRAPER_REQUEST);
                            this.analytics.track({
                                service: 'ScraperAPI',
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
                            service: 'ScraperAPI',
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
