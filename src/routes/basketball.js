const express = require('express');
const router = express.Router();
const generalizedSofaScoreService = require('../services/generalizedSofaScoreService');

// GET /api/basketball/live
router.get('/live', async (req, res, next) => {
    try {
        const result = await generalizedSofaScoreService.getLiveEvents('basketball');
        res.json(result.data || { events: [] });
    } catch (error) {
        next(error);
    }
});

// GET /api/basketball/scheduled
router.get('/scheduled', async (req, res, next) => {
    try {
        const { date } = req.query;
        const result = await generalizedSofaScoreService.getScheduledEvents('basketball', date, 24); // 24h window
        res.json(result.data || { events: [] });
    } catch (error) {
        next(error);
    }
});

// GET /api/basketball/finished
router.get('/finished', async (req, res, next) => {
    try {
        const { date } = req.query;
        const result = await generalizedSofaScoreService.getEventsByDate('basketball', date);
        if (result.success && result.data && result.data.events) {
            result.data.events = result.data.events.filter(e => e.status?.type === 'finished');
        }
        res.json(result.data || { events: [] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
