// src/routes/nbaPlayerProps.js
const express = require('express');
const router = express.Router();
const nbaPlayerPropsService = require('../services/nbaPlayerPropsService');

/**
 * @route   GET /api/nba/players/top
 * @desc    Obtener jugadores destacados del día con sus promedios
 * @access  Public
 */
router.get('/top', async (req, res) => {
    try {
        console.log('📊 Solicitando jugadores destacados del día...');

        const players = await nbaPlayerPropsService.getTodayTopPlayers();

        res.json({
            success: true,
            count: players.length,
            data: players,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error en /players/top:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   GET /api/nba/players/:playerId/stats
 * @desc    Obtener estadísticas de un jugador específico
 * @access  Public
 */
router.get('/:playerId/stats', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { games = 10 } = req.query;

        console.log(`📊 Obteniendo stats del jugador ${playerId}...`);

        const stats = await nbaPlayerPropsService.getPlayerStats(playerId, parseInt(games));
        const averages = nbaPlayerPropsService.calculateAverages(stats, parseInt(games));

        res.json({
            success: true,
            playerId,
            data: {
                stats,
                averages
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`❌ Error obteniendo stats del jugador:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/nba/players/predict
 * @desc    Generar predicción de rendimiento de un jugador
 * @access  Public
 * @body    { playerId, playerName, propType, line }
 */
router.post('/predict', async (req, res) => {
    try {
        const { playerId, playerName, propType, line } = req.body;

        // Validación
        if (!playerId || !playerName || !propType || !line) {
            return res.status(400).json({
                success: false,
                error: 'Faltan parámetros requeridos: playerId, playerName, propType, line'
            });
        }

        const validProps = ['points', 'assists', 'rebounds', 'steals', 'blocks'];
        if (!validProps.includes(propType)) {
            return res.status(400).json({
                success: false,
                error: `propType debe ser uno de: ${validProps.join(', ')}`
            });
        }

        console.log(`🎯 Generando predicción para ${playerName}: ${line} ${propType}`);

        const prediction = await nbaPlayerPropsService.generatePlayerPropPrediction(
            playerId,
            playerName,
            propType,
            line
        );

        res.json({
            success: true,
            data: prediction
        });
    } catch (error) {
        console.error('❌ Error generando predicción:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/nba/players/batch-predict
 * @desc    Generar múltiples predicciones a la vez
 * @access  Public
 * @body    { predictions: [{ playerId, playerName, propType, line }] }
 */
router.post('/batch-predict', async (req, res) => {
    try {
        const { predictions } = req.body;

        if (!Array.isArray(predictions) || predictions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere un array de predicciones'
            });
        }

        console.log(`🎯 Generando ${predictions.length} predicciones...`);

        const results = await Promise.all(
            predictions.map(async (pred) => {
                try {
                    return await nbaPlayerPropsService.generatePlayerPropPrediction(
                        pred.playerId,
                        pred.playerName,
                        pred.propType,
                        pred.line
                    );
                } catch (error) {
                    return {
                        player: pred.playerName,
                        error: error.message
                    };
                }
            })
        );

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('❌ Error en batch-predict:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   GET /api/nba/players/:playerId/averages
 * @desc    Obtener solo los promedios de un jugador
 * @access  Public
 */
router.get('/:playerId/averages', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { games = 10 } = req.query;

        console.log(`📊 Obteniendo promedios del jugador ${playerId}...`);

        const stats = await nbaPlayerPropsService.getPlayerStats(playerId, parseInt(games));
        const averages = nbaPlayerPropsService.calculateAverages(stats, parseInt(games));

        if (!averages) {
            return res.status(404).json({
                success: false,
                error: 'No se encontraron datos para este jugador'
            });
        }

        res.json({
            success: true,
            playerId,
            data: averages,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error obteniendo promedios:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
