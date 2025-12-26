import { NextRequest, NextResponse } from 'next/server';
import { predictionTrackingService } from '@/lib/services/predictionTrackingService';

/**
 * API para guardar predicciones en el sistema de tracking
 * POST /api/predictions/track
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            gameId,
            sport,
            league,
            homeTeam,
            awayTeam,
            predictedWinner,
            predictedScore,
            confidence,
            markets,
            modelUsed = 'llama-3.1-8b-instant',
            temperature = 0.8,
            promptVersion,
        } = body;

        // Validación básica
        if (!gameId || !sport || !predictedWinner) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Guardar predicción
        const predictionId = await predictionTrackingService.savePrediction({
            gameId,
            sport,
            league,
            homeTeam,
            awayTeam,
            predictedWinner,
            predictedScore,
            confidence,
            markets,
            modelUsed,
            temperature,
            promptVersion,
        });

        if (!predictionId) {
            return NextResponse.json(
                { success: false, error: 'Failed to save prediction' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            predictionId,
            message: 'Prediction tracked successfully',
        });
    } catch (error: any) {
        console.error('Error in prediction tracking API:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/predictions/track - Obtener estadísticas de precisión
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get('sport') || undefined;
        const period = (searchParams.get('period') as 'all' | 'week' | 'month') || 'all';

        const stats = await predictionTrackingService.getAccuracyStats(sport, period);

        return NextResponse.json({
            success: true,
            stats,
            period,
        });
    } catch (error: any) {
        console.error('Error fetching accuracy stats:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
