import { z } from 'zod';

export const SportSchema = z.enum(['football', 'basketball', 'tennis', 'baseball', 'american-football', 'hockey']);

export const MatchParamsSchema = z.object({
    sport: SportSchema,
    eventId: z.string().regex(/^\d+$/, 'Event ID must be numeric'),
});

export const PredictionRequestSchema = z.object({
    sport: SportSchema,
    eventId: z.string().or(z.number()),
    lang: z.string().optional().default('es'),
});

// Helper to validate params in Next.js API routes (Next 15+)
export async function validateParams<T>(
    params: Promise<any> | any,
    schema: z.ZodSchema<T>
): Promise<T> {
    const resolvedParams = await Promise.resolve(params);
    return schema.parseAsync(resolvedParams);
}
