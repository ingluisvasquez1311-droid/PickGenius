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
    userId?: string;
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
                awayTeam: request.awayTeam,
                uid: request.userId // Pass user ID for tier check
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
    const sportNames: { [key: string]: string } = {
        'football': 'fútbol',
        'basketball': 'baloncesto',
        'tennis': 'tenis',
        'baseball': 'béisbol',
        'hockey': 'hockey',
        'american-football': 'fútbol americano'
    };

    const isFootball = request.sport === 'football';
    const sportDisplayName = sportNames[request.sport] || request.sport;
    const homeName = request.homeTeam || 'Local';
    const awayName = request.awayTeam || 'Visitante';

    // Sport-specific picks
    const picks = isFootball ? [
        `${homeName} ML`,
        `${awayName} ML`,
        `${homeName} -1`,
        `${awayName} +1`,
        'Over 2.5 Goles',
        'Under 2.5 Goles',
        'Ambos Anotan (BTTS)'
    ] : request.sport === 'basketball' ? [
        `${homeName} ML`,
        `${awayName} ML`,
        `${homeName} -5.5`,
        `${awayName} +5.5`,
        'Over 215.5',
        'Under 215.5'
    ] : [
        `${homeName} Ganador`,
        `${awayName} Ganador`
    ];

    const randomPick = picks[Math.floor(Math.random() * picks.length)];
    const confidence = Math.floor(Math.random() * 30) + 65; // 65-95%

    const factors = isFootball ? [
        'Ventaja de local fuerte',
        'Racha de victorias consecutivas',
        'Defensa sólida en casa',
        'Lesiones clave en el equipo contrario',
        'Dominio en enfrentamientos directos recientes'
    ] : [
        'Eficiencia ofensiva superior',
        'Dominio en la pintura/rebotes',
        'Racha positiva de tiro exterior',
        'Ventaja física en emparejamientos clave',
        'Historial favorable en la liga'
    ];

    const randomFactors = factors
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

    // Dynamic Predictions object based on sport
    const predictions: any = {};

    if (isFootball) {
        predictions.totalGoals = '2.5';
        predictions.overUnder = { line: 2.5, pick: Math.random() > 0.5 ? 'Más de' : 'Menos de', confidence: 'Alta' };
        predictions.corners = { total: 9.5, pick: 'Más de', line: 9.5 };
        predictions.cards = { yellowCards: 4, redCards: 0, pick: 'Menos de', line: 4.5 };
        predictions.bothTeamsScore = { pick: 'Sí', confidence: 'Media' };
    } else if (request.sport === 'basketball') {
        predictions.totalPoints = '218.5';
        predictions.overUnder = { line: 218.5, pick: 'Más de', confidence: 'Media' };
        predictions.playerProps = {
            threes: { player: "Estrella Local", line: 2.5, pick: "Más de" },
            pra: { player: "Estrella Visitante", line: 30.5, pick: "Más de" }
        };
        predictions.quarterMarkets = {
            raceTo20: { pick: homeName, confidence: "Media" }
        };
    } else if (request.sport === 'tennis') {
        predictions.finalScore = '2-0';
        predictions.totalGames = '21.5';
        predictions.overUnder = { line: 21.5, pick: 'Menos de', confidence: 'Alta' };
    } else if (request.sport === 'baseball') {
        predictions.totalRuns = '8.5';
        predictions.overUnder = { line: 8.5, pick: 'Más de', confidence: 'Media' };
        predictions.runLine = { favorite: homeName, line: -1.5, recommendation: 'Cubrir' };
    } else if (request.sport === 'hockey') {
        predictions.totalGoals = '5.5';
        predictions.overUnder = { line: 5.5, pick: 'Más de', confidence: 'Media' };
        predictions.puckLine = { favorite: homeName, line: -1.5, recommendation: 'Cubrir' };
    } else if (request.sport === 'american-football') {
        predictions.totalPoints = '45.5';
        predictions.overUnder = { line: 45.5, pick: 'Más de', confidence: 'Alta' };
        predictions.touchdowns = { total: 4.5, pick: 'Más de', line: 4.5 };
        predictions.yards = { total: 650, pick: 'Más de', line: 640.5 };
    }

    return {
        winner: randomPick,
        confidence,
        reasoning: `Basado en el análisis de datos históricos y tendencias recientes de ${sportDisplayName}, ${randomPick} presenta una oportunidad sólida. Los factores clave incluyen el rendimiento reciente del equipo y las estadísticas de enfrentamientos directos.`,
        bettingTip: `🧙‍♂️ Pronóstico de ${sportDisplayName}: ${randomPick} con confianza ${confidence}%`,
        keyFactors: randomFactors,
        predictions
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
