import Groq from "groq-sdk";
import { logApiCall } from '@/lib/adminService';
import { GroqAPIRotator } from './groqAPIRotator';
import {
    CacheManager,
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
import { PredictionResponseSchema } from '../schemas/prediction-schemas';

/**
 * Servicio robusto para Groq API
 * Integrado con GroqAPIRotator y API Management Kit para control de costos y resiliencia
 */

class GroqService {
    private rotator: GroqAPIRotator;
    private keys: string[];

    // Componentes de gestión
    private cache: CacheManager;
    private breaker: CircuitBreaker;
    private logger: Logger;
    private budget: BudgetMonitor;
    private analytics: Analytics;

    constructor() {
        this.keys = this.loadApiKeys();
        this.rotator = new GroqAPIRotator(this.keys);

        // Inyectar dependencias globales
        this.cache = globalCache;
        this.logger = globalLogger;
        this.budget = globalBudget;
        this.analytics = globalAnalytics;

        // Circuit Breaker específico para IA (más tolerante)
        this.breaker = new CircuitBreaker(5, 30000); // 5 fallos, 30s de descanso

        this.logger.info(`\u{1F9D9} [GeniusEngine] Ready with ${this.keys.length} spells`);
    }

    private loadApiKeys(): string[] {
        const keys: string[] = [];
        if (process.env.GROQ_API_KEYS) {
            keys.push(...process.env.GROQ_API_KEYS.split(',').map(k => k.trim()).filter(k => k));
        }
        if (process.env.GROQ_API_KEY && !keys.includes(process.env.GROQ_API_KEY)) {
            keys.push(process.env.GROQ_API_KEY);
        }
        if (keys.length === 0) {
            console.warn('⚠️ No Groq API keys configured. Service will not work at runtime.');
            return ['dummy-key-for-build'];
        }
        return keys;
    }

    /**
     * Crea una predicción gestionada con caché y control de costos
     */
    async createPrediction(params: {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
        max_tokens?: number;
        response_format?: { type: 'json_object' | 'text' };
        useCache?: boolean; // Opción para bypass caché
        schema?: any; // Zod Schema opcional
    }): Promise<any> {
        const { useCache = true, schema = PredictionResponseSchema, ...aiParams } = params;

        // Clave de caché basada en el contenido de los mensajes (para no repetir análisis idénticos)
        const cacheKey = `groq: prediction:${JSON.stringify(aiParams.messages)} `;
        const start = Date.now();

        const fetchFn = async () => {
            return this.breaker.execute(async () => {
                try {
                    const result = await this.rotator.chatCompletion(
                        aiParams.messages as any,
                        {
                            model: aiParams.model || 'llama-3.1-8b-instant',
                            temperature: aiParams.temperature ?? 0.6,
                            max_tokens: aiParams.max_tokens || 800,
                            response_format: aiParams.response_format || { type: 'json_object' as const }
                        }
                    );

                    if (result.success && result.content) {
                        try {
                            const rawJson = JSON.parse(result.content);

                            // VALIDACIÓN ZOD (Nivel Profesional)
                            // Si los datos no cumplen la estructura, lanzará error detallado
                            const validatedData = schema.parse(rawJson);

                            // Log exitoso y métricas solo si es válido
                            this.budget.trackCost(API_COSTS.GROQ_REQUEST);
                            this.analytics.track({
                                service: 'GroqAPI',
                                endpoint: 'chat/completions',
                                success: true,
                                latency: Date.now() - start,
                                metadata: { model: aiParams.model, tokens: result.usage?.total_tokens }
                            });

                            return validatedData;

                        } catch (e: any) {
                            console.error('[GeniusEngine] Insight/Parse Error:', e.errors || e.message);
                            throw new Error('AI response validation failed: ' + (e.message || 'Invalid format'));
                        }
                    } else {
                        throw new Error(result.error || 'All Groq API keys failed');
                    }
                } catch (err: any) {
                    this.analytics.track({
                        service: 'GroqAPI',
                        endpoint: 'chat/completions',
                        success: false,
                        latency: Date.now() - start,
                        metadata: { error: err.message }
                    });
                    throw err;
                }
            });
        };

        try {
            if (useCache) {
                // Cachear análisis por 12 horas por defecto (Estrategia AI_ANALYSIS)
                return await this.cache.getOrFetch(cacheKey, fetchFn, CACHE_STRATEGIES.AI_ANALYSIS.ttl);
            } else {
                return await fetchFn();
            }
        } catch (error: any) {
            this.logger.error(`[GeniusEngine] Prediction failed`, { error: error.message });
            console.error("[GeniusEngine] Error:", error.message);
            logApiCall('Groq', '/chat/completions', 500).catch(() => { });
            throw error;
        }
    }

    /**
     * Crea un prompt simple gestionado
     */
    async complete(prompt: string, options: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        useCache?: boolean;
    } = {}): Promise<string> {
        const { useCache = true, ...aiOptions } = options;
        const cacheKey = `groq: complete:${prompt} `;

        const fetchFn = async () => {
            const result = await this.rotator.complete(prompt, aiOptions);
            if (result.success && result.content) {
                this.budget.trackCost(API_COSTS.GROQ_REQUEST);
                logApiCall('Groq', '/chat/completions', 200).catch(() => { });
                return result.content;
            }
            throw new Error(result.error || 'Groq completion failed');
        };

        try {
            if (useCache) {
                return await this.cache.getOrFetch(cacheKey, fetchFn, CACHE_STRATEGIES.AI_ANALYSIS.ttl);
            }
            return await fetchFn();
        } catch (error: any) {
            this.logger.error(`[GeniusEngine] Completion failed`, { error: error.message });
            throw error;
        }
    }

    getStats() {
        return {
            rotator: this.rotator.getSummary(),
            keys: this.rotator.getStats(),
            budget: this.budget.getReport(),
            circuit: this.breaker.getState()
        };
    }

    reset(): void {
        this.rotator.reset();
        this.breaker.reset();
    }
}

export const groqService = new GroqService();
