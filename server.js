/**
 * Servidor principal de sincronización y API
 * Sincronización automática de NBA y Football con cache inteligente
 */

require('dotenv').config();
const express = require('express');
const footballService = require('./src/services/football/footballService');
const footballApiService = require('./src/services/football/footballApiService');
const cacheManager = require('./src/services/cacheManager');
const apiRateLimiter = require('./src/services/apiRateLimiter');
const sofascoreRoutes = require('./src/routes/sofascore');
const nbaPlayerPropsRoutes = require('./src/routes/nbaPlayerProps');
const universalSportsRoutes = require('./src/routes/universalSports');
const proxyRoutes = require('./src/routes/proxy');
const footballRoutes = require('./src/routes/football');
const basketballRoutes = require('./src/routes/basketball');
const tennisRoutes = require('./src/routes/tennis');
const americanFootballRoutes = require('./src/routes/americanFootball');
const iceHockeyRoutes = require('./src/routes/iceHockey');
const baseballRoutes = require('./src/routes/baseball');
const adminRoutes = require('./src/routes/admin');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');



const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(rateLimiter(1000, 15 * 60 * 1000)); // Limite de 1000 peticiones cada 15 min (Aumentado para dev)

// CORS middleware
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'https://pickgeniuspro.vercel.app',
        'https://pick-genius.vercel.app',
        'https://unconsultative-lore-unlovely.ngrok-free.dev',
        'https://pickgeniuspro.com',
        'https://www.pickgeniuspro.com'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, bypass-tunnel-reminder, ngrok-skip-browser-warning');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'PickGenius - Sports Sync with Intelligent Cache'
    });
});

// ========================================
// SOFASCORE ROUTES
// ========================================
app.use('/api/sofascore', sofascoreRoutes);

// Status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        service: 'PickGenius - NBA & Football Sync',
        version: '3.0.0',
        features: [
            'Intelligent Firestore caching',
            'Auto-cleanup of played matches',
            '90%+ reduction in API calls'
        ],
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ========================================
// FOOTBALL API ENDPOINTS (with Cache)
// ========================================

// Get upcoming fixtures
app.get('/api/football/upcoming', async (req, res) => {
    try {
        const { league = 39, next = 10 } = req.query;
        console.log(`⚽ Fetching upcoming fixtures for league ${league}...`);

        const result = await footballApiService.getUpcomingFixtures(
            parseInt(league),
            { next: parseInt(next) }
        );

        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching fixtures:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get match predictions
app.get('/api/football/predictions/:fixtureId', async (req, res) => {
    try {
        const { fixtureId } = req.params;
        console.log(`⚽ Fetching predictions for fixture ${fixtureId}...`);

        const result = await footballApiService.getFixturePredictions(parseInt(fixtureId));
        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching predictions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get league standings
app.get('/api/football/standings/:leagueId', async (req, res) => {
    try {
        const { leagueId } = req.params;
        const { season = new Date().getFullYear() } = req.query;
        console.log(`⚽ Fetching standings for league ${leagueId}, season ${season}...`);

        const result = await footballApiService.getLeagueStandings(
            parseInt(leagueId),
            parseInt(season)
        );

        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching standings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sync all leagues
app.post('/api/football/sync', async (req, res) => {
    try {
        console.log('⚽ Syncing all football leagues...');
        const result = await footballApiService.syncAllLeagues();
        res.json(result);
    } catch (error) {
        console.error('❌ Error syncing leagues:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get football stats (CSV-based)
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

// Load football data from CSV
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

// ========================================
// NBA ENDPOINTS (Now handled by Sofascore)
// ========================================

// NBA Player Props Analysis
app.use('/api/nba/players', nbaPlayerPropsRoutes);

// Universal Sports API (Baseball, NHL, Tennis, etc.)
app.use('/api/sports', universalSportsRoutes);

// Specific Sport Routes
app.use('/api/football', footballRoutes);
app.use('/api/basketball', basketballRoutes);
app.use('/api/tennis', tennisRoutes);
app.use('/api/american-football', americanFootballRoutes);
app.use('/api/nfl', americanFootballRoutes);
app.use('/api/ice-hockey', iceHockeyRoutes);
app.use('/api/nhl', iceHockeyRoutes);
app.use('/api/baseball', baseballRoutes);
app.use('/api/admin', adminRoutes);

// General Proxy API
app.use('/api/proxy', proxyRoutes);




// ========================================
// CACHE MANAGEMENT ENDPOINTS
// ========================================

// Get cache statistics
app.get('/api/cache/stats', async (req, res) => {
    try {
        const stats = await cacheManager.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('❌ Error getting cache stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Manual cache cleanup
app.post('/api/cache/cleanup', async (req, res) => {
    try {
        console.log('🧹 Running manual cache cleanup...');
        const footballResult = await cacheManager.cleanupExpired('football');
        const nbaResult = await cacheManager.cleanupExpired('nba');

        res.json({
            success: true,
            football: footballResult,
            nba: nbaResult
        });
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get API usage statistics
app.get('/api/usage', async (req, res) => {
    try {
        const stats = await apiRateLimiter.getAllStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('❌ Error getting API usage:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// ROOT ENDPOINT
// ========================================

app.get('/', (req, res) => {
    res.json({
        message: '🏀⚽ PickGenius - Sports Sync Service with Intelligent Cache',
        version: '3.0.0',
        features: [
            'Intelligent Firestore caching',
            'Automatic API key rotation',
            'Auto-cleanup of played matches',
            '90%+ reduction in API calls'
        ],
        endpoints: {
            health: 'GET /health',
            status: 'GET /api/status',
            football: {
                upcoming: 'GET /api/football/upcoming?league=39&next=10',
                predictions: 'GET /api/football/predictions/:fixtureId',
                standings: 'GET /api/football/standings/:leagueId?season=2025',
                sync: 'POST /api/football/sync',
                stats: 'GET /api/football/stats/:league?',
                load: 'POST /api/football/load'
            },
            nba: {
                games: 'GET /api/nba/games',
                sync: 'POST /api/sync'
            },
            basketball: {
                live: 'GET /api/basketball/live',
                scheduled: 'GET /api/basketball/scheduled',
                finished: 'GET /api/basketball/finished'
            },
            tennis: {
                live: 'GET /api/tennis/live',
                scheduled: 'GET /api/tennis/scheduled',
                finished: 'GET /api/tennis/finished'
            },
            nhl: {
                live: 'GET /api/ice-hockey/live',
                scheduled: 'GET /api/ice-hockey/scheduled',
                finished: 'GET /api/ice-hockey/finished'
            },
            nfl: {
                live: 'GET /api/american-football/live',
                scheduled: 'GET /api/american-football/scheduled',
                finished: 'GET /api/american-football/finished'
            },
            baseball: {
                live: 'GET /api/baseball/live',
                scheduled: 'GET /api/baseball/scheduled',
                finished: 'GET /api/baseball/finished'
            },
            cache: {
                stats: 'GET /api/cache/stats',
                cleanup: 'POST /api/cache/cleanup'
            },
            apiUsage: 'GET /api/usage'
        }
    });
});

// Start server
const server = app.listen(PORT, () => {
    // Diagnostic Logs
    const scraperKeys = process.env.SCRAPER_API_KEYS ? process.env.SCRAPER_API_KEYS.split(',') : [];
    console.log('🔍 [Startup Check] SCRAPER_API_KEYS found:', scraperKeys.length);
    if (process.env.SCRAPER_API_KEY) console.log('🔍 [Startup Check] SCRAPER_API_KEY found (Single): Yes');

    console.log('='.repeat(60));
    console.log('   ✅ PICKGENIUSPRO - ALL SPORTS READY');
    console.log('='.repeat(60));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('   🔥 Sports Available:');
    console.log('   ⚽ Football    - /api/football/[live|scheduled|finished]');
    console.log('   🏀 Basketball - /api/basketball/[live|scheduled|finished]');
    console.log('   🎾 Tennis     - /api/tennis/[live|scheduled|finished]');
    console.log('   🏈 NFL        - /api/american-football/[live|scheduled|finished]');
    console.log('   🏒 NHL        - /api/ice-hockey/[live|scheduled|finished]');
    console.log('   ⚾ Baseball   - /api/baseball/[live|scheduled|finished]');
    console.log('='.repeat(60));
    console.log('✅ All services ready - using Sofascore for live data');
    console.log('='.repeat(60));
});

// Global Error Handler (Must be the last middleware)
app.use(errorHandler);

// Aumentar timeouts para conexiones lentas de túneles (Ngrok/LocalTunnel)
server.keepAliveTimeout = 65000; // 65 segundos
server.headersTimeout = 66000;  // 66 segundos

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
