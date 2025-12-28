const axios = require('axios');
const admin = require('firebase-admin');

const db = admin.firestore();

// Mapeo de deportes Flashscore (data-sport-id)
const FLASHSCORE_SPORTS = {
    football: 1,
    tennis: 2,
    basketball: 3,
    'ice-hockey': 4,
    'american-football': 5,
    baseball: 6
};

/**
 * FlashscoreScraper: Fuente de reserva extrema.
 * Usa el sistema de ninja feeds (f_1_1_...).
 */
class FlashscoreScraper {
    constructor() {
        this.baseURL = 'https://global.flashscore.ninja/2/x/feed';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Origin': 'https://www.flashscore.es',
            'Referer': 'https://www.flashscore.es/',
            'x-fsign': 'SW9D1eZo',
            'x-requested-with': 'XMLHttpRequest'
        };
    }

    /**
     * Obtiene eventos en vivo de Flashscore
     */
    async fetchLiveMatches(sportName) {
        const sportId = FLASHSCORE_SPORTS[sportName];
        if (!sportId) return [];

        try {
            // f_{sport}_{status}_{timezone}_{lang}_{refresh}
            // status 1 = LIVE
            const url = `${this.baseURL}/f_${sportId}_1_-4_es_1`;
            console.log(`📡 [Flashscore] Fetching live feed for ${sportName}...`);

            const response = await axios.get(url, { headers: this.headers });

            // Flashscore devuelve un formato texto propio separado por ÷ y ~
            // Por ahora devolvemos un placeholder o parser básico
            return this.parseNinjaFeed(response.data, sportName);
        } catch (error) {
            console.error(`❌ [Flashscore Error]: ${error.message}`);
            return [];
        }
    }

    /**
     * Parser básico para el Ninja Feed de Flashscore
     */
    parseNinjaFeed(data, sportName) {
        if (!data || typeof data !== 'string') return [];

        // El formato ninja es muy denso: AA÷Value~BB÷Value...
        // Ejemplo de ID de partido: SA÷1~...~~GN÷...~~
        console.log(`📝 [Flashscore] Parsing feed for ${sportName} (${data.length} bytes)`);

        // Mapeo básico de retorno para no romper el sistema
        // En Fase 6 implementaremos un parser de Regex para extraer equipos y scores
        return [];
    }
}

module.exports = new FlashscoreScraper();
