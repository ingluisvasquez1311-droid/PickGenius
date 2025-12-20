// src/scripts/testUniversalProps.js
require('dotenv').config();
const universalPlayerPropsService = require('../services/universalPlayerPropsService');

async function test() {
    console.log('🧪 Testing Universal Player Props Service...');

    const sports = ['basketball', 'baseball', 'nhl', 'tennis'];

    for (const sport of sports) {
        console.log(`\n--- Testing ${sport.toUpperCase()} ---`);
        try {
            const players = await universalPlayerPropsService.getTopPlayers(sport);
            console.log(`✅ Top players found: ${players.length}`);
            if (players.length > 0) {
                const p = players[0];
                console.log(`👤 Testing prediction for ${p.name} (${p.id})`);

                // Get a prop type for this sport
                const propType = Object.keys(p.averages)[0];
                const line = parseFloat(p.averages[propType]) + 0.5;

                console.log(`🎯 Prop: ${propType} | Line: ${line}`);

                // Note: This calls Gemini, so it might take time
                // We'll just test the stats fetching part if we want to be fast,
                // but let's try one prediction.
                const prediction = await universalPlayerPropsService.generatePrediction(
                    p.id, p.name, sport, propType, line
                );

                console.log(`🤖 Prediction: ${prediction.prediction.prediction}`);
                console.log(`📝 Reasoning: ${prediction.prediction.reasoning.substring(0, 50)}...`);
            }
        } catch (error) {
            console.error(`❌ Error testing ${sport}:`, error.message);
        }
    }
}

test();
