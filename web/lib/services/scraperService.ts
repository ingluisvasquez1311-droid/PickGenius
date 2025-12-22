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
        // Evitar acceso a process en cliente si no está definido (aunque Next.js suele definirlo vacío)
        if (typeof process === 'undefined') return [];

        if (process.env.SCRAPER_API_KEYS) {
            keys.push(...process.env.SCRAPER_API_KEYS.split(',').map(k => k.trim()).filter(k => k));
        }
        if (process.env.SCRAPER_API_KEY && !keys.includes(process.env.SCRAPER_API_KEY)) {
            keys.push(process.env.SCRAPER_API_KEY);
        }

        if (keys.length === 0) {
            console.warn('⚠️ [ScraperService] No API keys found (Normal on Client Side)');
            return [];
        }

        return keys;
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
