const express = require('express');
const router = express.Router();
const generalizedSofaScoreService = require('../services/generalizedSofaScoreService');

/**
 * Proxy for team logos
 * GET /api/proxy/team-logo/:teamId
 */
router.get('/team-logo/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const response = await generalizedSofaScoreService.getTeamLogo(teamId);

        if (response && response.data) {
            // Set cache headers
            res.set('Cache-Control', 'public, max-age=86400, immutable');
            res.set('Content-Type', response.headers['content-type'] || 'image/png');
            res.send(Buffer.from(response.data));
        } else {
            res.status(404).json({ success: false, error: 'Logo not found' });
        }
    } catch (error) {
        console.error(`❌ Error in team-logo proxy route:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Proxy for player images
 * GET /api/proxy/player-image/:playerId
 */
router.get('/player-image/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const response = await generalizedSofaScoreService.getPlayerImage(playerId);

        if (response && response.data) {
            res.set('Cache-Control', 'public, max-age=86400, immutable');
            res.set('Content-Type', response.headers['content-type'] || 'image/png');
            res.send(Buffer.from(response.data));
        } else {
            res.status(404).json({ success: false, error: 'Player image not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Proxy for category images (Flags)
 * GET /api/proxy/category-image/:categoryId
 */
router.get('/category-image/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const response = await generalizedSofaScoreService.getCategoryImage(categoryId);

        if (response && response.data) {
            res.set('Cache-Control', 'public, max-age=86400, immutable');
            res.set('Content-Type', response.headers['content-type'] || 'image/png');
            res.send(Buffer.from(response.data));
        } else {
            res.status(404).json({ success: false, error: 'Category image not found' });
        }
    } catch (error) {
        console.error(`❌ Error in category-image proxy route:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Proxy for Raw Sports Data (Unified Bridge)
 * GET /api/proxy/sportsdata/*
 */
router.get('/sportsdata/*', async (req, res) => {
    try {
        const path = req.params[0] || req.params.path || req.url.split('/sportsdata/')[1];
        console.log(`🔌 [Express Bridge] Proxying to Sofascore: ${path}`);

        const response = await generalizedSofaScoreService.fetchData(path);

        if (response && response.success) {
            res.json(response.data);
        } else {
            res.status(404).json({ success: false, error: 'Data not found' });
        }
    } catch (error) {
        console.error(`❌ Error in sportsdata proxy route:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
