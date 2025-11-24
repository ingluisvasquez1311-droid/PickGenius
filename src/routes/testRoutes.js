const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const aiService = require('../services/aiService');

router.get('/connections', async (req, res) => {
    const results = {
        firebase: { status: 'pending', message: '' },
        gemini: { status: 'pending', message: '' }
    };

    // 1. Test Firebase
    try {
        if (!db) throw new Error('Firestore client not initialized');
        const testRef = db.collection('system').doc('connection_check');
        await testRef.set({ last_check: new Date().toISOString() });
        results.firebase.status = 'success';
        results.firebase.message = 'Connected & Write Successful';
    } catch (error) {
        results.firebase.status = 'error';
        results.firebase.message = error.message;
    }

    // 2. Test Qwen AI
    try {
        const analysis = await aiService.analyzeMatch({
            home: 'Test Team A',
            away: 'Test Team B',
            note: 'This is a connection test, just say "Hello from Qwen!"'
        });
        results.gemini.status = 'success';
        results.gemini.message = 'Response received from Qwen AI';
        results.gemini.output = analysis;
    } catch (error) {
        results.gemini.status = 'error';
        results.gemini.message = error.message;
    }

    res.json(results);
});

module.exports = router;
