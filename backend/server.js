const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cronScheduler = require('./schedulers/cronJobs');
const sofascoreRobot = require('./robots/sofascoreScraper');
const multiSourceService = require('./services/multiSourceService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Firebase Admin
try {
    const serviceAccount = require('./firebase-service-account.json');
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }
} catch (e) {
    console.error("🔥 Error initializing Firebase Admin in server.js:", e.message);
    console.log("⚠️  Ensure 'firebase-service-account.json' is present in the backend root.");
}

const db = admin.apps.length ? admin.firestore() : null;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// ENDPOINTS DE CONTROL DE ROBOTS
// ============================================================================

// Trigger manual de Robot 1 (SofaScore)
app.all('/api/trigger/sofascore', async (req, res) => {
    try {
        console.log('🔧 Manual trigger: SofaScore');
        const result = await cronScheduler.runManual('sofascore');
        res.json({
            success: true,
            message: 'SofaScore sync completed',
            ...result
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Trigger manual de Robot 2 (BetPlay)
app.all('/api/trigger/betplay', async (req, res) => {
    try {
        console.log('🔧 Manual trigger: BetPlay');
        const result = await cronScheduler.runManual('betplay');
        res.json({
            success: true,
            message: 'BetPlay sync completed',
            ...result
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Trigger manual de ambos robots
app.all('/api/trigger/all', async (req, res) => {
    try {
        console.log('🔧 Manual trigger: ALL ROBOTS');
        const results = await cronScheduler.runManual('all');
        res.json({
            success: true,
            message: 'All robots sync completed',
            results
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// ENDPOINTS DE MONITOREO
// ============================================================================

// Estado del sistema
app.get('/api/status', async (req, res) => {
    try {
        if (!db) throw new Error("Firebase DB not initialized");

        // Contar documentos en Firebase
        const [eventsSnapshot, oddsSnapshot, logsSnapshot] = await Promise.all([
            db.collection('events').limit(1000).get(),
            db.collection('odds').limit(1000).get(),
            db.collection('sync_logs').orderBy('timestamp', 'desc').limit(1).get()
        ]);

        const lastLog = logsSnapshot.empty ? null : logsSnapshot.docs[0].data();

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            firebase: {
                connected: true,
                projectId: admin.app().options.projectId
            },
            data: {
                events: eventsSnapshot.size,
                odds: oddsSnapshot.size
            },
            robots: cronScheduler.getStatus(),
            lastSync: lastLog ? {
                robot: lastLog.robot,
                timestamp: lastLog.timestamp?.toDate(),
                duration: lastLog.duration
            } : null,
            ngrok: {
                url: process.env.NGROK_URL || 'Not configured'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// Historial de sincronizaciones
app.get('/api/sync/history', async (req, res) => {
    try {
        if (!db) throw new Error("Firebase DB not initialized");
        const limit = parseInt(req.query.limit) || 20;

        const snapshot = await db.collection('sync_logs')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const logs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                robot: data.robot,
                timestamp: data.timestamp?.toDate(),
                duration: data.duration,
                results: data.results || {},
                totalFound: data.totalFound,
                totalSaved: data.totalSaved,
                totalProcessed: data.totalProcessed
            });
        });

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================================================
// ENDPOINTS DE DEPORTES (RED DE RESPALDO)
// ============================================================================

// Partidos en VIVO (AiScore/Flashscore)
app.get('/api/:sport/live', async (req, res) => {
    try {
        const { sport } = req.params;
        console.log(`📡 [API] Direct Live Request: ${sport}`);
        const data = await multiSourceService.fetchLiveEvents(sport);
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Partidos PROGRAMADOS (Firebase fallback por ahora)
app.get('/api/:sport/scheduled', async (req, res) => {
    try {
        const { sport } = req.params;
        const date = req.query.date || new Date().toISOString().split('T')[0];
        console.log(`📡 [API] Scheduled Request: ${sport} for ${date}`);

        // Consultamos Firebase para no tocar SofaScore
        const snapshot = await db.collection('events')
            .where('sport', '==', sport)
            .where('status', '==', 'scheduled')
            .limit(100)
            .get();

        const events = [];
        snapshot.forEach(doc => events.push(doc.data()));

        res.json({ events });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================================
// ENDPOINT DE SALUD
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        bridge: 'Dual Backend 2.0 Active'
    });
});

// Alias para compatibilidad
app.get('/health', (req, res) => res.redirect('/api/health'));

// ============================================================================
// PROXY DE DATOS (BRIDGE)
// ============================================================================

const axios = require('axios');

// Proxy para logos de equipos
app.get('/api/proxy/team-logo/:teamId', async (req, res) => {
    try {
        const url = `https://api.sofascore.app/api/v1/team/${req.params.teamId}/image`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(response.data);
    } catch (error) {
        res.status(404).send('Logo not found');
    }
});

// Proxy para imágenes de jugadores
app.get('/api/proxy/player-image/:playerId', async (req, res) => {
    try {
        const url = `https://api.sofascore.app/api/v1/player/${req.params.playerId}/image`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(response.data);
    } catch (error) {
        res.status(404).send('Player image not found');
    }
});

// Proxy para banderas/categorías
app.get('/api/proxy/category-image/:categoryId', async (req, res) => {
    try {
        const url = `https://api.sofascore.app/api/v1/category/${req.params.categoryId}/image`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(response.data);
    } catch (error) {
        res.status(404).send('Category image not found');
    }
});

// Proxy para datos crudos de Sofascore (H2H, Momentum, etc)
app.get('/api/proxy/sportsdata/*', async (req, res) => {
    try {
        const path = req.params[0];
        console.log(`🔌 [Bridge Proxy] Request: ${path}`);

        // NUEVO: Detectar si es una petición de eventos en vivo y usar AiScore
        const liveEventsMatch = path.match(/sport\/([^\/]+)\/events\/live/);
        if (liveEventsMatch) {
            const sport = liveEventsMatch[1];
            console.log(`🎯 [Bridge] Redirecting to AiScore for live ${sport} events...`);

            try {
                const data = await multiSourceService.fetchLiveEvents(sport);
                return res.json(data);
            } catch (error) {
                console.error(`❌ [Bridge] AiScore failed for ${sport}:`, error.message);
                // No hacer fallback a SofaScore aquí, devolver vacío
                return res.json({ events: [] });
            }
        }

        // Para otros endpoints (scheduled, match details, etc), usar SofaScore directo
        const data = await multiSourceService.fetchData(path);
        res.json(data);

    } catch (error) {
        console.error(`❌ [Bridge Error] ${error.message}`);
        res.status(500).json({ success: false, error: 'Bridge Error', message: error.message });
    }
});

// --- CONFIG: COOKIE INJECTION ---
app.post('/api/proxy/config', express.json(), (req, res) => {
    const { source, cookies } = req.body;
    if (multiSourceService.updateCookies(source, cookies)) {
        res.json({ success: true, message: `Cookies updated for ${source}` });
    } else {
        res.status(400).json({ success: false, message: 'Invalid source' });
    }
});

// Proxy para cuotas de Betplay/Kambi
app.get('/api/proxy/kambi/*', async (req, res) => {
    try {
        const path = req.params[0];
        const url = `https://tienda.betplay.com.co/offering/v21/betp/${path}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://tienda.betplay.com.co/'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
app.listen(PORT, async () => {
    console.log('\n' + '═'.repeat(70));
    console.log('║' + ' '.repeat(20) + '🏆 PICKGENIUS BACKEND' + ' '.repeat(25) + '║');
    console.log('═'.repeat(70));

    console.log(`
✅ Server running on port ${PORT}
${db ? '✅ Firebase connected' : '❌ Firebase NOT connected'}
${process.env.NGROK_URL ? `✅ Ngrok URL: ${process.env.NGROK_URL}` : '⚠️  Ngrok URL not configured'}

📡 Available Endpoints:

   🤖 Robot Control (POST/GET):
   - http://localhost:${PORT}/api/trigger/sofascore
   - http://localhost:${PORT}/api/trigger/betplay
   - http://localhost:${PORT}/api/trigger/all

   📊 Monitoring (GET):
   - http://localhost:${PORT}/api/status
   - http://localhost:${PORT}/api/health

🤖 Robots Active: SofaScore (Updates Firebase) & BetPlay (Odds Sync)
📅 CRON Schedule: Automático cada 5, 15 y 30 minutos.
`);

    if (db) {
        // Arrancar Schedulers (BetPlay activo, SofaScore en modo pasivo)
        cronScheduler.start();
        console.log('🛡️  SofaScore Passive Mode: Waiting for user activity...');
    }

    console.log('═'.repeat(70) + '\n');
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    cronScheduler.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    cronScheduler.stop();
    process.exit(0);
});
