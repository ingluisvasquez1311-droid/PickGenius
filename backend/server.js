const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cronScheduler = require('./schedulers/cronJobs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// ENDPOINTS DE CONTROL DE ROBOTS
// ============================================================================

// Trigger manual de Robot 1 (SofaScore)
app.post('/api/trigger/sofascore', async (req, res) => {
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
app.post('/api/trigger/betplay', async (req, res) => {
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
app.post('/api/trigger/all', async (req, res) => {
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
// ENDPOINT DE SALUD
// ============================================================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
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

app.listen(PORT, () => {
    console.log('\n' + '═'.repeat(70));
    console.log('║' + ' '.repeat(20) + '🏆 PICKGENIUS BACKEND' + ' '.repeat(25) + '║');
    console.log('═'.repeat(70));
    console.log(`
✅ Server running on port ${PORT}
✅ Firebase connected to project: ${admin.app().options.projectId}
${process.env.NGROK_URL ? `✅ Ngrok URL: ${process.env.NGROK_URL}` : '⚠️  Ngrok URL not configured'}

📡 Available Endpoints:
   
   🤖 Robot Control:
   POST http://localhost:${PORT}/api/trigger/sofascore
   POST http://localhost:${PORT}/api/trigger/betplay  
   POST http://localhost:${PORT}/api/trigger/all
   
   📊 Monitoring:
   GET  http://localhost:${PORT}/api/status
   GET  http://localhost:${PORT}/api/sync/history?limit=20
   GET  http://localhost:${PORT}/health

🤖 Robots:
   Robot 1 (SofaScore): Scrapes sports events → Firebase
   Robot 2 (BetPlay): Reads odds JSON → Firebase

📅 CRON Schedule:
   🔄 Starting automated schedulers...
  `);

    // Iniciar CRON jobs
    cronScheduler.start();

    console.log(`
═`.repeat(70) + '\n');
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
