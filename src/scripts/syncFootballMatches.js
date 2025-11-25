/**
 * Script de sincronización de partidos próximos
 * Obtiene y cachea fixtures de todas las ligas principales
 */

const footballApiService = require('../services/football/footballApiService');
const cacheManager = require('../services/cacheManager');

async function syncUpcomingMatches() {
    console.log('🔄 SYNCING UPCOMING FOOTBALL MATCHES');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toLocaleString()}\n`);

    try {
        // Sincronizar todas las ligas principales
        const result = await footballApiService.syncAllLeagues();

        console.log('\n📊 SYNC SUMMARY');
        console.log('─'.repeat(60));
        console.log(`Total Fixtures: ${result.totalFixtures}`);
        console.log(`API Calls Made: ${result.apiCalls}`);
        console.log(`Cache Hits: ${result.cacheHits}`);

        if (result.apiCalls > 0) {
            const efficiency = ((result.cacheHits / (result.apiCalls + result.cacheHits)) * 100).toFixed(1);
            console.log(`Cache Efficiency: ${efficiency}%`);
        }

        console.log('\n📋 BY LEAGUE:');
        result.results.forEach(league => {
            const source = league.fromCache ? '💾 Cache' : '🌐 API';
            console.log(`   ${source} ${league.league}: ${league.count || 0} fixtures`);
        });

        // Limpiar cache expirado después de sync
        console.log('\n🧹 Cleaning up expired cache...');
        const cleanupResult = await cacheManager.cleanupExpired('football');
        console.log(`   Deleted ${cleanupResult.deleted} expired documents`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Sync completed successfully');
        console.log(`Finished at: ${new Date().toLocaleString()}`);

        return result;

    } catch (error) {
        console.error('\n❌ Error during sync:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    syncUpcomingMatches()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { syncUpcomingMatches };
