import { z } from 'zod';

// ==========================================
// COMPONENTES REUTILIZABLES
// ==========================================

const PercentageSchema = z.number().min(0).max(100);
const ScoreSchema = z.string().regex(/^\d+-\d+$/, "Score format must be 'Home-Away' (e.g. 2-1)");

// ==========================================
// ESQUEMAS DE DEPORTES
// ==========================================

// Baloncesto
const BasketballPredictionsSchema = z.object({
    finalScore: z.string().optional(),
    totalPoints: z.string().or(z.number()).optional(),
    spread: z.object({
        favorite: z.string(),
        line: z.number(),
        recommendation: z.string()
    }).optional(),
    overUnder: z.object({
        line: z.number(),
        pick: z.enum(['Más de', 'Menos de', 'Over', 'Under']),
        confidence: z.string().optional()
    }).optional(),
    topPlayers: z.object({
        homeTopScorer: z.object({
            name: z.string(),
            predictedPoints: z.number(),
            predictedRebounds: z.number().optional(),
            predictedAssists: z.number().optional()
        }).optional(),
        awayTopScorer: z.object({
            name: z.string(),
            predictedPoints: z.number(),
            predictedRebounds: z.number().optional(),
            predictedAssists: z.number().optional()
        }).optional()
    }).optional()
});

// Fútbol
const FootballPredictionsSchema = z.object({
    finalScore: z.string().optional(),
    totalGoals: z.string().or(z.number()).optional(),
    corners: z.object({
        home: z.number(),
        away: z.number(),
        total: z.number()
    }).optional(),
    shots: z.object({
        home: z.number(),
        away: z.number(),
        onTarget: z.string().or(z.number()).optional()
    }).optional(),
    cards: z.object({
        yellowCards: z.number(),
        redCards: z.number(),
        details: z.string().optional()
    }).optional(),
    offsides: z.object({
        total: z.number(),
        details: z.string().optional()
    }).optional()
});

// ==========================================
// ESQUEMA PRINCIPAL DE RESPUESTA
// ==========================================

export const PredictionResponseSchema = z.object({
    winner: z.string(),
    confidence: PercentageSchema,
    reasoning: z.string(),
    bettingTip: z.string(),
    keyFactors: z.array(z.string()),

    // Objeto de predicciones detalladas (puede ser de basket o fútbol)
    // Usamos .passthrough() para permitir campos extra sin fallar,
    // pero validamos los conocidos.
    predictions: z.union([
        BasketballPredictionsSchema,
        FootballPredictionsSchema
    ]).optional()
});

export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;
