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
     * OPTIMIZADO: Timeouts agresivos + Retry inteligente + IP Local Priority
     */
    async fetchSportMatches(sportName) {
        const sportId = AISCORE_SPORTS[sportName];
        if (!sportId) {
            console.error(`❌ [AiScore] Sport not supported: ${sportName}`);
            return [];
        }

        const maxRetries = 2;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const headers = this.getHeaders();
                const url = `${this.baseURL}/match/list?sportId=${sportId}&date=${new Date().toISOString().split('T')[0]}&langId=2`;

                console.log(`📡 [AiScore] Fetching ${sportName} (Attempt ${attempt}/${maxRetries})...`);

                const response = await axios.get(url, {
                    headers,
                    timeout: 5000, // 5s timeout - muy agresivo para respuesta rápida
                    validateStatus: (status) => status < 500 // Acepta 4xx pero no 5xx
                });

                if (response.data && response.data.data) {
                    const matches = this.transformMatches(response.data.data, sportName);
                    console.log(`✅ [AiScore] ${sportName}: ${matches.length} events retrieved`);
                    return matches;
                }

                // Si llegamos aquí, la respuesta no tiene data válida
                throw new Error('Invalid response structure from AiScore');

            } catch (error) {
                const isTimeout = error.code === 'ECONNABORTED';
                const isNetworkError = error.message.includes('Network') || error.code === 'ENOTFOUND';

                if (attempt < maxRetries && (isTimeout || isNetworkError)) {
                    console.warn(`⚠️ [AiScore] ${sportName} failed (${error.message}), retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms entre reintentos
                    continue;
                }

                console.error(`❌ [AiScore] ${sportName} fetch failed: ${error.message}`);
                break;
            }
        }

        return [];
    }

    /**
     * Transforma el formato de AiScore al de PickGenius
     */
    transformMatches(list, sport) {
        if (!Array.isArray(list)) {
            console.warn('⚠️ [AiScore] Invalid matches list format');
            return [];
        }

        return list.map(m => {
            // Emulamos el formato exacto de SofaScore que espera el frontend
            return {
                id: String(m.id || m.matchId),
                slug: `${m.homeTeamName || m.home_team_name}-${m.awayTeamName || m.away_team_name}`.toLowerCase().replace(/ /g, '-'),
                sport: sport,
                status: {
                    code: m.statusId || m.status_id || 0,
                    description: (m.statusId === 1 || m.status_id === 1) ? 'Live' : 'Scheduled',
                    type: (m.statusId === 1 || m.status_id === 1) ? 'inprogress' : 'scheduled'
                },
                homeTeam: {
                    id: m.homeTeamId || m.home_team_id,
                    name: m.homeTeamName || m.home_team_name,
                    shortName: (m.homeTeamName || m.home_team_name || '').substring(0, 3).toUpperCase(),
                    slug: (m.homeTeamName || m.home_team_name || '').toLowerCase().replace(/ /g, '-')
                },
                awayTeam: {
                    id: m.awayTeamId || m.away_team_id,
                    name: m.awayTeamName || m.away_team_name,
                    shortName: (m.awayTeamName || m.away_team_name || '').substring(0, 3).toUpperCase(),
                    slug: (m.awayTeamName || m.away_team_name || '').toLowerCase().replace(/ /g, '-')
                },
                homeScore: {
                    current: m.homeScore || m.home_score || 0,
                    display: m.homeScore || m.home_score || 0
                },
                awayScore: {
                    current: m.awayScore || m.away_score || 0,
                    display: m.awayScore || m.away_score || 0
                },
                tournament: {
                    id: m.leagueId || m.league_id,
                    name: m.leagueName || m.league_name || 'Unknown',
                    slug: (m.leagueName || m.league_name || '').toLowerCase().replace(/ /g, '-'),
                    category: {
                        name: 'International',
                        sport: { name: sport }
                    }
                },
                startTimestamp: m.startTime || m.start_time,
                source: 'aiscore',
                isAiScore: true // Flag interno
            };
        }).filter(m => m.id); // Filtrar eventos inválidos
    }

    /**
     * Guarda los datos en Firebase
     */
    async syncToFirebase(matches) {
        if (!matches || matches.length === 0) return;

        console.log(`💾 [AiScore] Saving ${matches.length} matches to Firebase...`);
        const batch = db.batch();

        matches.forEach(match => {
            const ref = db.collection('events').doc(String(match.id));
            batch.set(ref, match, { merge: true });
        });

        await batch.commit();
        console.log(`✅ [AiScore] Firebase sync complete.`);
    }
}

module.exports = new AiScoreScraper();
