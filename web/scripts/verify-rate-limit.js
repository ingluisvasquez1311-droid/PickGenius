const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3000';

// Colores para console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

/**
 * Test 1: Verificar que el rate limit general funciona
 */
async function testGeneralRateLimit() {
    log.info('TEST 1: Rate Limit General (100 requests/15min)');

    try {
        const requests = [];
        // We reduced the middleware basic limit to 60/min in middleware.ts (Step 429) but updated it to 100/15min in Step 440.
        // The middleware currently has: general: { windowMs: 15 * 60 * 1000, max: 100, name: 'General API' }
        const maxRequests = 105; // Intentar exceder el límite

        // Hacer múltiples requests
        log.info(`Enviando ${maxRequests} requests a /api/health-check (simulado)...`);

        // Note: We need a valid endpoint. Middleware intercepts /api/*. 
        // Let's use /api/football/live even if it errors, headers should be present.
        // Or /api/mock for safety if it doesn't exist, Next.js might 404 but middleware runs first? 
        // Middleware matcher is '/api/:path*'.

        for (let i = 0; i < maxRequests; i++) {
            requests.push(
                axios.get(`${API_BASE}/api/football/scheduled?date=2025-01-01`)
                    .then(res => ({ success: true, status: res.status, index: i }))
                    .catch(err => ({
                        success: false,
                        status: err.response?.status,
                        index: i,
                        message: err.response?.data?.error
                    }))
            );
            // Small delay to prevent network congestion issues, but fast enough to hit rate limit
            if (i % 10 === 0) await new Promise(r => setTimeout(r, 50));
        }

        const results = await Promise.all(requests);

        // Check for connection errors first
        const connectionErrors = results.filter(r => !r.success && !r.status).length;
        if (connectionErrors === maxRequests) {
            log.error('❌ NO SE PUDO CONECTAR AL SERVIDOR.');
            log.warn('⚠️  Asegúrate de que estás corriendo "npm run dev" en otra terminal.');
            return;
        }

        const successful = results.filter(r => r.status === 200).length;
        const rateLimited = results.filter(r => r.status === 429).length;

        log.info(`Requests exitosos (200): ${successful}`);
        log.info(`Requests bloqueados (429): ${rateLimited}`);
        log.info(`Otros errores: ${results.length - successful - rateLimited}`);

        if (rateLimited > 0) {
            log.success('Rate limit general está funcionando ✓');
        } else {
            log.warn('Rate limit NO bloqueó ningún request. (¿Middleware activo?)');
        }

    } catch (error) {
        log.error(`Error en test: ${error.message}`);
    }
}

/**
 * Test 2: Verificar headers de rate limit
 */
async function testRateLimitHeaders() {
    log.info('\nTEST 2: Headers de Rate Limit');

    try {
        // Calling a harmless endpoint
        const response = await axios.get(`${API_BASE}/api/football/live`);

        const headers = {
            limit: response.headers['x-ratelimit-limit'],
            remaining: response.headers['x-ratelimit-remaining'],
            reset: response.headers['x-ratelimit-reset']
        };

        if (headers.limit) {
            log.success('Headers de rate limit presentes ✓');
            log.info(`X-RateLimit-Limit: ${headers.limit}`);
            log.info(`X-RateLimit-Remaining: ${headers.remaining}`);
        } else {
            log.error('Headers de rate limit NO encontrados. (Nombres de headers pueden variar)');
            console.log('Headers recibidos:', response.headers);
        }

    } catch (error) {
        // If 404 or 500, headers might still be there
        if (error.response) {
            const headers = {
                limit: error.response.headers['x-ratelimit-limit'],
                remaining: error.response.headers['x-ratelimit-remaining'],
            };
            if (headers.limit) {
                log.success('Headers de rate limit presentes (en respuesta de error) ✓');
                log.info(`X-RateLimit-Limit: ${headers.limit}`);
                return;
            }
        }
        log.error(`Error obteniendo headers: ${error.message}`);
    }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 VERIFICACIÓN DE RATE LIMITING (NEXT.JS MIDDLEWARE)');
    console.log('='.repeat(60) + '\n');
    console.log(`Target: ${API_BASE}`);

    await testRateLimitHeaders();

    log.warn('\n⚠️  Iniciando stress test (puede tomar unos segundos)...');
    await testGeneralRateLimit();

    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTS COMPLETADOS');
    console.log('='.repeat(60) + '\n');
}

// Ejecutar
runAllTests().catch(console.error);
