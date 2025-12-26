import { NextRequest, NextResponse } from 'next/server';
import { valueDetectorService } from '@/lib/services/valueDetectorService';

/**
 * API para detectar y obtener oportunidades de valor
 * POST /api/value-alerts - Detectar valor en una predicción
 * GET /api/value-alerts - Obtener oportunidades activas
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            gameId,
            sport,
            homeTeam,
            awayTeam,
            market,
            aiProbability,
            aiConfidence,
            marketOdds,
        } = body;

        // Validación
        if (!gameId || !sport || !marketOdds || !aiProbability) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Detectar valor
        const opportunity = await valueDetectorService.detectValue({
            gameId,
            sport,
            homeTeam,
            awayTeam,
            market,
            aiProbability,
            aiConfidence,
            marketOdds,
        });

        if (!opportunity) {
            return NextResponse.json({
                success: true,
                hasValue: false,
                message: 'No se detectó valor suficiente (EV < 10%)',
            });
        }

        return NextResponse.json({
            success: true,
            hasValue: true,
            opportunity,
            message: `¡Valor detectado! EV: ${opportunity.expectedValue}%`,
        });
    } catch (error: any) {
        console.error('Error detecting value:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get('sport') || undefined;
        const minEVParam = searchParams.get('minEV');
        const minEV = minEVParam ? parseInt(minEVParam) : 10;

        const opportunities = await valueDetectorService.getActiveOpportunities(sport, minEV);

        return NextResponse.json({
            success: true,
            count: opportunities.length,
            opportunities,
        });
    } catch (error: any) {
        console.error('Error fetching value opportunities:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
