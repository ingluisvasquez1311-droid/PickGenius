const sofascore = require('./robots/sofascoreScraper');
const betplay = require('./robots/betplayReader');

async function runTests() {
    console.log('🧪 INICIANDO TEST DE ROBOTS');
    console.log('---------------------------');

    try {
        // Test Robot 1
        console.log('\n🤖 1. Probando SofaScore Scraper...');
        const res1 = await sofascore.fullSync();
        console.log('✅ SofaScore OK:', res1);
    } catch (error) {
        console.error('❌ SofaScore Falló:', error.message);
    }

    try {
        // Test Robot 2
        console.log('\n🤖 2. Probando BetPlay Reader...');
        const res2 = await betplay.fullSync();
        console.log('✅ BetPlay OK:', res2);
    } catch (error) {
        console.error('❌ BetPlay Falló:', error.message);
    }

    console.log('\n---------------------------');
    console.log('🏁 TEST FINALIZADO');
}

runTests();
