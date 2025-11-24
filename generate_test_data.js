/**
 * Script para generar datos de prueba en Firestore
 * Ejecutar con: node generate_test_data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-credentials.json');

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('🏀 Generando datos de prueba para NBA Sync Dashboard...\n');

// Equipos NBA
const teams = ['LAL', 'BOS', 'GSW', 'MIA', 'PHI', 'MIL', 'BKN', 'DAL', 'PHX', 'DEN'];

// Jugadores de ejemplo
const players = [
    'LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis Antetokounmpo',
    'Luka Doncic', 'Joel Embiid', 'Jayson Tatum', 'Nikola Jokic',
    'Damian Lillard', 'Anthony Davis', 'Devin Booker', 'Jimmy Butler'
];

async function generateTestData() {
    try {
        // Generar datos para colección 2024-25
        console.log('📦 Generando datos para colección 2024-25...');

        const batch = db.batch();
        let count = 0;

        // Generar 200 documentos de prueba
        for (let gameNum = 0; gameNum < 20; gameNum++) {
            const gameId = `0022400${String(gameNum).padStart(3, '0')}`;
            const gameDate = new Date(2024, 10, gameNum + 1).toISOString().split('T')[0];

            // 10 jugadores por juego
            for (let playerNum = 0; playerNum < 10; playerNum++) {
                const team = teams[Math.floor(Math.random() * teams.length)];
                const player = players[Math.floor(Math.random() * players.length)];
                const personId = 1000 + (gameNum * 10) + playerNum;

                const docId = `${gameId}_${personId}`;
                const docRef = db.collection('nba_regular_season_box_scores_2024_25').doc(docId);

                batch.set(docRef, {
                    gameId: gameId,
                    teamTricode: team,
                    personName: player,
                    points: Math.floor(Math.random() * 35),
                    reboundsTotal: Math.floor(Math.random() * 12),
                    assists: Math.floor(Math.random() * 10),
                    fieldGoalsPercentage: (Math.random() * 30 + 35).toFixed(1),
                    threePointersMade: Math.floor(Math.random() * 6),
                    minutes: `${Math.floor(Math.random() * 20 + 20)}:00`,
                    season_year: '2024-25',
                    game_date: gameDate
                });

                count++;
            }
        }

        await batch.commit();
        console.log(`✅ Creados ${count} documentos en colección 2024-25\n`);

        // Generar algunos datos para colección 2023-24
        console.log('📦 Generando datos para colección 2023-24...');

        const batch2 = db.batch();
        let count2 = 0;

        for (let gameNum = 0; gameNum < 10; gameNum++) {
            const gameId = `0022300${String(gameNum).padStart(3, '0')}`;
            const gameDate = new Date(2024, 2, gameNum + 1).toISOString().split('T')[0];

            for (let playerNum = 0; playerNum < 10; playerNum++) {
                const team = teams[Math.floor(Math.random() * teams.length)];
                const player = players[Math.floor(Math.random() * players.length)];
                const personId = 2000 + (gameNum * 10) + playerNum;

                const docId = `${gameId}_${personId}`;
                const docRef = db.collection('nba_regular_season_box_scores_2010_2024_part_3').doc(docId);

                batch2.set(docRef, {
                    gameId: gameId,
                    teamTricode: team,
                    personName: player,
                    points: Math.floor(Math.random() * 35),
                    reboundsTotal: Math.floor(Math.random() * 12),
                    assists: Math.floor(Math.random() * 10),
                    fieldGoalsPercentage: (Math.random() * 30 + 35).toFixed(1),
                    threePointersMade: Math.floor(Math.random() * 6),
                    minutes: `${Math.floor(Math.random() * 20 + 20)}:00`,
                    season_year: '2023-24',
                    game_date: gameDate
                });

                count2++;
            }
        }

        await batch2.commit();
        console.log(`✅ Creados ${count2} documentos en colección 2023-24\n`);

        console.log('='.repeat(60));
        console.log('🎉 DATOS DE PRUEBA GENERADOS EXITOSAMENTE');
        console.log('='.repeat(60));
        console.log(`Total documentos creados: ${count + count2}`);
        console.log(`\n📊 Ahora puedes:`);
        console.log(`   1. Abrir el dashboard: streamlit run dashboard.py`);
        console.log(`   2. Recargar la página en tu navegador`);
        console.log(`   3. ¡Ver los datos en acción!\n`);
        console.log(`⚠️  IMPORTANTE: Estos son datos de PRUEBA (aleatorios)`);
        console.log(`   Para datos reales, configura la API de balldontlie.io\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error generando datos:', error);
        process.exit(1);
    }
}

// Ejecutar
generateTestData();
