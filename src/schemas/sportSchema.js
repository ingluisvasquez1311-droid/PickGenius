const { z } = require('zod');

const sportParamSchema = z.object({
    sport: z.enum(['football', 'basketball', 'tennis', 'nhl', 'nfl', 'baseball'])
});

const eventIdParamSchema = z.object({
    eventId: z.string().or(z.number())
});

const predictSchema = z.object({
    playerId: z.string().or(z.number()),
    playerName: z.string(),
    propType: z.string(),
    line: z.number(),
    eventId: z.string().or(z.number())
});

module.exports = {
    sportParamSchema,
    eventIdParamSchema,
    predictSchema
};
