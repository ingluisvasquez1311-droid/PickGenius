const express = require('express');
const router = express.Router();
const nbaController = require('../controllers/nbaController');

// Get today's NBA games
router.get('/games/today', nbaController.getTodayGames.bind(nbaController));

// Analyze a specific game
router.get('/games/:id/analyze', nbaController.analyzeGame.bind(nbaController));

module.exports = router;
