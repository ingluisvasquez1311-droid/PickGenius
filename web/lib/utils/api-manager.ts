/**
 * API Management Kit
 * Sistema holístico para control, optimización, seguridad y observabilidad de APIs.
 */

// ==========================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ==========================================

export const CACHE_STRATEGIES = {
    // Datos de producto/jugador (cambian muy poco)
    STATIC_DATA: { ttl: 24 * 3600000 }, // 24 horas

    // Análisis de IA (costoso, reutilizable)
    AI_ANALYSIS: { ttl: 12 * 3600000 }, // 12 horas

    // Datos de Partidos (Sofascore)
    MATCH_DATA: { ttl: 30 * 60000 }, // 30 minutos

    // Live Score / Trending (muy dinámico)
    LIVE_DATA: { ttl: 1 * 60000 }, // 1 minuto

    // Predeterminado
    DEFAULT: { ttl: 60 * 60000 } // 1 hora
};

export const API_COSTS = {
    GROQ_REQUEST: 0.0005, // Estimado por request/tokens
    SCRAPER_REQUEST: 0.001 // Costo promedio por llamada exitosa
};

// ==========================================
// 2. OBSERVABILIDAD & ANALITICA
// ==========================================

export interface MetricEntry {
    service: string;
    endpoint?: string;
    success: boolean;
    latency: number;
    timestamp: Date;
    metadata?: any;
}

export class Analytics {
    private metrics: MetricEntry[] = [];

    track(entry: Omit<MetricEntry, 'timestamp'>) {
        this.metrics.push({
            ...entry,
            timestamp: new Date()
        });

        // Mantener tamaño manejable en memoria
        if (this.metrics.length > 5000) this.metrics.shift();
    }

    getDashboard() {
        const total = this.metrics.length;
        const errors = this.metrics.filter(m => !m.success).length;
        const latencies = this.metrics.map(m => m.latency);
        const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

        return {
            totalRequests: total,
            errorRate: total ? ((errors / total) * 100).toFixed(2) + '%' : '0%',
            avgLatency: Math.round(avgLatency) + 'ms',
            lastUpdate: new Date().toISOString()
        };
    }
}

export const globalAnalytics = new Analytics();

// ==========================================
// 3. CONTROL DE NEGOCIO (PRESUPUESTO)
// ==========================================

export class BudgetMonitor {
    private budget: number;
    private spent: number;

    constructor(monthlyBudget: number = 50.0) { // $50 USD por defecto
        this.budget = monthlyBudget;
        this.spent = 0; // En un sistema real, esto se cargaría de DB/Persistencia
    }

    trackCost(cost: number) {
        this.spent += cost;
        this.checkThresholds();
    }

    private checkThresholds() {
        const percentage = (this.spent / this.budget) * 100;

        if (percentage >= 100) {
            console.error(`💰 [CRITICAL] Presupuesto excedido: $${this.spent.toFixed(2)} / $${this.budget}`);
        } else if (percentage > 80) {
            console.warn(`⚠️ [WARNING] 80% del presupuesto consumido: $${this.spent.toFixed(2)}`);
        }
    }

    getReport() {
        return {
            budget: this.budget,
            spent: this.spent.toFixed(4),
            remaining: (this.budget - this.spent).toFixed(4),
            percentage: ((this.spent / this.budget) * 100).toFixed(1) + '%'
        };
    }
}

export const globalBudget = new BudgetMonitor(50); // Presupuesto global

// ==========================================
// 4. SEGURIDAD (USER RATE LIMITER)
// ==========================================

export interface RateLimitResult {
    allowed: boolean;
    remaining?: number;
    resetIn?: number; // Segundos
}

export class UserRateLimiter {
    private users: Map<string, number[]> = new Map();

    canMakeRequest(userId: string, limit: number = 100, windowMs: number = 3600000): RateLimitResult {
        const now = Date.now();
        const userRequests = this.users.get(userId) || [];

        // Limpiar requests antiguos fuera de ventana
        const recentRequests = userRequests.filter(time => now - time < windowMs);

        if (recentRequests.length >= limit) {
            const oldestRequest = recentRequests[0] || now;
            const resetIn = Math.ceil((oldestRequest + windowMs - now) / 1000);

            return {
                allowed: false,
                resetIn
            };
        }

        recentRequests.push(now);
        this.users.set(userId, recentRequests);

        return {
            allowed: true,
            remaining: limit - recentRequests.length
        };
    }
}

export const globalRateLimiter = new UserRateLimiter();

// ==========================================
// 5. OPTIMIZACIÓN (CACHE & QUEUE)
// ==========================================

import { Redis } from '@upstash/redis';

export class CacheManager {
    private memoryCache: Map<string, { value: any; expiry: number }> = new Map();
    private redis: Redis | null = null;
    private useRedis: boolean = false;

    constructor() {
        // Intentar inicializar Redis si existen las variables
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            try {
                this.redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                });
                this.useRedis = true;
                console.log('📦 [CacheManager] Redis enabled via Upstash');
            } catch (error) {
                console.warn('⚠️ [CacheManager] Failed to initialize Redis, falling back to memory');
            }
        } else {
            console.log('ℹ️ [CacheManager] Running in Memory mode (No Redis credentials)');
        }
    }

    async set(key: string, value: any, ttl: number = CACHE_STRATEGIES.DEFAULT.ttl): Promise<void> {
        if (this.useRedis && this.redis) {
            // Redis TTL es en segundos
            const seconds = Math.ceil(ttl / 1000);
            try {
                await this.redis.set(key, value, { ex: seconds });
                return;
            } catch (err) {
                console.error('❌ [CacheManager] Redis set error:', err);
            }
        }

        // Fallback o modo memoria
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.useRedis && this.redis) {
            try {
                const data = await this.redis.get<T>(key);
                if (data) return data;
            } catch (err) {
                console.error('❌ [CacheManager] Redis get error:', err);
            }
        }

        // Fallback o modo memoria
        const item = this.memoryCache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.memoryCache.delete(key);
            return null;
        }

        return item.value as T;
    }

    /**
     * Obtiene del caché o ejecuta la función de fetch y guarda el resultado
     */
    async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached) {
            return cached;
        }

        const data = await fetchFn();

        // Guardar en fondo para no bloquear respuesta principal
        this.set(key, data, ttl).catch(err => console.error('Cache set background error:', err));

        return data;
    }
}

export class RequestQueue {
    private queue: Array<{ fn: () => Promise<any>; resolve: (v: any) => void; reject: (e: any) => void }> = [];
    private running: number = 0;
    private concurrency: number;

    constructor(concurrency: number = 3) {
        this.concurrency = concurrency;
    }

    async add<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }

    private async process(): Promise<void> {
        if (this.running >= this.concurrency || this.queue.length === 0) return;

        this.running++;
        const job = this.queue.shift();
        if (!job) { this.running--; return; }

        const { fn, resolve, reject } = job;
        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            this.process();
        }
    }
}

export const globalCache = new CacheManager();

// ==========================================
// 6. RESILIENCIA (CIRCUIT BREAKER)
// ==========================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
    private state: CircuitState = 'CLOSED';
    private failures: number = 0;
    private nextAttempt: number = 0;

    constructor(
        private threshold: number = 5,
        private timeout: number = 60000
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit Breaker OPEN');
            }
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    private onFailure() {
        this.failures++;
        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
        }
    }

    getState() { return this.state; }
}

// ==========================================
// 7. LOGGER UNIFICADO
// ==========================================

export class Logger {
    info(msg: string, data?: any) { console.log(`ℹ️ [INFO] ${msg}`, data || ''); }
    error(msg: string, data?: any) { console.error(`❌ [ERROR] ${msg}`, data || ''); }
    warn(msg: string, data?: any) { console.warn(`⚠️ [WARN] ${msg}`, data || ''); }
}

export const globalLogger = new Logger();
