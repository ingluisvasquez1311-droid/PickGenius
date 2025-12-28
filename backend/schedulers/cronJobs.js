const cron = require('node-cron');
const sofascoreScraper = require('../robots/sofascoreScraper');
const betplayReader = require('../robots/betplayReader');
const admin = require('firebase-admin');

const db = admin.firestore();

class CronScheduler {
    constructor() {
        this.jobs = {};
        this.isRunning = {
            sofascore: false,
            betplay: false,
            cleanup: false
        };
    }

    // Iniciar todos los CRON jobs
    start() {
        console.log('\n' + '='.repeat(60));
        console.log('📅 Starting CRON Schedulers');
        console.log('='.repeat(60) + '\n');

        /* 
        // ROBOT 1: SofaScore (MODO 100% PASIVO) 
        // Desactivado para evitar peticiones independientes desde la IP residencial
        // El guardado ocurre automáticamente vía Piggyback en server.js cuando el usuario navega
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

        // LIMPIEZA AUTOMÁTICA: Eliminar partidos terminados cada hora
        this.jobs.cleanup = cron.schedule('0 * * * *', async () => {
            if (this.isRunning.cleanup) return;
            try {
                this.isRunning.cleanup = true;
                await this.cleanupFinishedMatches();
            } catch (error) {
                console.error('❌ Cleanup error:', error);
            } finally {
                this.isRunning.cleanup = false;
            }
        });

        console.log('✅ CRON Jobs started:');
        console.log('  🤖 SofaScore: 100% PASSIVE (Piggyback ONLY - No direct requests)');
        console.log('  🤖 BetPlay: Every 15 minutes');
        console.log('  🧹 Cleanup: Every hour (removes finished matches)');
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Limpia partidos terminados de Firebase
     */
    async cleanupFinishedMatches() {
        console.log('🧹 [Cleanup] Starting cleanup of finished matches...');

        try {
            const now = Date.now();
            const twoHoursAgo = now - (2 * 60 * 60 * 1000); // 2 horas atrás

            // Buscar eventos finalizados hace más de 2 horas
            const snapshot = await db.collection('events')
                .where('status.type', '==', 'finished')
                .get();

            const batch = db.batch();
            let deletedCount = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                const startTime = data.startTimestamp * 1000; // Convertir a ms

                // Si el partido terminó hace más de 2 horas, eliminarlo
                if (startTime < twoHoursAgo) {
                    batch.delete(doc.ref);
                    deletedCount++;
                }
            });

            if (deletedCount > 0) {
                await batch.commit();
                console.log(`✅ [Cleanup] Deleted ${deletedCount} finished matches`);
            } else {
                console.log(`ℹ️ [Cleanup] No finished matches to clean`);
            }

        } catch (error) {
            console.error(`❌ [Cleanup] Error:`, error.message);
        }
    }

    // Ejecutar sincronización manual
    async runManual(robot) {
        console.log(`🔧 Manual sync triggered: ${robot}`);

        if (robot === 'sofascore' || robot === 'all') {
            console.warn('⚠️ SofaScore is in 100% PASSIVE mode - only piggyback saves allowed');
        }

        if (robot === 'betplay' || robot === 'all') {
            if (this.isRunning.betplay) {
                console.log('⏳ BetPlay sync already running...');
            } else {
                try {
                    this.isRunning.betplay = true;
                    await betplayReader.fullSync();
                } catch (error) {
                    console.error('❌ BetPlay sync error:', error);
                } finally {
                    this.isRunning.betplay = false;
                }
            }
        }

        if (robot === 'cleanup') {
            await this.cleanupFinishedMatches();
        }

        return { success: true, message: `Sync completed for ${robot}` };
    }

    getStatus() {
        return {
            sofascore: { mode: '100% PASSIVE (Piggyback Only)', running: false },
            betplay: { mode: 'CRON (Every 15 min)', running: this.isRunning.betplay },
            cleanup: { mode: 'CRON (Every hour)', running: this.isRunning.cleanup }
        };
    }

    stop() {
        Object.values(this.jobs).forEach(job => job && job.stop());
        console.log('🛑 All CRON jobs stopped');
    }
}

module.exports = new CronScheduler();
