const cron = require('node-cron');
const sofascoreScraper = require('../robots/sofascoreScraper');
const betplayReader = require('../robots/betplayReader');

class CronScheduler {
    constructor() {
        this.jobs = {};
        this.isRunning = {
            sofascore: false,
            betplay: false
        };
    }

    // Iniciar todos los CRON jobs
    start() {
        console.log('\n' + '='.repeat(60));
        console.log('📅 Starting CRON Schedulers');
        console.log('='.repeat(60) + '\n');

        /* 
        // ROBOT 1: SofaScore (MODO PASIVO) 
        // Desactivado para evitar peticiones independientes desde la IP residencial
        // El guardado ocurre automáticamente vía Piggyback en server.js
        this.jobs.sofascore = cron.schedule('0 * * * *', async () => {
             // ...
        });
        */

        // ROBOT 2: BetPlay - Cada 15 minutos
        this.jobs.betplay = cron.schedule('*/15 * * * *', async () => {
            if (this.isRunning.betplay) return;
            try {
                this.isRunning.betplay = true;
                await betplayReader.fullSync();
            } catch (error) {
                console.error('❌ BetPlay sync error:', error);
            } finally {
                this.isRunning.betplay = false;
            }
        });

        console.log('✅ CRON Jobs started:');
        console.log('  🤖 SofaScore: Passive Mode (Piggyback Active)');
        console.log('  🤖 BetPlay: Every 15 minutes');
        console.log('='.repeat(60) + '\n');
    }

    // Ejecutar sincronización manual
    async runManual(robot) {
        console.log(`🔧 Manual sync triggered: ${robot}`);

        switch (robot) {
            case 'quick_live':
                return await sofascoreScraper.quickLiveSync();
            case 'sofascore':
                if (this.isRunning.sofascore) {
                    throw new Error('SofaScore sync already running');
                }
                this.isRunning.sofascore = true;
                try {
                    return await sofascoreScraper.fullSync();
                } finally {
                    this.isRunning.sofascore = false;
                }

            case 'betplay':
                if (this.isRunning.betplay) {
                    throw new Error('BetPlay sync already running');
                }
                this.isRunning.betplay = true;
                try {
                    return await betplayReader.fullSync();
                } finally {
                    this.isRunning.betplay = false;
                }

            case 'all':
                const results = {};

                if (!this.isRunning.sofascore) {
                    this.isRunning.sofascore = true;
                    try {
                        results.sofascore = await sofascoreScraper.fullSync();
                    } finally {
                        this.isRunning.sofascore = false;
                    }
                }

                // Esperar 3 segundos entre robots
                await new Promise(resolve => setTimeout(resolve, 3000));

                if (!this.isRunning.betplay) {
                    this.isRunning.betplay = true;
                    try {
                        results.betplay = await betplayReader.fullSync();
                    } finally {
                        this.isRunning.betplay = false;
                    }
                }

                return results;

            default:
                throw new Error(`Unknown robot: ${robot}`);
        }
    }

    // Detener todos los jobs
    stop() {
        console.log('🛑 Stopping all CRON jobs...');
        Object.values(this.jobs).forEach(job => job.stop());
        console.log('✅ All CRON jobs stopped');
    }

    // Estado actual
    getStatus() {
        return {
            running: {
                sofascore: this.isRunning.sofascore,
                betplay: this.isRunning.betplay
            },
            jobs: {
                sofascore: this.jobs.sofascore ? 'active' : 'inactive',
                sofascoreLive: this.jobs.sofascoreLive ? 'active' : 'inactive',
                betplay: this.jobs.betplay ? 'active' : 'inactive'
            }
        };
    }
}

module.exports = new CronScheduler();
