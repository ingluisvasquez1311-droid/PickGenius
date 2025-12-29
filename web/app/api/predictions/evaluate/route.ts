import { NextRequest, NextResponse } from 'next/server';
import { predictionTrackingService } from '@/lib/services/predictionTrackingService';

/**
 * API para evaluar predicciones con resultados reales
 * POST /api/predictions/evaluate
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            predictionId,
            winner,
            score,
            totalGoals,
            totalPoints,
            btts,
        } = body;

        // Validación
        if (!predictionId || !winner || !score) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: predictionId, winner, score' },
                { status: 400 }
            );
        }

        // Evaluar predicción
        const evaluated = await predictionTrackingService.evaluatePrediction(
            predictionId,
            {
                winner,
                score,
                totalGoals,
                totalPoints,
                btts,
            }
        );

        if (!evaluated) {
            return NextResponse.json(
                { success: false, error: 'Failed to evaluate prediction' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Prediction evaluated successfully',
        });
    } catch (error: any) {
        console.error('Error evaluating prediction:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/predictions/evaluate - Obtener predicciones pendientes
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limitCount = limitParam ? parseInt(limitParam) : 50;

        const pending = await predictionTrackingService.getPendingEvaluations(limitCount);

        return NextResponse.json({
            success: true,
            count: pending.length,
            predictions: pending,
        });
    } catch (error: any) {
        console.error('Error fetching pending evaluations:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}