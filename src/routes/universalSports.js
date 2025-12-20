// src/routes/universalSports.js
const express = require('express');
const router = express.Router();
const universalPlayerPropsService = require('../services/universalPlayerPropsService');
const generalizedSofaScoreService = require('../services/generalizedSofaScoreService');

/**
 * @route   GET /api/sports/:sport/top-players
 */
router.get('/:sport/top-players', async (req, res) => {
    try {
        const { sport } = req.params;
        const players = await universalPlayerPropsService.getTopPlayers(sport);
        res.json({ success: true, data: players });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/sports/:sport/predict
 */
router.post('/:sport/predict', async (req, res) => {
    try {
        const { sport } = req.params;
        const { playerId, playerName, propType, line } = req.body;

        const prediction = await universalPlayerPropsService.generatePrediction(
            playerId, playerName, sport, propType, line
        );

        res.json({ success: true, data: prediction });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/sports/:sport/live
 */
router.get('/:sport/live', async (req, res) => {
    try {
        const { sport } = req.params;
        const events = await generalizedSofaScoreService.getLiveEvents(sport);
        res.json({ success: true, data: events.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
