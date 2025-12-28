const axios = require('axios');
const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

// Usar la misma instancia de Firebase (asumiendo init previo)
const db = admin.firestore();

// Configuración
const BETPLAY_JSON_PATH = process.env.BETPLAY_JSON_PATH || './data/betplay.json';
const BETPLAY_JSON_URL = process.env.BETPLAY_JSON_URL;
const USE_URL = !!BETPLAY_JSON_URL;

class BetPlayReader {
    constructor() {
        console.log('🤖 BetPlay Reader initialized');
        console.log('Mode:', USE_URL ? 'Remote URL' : 'Local File');
    }

    // Leer JSON de BetPlay
    async readBetPlayData() {
        try {
            if (USE_URL) {
                console.log(`📥 Fetching BetPlay data from URL: ${BETPLAY_JSON_URL}`);
                const response = await axios.get(BETPLAY_JSON_URL, { timeout: 10000 });
                return response.data;
            } else {
                console.log(`📂 Reading BetPlay data from file: ${BETPLAY_JSON_PATH}`);
                // Resolver path desde donde se ejecuta, o relativo a este archivo
                // Asumimos ejecución desde root del backend, pero intentamos resolver seguro
                const filePath = path.resolve(BETPLAY_JSON_PATH);
                const fileContent = await fs.readFile(filePath, 'utf8');
                return JSON.parse(fileContent);
            }
        } catch (error) {
            console.error('❌ Error reading BetPlay data:', error.message);
            // Retornar estructura vacía para no romper el flujo
            return { events: [] };
        }
    }

    // Transformar odds de BetPlay a nuestro formato
    transformOdds(betplayEvent, sport) {
        return {
            eventId: betplayEvent.event_id || betplayEvent.id,
            sport: sport || betplayEvent.sport || 'unknown',

            // Mercados principales
            markets: {
                moneyline: {
                    home: betplayEvent.odds?.home || null,
                    away: betplayEvent.odds?.away || null,
                    draw: betplayEvent.odds?.draw || null
                },
                overUnder: betplayEvent.totals ? {
                    line: betplayEvent.totals.line || null,
                    over: betplayEvent.totals.over || null,
                    under: betplayEvent.totals.under || null
                } : null,
                spread: betplayEvent.handicap ? {
                    line: betplayEvent.handicap.line || null,
                    home: betplayEvent.handicap.home || null,
                    away: betplayEvent.handicap.away || null
                } : null
            },

            // Props de jugadores
            playerProps: this.extractPlayerProps(betplayEvent.player_props || []),

            // Metadata
            source: 'betplay',
            bookmaker: betplayEvent.bookmaker || 'betplay',
            lastUpdated: betplayEvent.timestamp ? new Date(betplayEvent.timestamp * 1000) : new Date(),
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        };
    }

    // Extraer props de jugadores
    extractPlayerProps(playerPropsArray) {
        if (!Array.isArray(playerPropsArray)) return [];

        return playerPropsArray.map(prop => ({
            playerId: prop.player_id || null,
            playerName: prop.player_name || prop.name || '',
            market: prop.market || prop.type || '',
            line: prop.line || null,
            over: prop.over || null,
            under: prop.under || null,
            description: prop.description || ''
        }));
    }

    // Procesar datos de BetPlay
    async processBetPlayData(data) {
        const processed = [];

        // Estructura flexible para diferentes formatos de JSON
        let events = [];

        if (Array.isArray(data)) {
            events = data;
        } else if (data.events && Array.isArray(data.events)) {
            events = data.events;
        } else if (data.data && Array.isArray(data.data)) {
            events = data.data;
        }

        console.log(`📊 Processing ${events.length} events from BetPlay...`);

        for (const event of events) {
            try {
                const sport = event.sport || this.detectSport(event);
                const transformed = this.transformOdds(event, sport);
                processed.push(transformed);
            } catch (error) {
                console.error(`❌ Error processing event ${event.id}:`, error.message);
            }
        }

        return processed;
    }

    // Detectar deporte del evento
    detectSport(event) {
        const sportKeywords = {
            football: ['soccer', 'futbol', 'football'],
            basketball: ['basket', 'nba', 'basketball'],
            tennis: ['tennis', 'tenis'],
            baseball: ['baseball', 'mlb'],
            'ice-hockey': ['hockey', 'nhl'],
            'american-football': ['nfl', 'american football']
        };

        const eventStr = JSON.stringify(event).toLowerCase();

        for (const [sport, keywords] of Object.entries(sportKeywords)) {
            if (keywords.some(keyword => eventStr.includes(keyword))) {
                return sport;
            }
        }

        return 'unknown';
    }

    // Guardar odds en Firebase
    async saveToFirebase(oddsArray) {
        if (oddsArray.length === 0) {
            console.log('⚠️ No odds to save');
            return 0;
        }

        const batch = db.batch();
        let saved = 0;

        for (const odds of oddsArray) {
            try {
                // Unificamos con marketLines para que coincida con el OddsSyncService
                const docId = `${odds.sport}_${odds.eventId}`;
                const docRef = db.collection('marketLines').doc(docId);

                // Mapeo de compatibilidad con MarketLine interface
                const marketData = {
                    ...odds,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    marketSource: 'Robot BetPlay Reader'
                };

                batch.set(docRef, marketData, { merge: true });
                saved++;
            } catch (error) {
                console.error(`❌ Error preparing odds ${odds.eventId}:`, error.message);
            }
        }

        await batch.commit();
        console.log(`💾 Saved ${saved} odds to Firebase`);
        return saved;
    }

    // Limpiar odds expiradas
    async cleanOldOdds() {
        try {
            console.log('🗑️ Cleaning expired odds...');

            const now = new Date();
            const snapshot = await db.collection('marketLines')
                .where('expiresAt', '<', now)
                .get();

            if (snapshot.empty) {
                console.log('✅ No expired odds to clean');
                return 0;
            }

            const batch = db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log(`✅ Deleted ${snapshot.size} expired odds`);
            return snapshot.size;
        } catch (error) {
            console.error('❌ Error cleaning old odds:', error.message);
            return 0;
        }
    }

    // Sincronización completa
    async fullSync() {
        console.log('\n' + '='.repeat(60));
        console.log('🤖 ROBOT 2: BetPlay Reader Started');
        console.log('='.repeat(60));
        console.log('Time:', new Date().toISOString());
        console.log('Source:', USE_URL ? BETPLAY_JSON_URL : BETPLAY_JSON_PATH);
        console.log('='.repeat(60) + '\n');

        const startTime = Date.now();

        try {
            // 1. Limpiar odds expiradas
            await this.cleanOldOdds();

            // 2. Leer datos de BetPlay
            const rawData = await this.readBetPlayData();

            // 3. Procesar datos
            const processedOdds = await this.processBetPlayData(rawData);

            // 4. Guardar en Firebase
            const saved = await this.saveToFirebase(processedOdds);

            // 5. Resumen
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log('\n' + '='.repeat(60));
            console.log('✅ SYNC COMPLETED');
            console.log('='.repeat(60));
            console.log(`⏱️  Duration: ${duration}s`);
            console.log(`📊 Total processed: ${processedOdds.length}`);
            console.log(`💾 Total saved: ${saved}`);
            console.log('='.repeat(60) + '\n');

            // 6. Guardar log de sincronización
            await db.collection('sync_logs').add({
                robot: 'betplay_reader',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                duration: duration + 's',
                totalProcessed: processedOdds.length,
                totalSaved: saved
            });

            return { success: true, processed: processedOdds.length, saved };
        } catch (error) {
            console.error('❌ SYNC FAILED:', error);
            throw error;
        }
    }
}

// Exportar instancia
module.exports = new BetPlayReader();
