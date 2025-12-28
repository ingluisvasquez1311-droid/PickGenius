const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cronScheduler = require('./schedulers/cronJobs');
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
// ENDPOINTS BÁSICOS
// ============================================================================

// Health check simple
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mode: '100% PASSIVE - Firebase Only'
    });
});

// Alias para compatibilidad
app.get('/health', (req, res) => res.redirect('/api/health'));

// Estado del sistema
app.get('/api/status', async (req, res) => {
    try {
        if (!db) throw new Error("Firebase DB not initialized");

        const [eventsSnapshot, oddsSnapshot] = await Promise.all([
            db.collection('events').limit(1000).get(),
            db.collection('odds').limit(1000).get()
        ]);

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            mode: '100% PASSIVE',
            firebase: {
                connected: true,
                projectId: admin.app().options.projectId
            },
            data: {
                events: eventsSnapshot.size,
                odds: oddsSnapshot.size
            },
            robots: cronScheduler.getStatus()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// Trigger manual de BetPlay
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

// Trigger manual de cleanup
app.all('/api/trigger/cleanup', async (req, res) => {
    try {
        console.log('🔧 Manual trigger: Cleanup');
        const result = await cronScheduler.runManual('cleanup');
        res.json({
            success: true,
            message: 'Cleanup completed',
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

   🤖 Robot Control:
   - http://localhost:${PORT}/api/trigger/betplay
   - http://localhost:${PORT}/api/trigger/cleanup

   📊 Monitoring:
   - http://localhost:${PORT}/api/status
   - http://localhost:${PORT}/api/health

🛡️  MODE: 100% PASSIVE
- SofaScore: Piggyback ONLY (saves when you navigate)
- BetPlay: Updates odds every 15 minutes
- Cleanup: Removes finished matches every hour
`);

    if (db) {
        // Arrancar Schedulers en modo pasivo
        cronScheduler.start();
        console.log('🛡️  Passive Mode Active: No direct requests from your IP');
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
