const express = require('express');
const router = express.Router();
const generalizedSofaScoreService = require('../services/generalizedSofaScoreService');

router.get('/live', async (req, res, next) => {
    try {
        const result = await generalizedSofaScoreService.getLiveEvents('ice-hockey');
        res.json(result.data || { events: [] });
    } catch (error) {
        next(error);
    }
});

router.get('/scheduled', async (req, res, next) => {
    try {
        const { date } = req.query;
        const result = await generalizedSofaScoreService.getScheduledEvents('ice-hockey', date, 24);
        res.json(result.data || { events: [] });
    } catch (error) {
        next(error);
    }
});

router.get('/finished', async (req, res, next) => {
    try {
        const { date } = req.query;
        const result = await generalizedSofaScoreService.getEventsByDate('ice-hockey', date);
        if (result.success && result.data && result.data.events) {
            result.data.events = result.data.events.filter(e => e.status?.type === 'finished');
        }
        res.json(result.data || { events: [] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
