const fs = require('fs');
const path = require('path');
const sofaScoreBasketballService = require('../src/services/basketball/sofaScoreBasketballService');

const logFile = path.join(__dirname, '../debug_output.txt');

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

async function debugLineups() {
    const eventId = '12697005'; // Denver vs Knicks
    log(`Fetching lineups for event ${eventId}...`);

    try {
        const result = await sofaScoreBasketballService.getLineups(eventId);

        if (result.success) {
            log('Successfully fetched lineups');

            if (result.data.home) {
                log(`Home Team Players: ${result.data.home.players.length}`);
                if (result.data.home.players.length > 0) {
                    const firstPlayer = result.data.home.players[0];
                    log('First Player Structure: ' + JSON.stringify(firstPlayer, null, 2));
                }
            } else {
                log('No home team data found');
            }
        } else {
            log('Error fetching lineups: ' + JSON.stringify(result.error));
        }
    } catch (error) {
        log('Script error: ' + error.message);
    }
}

// Clear log file
fs.writeFileSync(logFile, '');
debugLineups();
