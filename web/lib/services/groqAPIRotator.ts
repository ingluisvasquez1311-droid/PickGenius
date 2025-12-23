/**
 * Sistema inteligente de rotación de API keys para Groq
 * Con balanceo de carga, tracking de rate limit y retry automático
 */

interface GroqKeyStats {
    key: string;
    index: number;
    failures: number;
    successes: number;
    totalRequests: number;
    lastUsed: number | null;
    isBlocked: boolean;
    blockUntil: number | null;
    rateLimitReset: number | null;
    remainingRequests: number | null;
}

interface GroqRequestResult<T = any> {
    success: boolean;
    data?: T;
    content?: string;
    error?: string;
    keyUsed?: number;
    attempts: number;
    usage?: any;
}

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqCompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' | 'text' };
    [key: string]: any;
}

export class GroqAPIRotator {
    private apiKeys: GroqKeyStats[];
    private maxRetries: number;
    private maxFailuresBeforeBlock: number;
    private blockDuration: number;
    private rateLimitBlockDuration: number;

    constructor(apiKeys: string[]) {
        this.apiKeys = apiKeys.map((key, index) => ({
            key,
            index,
            failures: 0,
            successes: 0,
            totalRequests: 0,
            lastUsed: null,
            isBlocked: false,
            blockUntil: null,
            rateLimitReset: null,
            remainingRequests: null
        }));

        this.maxRetries = 10; // Más intentos dado que ahora tenemos 30 keys
        this.maxFailuresBeforeBlock = 2; // Más estricto para rotar rápido si hay fallos
        this.blockDuration = 1 * 60 * 1000; // Bloqueo más corto (1 min) para reintentar rápido
        this.rateLimitBlockDuration = 5 * 60 * 1000; // 5 minutos para rate limit (Groq suele resetear rápido)

        console.log(`[GroqAPIRotator] Initialized with ${apiKeys.length} API key(s)`);
    }

    /**
     * Obtiene la siguiente key disponible (prioriza las menos usadas)
     */
    private getNextKey(): GroqKeyStats {
        const now = Date.now();

        // Desbloquear keys si ya pasó el tiempo
        this.apiKeys.forEach(keyObj => {
            if (keyObj.isBlocked && keyObj.blockUntil && now > keyObj.blockUntil) {
                keyObj.isBlocked = false;
                keyObj.failures = 0;
                console.log(`[OK] Groq Key #${keyObj.index + 1} desbloqueada`);
            }
        });

        // Filtrar keys disponibles
        const availableKeys = this.apiKeys.filter(k => !k.isBlocked);

        if (availableKeys.length === 0) {
            const nextUnblock = Math.min(...this.apiKeys.map(k => k.blockUntil || Infinity));
            const waitTime = Math.ceil((nextUnblock - now) / 1000);
            throw new Error(`[Error] Todas las Groq API keys están bloqueadas. Próxima disponible en ${waitTime}s`);
        }

        // Ordenar por menor uso (balanceo de carga)
        availableKeys.sort((a, b) => a.totalRequests - b.totalRequests);

        // Seleccionar la menos usada
        const selectedKey = availableKeys[0];
        selectedKey.lastUsed = now;
        selectedKey.totalRequests++;

        return selectedKey;
    }

    /**
     * Marca key como exitosa
     */
    private markSuccess(keyObj: GroqKeyStats, responseHeaders: Record<string, string> = {}): void {
        keyObj.successes++;
        keyObj.failures = 0;

        // Extraer información de rate limit de los headers
        if (responseHeaders['x-ratelimit-remaining']) {
            keyObj.remainingRequests = parseInt(responseHeaders['x-ratelimit-remaining']);
        }
        if (responseHeaders['x-ratelimit-reset']) {
            keyObj.rateLimitReset = parseInt(responseHeaders['x-ratelimit-reset']) * 1000;
        }

        console.log(`[OK] Groq Key #${keyObj.index + 1} - Éxito | Total: ${keyObj.successes} | Remaining: ${keyObj.remainingRequests || '?'}`);
    }

    /**
     * Marca key como fallida
     */
    private markFailure(keyObj: GroqKeyStats, error: Error, statusCode: number | null = null): void {
        keyObj.failures++;

        // Rate limit (429)
        if (statusCode === 429) {
            keyObj.isBlocked = true;
            keyObj.blockUntil = Date.now() + this.rateLimitBlockDuration;
            console.log(`[Blocked] Groq Key #${keyObj.index + 1} - RATE LIMIT - Bloqueada por ${this.rateLimitBlockDuration / 60000} min`);
            return;
        }

        console.log(`[Warning] Groq Key #${keyObj.index + 1} - Fallo ${keyObj.failures}/${this.maxFailuresBeforeBlock}`);
        console.log(`   Error: ${error.message || error}`);

        // Bloquear si supera el límite
        if (keyObj.failures >= this.maxFailuresBeforeBlock) {
            keyObj.isBlocked = true;
            keyObj.blockUntil = Date.now() + this.blockDuration;
            console.log(`[Blocked] Groq Key #${keyObj.index + 1} bloqueada por ${this.blockDuration / 60000} min`);
        }
    }

    /**
     * Hace un chat completion con retry inteligente
     */
    async chatCompletion(
        messages: GroqMessage[],
        options: GroqCompletionOptions = {}
    ): Promise<GroqRequestResult> {
        const {
            model = "llama-3.3-70b-versatile",
            temperature = 0.7,
            max_tokens = 1024,
            ...otherOptions
        } = options;

        let lastError: Error | null = null;
        let attempts = 0;

        while (attempts < this.maxRetries) {
            attempts++;
            let keyObj: GroqKeyStats | null = null;

            try {
                keyObj = this.getNextKey();
                console.log(`\n[Retry] Intento ${attempts}/${this.maxRetries} - Usando Groq Key #${keyObj.index + 1}`);

                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${keyObj.key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature,
                        max_tokens,
                        ...otherOptions
                    })
                });

                // Guardar headers para rate limit info
                const headers: Record<string, string> = {};
                response.headers.forEach((value, key) => {
                    headers[key.toLowerCase()] = value;
                });

                // Manejar errores HTTP
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));

                    if (response.status === 429) {
                        this.markFailure(keyObj, new Error('Rate limit exceeded'), 429);

                        // Si quedan keys, continuar; si no, esperar
                        const availableKeys = this.apiKeys.filter(k => !k.isBlocked).length;
                        if (availableKeys === 0) {
                            throw new Error('Todas las keys en rate limit');
                        }
                        continue;
                    }

                    throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
                }

                const data = await response.json();

                // Verificar que la respuesta sea válida
                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    throw new Error('Respuesta inválida de Groq API');
                }

                // Success
                this.markSuccess(keyObj, headers);
                return {
                    success: true,
                    data,
                    content: data.choices[0].message.content,
                    keyUsed: keyObj.index + 1,
                    attempts,
                    usage: data.usage
                };

            } catch (error) {
                lastError = error as Error;

                // Marcar fallo solo si tenemos referencia a la key
                if (keyObj) {
                    this.markFailure(keyObj, lastError);
                }

                // Si no quedan más intentos, terminar
                if (attempts >= this.maxRetries) {
                    console.log(`\n[Error] Todos los intentos fallaron`);
                    break;
                }

                // Esperar antes de reintentar (backoff exponencial)
                const waitTime = Math.min(500 * Math.pow(2, attempts - 1), 3000);
                console.log(`[Wait] Esperando ${waitTime}ms antes de reintentar...`);
                await this.sleep(waitTime);
            }
        }

        // Todos los intentos fallaron
        return {
            success: false,
            error: lastError?.message || 'Error desconocido',
            attempts
        };
    }

    /**
     * Método conveniente para prompts simples
     */
    async complete(prompt: string, options: GroqCompletionOptions = {}): Promise<GroqRequestResult> {
        return this.chatCompletion([
            { role: "user", content: prompt }
        ], options);
    }

    /**
     * Utilidad para esperar
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtiene estadísticas detalladas por key
     */
    getStats() {
        return this.apiKeys.map(k => ({
            key: `Key #${k.index + 1}`,
            successes: k.successes,
            failures: k.failures,
            totalRequests: k.totalRequests,
            remaining: k.remainingRequests || '?',
            status: k.isBlocked ? '[Blocked] Bloqueada' : '[Active] Activa'
        }));
    }

    /**
     * Obtiene resumen general
     */
    getSummary() {
        const active = this.apiKeys.filter(k => !k.isBlocked).length;
        const blocked = this.apiKeys.length - active;
        const totalRequests = this.apiKeys.reduce((sum, k) => sum + k.totalRequests, 0);
        const totalSuccesses = this.apiKeys.reduce((sum, k) => sum + k.successes, 0);
        const totalFailures = this.apiKeys.reduce((sum, k) => sum + k.failures, 0);

        return {
            totalKeys: this.apiKeys.length,
            activeKeys: active,
            blockedKeys: blocked,
            totalRequests,
            totalSuccesses,
            totalFailures,
            successRate: totalRequests > 0 ? `${((totalSuccesses / totalRequests) * 100).toFixed(1)}%` : '0%'
        };
    }

    /**
     * Resetea estadísticas
     */
    reset(): void {
        this.apiKeys.forEach(k => {
            k.failures = 0;
            k.successes = 0;
            k.totalRequests = 0;
            k.isBlocked = false;
            k.blockUntil = null;
            k.rateLimitReset = null;
            k.remainingRequests = null;
        });
        console.log('[Reset] Groq: Estadísticas reseteadas');
    }
}
