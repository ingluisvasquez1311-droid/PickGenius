// src/routes/universalSports.js
const express = require('express');
const router = express.Router();
const universalPlayerPropsService = require('../services/universalPlayerPropsService');
const generalizedSofaScoreService = require('../services/generalizedSofaScoreService');
const validate = require('../middleware/validate');
const { sportParamSchema, eventIdParamSchema, predictSchema } = require('../schemas/sportSchema');

/**
 * @route   GET /api/sports/:sport/top-players
 */
router.get('/:sport/top-players', validate(sportParamSchema, 'params'), async (req, res) => {
    try {
        const { sport } = req.params;
        const players = await universalPlayerPropsService.getTopPlayers(sport);
        res.json({ success: true, data: players });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/sports/:sport/player/:playerId/stats
 */
router.get('/:sport/player/:playerId/stats', validate(sportParamSchema, 'params'), async (req, res) => {
    try {
        const { sport, playerId } = req.params;
        const stats = await universalPlayerPropsService.getPlayerStats(playerId, sport);
        const averages = universalPlayerPropsService.calculateAverages(stats, sport, 10);
        res.json({ success: true, data: { stats, averages } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/sports/:sport/predict
 */
router.post('/:sport/predict',
    validate(sportParamSchema, 'params'),
    validate(predictSchema, 'body'),
    async (req, res) => {
        try {
            const { sport } = req.params;
            const { playerId, playerName, propType, line, eventId } = req.body;

            const prediction = await universalPlayerPropsService.generatePrediction(
                playerId, playerName, sport, propType, line, eventId
            );

            res.json({ success: true, data: prediction });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

/**
 * @route   GET /api/sports/:sport/match/:eventId
 */
router.get('/:sport/match/:eventId',
    validate(sportParamSchema, 'params'),
    validate(eventIdParamSchema, 'params'),
    async (req, res) => {
        try {
            const { eventId } = req.params;
            const result = await generalizedSofaScoreService.getEventDetails(eventId);
            if (result.success) {
                res.json({ success: true, data: result.data.event || result.data });
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

/**
 * @route   GET /api/sports/:sport/match/:eventId/statistics
 */
router.get('/:sport/match/:eventId/statistics', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await generalizedSofaScoreService.getEventStatistics(eventId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/sports/:sport/match/:eventId/best-player
 */
router.get('/:sport/match/:eventId/best-player', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await generalizedSofaScoreService.getBestPlayers(eventId);

        if (result.success && result.data && result.data.bestPlayers) {
            // Flatten the structure: return what's inside result.data.bestPlayers
            res.json({ success: true, data: result.data.bestPlayers });
        } else {
            res.json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/sports/:sport/match/:eventId/lineups
 */
router.get('/:sport/match/:eventId/lineups', async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await generalizedSofaScoreService.getEventLineups(eventId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/sports/:sport/live
 */
router.get('/:sport/live', validate(sportParamSchema, 'params'), async (req, res) => {
    try {
        const { sport } = req.params;
        const events = await generalizedSofaScoreService.getLiveEvents(sport);
        res.json({ success: true, data: events.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/sports/:sport/scheduled
 */
router.get('/:sport/scheduled', validate(sportParamSchema, 'params'), async (req, res) => {
    try {
        const { sport } = req.params;
        const { date } = req.query;
        const result = await generalizedSofaScoreService.getScheduledEvents(sport, date);

        if (result.success) {
            res.json({
                success: true,
                data: result.data.events || [],
                _metadata: {
                    count: result.data.events?.length || 0,
                    sport: sport,
                    date: date || new Date().toISOString().split('T')[0]
                }
            });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
