import { NextResponse } from 'next/server';
import { predictionTrackingService } from '@/lib/services/predictionTrackingService';
import { sportsDataService } from '@/lib/services/sportsDataService';

/**
 * Endpoint para ejecución de Cron Job
 * Evalúa automáticamente predicciones pendientes con resultados reales
 */
export async function GET(request: Request) {
    try {
        // Verificar token simple o IP si es necesario (seguridad básica)
        const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        console.log('🔄 [Cron] Iniciando evaluación automática de predicciones...');

        // 1. Obtener predicciones pendientes (máximo 20 por lote para evitar timeouts)
        const pending = await predictionTrackingService.getPendingEvaluations(20);

        if (!pending || pending.length === 0) {
            return NextResponse.json({ message: 'No pending predictions to evaluate' });
        }

        const stats = {
            total: pending.length,
            evaluated: 0,
            skipped: 0,
            errors: 0
        };

        // 2. Procesar cada predicción
        for (const pred of pending) {
            try {
                if (!pred.gameId || !pred.id) {
                    stats.skipped++;
                    continue;
                }

                // Obtener evento actualizado
                const event = await sportsDataService.getEventById(pred.gameId);

                if (!event) {
                    stats.skipped++;
                    continue;
                }

                // Solo evaluar si el partido ha terminado
                if (event.status.type === 'finished') {
                    const homeScore = event.homeScore?.display ?? 0;
                    const awayScore = event.awayScore?.display ?? 0;

                    // Determinar ganador para evaluación
                    let actualWinner = 'draw';
                    if (homeScore > awayScore) actualWinner = 'home';
                    else if (awayScore > homeScore) actualWinner = 'away';

                    const success = await predictionTrackingService.evaluatePrediction(pred.id, {
                        winner: actualWinner,
                        score: `${homeScore}-${awayScore}`,
                        totalGoals: homeScore + awayScore,
                        totalPoints: homeScore + awayScore,
                        btts: homeScore > 0 && awayScore > 0
                    });

                    if (success) stats.evaluated++;
                    else stats.errors++;
                } else {
                    stats.skipped++;
                }
            } catch (err) {
                console.error(`❌ [Cron] Error procesando pred ${pred.id}:`, err);
                stats.errors++;
            }
        }

        console.log(`✅ [Cron] Fin de evaluación: ${stats.evaluated} evaluadas, ${stats.skipped} pendientes/en juego, ${stats.errors} errores.`);

        return NextResponse.json({
            success: true,
            summary: stats
        });

    } catch (error: any) {
        console.error('❌ [Cron] Critical error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
