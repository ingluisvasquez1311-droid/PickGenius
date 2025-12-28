import { z } from 'zod';

// ==========================================
// COMPONENTES REUTILIZABLES
// ==========================================

const PercentageSchema = z.number().min(0).max(100);

// ==========================================
// ESQUEMAS DE DEPORTES
// ==========================================

// Baloncesto
const BasketballPredictionsSchema = z.object({
    finalScore: z.string().optional(),
    totalPoints: z.number().optional(),
    firstHalfPoints: z.number().optional(),
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
    playerProps: z.object({
        threes: z.object({ player: z.string(), pick: z.string(), line: z.number() }).optional(),
        pra: z.object({ player: z.string(), pick: z.string(), line: z.number() }).optional()
    }).optional(),
    quarterMarkets: z.object({
        raceTo20: z.object({ pick: z.string() }).optional(),
        firstQuarter: z.object({ pick: z.string() }).optional()
    }).optional()
});

// Fútbol
const FootballPredictionsSchema = z.object({
    finalScore: z.string().optional(),
    totalGoals: z.number().optional(),
    corners: z.object({
        line: z.number().optional(),
        pick: z.string().optional(),
        total: z.number().optional(),
        home: z.number().optional(),
        away: z.number().optional()
    }).optional(),
    cards: z.object({
        line: z.number().optional(),
        pick: z.string().optional(),
        yellowCards: z.number().optional(),
        redCards: z.number().optional()
    }).optional(),
    bothTeamsScore: z.object({
        pick: z.enum(['Sí', 'No', 'Yes', 'No']),
        confidence: z.string().optional()
    }).optional(),
    goalsByHalf: z.object({
        firstHalf: z.object({ total: z.number(), pick: z.string() }),
        secondHalf: z.object({ total: z.number(), pick: z.string() })
    }).optional()
});

// NFL / Fútbol Americano
const NFLPredictionsSchema = z.object({
    finalScore: z.string().optional(),
    totalPoints: z.number().optional(),
    touchdowns: z.object({
        line: z.number().optional(),
        pick: z.string().optional(),
        total: z.number().optional()
    }).optional(),
    yards: z.object({
        line: z.number().optional(),
        pick: z.string().optional(),
        total: z.number().optional()
    }).optional()
});

// Béisbol
const BaseballPredictionsSchema = z.object({
    finalScore: z.string().optional(),
    totalRuns: z.number().optional(),
    first5: z.object({
        winner: z.string().optional(),
        pick: z.string().optional(),
        line: z.number().optional()
    }).optional(),
    hits: z.object({
        total: z.number().optional(),
        pick: z.string().optional()
    }).optional()
});

// Tenis
const TennisPredictionsSchema = z.object({
    finalScore: z.object({ home: z.number(), away: z.number() }).optional(),
    totalGames: z.number().optional(),
    sets: z.object({
        home: z.number(),
        away: z.number(),
        pick: z.string().optional()
    }).optional(),
    aces: z.object({
        total: z.number().optional(),
        pick: z.string().optional()
    }).optional()
});

// NHL / Hockey
const HockeyPredictionsSchema = z.object({
    finalScore: z.string().optional(),
    totalGoals: z.number().optional(),
    puckLine: z.object({
        favorite: z.string(),
        line: z.number(),
        pick: z.string().optional()
    }).optional(),
    periodMarkets: z.object({
        firstPeriodWinner: z.string().optional(),
        totalGoalsP1: z.number().optional()
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
    isValueBet: z.boolean().optional(),
    edge: z.number().optional(),
    mostViablePick: z.object({
        pick: z.string(),
        line: z.string().or(z.number()),
        market: z.string(),
        winProbability: z.string().or(z.number()),
        rationale: z.string()
    }).optional(),
    predictions: z.union([
        BasketballPredictionsSchema,
        FootballPredictionsSchema,
        NFLPredictionsSchema,
        BaseballPredictionsSchema,
        TennisPredictionsSchema,
        HockeyPredictionsSchema
    ]).optional(),
    keyFactors: z.array(z.string()).optional()
}).passthrough();

export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;
export type TennisPredictions = z.infer<typeof TennisPredictionsSchema>;
export type HockeyPredictions = z.infer<typeof HockeyPredictionsSchema>;
