/**
 * Sistema inteligente de rotación de API keys para ScraperAPI/Sofascore
 * Con tracking de fallos, bloqueo temporal y retry automático
 */

interface KeyStats {
    key: string;
    index: number;
    failures: number;
    successes: number;
    lastUsed: number | null;
    isBlocked: boolean;
    blockUntil: number | null;
}

interface RequestResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    keyUsed?: number;
    attempts: number;
}

export class SmartAPIRotator {
    private apiKeys: KeyStats[];
    private currentIndex: number;
    private maxRetries: number;
    private maxFailuresBeforeBlock: number;
    private blockDuration: number; // milliseconds

    constructor(apiKeys: string[]) {
        this.apiKeys = apiKeys.map((key, index) => ({
            key,
            index,
            failures: 0,
            successes: 0,
            lastUsed: null,
            isBlocked: false,
            blockUntil: null
        }));

        this.currentIndex = 0;
        this.maxRetries = 3;
        this.maxFailuresBeforeBlock = 3;
        this.blockDuration = 5 * 60 * 1000; // 5 minutos

        console.log(`🔑 [SmartAPIRotator] Initialized with ${apiKeys.length} API key(s)`);
    }

    /**
     * Obtiene la siguiente key disponible
     */
    private getNextKey(): KeyStats {
        const now = Date.now();

        // Desbloquear keys si ya pasó el tiempo
        this.apiKeys.forEach(keyObj => {
            if (keyObj.isBlocked && keyObj.blockUntil && now > keyObj.blockUntil) {
                keyObj.isBlocked = false;
                keyObj.failures = 0;
                console.log(`✅ Key #${keyObj.index + 1} desbloqueada`);
            }
        });

        // Buscar una key disponible
        const availableKeys = this.apiKeys.filter(k => !k.isBlocked);

        if (availableKeys.length === 0) {
            throw new Error('❌ Todas las API keys están bloqueadas temporalmente');
        }

        // Rotar al siguiente índice
        this.currentIndex = (this.currentIndex + 1) % availableKeys.length;
        const selectedKey = availableKeys[this.currentIndex];
        selectedKey.lastUsed = now;

        return selectedKey;
    }

    /**
     * Marca una key como exitosa
     */
    private markSuccess(keyObj: KeyStats): void {
        keyObj.successes++;
        keyObj.failures = 0; // Reset failures en caso de éxito
        console.log(`✅ Key #${keyObj.index + 1} - Éxito (Total: ${keyObj.successes})`);
    }

    /**
     * Marca una key como fallida
     */
    private markFailure(keyObj: KeyStats, error: Error): void {
        keyObj.failures++;
        console.log(`⚠️ Key #${keyObj.index + 1} - Fallo ${keyObj.failures}/${this.maxFailuresBeforeBlock}`);
        console.log(`   Error: ${error.message}`);

        // Bloquear si supera el límite
        if (keyObj.failures >= this.maxFailuresBeforeBlock) {
            keyObj.isBlocked = true;
            keyObj.blockUntil = Date.now() + this.blockDuration;
            console.log(`🚫 Key #${keyObj.index + 1} bloqueada por ${this.blockDuration / 60000} minutos`);
        }
    }

    /**
     * Hace una request con retry inteligente y rotación automática
     */
    /**
     * Hace una request con retry inteligente y rotación automática
     */
    async makeRequest<T = any>(
        url: string,
        options: RequestInit & {
            render?: boolean;
            country_code?: string;
            premium?: boolean;
            keep_headers?: boolean;
            device_type?: string;
        } = {}
    ): Promise<RequestResult<T>> {
        let lastError: Error | null = null;
        let attempts = 0;

        while (attempts < this.maxRetries) {
            attempts++;

            try {
                const keyObj = this.getNextKey();
                console.log(`\n🔄 Intento ${attempts}/${this.maxRetries} - Usando Key #${keyObj.index + 1}`);

                // Construir parámetros de ScraperAPI
                const params = new URLSearchParams();
                params.append('api_key', keyObj.key);
                params.append('url', url);

                if (options.render) params.append('render', 'true');
                if (options.country_code) params.append('country_code', options.country_code);
                if (options.premium) params.append('premium', 'true');
                if (options.keep_headers) params.append('keep_headers', 'true');
                if (options.device_type) params.append('device_type', options.device_type);

                const scraperUrl = `http://api.scraperapi.com?${params.toString()}`;

                // Separar opciones de fetch de las opciones de ScraperAPI
                const {
                    render,
                    country_code,
                    premium,
                    keep_headers,
                    device_type,
                    ...fetchOptions
                } = options;

                const response = await fetch(scraperUrl, {
                    ...fetchOptions,
                    headers: {
                        'Accept': 'application/json',
                        ...fetchOptions.headers
                    }
                });

                // Verificar respuesta
                if (response.status === 403) {
                    console.error(`⛔ Key #${keyObj.index + 1} ha excedido su cuota o es inválida (403 Forbidden). Bloqueando inmediatamente.`);
                    // Forzar bloqueo inmediato para esta key
                    keyObj.failures = this.maxFailuresBeforeBlock;
                    this.markFailure(keyObj, new Error('403 Forbidden - Quota Exceeded'));
                    throw new Error('403 Forbidden - Quota Exceeded');
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Verificar que la respuesta tenga contenido válido
                if (!data || (Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
                    throw new Error('Respuesta vacía o inválida de Sofascore');
                }

                // ✅ Éxito
                this.markSuccess(keyObj);
                return {
                    success: true,
                    data: data as T,
                    keyUsed: keyObj.index + 1,
                    attempts
                };

            } catch (error) {
                lastError = error as Error;

                // Obtener la key que falló (la más recientemente usada)
                const failedKey = this.apiKeys.find(k => k.lastUsed !== null && k.index === this.currentIndex);
                if (failedKey) {
                    this.markFailure(failedKey, lastError);
                }

                // Si no quedan más intentos, lanzar error
                if (attempts >= this.maxRetries) {
                    console.log(`\n❌ Todos los intentos fallaron`);
                    break;
                }

                // Esperar antes de reintentar (backoff exponencial)
                const waitTime = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
                console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
                await this.sleep(waitTime);
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        return {
            success: false,
            error: lastError?.message || 'Error desconocido',
            attempts
        };
    }

    /**
     * Utilidad para esperar
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Obtiene estadísticas de uso
     */
    getStats() {
        return this.apiKeys.map(k => ({
            key: `Key #${k.index + 1}`,
            successes: k.successes,
            failures: k.failures,
            isBlocked: k.isBlocked,
            status: k.isBlocked ? '🚫 Bloqueada' : '✅ Activa'
        }));
    }

    /**
     * Resetea todas las estadísticas
     */
    reset(): void {
        this.apiKeys.forEach(k => {
            k.failures = 0;
            k.successes = 0;
            k.isBlocked = false;
            k.blockUntil = null;
        });
        console.log('🔄 Estadísticas reseteadas');
    }
}
