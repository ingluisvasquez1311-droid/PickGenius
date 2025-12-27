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

        // ROBOT 1: SofaScore - Cada 30 minutos
        this.jobs.sofascore = cron.schedule('*/30 * * * *', async () => {
            if (this.isRunning.sofascore) {
                console.log('⚠️ SofaScore sync already running, skipping...');
                return;
            }

            try {
                this.isRunning.sofascore = true;
                await sofascoreScraper.fullSync();
            } catch (error) {
                console.error('❌ SofaScore sync error:', error);
            } finally {
                this.isRunning.sofascore = false;
            }
        });

        // ROBOT 1b: SofaScore LIVE - Cada 5 minutos (solo eventos en vivo)
        this.jobs.sofascoreLive = cron.schedule('*/5 * * * *', async () => {
            if (this.isRunning.sofascore) return;

            try {
                console.log('🔄 Quick live events update...');
                // Aquí podrías tener una versión rápida que solo actualiza eventos en vivo
            } catch (error) {
                console.error('❌ Live update error:', error);
            }
        });

        // ROBOT 2: BetPlay - Cada 15 minutos
        this.jobs.betplay = cron.schedule('*/15 * * * *', async () => {
            if (this.isRunning.betplay) {
                console.log('⚠️ BetPlay sync already running, skipping...');
                return;
            }

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
        console.log('  🤖 Robot 1 (SofaScore): Every 30 minutes');
        console.log('  🤖 Robot 1b (Live): Every 5 minutes');
        console.log('  🤖 Robot 2 (BetPlay): Every 15 minutes');
        console.log('='.repeat(60) + '\n');
    }

    // Ejecutar sincronización manual
    async runManual(robot) {
        console.log(`🔧 Manual sync triggered: ${robot}`);

        switch (robot) {
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
