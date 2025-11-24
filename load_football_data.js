/**
 * Script para cargar datos de fútbol desde CSV a Firestore
 * Ejecutar con: node load_football_data.js
 */

const footballService = require('./src/services/football/footballService');

async function main() {
    try {
        console.log('🚀 Iniciando carga de datos de fútbol...\n');

        // Cargar todas las ligas principales de la temporada 2024-25
        const result = await footballService.loadAllLeagues('2425');

        if (result.success) {
            console.log('\n📊 Obteniendo estadísticas...\n');

            // Mostrar estadísticas por liga
            const leagues = ['La Liga', 'Premier League', 'Serie A', 'Bundesliga', 'Ligue 1'];

            for (const league of leagues) {
                try {
                    const stats = await footballService.getPredictionStats(league);
                    console.log(`${league}:`);
                    console.log(`  Total partidos: ${stats.total}`);
                    console.log(`  Ambos marcan: ${stats.bothTeamsScored.percentage}%`);
                    console.log(`  Over 2.5 goles: ${stats.over25Goals.percentage}%`);
                    console.log(`  Promedio corners: ${stats.avgCorners}`);
                    console.log(`  Promedio tiros: ${stats.avgShots}\n`);
                } catch (error) {
                    console.log(`  ⚠️  No hay datos para ${league}\n`);
                }
            }

            console.log('✅ Proceso completado exitosamente!');
        } else {
            console.error('❌ Error en la carga de datos');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
