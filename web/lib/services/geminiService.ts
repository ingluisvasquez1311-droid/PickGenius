import axios from 'axios';
import {
    globalCache,
    globalLogger,
    globalBudget,
    globalAnalytics,
    CACHE_STRATEGIES,
    API_COSTS
} from '../utils/api-manager';

/**
 * Servicio robusto para Google Gemini API
 * Con ROTACIÓN de llaves (22+) para máxima disponibilidad
 */
class GeminiService {
    private keys: string[];
    private currentKeyIndex: number = 0;
    private baseUrl: string;

    constructor() {
        this.keys = this.loadApiKeys();
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        globalLogger.info(`🚀 [GeminiService] Initialized with ${this.keys.length} keys`);
    }

    private loadApiKeys(): string[] {
        const keys: string[] = [];
        // Priorizar la lista plural de llaves
        if (process.env.GEMINI_API_KEYS) {
            keys.push(...process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(k => k));
        }
        // Fallback a la llave única
        if (process.env.GEMINI_API_KEY && !keys.includes(process.env.GEMINI_API_KEY)) {
            keys.push(process.env.GEMINI_API_KEY);
        }

        // Eliminar duplicados
        return [...new Set(keys)];
    }

    private getNextKey(): string {
        if (this.keys.length === 0) return '';
        const key = this.keys[this.currentKeyIndex];
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
        return key;
    }

    async createPrediction(params: {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
    }): Promise<any> {
        const { messages, model = 'gemini-1.5-flash', temperature = 0.7 } = params;

        const cacheKey = `gemini:prediction:${JSON.stringify(messages)}`;
        const start = Date.now();

        const fetchFn = async () => {
            let lastError;
            // Intentar hasta 3 veces con diferentes llaves si hay fallos de cuota
            for (let attempt = 0; attempt < Math.min(this.keys.length, 3); attempt++) {
                const apiKey = this.getNextKey();
                if (!apiKey) throw new Error('GEMINI_API_KEY no configurado');

                try {
                    // Convertimos formato ChatML/OpenAI a Gemini Format
                    const contents = messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }));

                    if (contents.length > 0 && contents[0].role === 'model') {
                        contents.unshift({ role: 'user', parts: [{ text: 'Instrucción: Analiza la siguiente solicitud deportiva.' }] });
                    }

                    const response = await axios.post(
                        `${this.baseUrl}/${model}:generateContent?key=${apiKey}`,
                        {
                            contents,
                            generationConfig: {
                                temperature,
                                responseMimeType: 'application/json'
                            }
                        },
                        { timeout: 15000 }
                    );

                    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) throw new Error('Respuesta vacía de Gemini');

                    const validatedData = JSON.parse(text);

                    globalBudget.trackCost(API_COSTS.GROQ_REQUEST);
                    globalAnalytics.track({
                        service: 'GeminiAPI',
                        endpoint: 'generateContent',
                        success: true,
                        latency: Date.now() - start,
                        metadata: { model, keyIndex: this.currentKeyIndex }
                    });

                    return validatedData;

                } catch (error: any) {
                    lastError = error;
                    const status = error.response?.status;

                    if (status === 429 || status === 401 || status === 403) {
                        console.warn(`⚠️ [GeminiService] Key rotation triggered due to ${status}. Attempt ${attempt + 1}`);
                        continue; // Intentar con la siguiente llave
                    }

                    break; // Error no recuperable (ej. mala sintaxis)
                }
            }

            throw lastError || new Error('All Gemini attempts failed');
        };

        return await globalCache.getOrFetch(cacheKey, fetchFn, CACHE_STRATEGIES.AI_ANALYSIS.ttl);
    }
}

export const geminiService = new GeminiService();
