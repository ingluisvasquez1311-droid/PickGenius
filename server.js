/**
 * Servidor principal para deployment en Render
 * Incluye sincronización automática de NBA
 */

const express = require('express');
const autoSyncService = require('./src/services/autoSyncService');
const footballService = require('./src/services/football/footballService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'NBA Sync Service'
    });
});

// Manual sync endpoint
app.post('/api/sync', async (req, res) => {
    try {
        console.log('🔄 Manual sync triggered...');
        const result = await autoSyncService.syncCurrentSeason();
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Sync error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        service: 'Tirens Parleys - NBA & Football Sync',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Football endpoints
app.post('/api/football/load', async (req, res) => {
    try {
        console.log('⚽ Loading football data from CSV...');
        const { season } = req.body;
        const result = await footballService.loadAllLeagues(season || '2425');
        res.json({ success: true, result });
    } catch (error) {
        console.error('❌ Football load error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/football/stats/:league?', async (req, res) => {
    try {
        const { league } = req.params;
        const stats = await footballService.getPredictionStats(league);
        res.json({ success: true, stats });
    } catch (error) {
        console.error('❌ Football stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// NBA endpoints
app.get('/api/nba/games', async (req, res) => {
    try {
        console.log('🏀 Fetching NBA games...');
        const games = await autoSyncService.fetchTodayGames();
        res.json({ success: true, games });
    } catch (error) {
        console.error('❌ NBA games error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🏀⚽ Tirens Parleys - Sports Sync Service',
        endpoints: {
            health: '/health',
            status: '/api/status',
            nba: {
                sync: 'POST /api/sync'
            },
            football: {
                load: 'POST /api/football/load',
                stats: 'GET /api/football/stats/:league?'
            }
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);

    // Iniciar sincronización automática diaria
    console.log('⏰ Starting daily auto-sync...');
    autoSyncService.startDailySync();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
