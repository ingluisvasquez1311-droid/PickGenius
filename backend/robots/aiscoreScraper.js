const axios = require('axios');
const admin = require('firebase-admin');

const db = admin.firestore();

// Mapeo de deportes AiScore
const AISCORE_SPORTS = {
    football: 1,
    basketball: 2,
    tennis: 3,
    baseball: 6,
    'ice-hockey': 8,
    'american-football': 17
};

class AiScoreScraper {
    constructor() {
        this.baseURL = 'https://api.aiscore.com/v1/m/api';
        this.userAgents = [
            'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        ];
    }

    getHeaders() {
        const ua = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        return {
            'User-Agent': ua,
            'Accept': '*/*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Origin': 'https://m.aiscore.com',
            'Referer': 'https://m.aiscore.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
        };
    }

    /**
     * Obtiene partidos de cualquier deporte soportado
     */
    async fetchSportMatches(sportName) {
        const sportId = AISCORE_SPORTS[sportName];
        if (!sportId) {
            console.error(`❌ [AiScore] Sport not supported: ${sportName}`);
            return [];
        }
        try {
            const headers = this.getHeaders();
            const url = `${this.baseURL}/matches/count?tz=-4`;
            const countRes = await axios.get(url, { headers });

            // Si hay partidos en vivo, los buscamos por fecha hoy
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const matchesUrl = `${this.baseURL}/matches?lang=4&sport_id=${sportId}&date=${today}&tz=-04:00`;

            console.log(`📡 [AiScore] Fetching matches for sport ${sportId}...`);
            const response = await axios.get(matchesUrl, { headers });

            if (response.data && response.data.data && response.data.data.list) {
                return this.transformMatches(response.data.data.list, sportId);
            }
            return [];
        } catch (error) {
            console.error(`❌ [AiScore Error]: ${error.message}`);
            return [];
        }
    }

    /**
     * Transforma el formato de AiScore al de PickGenius
     */
    transformMatches(list, sportId) {
        // Invertimos el mapeo para buscar por ID
        const ID_TO_SPORT = Object.fromEntries(
            Object.entries(AISCORE_SPORTS).map(([k, v]) => [v, k])
        );

        return list.map(m => {
            const sportName = ID_TO_SPORT[sportId] || 'football';

            // Emulamos el formato exacto de SofaScore que espera el frontend
            return {
                id: m.id, // Usamos el ID original para no romper los links
                slug: `${m.home_team_name}-${m.away_team_name}`.toLowerCase().replace(/ /g, '-'),
                sport: sportName,
                status: {
                    code: m.status_id,
                    description: m.status_id === 1 ? 'Live' : 'Scheduled',
                    type: m.status_id === 1 ? 'inprogress' : 'scheduled'
                },
                homeTeam: {
                    id: m.home_team_id,
                    name: m.home_team_name,
                    shortName: m.home_team_name.substring(0, 3).toUpperCase(),
                    slug: m.home_team_name.toLowerCase().replace(/ /g, '-')
                },
                awayTeam: {
                    id: m.away_team_id,
                    name: m.away_team_name,
                    shortName: m.away_team_name.substring(0, 3).toUpperCase(),
                    slug: m.away_team_name.toLowerCase().replace(/ /g, '-')
                },
                homeScore: {
                    current: m.home_score || 0,
                    display: m.home_score || 0
                },
                awayScore: {
                    current: m.away_score || 0,
                    display: m.away_score || 0
                },
                tournament: {
                    id: m.league_id,
                    name: m.league_name,
                    slug: m.league_name.toLowerCase().replace(/ /g, '-'),
                    category: {
                        name: 'International',
                        sport: { name: sportName }
                    }
                },
                startTimestamp: m.start_time,
                source: 'aiscore',
                isAiScore: true // Flag interno
            };
        });
    }

    /**
     * Guarda los datos en Firebase
     */
    async syncToFirebase(matches) {
        if (!matches || matches.length === 0) return;

        console.log(`💾 [AiScore] Saving ${matches.length} matches to Firebase...`);
        const batch = db.batch();

        matches.forEach(match => {
            const ref = db.collection('events').doc(match.id);
            batch.set(ref, match, { merge: true });
        });

        await batch.commit();
        console.log(`✅ [AiScore] Firebase sync complete.`);
    }
}

module.exports = new AiScoreScraper();
