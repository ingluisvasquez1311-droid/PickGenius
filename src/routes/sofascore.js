const express = require('express');
const router = express.Router();
const sofaScoreFootballService = require('../services/football/sofaScoreService');
const sofaScoreBasketballService = require('../services/basketball/sofaScoreBasketballService');

// ========================================
// BASKETBALL ENDPOINTS
// ========================================

/**
 * GET /api/sofascore/basketball/live
 * Obtener eventos de baloncesto en vivo
 */
router.get('/basketball/live', async (req, res) => {
    try {
        const result = await sofaScoreBasketballService.getLiveEvents();

        if (result.success) {
            res.json({
                success: true,
                data: result.data.events || [],
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sofascore/basketball/game/:eventId
 * Obtener detalles de un juego específico
 */
router.get('/basketball/game/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreBasketballService.getEventDetails(eventId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sofascore/basketball/game/:eventId/stats
 * Obtener estadísticas detalladas de un juego
 */
router.get('/basketball/game/:eventId/stats', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreBasketballService.getFormattedGameStats(eventId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sofascore/basketball/game/:eventId/lineups
 * Obtener alineaciones y estadísticas de jugadores
 */
router.get('/basketball/game/:eventId/lineups', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreBasketballService.getLineups(eventId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// FOOTBALL ENDPOINTS
// ========================================

/**
 * GET /api/sofascore/football/live
 * Obtener partidos de fútbol en vivo
 */
router.get('/football/live', async (req, res) => {
    try {
        const result = await sofaScoreFootballService.getLiveEvents();

        if (result.success) {
            res.json({
                success: true,
                data: result.data.events || [],
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sofascore/football/match/:eventId
 * Obtener detalles de un partido específico
 */
router.get('/football/match/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreFootballService.getEventDetails(eventId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sofascore/football/match/:eventId/stats
 * Obtener estadísticas de un partido
 */
router.get('/football/match/:eventId/stats', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreFootballService.getEventStatistics(eventId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sofascore/football/match/:eventId/lineups
 * Obtener alineaciones de un partido
 */
router.get('/football/match/:eventId/lineups', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreFootballService.getLineups(eventId);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                fromCache: result.fromCache
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sofascore/football/match/:eventId/incidents
 */
router.get('/football/match/:eventId/incidents', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreFootballService.getIncidents(eventId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sofascore/football/match/:eventId/h2h
 */
router.get('/football/match/:eventId/h2h', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreFootballService.getH2H(eventId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sofascore/football/tournament/:tournamentId/season/:seasonId/standings
 */
router.get('/football/tournament/:tournamentId/season/:seasonId/standings', async (req, res) => {
    try {
        const { tournamentId, seasonId } = req.params;
        const result = await sofaScoreFootballService.getStandings(tournamentId, seasonId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// BASKETBALL NEW ENDPOINTS

/**
 * GET /api/sofascore/basketball/game/:eventId/incidents
 */
router.get('/basketball/game/:eventId/incidents', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreBasketballService.getIncidents(eventId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sofascore/basketball/game/:eventId/h2h
 */
router.get('/basketball/game/:eventId/h2h', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await sofaScoreBasketballService.getH2H(eventId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sofascore/basketball/tournament/:tournamentId/season/:seasonId/standings
 */
router.get('/basketball/tournament/:tournamentId/season/:seasonId/standings', async (req, res) => {
    try {
        const { tournamentId, seasonId } = req.params;
        const result = await sofaScoreBasketballService.getStandings(tournamentId, seasonId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const geminiService = require('../services/GeminiService');

/**
 * GET /api/sofascore/predict/:sport/:eventId
 * Obtener predicción de IA para un partido
 */
router.get('/predict/:sport/:eventId', async (req, res) => {
    try {
        const { sport, eventId } = req.params;
        const result = await geminiService.predictMatch(eventId, sport);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
