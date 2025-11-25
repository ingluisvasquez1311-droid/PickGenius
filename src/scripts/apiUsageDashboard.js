/**
 * Dashboard de uso de API
 * Monitorea el uso de las APIs y eficiencia del cache
 */

const cacheManager = require('../services/cacheManager');
const apiRateLimiter = require('../services/apiRateLimiter');

async function showDashboard() {
    console.clear();
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(25) + 'API USAGE DASHBOARD' + ' '.repeat(34) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');
    console.log();

    try {
        // 1. API Usage Stats
        const apiStats = await apiRateLimiter.getAllStats();

        console.log('📊 API USAGE BY PROVIDER');
        console.log('─'.repeat(80));

        for (const [provider, stats] of Object.entries(apiStats)) {
            const totalLimit = stats.totalKeys * 100;
            const usagePercent = ((stats.totalCalls / totalLimit) * 100).toFixed(1);

            console.log(`\n🔑 ${provider.toUpperCase()}`);
            console.log(`   Active Keys: ${stats.totalKeys}`);
            console.log(`   Total Limit: ${totalLimit} calls/day`);
            console.log(`   Used Today: ${stats.totalCalls} (${usagePercent}%)`);
            console.log(`   Available: ${stats.availableCalls} calls`);

            // Barra de progreso
            const barLength = 50;
            const filled = Math.floor((stats.totalCalls / totalLimit) * barLength);
            const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
            console.log(`   [${bar}]`);

            // Detalles por clave
            console.log('\n   Keys Details:');
            stats.keys.forEach((key, index) => {
                const keyPercent = ((key.callsToday / 100) * 100).toFixed(0);
                const status = key.callsToday >= 100 ? '🔴' :
                    key.callsToday >= 80 ? '🟡' : '🟢';

                console.log(`   ${status} Key ${index + 1}: ${key.callsToday}/100 (${keyPercent}%) - ${key.callsRemaining} remaining`);

                if (key.lastUsed) {
                    const lastUsed = new Date(key.lastUsed);
                    const minutesAgo = Math.floor((Date.now() - lastUsed.getTime()) / 60000);
                    console.log(`      Last used: ${minutesAgo} minutes ago`);
                }
            });
        }

        // 2. Cache Stats
        console.log('\n\n💾 CACHE STATISTICS');
        console.log('─'.repeat(80));

        const cacheStats = await cacheManager.getStats();

        for (const [sport, stats] of Object.entries(cacheStats)) {
            const validPercent = stats.total > 0
                ? ((stats.valid / stats.total) * 100).toFixed(1)
                : 0;

            console.log(`\n⚽ ${sport.toUpperCase()}`);
            console.log(`   Total Cached: ${stats.total} documents`);
            console.log(`   Valid: ${stats.valid} (${validPercent}%)`);
            console.log(`   Expired: ${stats.expired}`);
            console.log('\n   By Status:');
            console.log(`      📅 Scheduled: ${stats.byStatus.scheduled}`);
            console.log(`      🔴 Live: ${stats.byStatus.live}`);
            console.log(`      ✅ Finished: ${stats.byStatus.finished}`);
        }

        // 3. Efficiency Metrics
        console.log('\n\n📈 EFFICIENCY METRICS');
        console.log('─'.repeat(80));

        const totalApiCalls = Object.values(apiStats).reduce((sum, s) => sum + s.totalCalls, 0);
        const totalCached = Object.values(cacheStats).reduce((sum, s) => sum + s.valid, 0);

        console.log(`\n   Total API Calls Today: ${totalApiCalls}`);
        console.log(`   Total Cached Items: ${totalCached}`);

        if (totalApiCalls > 0) {
            const efficiency = ((totalCached / totalApiCalls) * 100).toFixed(1);
            console.log(`   Cache Efficiency: ${efficiency}x (${totalCached} items from ${totalApiCalls} calls)`);
        }

        // 4. Recommendations
        console.log('\n\n💡 RECOMMENDATIONS');
        console.log('─'.repeat(80));

        const recommendations = [];

        for (const [provider, stats] of Object.entries(apiStats)) {
            const usagePercent = (stats.totalCalls / (stats.totalKeys * 100)) * 100;

            if (usagePercent > 80) {
                recommendations.push(`⚠️  ${provider}: High usage (${usagePercent.toFixed(1)}%). Consider adding more API keys.`);
            }

            if (stats.availableCalls < 20) {
                recommendations.push(`🔴 ${provider}: Low available calls (${stats.availableCalls}). May need to wait for reset.`);
            }
        }

        for (const [sport, stats] of Object.entries(cacheStats)) {
            if (stats.expired > stats.valid * 0.3) {
                recommendations.push(`🧹 ${sport}: Many expired items (${stats.expired}). Run cleanup: node src/scripts/cleanupCache.js`);
            }
        }

        if (recommendations.length === 0) {
            console.log('\n   ✅ Everything looks good! System is running efficiently.');
        } else {
            recommendations.forEach(rec => console.log(`\n   ${rec}`));
        }

        console.log('\n' + '═'.repeat(80));
        console.log(`Last updated: ${new Date().toLocaleString()}`);
        console.log('═'.repeat(80));

    } catch (error) {
        console.error('❌ Error generating dashboard:', error);
    }
}

// Auto-refresh cada 30 segundos si se pasa --watch
const args = process.argv.slice(2);
const watchMode = args.includes('--watch') || args.includes('-w');

if (watchMode) {
    console.log('👀 Watch mode enabled. Dashboard will refresh every 30 seconds.');
    console.log('Press Ctrl+C to exit.\n');

    showDashboard();
    setInterval(showDashboard, 30000);
} else {
    showDashboard().then(() => process.exit(0));
}

module.exports = { showDashboard };
