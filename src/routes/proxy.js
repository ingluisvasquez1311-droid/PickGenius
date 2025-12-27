const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const generalizedSofaScoreService = require('../services/generalizedSofaScoreService');
const memoryCache = require('../services/memoryCache');

/**
 * Proxy for team logos
 */
router.get('/team-logo/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const response = await generalizedSofaScoreService.getTeamLogo(teamId);

        if (response && response.data) {
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

/**
 * Proxy for Kambi/Betplay Data with File Fallback and Cache
 * GET /api/proxy/kambi/*
 */
router.get('/kambi/*', async (req, res) => {
    try {
        const kambiPath = req.params[0] || req.url.split('/kambi/')[1];
        const cacheKey = `kambi_proxy_${kambiPath.replace(/\//g, '_')}`;

        // 1. Check Memory Cache (5 minutes for Kambi to avoid 403s on repeated calls)
        const cachedResult = memoryCache.get(cacheKey);
        if (cachedResult) {
            // console.log(`✅ [Proxy Cache] Hit for Kambi: ${kambiPath}`);
            return res.json(cachedResult);
        }

        // 2. USER REQUEST: Check for local JSON file first (Manual Overrides)
        // Check in data/betplay/[id].json or similar
        const fileName = kambiPath.split('/').pop(); // e.g., '1000093190.json'
        const localFilePath = path.join(process.cwd(), 'data', 'betplay', fileName);

        if (fs.existsSync(localFilePath)) {
            try {
                const fileContent = fs.readFileSync(localFilePath, 'utf8');
                // Basic validation: must be a JSON object, not a Cloudflare HTML
                if (fileContent.trim().startsWith('{')) {
                    const jsonData = JSON.parse(fileContent);
                    console.log(`📁 [Proxy] Using local JSON file for: ${fileName}`);
                    memoryCache.set(cacheKey, jsonData, 300); // Cache for 5 min
                    return res.json(jsonData);
                }
            } catch (fileError) {
                console.warn(`⚠️ [Proxy] Error reading local file ${fileName}:`, fileError.message);
            }
        }

        // 3. API Request if no valid local file
        const url = `https://tienda.betplay.com.co/offering/v21/betp/${kambiPath}`;
        console.log(`🔌 [Express Bridge] Proxying to Kambi/Betplay: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Referer': 'https://tienda.betplay.com.co/',
                'Origin': 'https://tienda.betplay.com.co',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site'
            },
            timeout: 10000
        });

        if (response.data) {
            memoryCache.set(cacheKey, response.data, 300); // 5 minutes cache
            res.json(response.data);
        } else {
            res.status(404).json({ success: false, error: 'Kambi data not found' });
        }

    } catch (error) {
        if (error.response?.status === 403) {
            console.error(`❌ [Proxy] Kambi Forbidden (403) - Cloudflare block detected for ${req.url}`);
        } else {
            console.error(`❌ Error in kambi proxy route:`, error.message);
        }

        res.status(error.response?.status || 500).json({
            success: false,
            error: error.message,
            status: error.response?.status
        });
    }
});

module.exports = router;

