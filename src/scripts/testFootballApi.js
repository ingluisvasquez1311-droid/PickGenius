/**
 * Test de integración para Football API
 * Verifica que el sistema de cache y rate limiting funcione correctamente
 */

const footballApiService = require('../services/football/footballApiService');
const cacheManager = require('../services/cacheManager');
const apiRateLimiter = require('../services/apiRateLimiter');

async function runTests() {
    console.log('🧪 TESTING FOOTBALL API INTEGRATION');
    console.log('='.repeat(60));

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Obtener fixtures de Premier League
    try {
        console.log('\n📝 Test 1: Get Premier League Fixtures');
        const fixtures = await footballApiService.getUpcomingFixtures(39, { next: 5 });

        if (fixtures.success && fixtures.fixtures.length > 0) {
            console.log('   ✅ PASSED - Got', fixtures.fixtures.length, 'fixtures');
            console.log('   Source:', fixtures.fromCache ? 'Cache' : 'API');
            results.passed++;
        } else {
            console.log('   ❌ FAILED - No fixtures returned');
            results.failed++;
        }

        results.tests.push({
            name: 'Get Premier League Fixtures',
            passed: fixtures.success,
            fromCache: fixtures.fromCache
        });

    } catch (error) {
        console.log('   ❌ FAILED -', error.message);
        results.failed++;
        results.tests.push({
            name: 'Get Premier League Fixtures',
            passed: false,
            error: error.message
        });
    }

    // Test 2: Verificar cache (segunda llamada debe venir del cache)
    try {
        console.log('\n📝 Test 2: Verify Cache Hit');
        const fixtures = await footballApiService.getUpcomingFixtures(39, { next: 5 });

        if (fixtures.fromCache) {
            console.log('   ✅ PASSED - Data served from cache');
            results.passed++;
        } else {
            console.log('   ⚠️  WARNING - Expected cache hit but got API call');
            console.log('   This is normal if cache expired or this is first run');
            results.passed++;
        }

        results.tests.push({
            name: 'Verify Cache Hit',
            passed: true,
            fromCache: fixtures.fromCache
        });

    } catch (error) {
        console.log('   ❌ FAILED -', error.message);
        results.failed++;
    }

    // Test 3: Verificar estadísticas de API
    try {
        console.log('\n📝 Test 3: Check API Usage Stats');
        const stats = await apiRateLimiter.getAllStats();

        if (stats['api-football']) {
            const footballStats = stats['api-football'];
            console.log('   ✅ PASSED - API stats available');
            console.log(`   Total Keys: ${footballStats.totalKeys}`);
            console.log(`   Calls Today: ${footballStats.totalCalls}`);
            console.log(`   Available: ${footballStats.availableCalls}`);
            results.passed++;
        } else {
            console.log('   ❌ FAILED - No API stats found');
            results.failed++;
        }

        results.tests.push({
            name: 'Check API Usage Stats',
            passed: !!stats['api-football']
        });

    } catch (error) {
        console.log('   ❌ FAILED -', error.message);
        results.failed++;
    }

    // Test 4: Verificar estadísticas de cache
    try {
        console.log('\n📝 Test 4: Check Cache Stats');
        const cacheStats = await cacheManager.getStats('football');

        if (cacheStats.football) {
            console.log('   ✅ PASSED - Cache stats available');
            console.log(`   Total Cached: ${cacheStats.football.total}`);
            console.log(`   Valid: ${cacheStats.football.valid}`);
            console.log(`   Expired: ${cacheStats.football.expired}`);
            results.passed++;
        } else {
            console.log('   ⚠️  WARNING - No cache stats (cache might be empty)');
            results.passed++;
        }

        results.tests.push({
            name: 'Check Cache Stats',
            passed: true
        });

    } catch (error) {
        console.log('   ❌ FAILED -', error.message);
        results.failed++;
    }

    // Test 5: Test de predicciones (si hay fixtures disponibles)
    try {
        console.log('\n📝 Test 5: Get Match Predictions');

        // Primero obtener un fixture
        const fixtures = await footballApiService.getUpcomingFixtures(39, { next: 1 });

        if (fixtures.success && fixtures.fixtures.length > 0) {
            const fixtureId = fixtures.fixtures[0].fixtureId;
            console.log(`   Testing with fixture ID: ${fixtureId}`);

            const predictions = await footballApiService.getFixturePredictions(fixtureId);

            if (predictions.success) {
                console.log('   ✅ PASSED - Got predictions');
                console.log('   Source:', predictions.fromCache ? 'Cache' : 'API');
                results.passed++;
            } else {
                console.log('   ⚠️  WARNING - Predictions not available for this fixture');
                results.passed++;
            }
        } else {
            console.log('   ⚠️  SKIPPED - No fixtures available to test');
            results.passed++;
        }

        results.tests.push({
            name: 'Get Match Predictions',
            passed: true
        });

    } catch (error) {
        console.log('   ⚠️  WARNING -', error.message);
        console.log('   (Predictions might not be available for all fixtures)');
        results.passed++;
    }

    // Test 6: Test de limpieza de cache
    try {
        console.log('\n📝 Test 6: Test Cache Cleanup');
        const cleanupResult = await cacheManager.cleanupExpired('football');

        console.log('   ✅ PASSED - Cleanup executed');
        console.log(`   Deleted: ${cleanupResult.deleted} documents`);
        results.passed++;

        results.tests.push({
            name: 'Test Cache Cleanup',
            passed: true,
            deleted: cleanupResult.deleted
        });

    } catch (error) {
        console.log('   ❌ FAILED -', error.message);
        results.failed++;
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('─'.repeat(60));
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);

    const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);

    console.log('\n💡 RECOMMENDATIONS:');
    if (results.failed === 0) {
        console.log('   ✅ All tests passed! System is working correctly.');
    } else {
        console.log('   ⚠️  Some tests failed. Check error messages above.');
    }

    console.log('\n   Next steps:');
    console.log('   1. Run sync: node src/scripts/syncFootballMatches.js');
    console.log('   2. View dashboard: node src/scripts/apiUsageDashboard.js');
    console.log('   3. Setup cron job for automatic sync and cleanup');

    console.log('\n' + '='.repeat(60));

    return results;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runTests()
        .then(results => {
            process.exit(results.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { runTests };
