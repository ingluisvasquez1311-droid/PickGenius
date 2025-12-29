import { z } from 'zod';

export const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

export const sportParamSchema = z.enum(['football', 'basketball', 'tennis', 'nhl', 'nfl', 'american-football', 'baseball', 'ice-hockey']);
