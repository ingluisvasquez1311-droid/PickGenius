/**
 * Scheduler para tareas automáticas
 * Ejecuta sync y cleanup en intervalos programados
 */

const { syncUpcomingMatches } = require('./syncFootballMatches');
const { runCleanup } = require('./cleanupCache');

class AutoScheduler {
    constructor() {
        this.intervals = {
            sync: null,
            cleanup: null
        };

        // Configuración de intervalos (en milisegundos)
        this.config = {
            syncInterval: 6 * 60 * 60 * 1000,      // 6 horas
            cleanupInterval: 12 * 60 * 60 * 1000   // 12 horas
        };
    }

    /**
     * Inicia el scheduler
     */
    start() {
        console.log('🚀 Starting Auto Scheduler...');
        console.log('─'.repeat(60));
        console.log(`Sync interval: Every 6 hours`);
        console.log(`Cleanup interval: Every 12 hours`);
        console.log('─'.repeat(60));

        // Ejecutar inmediatamente al inicio
        this.runSync();
        this.runCleanup();

        // Programar ejecuciones periódicas
        this.intervals.sync = setInterval(() => {
            this.runSync();
        }, this.config.syncInterval);

        this.intervals.cleanup = setInterval(() => {
            this.runCleanup();
        }, this.config.cleanupInterval);

        console.log('✅ Scheduler started successfully');
        console.log('Press Ctrl+C to stop\n');
    }

    /**
     * Detiene el scheduler
     */
    stop() {
        console.log('\n🛑 Stopping scheduler...');

        if (this.intervals.sync) {
            clearInterval(this.intervals.sync);
        }

        if (this.intervals.cleanup) {
            clearInterval(this.intervals.cleanup);
        }

        console.log('✅ Scheduler stopped');
    }

    /**
     * Ejecuta sincronización
     */
    async runSync() {
        console.log('\n' + '='.repeat(60));
        console.log(`🔄 AUTO SYNC - ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));

        try {
            await syncUpcomingMatches();
        } catch (error) {
            console.error('❌ Sync failed:', error);
        }
    }

    /**
     * Ejecuta limpieza
     */
    async runCleanup() {
        console.log('\n' + '='.repeat(60));
        console.log(`🧹 AUTO CLEANUP - ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));

        try {
            await runCleanup();
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const scheduler = new AutoScheduler();
    scheduler.start();

    // Manejar señales de terminación
    process.on('SIGINT', () => {
        scheduler.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        scheduler.stop();
        process.exit(0);
    });
}

module.exports = AutoScheduler;
