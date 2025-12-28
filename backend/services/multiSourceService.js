const axios = require('axios');
const http2 = require('http2');
const sofascoreRobot = require('../robots/sofascoreScraper');

/**
 * MultiSourceService: Orquestador de fuentes de datos.
 * Maneja SofaScore, AiScore y Flashscore con lógica de reintentos y fallbacks.
 */
class MultiSourceService {
    constructor() {
        this.sources = {
            sofascore: { active: true, weight: 100, lastError: null }, // Reactivado para prueba
            aiscore: { active: false, weight: 0, lastError: null },
            flashscore: { active: false, weight: 0, lastError: null }
        };

        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ];

        this.scraperApiKey = process.env.SCRAPERAPI_KEY || '';

        this.cookies = {
            sofascore: '',
            aiscore: '',
            flashscore: ''
        };

        // Normalizador de nombres de deportes (Frontend -> API)
        this.sportMapping = {
            'nfl': 'american-football',
            'nhl': 'ice-hockey',
            'icehockey': 'ice-hockey',
            'soccer': 'football'
        };
    }

    /**
     * Normaliza el nombre del deporte
     */
    normalizeSport(sport) {
        return this.sportMapping[sport.toLowerCase()] || sport.toLowerCase();
    }

    /**
     * Actualiza las cookies de una fuente (Inyección dinámica)
     */
    updateCookies(source, cookieString) {
        if (this.cookies[source] !== undefined) {
            this.cookies[source] = cookieString;
            console.log(`✅ [MultiSource] Cookies updated for ${source}`);
            return true;
        }
        return false;
    }

    /**
     * Helper para peticiones HTTP/2 (Ultra-Stealth para SofaScore)
     */
    async fetchH2(hostname, path, headers = {}) {
        return new Promise((resolve, reject) => {
            const client = http2.connect(`https://${hostname}`);

            client.on('error', (err) => reject(err));

            const req = client.request({
                ':method': 'GET',
                ':path': path,
                ...headers
            });

            let data = '';
            req.on('response', (headers) => {
                if (headers[':status'] !== 200) {
                    reject(new Error(`HTTP/2 Status: ${headers[':status']}`));
                }
            });

            req.on('data', (chunk) => { data += chunk; });
            req.on('end', () => {
                client.close();
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data); // Devolver texto si no es JSON
                }
            });
            req.end();

            // Timeout de seguridad
            setTimeout(() => {
                client.destroy();
                reject(new Error('HTTP/2 Timeout'));
            }, 10000);
        });
    }

    /**
     * Obtiene una respuesta de SofaScore usando el Bridge (HTTP/2 Mode)
     */
    async fetchFromSofaScore(path) {
        const hostname = 'api.sofascore.com';
        const fullPath = `/api/v1/${path}`;

        const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

        const headers = {
            ':method': 'GET',
            ':path': fullPath,
            ':authority': hostname,
            ':scheme': 'https',
            'user-agent': userAgent,
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
            'cookie': this.cookies.sofascore,
            'referer': 'https://www.sofascore.com/',
            'origin': 'https://www.sofascore.com',
            'sec-ch-ua': '"Not A(Battery;Base;7.2.1", "Chromium";"121", "Google Chrome";"121"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site'
        };

        try {
            console.log(`⚡ [MultiSource] H2 Fetch: ${hostname}${fullPath}`);
            const data = await this.fetchH2(hostname, fullPath, headers);

            // Piggyback Sync
            if (path.includes('events/') || path.includes('scheduled-events')) {
                sofascoreRobot.processPassiveData(path, data)
                    .catch(err => console.error('❌ [Passive Sync Failed]:', err.message));
            }

            return data;
        } catch (error) {
            this.sources.sofascore.lastError = error.message;
            console.error(`❌ [MultiSource] SofaScore H2 Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Placeholder para AiScore
     */
    async fetchFromAiScore(path) {
        // Implementación futura basada en los cURL de Daniel
        console.warn('⚠️ [MultiSource] AiScore fetch not implemented yet');
        throw new Error('AiScore not implemented');
    }

    /**
     * Placeholder para Flashscore
     */
    async fetchFromFlashscore(path) {
        // Implementación futura basada en los cURL de Daniel
        console.warn('⚠️ [MultiSource] Flashscore fetch not implemented yet');
        throw new Error('Flashscore not implemented');
    }

    /**
     * Intenta obtener datos de múltiples fuentes en orden de prioridad.
     * PRIORIZA SofaScore vía HTTP/2 para máxima calidad en la Prueba Real.
     */
    async fetchLiveEvents(sportName) {
        const normalizedSport = this.normalizeSport(sportName);

        // --- 1. PRIORIDAD: SOFASCORE (PROBADA Y SEGURA) ---
        if (this.sources.sofascore.active) {
            try {
                console.log(`📡 [MultiSource] Primary: SofaScore H2 for ${normalizedSport}...`);
                const path = `sport/${normalizedSport}/events/live`;
                const data = await this.fetchFromSofaScore(path);

                if (data && data.events) {
                    console.log(`✅ [MultiSource] Success with SofaScore for ${normalizedSport}`);
                    return data;
                }
            } catch (error) {
                console.warn(`⚠️ [MultiSource] SofaScore H2 failed for ${normalizedSport}: ${error.message}`);
            }
        }

        // --- 2. RESERVA: AISCORE (SILENCIOSA) ---
        if (this.sources.aiscore.active) {
            try {
                console.log(`📡 [MultiSource] Fallback: AiScore for ${normalizedSport}...`);
                const aiscoreScraper = require('../robots/aiscoreScraper');
                const matches = await aiscoreScraper.fetchSportMatches(normalizedSport);
                if (matches && matches.length > 0) {
                    return { events: matches };
                }
            } catch (error) {
                console.warn(`⚠️ [MultiSource] AiScore failed for ${normalizedSport}: ${error.message}`);
            }
        }

        return { events: [] };
    }

    /**
     * Mantiene la compatibilidad con peticiones genéricas
     */
    async fetchData(path) {
        return await this.fetchFromSofaScore(path);
    }
}

module.exports = new MultiSourceService();
