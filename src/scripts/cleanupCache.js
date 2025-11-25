/**
 * Script de limpieza automática
 * Elimina partidos jugados y cache expirado
 * Ejecutar como cron job diario
 */

const cacheManager = require('../services/cacheManager');
const apiRateLimiter = require('../services/apiRateLimiter');

async function runCleanup() {
    console.log('🧹 Starting automatic cleanup...');
    console.log('='.repeat(60));

    try {
        // 1. Limpiar cache expirado para Football
        console.log('\n📊 Cleaning Football cache...');
        const footballResult = await cacheManager.cleanupExpired('football');
        console.log(`   Deleted: ${footballResult.deleted} documents`);

        // 2. Limpiar cache expirado para NBA
        console.log('\n🏀 Cleaning NBA cache...');
        const nbaResult = await cacheManager.cleanupExpired('nba');
        console.log(`   Deleted: ${nbaResult.deleted} documents`);

        // 3. Obtener estadísticas de cache
        console.log('\n📈 Cache Statistics:');
        const cacheStats = await cacheManager.getStats();

        for (const [sport, stats] of Object.entries(cacheStats)) {
            console.log(`\n   ${sport.toUpperCase()}:`);
            console.log(`      Total: ${stats.total}`);
            console.log(`      Valid: ${stats.valid}`);
            console.log(`      Expired: ${stats.expired}`);
            console.log(`      Scheduled: ${stats.byStatus.scheduled}`);
            console.log(`      Live: ${stats.byStatus.live}`);
            console.log(`      Finished: ${stats.byStatus.finished}`);
        }

        // 4. Obtener estadísticas de API usage
        console.log('\n📊 API Usage Statistics:');
        const apiStats = await apiRateLimiter.getAllStats();

        for (const [provider, stats] of Object.entries(apiStats)) {
            console.log(`\n   ${provider.toUpperCase()}:`);
            console.log(`      Total Keys: ${stats.totalKeys}`);
            console.log(`      Calls Today: ${stats.totalCalls}`);
            console.log(`      Available Calls: ${stats.availableCalls}`);

            stats.keys.forEach((key, index) => {
                console.log(`      Key ${index + 1}: ${key.callsToday}/100 calls (${key.callsRemaining} remaining)`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Cleanup completed successfully');

        return {
            success: true,
            football: footballResult,
            nba: nbaResult,
            cacheStats,
            apiStats
        };

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runCleanup()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runCleanup };
