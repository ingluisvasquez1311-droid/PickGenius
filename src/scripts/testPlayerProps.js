// src/scripts/testPlayerProps.js
require('dotenv').config();
const nbaPlayerPropsService = require('../services/nbaPlayerPropsService');

async function testPlayerProps() {
    console.log('🏀 INICIANDO PRUEBA DE PLAYER PROPS (SOFASCORE)\n');

    try {
        // Test 1: Obtener jugadores destacados
        console.log('📊 TEST 1: Obtener jugadores destacados del día');
        console.log('='.repeat(60));

        const topPlayers = await nbaPlayerPropsService.getTodayTopPlayers();
        console.log(`✅ Encontrados ${topPlayers.length} jugadores\n`);

        topPlayers.slice(0, 3).forEach((player, idx) => {
            console.log(`${idx + 1}. ${player.name} (SofaID: ${player.id})`);
            if (player.averages) {
                console.log(`   Puntos: ${player.averages.points}`);
                console.log(`   Asistencias: ${player.averages.assists}`);
                console.log(`   Rebotes: ${player.averages.rebounds}`);
            }
            console.log('');
        });

        if (topPlayers.length === 0) {
            console.log('⚠️ No se encontraron jugadores destacados. Verifica la conexión a Sofascore.');
            return;
        }

        // Test 2: Obtener estadísticas detalladas de un jugador (ej: LeBron James 15152)
        const testPlayer = topPlayers[0];
        console.log(`📊 TEST 2: Estadísticas detalladas de ${testPlayer.name}`);
        console.log('='.repeat(60));

        const stats = await nbaPlayerPropsService.getPlayerStats(testPlayer.id, 5);
        const avg = nbaPlayerPropsService.calculateAverages(stats, 5);

        console.log('✅ Promedios últimos 5 juegos:');
        console.log(JSON.stringify(avg.averages, null, 2));
        console.log('\n✅ Últimos juegos:');
        avg.lastGames.slice(0, 3).forEach((game, idx) => {
            console.log(`${idx + 1}.vs ${game.opponent}: ${game.points} PTS, ${game.assists} AST, ${game.rebounds} REB`);
        });

        // Test 3: Generar predicción
        console.log('\n📊 TEST 3: Generar predicción con IA (Gemini)');
        console.log('='.repeat(60));
        const linea = 25.5;
        console.log(`Pregunta: ¿${testPlayer.name} superará ${linea} puntos?\n`);

        const prediction = await nbaPlayerPropsService.generatePlayerPropPrediction(
            testPlayer.id,
            testPlayer.name,
            'points',
            linea
        );

        console.log('✅ PREDICCIÓN (EN ESPAÑOL):');
        console.log(`   Resultado: ${prediction.prediction.prediction}`);
        console.log(`   Probabilidad: ${prediction.prediction.probability}%`);
        console.log(`   Confianza: ${prediction.prediction.confidence}`);
        console.log(`\n   Razón: ${prediction.prediction.reasoning}`);

        if (prediction.prediction.keyFactors) {
            console.log('\n   Factores clave:');
            prediction.prediction.keyFactors.forEach((factor, idx) => {
                console.log(`   ${idx + 1}. ${factor}`);
            });
        }

        console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE 🎉');

    } catch (error) {
        console.error('❌ ERROR EN LAS PRUEBAS:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Ejecutar tests
testPlayerProps();
