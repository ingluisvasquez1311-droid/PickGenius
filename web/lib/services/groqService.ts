import Groq from 'groq-sdk';

/**
 * Servicio centralizado para manejar múltiples API keys de Groq
 * con rotación automática y fallback inteligente
 */

interface GroqConfig {
    keys: string[];
    currentKeyIndex: number;
    lastRotation: number;
    rateLimitCooldown: Map<string, number>;
}

class GroqService {
    private config: GroqConfig;
    private groqInstances: Map<string, Groq>;

    constructor() {
        // Inicializar configuración con múltiples fuentes de API keys
        const keys = this.loadApiKeys();

        this.config = {
            keys,
            currentKeyIndex: 0,
            lastRotation: Date.now(),
            rateLimitCooldown: new Map()
        };

        this.groqInstances = new Map();
        console.log(`🔑 [GroqService] Initialized with ${keys.length} API key(s)`);
    }

    /**
     * Carga API keys desde múltiples fuentes en orden de prioridad
     */
    private loadApiKeys(): string[] {
        const keys: string[] = [];

        // 1. Prioridad: GROQ_API_KEYS (múltiples keys separadas por comas)
        if (process.env.GROQ_API_KEYS) {
            const multiKeys = process.env.GROQ_API_KEYS.split(',').map(k => k.trim()).filter(k => k);
            keys.push(...multiKeys);
            console.log(`✅ Loaded ${multiKeys.length} keys from GROQ_API_KEYS`);
        }

        // 2. Fallback: GROQ_API_KEY (key única)
        if (process.env.GROQ_API_KEY && !keys.includes(process.env.GROQ_API_KEY)) {
            keys.push(process.env.GROQ_API_KEY);
            console.log('✅ Loaded 1 key from GROQ_API_KEY');
        }

        // Validar que al menos haya una key configurada
        if (keys.length === 0) {
            console.error('❌ No Groq API keys configured!');
            console.error('Please set GROQ_API_KEY or GROQ_API_KEYS in environment variables');
            throw new Error('No Groq API keys available. Please configure GROQ_API_KEY or GROQ_API_KEYS in your environment variables.');
        }

        return keys;
    }

    /**
     * Obtiene la próxima API key disponible, rotando si es necesario
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

        // Si todas están en cooldown, usar la que tenga el cooldown más corto
        console.warn('⚠️ All keys in cooldown, using least cooled');
        return this.config.keys[this.config.currentKeyIndex];
    }

    /**
     * Obtiene o crea una instancia de Groq para una key específica
     */
    private getGroqInstance(apiKey: string): Groq {
        if (!this.groqInstances.has(apiKey)) {
            this.groqInstances.set(apiKey, new Groq({ apiKey }));
        }
        return this.groqInstances.get(apiKey)!;
    }

    /**
     * Marca una key como en rate limit y rota a la siguiente
     */
    private handleRateLimit(apiKey: string): void {
        const cooldownMinutes = 1; // 1 minuto de cooldown
        const cooldownUntil = Date.now() + (cooldownMinutes * 60 * 1000);

        this.config.rateLimitCooldown.set(apiKey, cooldownUntil);
        console.warn(`⏰ [GroqService] Key marked as rate limited for ${cooldownMinutes}min`);

        // Rotar a la siguiente key
        this.rotateToNextKey();
    }

    /**
     * Rota a la siguiente API key disponible
     */
    private rotateToNextKey(): void {
        this.config.currentKeyIndex = (this.config.currentKeyIndex + 1) % this.config.keys.length;
        this.config.lastRotation = Date.now();
        console.log(`🔄 [GroqService] Rotated to key #${this.config.currentKeyIndex + 1}`);
    }

    /**
     * Crea una predicción usando Groq con fallback automático entre keys
     */
    async createPrediction(params: {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
        max_tokens?: number;
        response_format?: { type: 'json_object' | 'text' };
    }): Promise<any> {
        const maxRetries = this.config.keys.length; // Intentar con todas las keys disponibles
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const apiKey = this.getAvailableKey();
                const groq = this.getGroqInstance(apiKey);

                console.log(`🤖 [GroqService] Attempt ${attempt + 1}/${maxRetries} with key #${this.config.currentKeyIndex + 1}`);

                const completion = await groq.chat.completions.create({
                    messages: params.messages as any,
                    model: params.model || 'llama-3.1-8b-instant',
                    temperature: params.temperature ?? 0.6,
                    max_tokens: params.max_tokens || 800,
                    response_format: params.response_format || { type: 'json_object' as const }
                });

                const responseContent = completion.choices[0]?.message?.content;

                if (!responseContent) {
                    throw new Error('Empty response from Groq');
                }

                console.log('✅ [GroqService] Prediction successful');
                return JSON.parse(responseContent);

            } catch (error: any) {
                lastError = error;
                console.error(`❌ [GroqService] Attempt ${attempt + 1} failed:`, error.message);

                // Detectar rate limit
                if (error.message?.includes('rate_limit') || error.status === 429) {
                    const currentKey = this.config.keys[this.config.currentKeyIndex];
                    this.handleRateLimit(currentKey);
                    continue; // Intentar con la siguiente key
                }

                // Si es un error de parsing JSON, no reintentar
                if (error.message?.includes('JSON')) {
                    console.error('JSON parsing error, not retrying');
                    break;
                }

                // Para otros errores, rotar y reintentar
                if (attempt < maxRetries - 1) {
                    this.rotateToNextKey();
                }
            }
        }

        // Si llegamos aquí, todas las keys fallaron
        console.error('❌ [GroqService] All API keys failed');
        throw lastError || new Error('All Groq API keys failed');
    }

    /**
     * Crea un cliente Groq directo (para casos especiales)
     */
    getClient(): Groq {
        const apiKey = this.getAvailableKey();
        return this.getGroqInstance(apiKey);
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
export const groqService = new GroqService();
