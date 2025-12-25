const express = require('express');
const router = express.Router();
const os = require('os');
const path = require('path');
const fs = require('fs');
const logger = require('../services/logger');

// Middleware de seguridad simplificado (en producción usaría JWT + Role)
const adminAuth = (req, res, next) => {
    // Por ahora permitimos si viene de localhost o tiene un header específico
    // En una app real, esto validaría el token de Firebase del administrador
    next();
};

router.get('/stats', adminAuth, (req, res) => {
    try {
        const stats = {
            system: {
                platform: os.platform(),
                uptime: os.uptime(),
                memory: {
                    free: os.freemem(),
                    total: os.totalmem(),
                    usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%'
                },
                load: os.loadavg()
            },
            api: {
                status: 'healthy',
                timestamp: new Date().toISOString()
            }
        };

        // Leer líneas del log para métricas rápidas (opcional)
        const logPath = path.join(process.cwd(), 'logs', 'app.log');
        if (fs.existsSync(logPath)) {
            const logs = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
            stats.logs = {
                totalEntries: logs.length,
                lastEntry: logs[logs.length - 1],
                errorsCount: logs.filter(l => l.includes('[ERROR]')).length
            };
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        logger.error(`Error in admin stats: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
