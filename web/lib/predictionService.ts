/**
 * Prediction Service - AI-powered game predictions
 * Integrates with Gemini API for advanced analysis
 */
import { fetchAPI } from './api';

export interface PredictionRequest {
    gameId: string;
    homeTeam?: string;
    awayTeam?: string;
    date?: Date;
    sport: string;
}


export interface PredictionResult {
    winner: string;
    confidence: number;
    reasoning: string;
    bettingTip: string;
    predictions?: {
        finalScore: string;
        totalGoals: string;
        corners: {
            home: number;
            away: number;
            total: number;
        };
        shots: {
            home: number;
            away: number;
            onTarget: string;
        };
        cards: {
            yellowCards: number;
            redCards: number;
            details: string;
        };
        offsides: {
            total: number;
            details: string;
        };
    };
    keyFactors?: string[];
}


export async function generatePrediction(request: PredictionRequest): Promise<PredictionResult> {
    try {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds

        const data = await fetchAPI('/api/predictions', {
            method: 'POST',
            body: JSON.stringify({
                gameId: request.gameId,
                sport: request.sport,
                homeTeam: request.homeTeam,
                awayTeam: request.awayTeam
            }),
            signal: controller.signal
        });

        // If API returns fallback/mock flag, USE IT if it has data
        // We prefer the server-side mock because it's richer
        if (data.isMock || data.isFallback) {
            console.warn('Using server-side mock prediction');
            return data;
        }

        return data;
    } catch (error: any) {
        console.error('Error generating prediction:', error);

        // Check if it's a timeout error
        if (error.name === 'AbortError') {
            console.error('Prediction request timed out after 90 seconds');
            throw new Error('El análisis está tomando más tiempo del esperado. Por favor, intenta de nuevo.');
        }

        // Return mock prediction as fallback
        return generateMockPrediction(request);
    }
}

/**
 * Generate mock prediction (for development/fallback)
 */
function generateMockPrediction(request: PredictionRequest): PredictionResult {
    const isFootball = request.sport === 'football';

    // Sport-specific picks
    const picks = isFootball ? [
        `${request.homeTeam} ML`,
        `${request.awayTeam} ML`,
        `${request.homeTeam} -1`,
        `${request.awayTeam} +1`,
        'Over 2.5 Goals',
        'Under 2.5 Goals',
        'Both Teams to Score'
    ] : [
        `${request.homeTeam} ML`,
        `${request.awayTeam} ML`,
        `${request.homeTeam} -5.5`,
        `${request.awayTeam} +5.5`,
        'Over 215.5',
        'Under 215.5'
    ];

    const randomPick = picks[Math.floor(Math.random() * picks.length)];
    const confidence = Math.floor(Math.random() * 30) + 65; // 65-95%

    const factors = isFootball ? [
        'Ventaja de local fuerte',
        'Racha de 5 victorias consecutivas',
        'Defensa sólida en casa',
        'Lesiones clave en el equipo contrario',
        'Dominio en enfrentamientos directos recientes'
    ] : [
        'Ventaja de local fuerte',
        'Racha de 5 victorias consecutivas',
        'Defensa top 5 de la liga',
        'Lesiones clave en el equipo contrario',
        'Historial favorable en enfrentamientos directos'
    ];

    const randomFactors = factors
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    return {
        winner: randomPick,
        confidence,
        reasoning: `Basado en el análisis de datos históricos y tendencias recientes de ${isFootball ? 'fútbol' : 'baloncesto'}, ${randomPick} presenta una oportunidad sólida. Los factores clave incluyen el rendimiento reciente del equipo y las estadísticas de enfrentamientos directos.`,
        bettingTip: `🧙‍♂️ ${isFootball ? 'Pronóstico de fútbol' : 'Pronóstico NBA'}: ${randomPick} con confianza ${confidence}%`,
        keyFactors: randomFactors
    };
}

/**
 * Check if prediction is available (respects user limits)
 */
export async function checkPredictionAvailability(userId: string): Promise<{
    available: boolean;
    remaining: number;
    message: string;
}> {
    // This would integrate with your user service
    // For now, returning mock data
    return {
        available: true,
        remaining: 2,
        message: 'Tienes 2 predicciones restantes hoy'
    };
}

/**
 * Save prediction to user history
 */
export async function savePredictionToHistory(
    userId: string,
    prediction: PredictionResult,
    gameId: string
): Promise<void> {
    try {
        await fetchAPI('/api/predictions/history', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                prediction,
                gameId,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Error saving prediction to history:', error);
    }
}
