const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Load NBA 2023-24 season data only
router.get('/load/nba/2023-24', async (req, res) => {
    try {
        const data = await dataService.loadNBAData('2023-24');

        for (const [key, value] of Object.entries(data)) {
            if (value.length > 0) {
                await dataService.saveToFirebase(`nba_${key}`, value);
            }
        }

        res.json({
            success: true,
            message: '2023-24 NBA data loaded successfully',
            files: Object.keys(data),
            totalRecords: Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Debug: Check 2023-24 data
router.get('/debug/2023-24', async (req, res) => {
    try {
        const { db } = require('../config/firebase');
        const snapshot = await db.collection('nba_regular_season_box_scores_2010_2024_part_1')
            .where('season_year', '==', '2023-24')
            .limit(5)
            .get();

        if (snapshot.empty) {
            return res.json({ message: 'No 2023-24 data found' });
        }

        const data = snapshot.docs.map(doc => doc.data());
        res.json({
            count: data.length,
            samples: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Debug: Check specific team data across all collections
router.get('/debug/team/:abbr', async (req, res) => {
    try {
        const { db } = require('../config/firebase');
        const teamAbbr = req.params.abbr;

        const collections = [
            'nba_regular_season_box_scores_2010_2024_part_1',
            'nba_regular_season_box_scores_2010_2024_part_2',
            'nba_regular_season_box_scores_2010_2024_part_3',
            'nba_regular_season_box_scores_2025_26'
        ];

        const results = {};

        for (const col of collections) {
            try {
                const snapshot = await db.collection(col)
                    .where('teamTricode', '==', teamAbbr)
                    .limit(5)
                    .get();

                results[col] = {
                    found: !snapshot.empty,
                    count: snapshot.size,
                    sample: snapshot.empty ? null : snapshot.docs[0].data()
                };
            } catch (e) {
                results[col] = { error: e.message };
            }
        }

        res.json({
            team: teamAbbr,
            results: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Debug: Sample one document from each collection to verify content
router.get('/debug/samples', async (req, res) => {
    try {
        const { db } = require('../config/firebase');
        const collections = [
            'nba_regular_season_box_scores_2010_2024_part_1',
            'nba_regular_season_box_scores_2010_2024_part_2',
            'nba_regular_season_box_scores_2010_2024_part_3',
            'nba_regular_season_box_scores_2025_26'
        ];

        const results = {};

        for (const col of collections) {
            const snapshot = await db.collection(col).limit(1).get();
            results[col] = {
                empty: snapshot.empty,
                sample: snapshot.empty ? null : snapshot.docs[0].data()
            };
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug: Search for a player to find their team code
router.get('/debug/player/:name', async (req, res) => {
    try {
        const { db } = require('../config/firebase');
        const name = req.params.name;

        const collections = [
            'nba_regular_season_box_scores_2010_2024_part_1',
            'nba_regular_season_box_scores_2010_2024_part_2',
            'nba_regular_season_box_scores_2010_2024_part_3',
            'nba_regular_season_box_scores_2025_26'
        ];

        let allResults = [];

        for (const col of collections) {
            try {
                const snapshot = await db.collection(col)
                    .where('personName', '>=', name)
                    .where('personName', '<=', name + '\uf8ff')
                    .limit(5)
                    .get();

                const results = snapshot.docs.map(doc => ({
                    collection: col,
                    name: doc.data().personName,
                    team: doc.data().teamTricode,
                    season: doc.data().season_year
                }));

                allResults = allResults.concat(results);
            } catch (e) {
                console.error(`Error searching ${col}:`, e.message);
            }
        }

        res.json({ query: name, results: allResults });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
