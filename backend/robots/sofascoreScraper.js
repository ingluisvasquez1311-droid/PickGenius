const axios = require('axios');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
try {
  if (!admin.apps.length) {
    const serviceAccount = require('../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
} catch (e) {
  // Si falla la carga de credenciales aquí, probablemente ya esté inicializado o se manejará en el script principal
  console.log('ℹ️ Firebase init check skipped in module scope');
}

const db = admin.firestore();

// Deportes soportados
const SPORTS = {
  football: 1,
  basketball: 2,
  tennis: 5,
  baseball: 3,
  'ice-hockey': 4,
  'american-football': 16
};

// Configuración
const SOFASCORE_API_KEY = process.env.SOFASCORE_API_KEY;
const USE_API = !!SOFASCORE_API_KEY; // Si hay key, usar API; si no, scraping

class SofaScoreScraper {
  constructor() {
    this.active = false; // DESACTIVADO POR SEGURIDAD
    this.baseURL = 'http://localhost:3001/api/proxy/sportsdata';
  }

  // Obtener eventos de un deporte
  async fetchSportEvents(sport, sportId) {
    if (!this.active) {
      console.log(`🛡️ [Robot Security] SofaScore Robot is ON THE BENCH (Disabled). skipping ${sport}.`);
      return [];
    }
    try {
      const now = Math.floor(Date.now() / 1000);
      const tomorrow = now + 86400; // +24 horas

      const url = USE_API
        ? `${this.baseURL}/sport/${sportId}/scheduled-events?from=${now}&to=${tomorrow}`
        : `${this.baseURL}/sport/${sport}/scheduled-events/${new Date().toISOString().split('T')[0]}`;

      const headers = USE_API ? {
        'x-rapidapi-key': SOFASCORE_API_KEY,
        'x-rapidapi-host': 'sofascore.p.rapidapi.com'
      } : {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      };

      console.log(`📥 [BRIDGE] Fetching ${sport} events via Residency IP...`);

      const response = await axios.get(url, {
        headers,
        timeout: 15000
      });

      const events = response.data.events || [];
      console.log(`✅ Found ${events.length} ${sport} events`);

      return events;
    } catch (error) {
      console.error(`❌ Error fetching ${sport}:`, error.message);
      return [];
    }
  }

  // Obtener eventos EN VIVO
  async fetchLiveEvents(sport, sportId) {
    if (!this.active) {
      console.log(`🛡️ [Robot Security] SofaScore Live Robot is ON THE BENCH. Skipping ${sport}.`);
      return [];
    }
    try {
      const url = USE_API
        ? `${this.baseURL}/sport/${sportId}/events/live`
        : `${this.baseURL}/sport/${sport}/events/live`;

      const headers = USE_API ? {
        'x-rapidapi-key': SOFASCORE_API_KEY,
        'x-rapidapi-host': 'sofascore.p.rapidapi.com'
      } : {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      };

      console.log(`📺 [BRIDGE] Fetching LIVE ${sport} events via Residency IP...`);

      const response = await axios.get(url, {
        headers,
        timeout: 15000
      });

      const events = response.data.events || [];
      console.log(`✅ Found ${events.length} LIVE ${sport} events`);

      return events;
    } catch (error) {
      console.error(`❌ Error fetching live ${sport}:`, error.message);
      return [];
    }
  }

  // Transformar evento de SofaScore a nuestro formato
  transformEvent(event, sport) {
    return {
      id: `${sport}_${event.id}`,
      externalId: event.id,
      sport: sport,
      status: event.status?.type || 'scheduled',
      startTime: event.startTimestamp ? new Date(event.startTimestamp * 1000) : null,
      tournament: {
        id: event.tournament?.id,
        name: event.tournament?.name || '',
        category: event.tournament?.category?.name || '',
        country: event.tournament?.category?.alpha2 || ''
      },
      homeTeam: {
        id: event.homeTeam?.id,
        name: event.homeTeam?.name || '',
        shortName: event.homeTeam?.shortName || '',
        logo: event.homeTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image` : null,
        score: event.homeScore?.current ?? event.homeScore?.display ?? null,
        halfScore: event.homeScore?.period1 ?? null
      },
      awayTeam: {
        id: event.awayTeam?.id,
        name: event.awayTeam?.name || '',
        shortName: event.awayTeam?.shortName || '',
        logo: event.awayTeam?.id ? `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image` : null,
        score: event.awayScore?.current ?? event.awayScore?.display ?? null,
        halfScore: event.awayScore?.period1 ?? null
      },
      venue: {
        name: event.venue?.stadium?.name || null,
        city: event.venue?.city?.name || null
      },
      source: 'sofascore',
      sourceUrl: `https://www.sofascore.com/event/${event.customId || event.id}`,
      syncedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 horas
    };
  }

  // Guardar eventos en Firebase
  async saveToFirebase(events, sport) {
    if (events.length === 0) {
      console.log(`⚠️ No events to save for ${sport}`);
      return 0;
    }

    const batch = db.batch();
    let saved = 0;

    for (const event of events) {
      try {
        const transformed = this.transformEvent(event, sport);
        const docRef = db.collection('events').doc(transformed.id);
        batch.set(docRef, transformed, { merge: true });
        saved++;
      } catch (error) {
        console.error(`❌ Error preparing event ${event.id}:`, error.message);
      }
    }

    await batch.commit();
    console.log(`💾 Saved ${saved} ${sport} events to Firebase`);
    return saved;
  }

  // Limpiar eventos expirados
  async cleanOldEvents() {
    try {
      console.log('🗑️ Cleaning expired events...');

      const now = new Date();
      const snapshot = await db.collection('events')
        .where('expiresAt', '<', now)
        .get();

      if (snapshot.empty) {
        console.log('✅ No expired odds to clean');
        return 0;
      }

      const batch = db.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      console.log(`✅ Deleted ${snapshot.size} expired events`);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error cleaning old events:', error.message);
      return 0;
    }
  }

  // Sincronizar un deporte
  async syncSport(sport) {
    const sportId = SPORTS[sport];
    if (!sportId) {
      throw new Error(`Sport not supported: ${sport}`);
    }

    console.log(`\n🔄 Syncing ${sport}...`);

    try {
      // Obtener eventos programados Y en vivo
      const [scheduledEvents, liveEvents] = await Promise.all([
        this.fetchSportEvents(sport, sportId),
        this.fetchLiveEvents(sport, sportId)
      ]);

      const allEvents = [...scheduledEvents, ...liveEvents];
      const saved = await this.saveToFirebase(allEvents, sport);

      return { sport, found: allEvents.length, saved };
    } catch (error) {
      console.error(`❌ Error syncing ${sport}:`, error.message);
      return { sport, found: 0, saved: 0, error: error.message };
    }
  }

  // Sincronización rápida (solo LIVE) - Ideal para el arranque
  async quickLiveSync() {
    console.log('⚡ Starting QUICK LIVE SYNC...');
    const startTime = Date.now();

    try {
      // Sincronizar solo eventos en vivo de todos los deportes en paralelo (o con mínima pausa)
      const syncPromises = Object.keys(SPORTS).map(async (sport) => {
        const sportId = SPORTS[sport];
        const liveEvents = await this.fetchLiveEvents(sport, sportId);
        const saved = await this.saveToFirebase(liveEvents, sport);
        return { sport, live: liveEvents.length, saved };
      });

      const results = await Promise.all(syncPromises);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ QUICK LIVE SYNC COMPLETED in ${duration}s`);
      return { success: true, duration, results };
    } catch (error) {
      console.error('❌ QUICK LIVE SYNC FAILED:', error);
      return { success: false, error: error.message };
    }
  }

  // Sincronización completa
  async fullSync() {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 ROBOT 1: SofaScore Scraper Started');
    console.log('='.repeat(60));
    console.log('Time:', new Date().toISOString());
    console.log('Mode:', USE_API ? 'API (with key)' : 'Scraping (no key)');
    console.log('='.repeat(60) + '\n');

    const startTime = Date.now();

    try {
      // 1. Limpiar eventos expirados
      await this.cleanOldEvents();

      // 2. Sincronizar todos los deportes
      const results = [];
      for (const sport of Object.keys(SPORTS)) {
        const result = await this.syncSport(sport);
        results.push(result);

        // Pausa entre deportes (2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // 3. Resumen
      const totalFound = results.reduce((sum, r) => sum + r.found, 0);
      const totalSaved = results.reduce((sum, r) => sum + r.saved, 0);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n' + '='.repeat(60));
      console.log('✅ SYNC COMPLETED');
      console.log('='.repeat(60));
      console.log(`⏱️  Duration: ${duration}s`);
      console.log(`📊 Total found: ${totalFound}`);
      console.log(`💾 Total saved: ${totalSaved}`);
      console.log('\nBy sport:');
      results.forEach(r => {
        console.log(`  ${r.sport}: ${r.found} found, ${r.saved} saved`);
        if (r.error) console.log(`    ⚠️ Error: ${r.error}`);
      });
      console.log('='.repeat(60) + '\n');

      // 4. Guardar log de sincronización
      await db.collection('sync_logs').add({
        robot: 'sofascore_scraper',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        duration: duration + 's',
        results,
        totalFound,
        totalSaved
      });

      return { success: true, totalFound, totalSaved, results };
    } catch (error) {
      console.error('❌ SYNC FAILED:', error);
      throw error;
    }
  }

  /**
   * Procesa y guarda datos interceptados pasivamente por el Bridge (Proxy)
   * Esto evita que el Robot tenga que hacer su propia petición si el usuario ya vio los datos.
   */
  async processPassiveData(path, data) {
    try {
      // Detectar deporte y tipo desde el path (ej: sport/football/events/live)
      const parts = path.split('/');
      const sportIndex = parts.indexOf('sport');
      if (sportIndex === -1 || parts.length < sportIndex + 3) return null;

      const sport = parts[sportIndex + 1];
      const type = parts[parts.length - 1]; // live, scheduled-events, etc.

      if (!data.events || data.events.length === 0) return null;

      console.log(`📡 [Passive Sync] Processing ${data.events.length} events for ${sport} (${type})`);

      const batch = db.batch();
      let savedCount = 0;

      for (const event of data.events) {
        if (!event.id) continue;

        const transformed = this.transformEvent(event, sport);
        const docRef = db.collection('events').doc(transformed.id);
        batch.set(docRef, transformed, { merge: true });
        savedCount++;
      }

      if (savedCount > 0) {
        await batch.commit();
        console.log(`✅ [Passive Sync] Saved ${savedCount} events for ${sport} to Firebase`);
      }

      return { success: true, saved: savedCount };
    } catch (error) {
      console.error('❌ Passive Sync Error:', error.message);
      return null;
    }
  }
}

// Exportar instancia
module.exports = new SofaScoreScraper();
