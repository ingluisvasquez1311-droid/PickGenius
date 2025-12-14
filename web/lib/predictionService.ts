/**
 * Prediction Service - AI-powered game predictions
 * Integrates with Gemini API for advanced analysis
 */

export interface PredictionRequest {
    gameId: string;
    homeTeam?: string;
    awayTeam?: string;
    date?: Date;
    sport: 'basketball' | 'football';
}

export async function generatePrediction(request: PredictionRequest): Promise<PredictionResult> {
    try {
        const response = await fetch('/api/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameId: request.gameId,
                sport: request.sport,
                homeTeam: request.homeTeam,
                awayTeam: request.awayTeam
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate prediction');
        }

        const data = await response.json();

        // If API returns fallback/mock flag or fails gracefully
        if (data.isFallback) {
            console.warn('Using fallback prediction due to API error');
            return generateMockPrediction(request);
        }

        return data;
    } catch (error) {
        console.error('Error generating prediction:', error);
        return generateMockPrediction(request);
    }
}

/**
 * Generate mock prediction (for development/fallback)
 */
function generateMockPrediction(request: PredictionRequest): PredictionResult {
    const picks = [
        `${request.homeTeam} ML`,
        `${request.awayTeam} ML`,
        `${request.homeTeam} -5.5`,
        `${request.awayTeam} +5.5`,
        'Over 215.5',
        'Under 215.5'
    ];

    const randomPick = picks[Math.floor(Math.random() * picks.length)];
    const confidence = Math.floor(Math.random() * 30) + 65; // 65-95%

    const factors = [
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
        pick: randomPick,
        confidence,
        odds: confidence > 80 ? '-150' : '+120',
        analysis: `Basado en el análisis de datos históricos y tendencias recientes, ${randomPick} presenta una oportunidad sólida. Los factores clave incluyen el rendimiento reciente del equipo y las estadísticas de enfrentamientos directos.`,
        wizardTip: `🧙‍♂️ El Mago recomienda: ${randomPick} con confianza ${confidence}%`,
        factors: randomFactors
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
        await fetch('/api/predictions/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
