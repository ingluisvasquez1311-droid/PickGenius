import { z } from 'zod';

/**
 * Zod Schemas for Sofascore Data Validation
 * Ensures runtime safety and prevents "undefined" errors if API structure changes.
 */

export const SofaScoreTeamSchema = z.object({
    id: z.number(),
    name: z.string(),
    shortName: z.string().optional(),
    slug: z.string().optional(),
});

export const SofaScoreEventSchema = z.object({
    id: z.number(),
    startTimestamp: z.number(),
    slug: z.string().optional(),
    homeTeam: SofaScoreTeamSchema,
    awayTeam: SofaScoreTeamSchema,
    homeScore: z.object({
        current: z.number().optional(),
        display: z.number().optional(),
        period1: z.number().optional(),
        period2: z.number().optional()
    }).optional(),
    awayScore: z.object({
        current: z.number().optional(),
        display: z.number().optional(),
        period1: z.number().optional(),
        period2: z.number().optional()
    }).optional(),
    status: z.object({
        code: z.number(),
        description: z.string(),
        type: z.string()
    }),
    tournament: z.object({
        name: z.string(),
        slug: z.string().optional(),
        category: z.object({
            name: z.string(),
            slug: z.string().optional()
        }).optional()
    }).optional(),
    lastPeriod: z.string().optional(),
    mainOdds: z.any().optional() // Computed field in our routes
});

export const SofaScoreLiveResponseSchema = z.object({
    events: z.array(z.any()).catch([]) // We use .any() for the initial array and then validate individual items or just catch errors
});

export const SofaScoreOddsSchema = z.object({
    markets: z.array(z.object({
        marketName: z.string(),
        choices: z.array(z.object({
            name: z.string(),
            fractionalValue: z.string().optional(),
            decimalValue: z.string().optional(),
            change: z.number().optional()
        })).optional()
    })).optional()
}).catch({ markets: [] });
