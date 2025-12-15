import { sofaScoreFootballService } from './services/sofaScoreFootballService';
import { getTodayGames as getNBAGames } from './nbaDataService';
import { PredictionResult, generatePrediction } from './predictionService';
import { getCachedOrFetch } from './apiCache';

interface WizardPick {
    match: {
        id: string;
        homeTeam: string;
        awayTeam: string;
        league: string;
        date: Date;
    };
    prediction: PredictionResult;
}

/**
 * Get the Wizard's top pick of the day
 * Automatically selects the highest confidence prediction
 * and rotates between different leagues
 */
export async function getWizardPick(sport: 'nba' | 'football'): Promise<WizardPick | null> {
    const cacheKey = `wizard_pick_${sport}_${new Date().toDateString()}`;

    return getCachedOrFetch(cacheKey, async () => {
        try {
            // 1. Get all matches for today
            let todayMatches: any[] = [];

            if (sport === 'football') {
                const response = await sofaScoreFootballService.getLiveEvents();
                if (response.success && response.data?.events) {
                    todayMatches = response.data.events;
                }
            } else {
                todayMatches = await getNBAGames();
            }

            if (!todayMatches || todayMatches.length === 0) {
                return null;
            }

            // 2. Generate predictions for top matches (limit to avoid API quotas)
            const predictions = await Promise.all(
                todayMatches.slice(0, 10).map(async (match: any) => {
                    try {
                        const prediction = await generatePrediction({
                            gameId: match.id.toString(),
                            homeTeam: match.homeTeam.name || match.homeTeam,
                            awayTeam: match.awayTeam.name || match.awayTeam,
                            date: new Date(match.utcDate || match.date)
                        });

                        return {
                            match: {
                                id: match.id.toString(),
                                homeTeam: match.homeTeam.name || match.homeTeam,
                                awayTeam: match.awayTeam.name || match.awayTeam,
                                league: match.competition?.name || match.league || (sport === 'football' ? 'Football' : 'NBA'),
                                date: new Date(match.utcDate || match.date)
                            },
                            prediction
                        };
                    } catch (error) {
                        console.error(`Failed to generate prediction for match ${match.id}:`, error);
                        return null;
                    }
                })
            );

            // Filter out failed predictions
            const validPredictions = predictions.filter((p): p is WizardPick => p !== null);

            if (validPredictions.length === 0) {
                return null;
            }

            // 3. Sort by confidence
            const sorted = validPredictions.sort((a, b) =>
                b.prediction.confidence - a.prediction.confidence
            );

            // Return the best pick
            return sorted[0];
        } catch (error) {
            console.error('Error generating wizard pick:', error);
            return null;
        }
    }, 3600000); // Cache for 1 hour
}

/**
 * Get multiple wizard picks for variety
 */
export async function getWizardPicks(sport: 'nba' | 'football', count: number = 3): Promise<WizardPick[]> {
    const cacheKey = `wizard_picks_${sport}_${count}_${new Date().toDateString()}`;

    return getCachedOrFetch(cacheKey, async () => {
        try {
            // 1. Get all matches for today
            let todayMatches: any[] = [];

            if (sport === 'football') {
                const response = await sofaScoreFootballService.getLiveEvents();
                if (response.success && response.data?.events) {
                    todayMatches = response.data.events;
                }
            } else {
                todayMatches = await getNBAGames();
            }

            if (!todayMatches || todayMatches.length === 0) {
                return [];
            }

            // 2. Generate predictions
            const predictions = await Promise.all(
                todayMatches.slice(0, 15).map(async (match: any) => {
                    try {
                        const prediction = await generatePrediction({
                            gameId: match.id.toString(),
                            homeTeam: match.homeTeam.name || match.homeTeam,
                            awayTeam: match.awayTeam.name || match.awayTeam,
                            date: new Date(match.utcDate || match.date)
                        });

                        return {
                            match: {
                                id: match.id.toString(),
                                homeTeam: match.homeTeam.name || match.homeTeam,
                                awayTeam: match.awayTeam.name || match.awayTeam,
                                league: match.competition?.name || match.league || (sport === 'football' ? 'Football' : 'NBA'),
                                date: new Date(match.utcDate || match.date)
                            },
                            prediction
                        };
                    } catch (error) {
                        return null;
                    }
                })
            );

            const validPredictions = predictions.filter((p): p is WizardPick => p !== null);

            // 3. Sort by confidence
            const sorted = validPredictions.sort((a, b) =>
                b.prediction.confidence - a.prediction.confidence
            );

            // 4. Select top picks from different leagues
            const diversePicks: WizardPick[] = [];
            const usedLeagues = new Set<string>();

            for (const pick of sorted) {
                if (diversePicks.length >= count) break;

                if (!usedLeagues.has(pick.match.league)) {
                    diversePicks.push(pick);
                    usedLeagues.add(pick.match.league);
                }
            }

            // Fill remaining slots with highest confidence picks
            while (diversePicks.length < count && diversePicks.length < sorted.length) {
                const nextPick = sorted.find((p: WizardPick) => !diversePicks.includes(p));
                if (nextPick) {
                    diversePicks.push(nextPick);
                } else {
                    break;
                }
            }

            return diversePicks;
        } catch (error) {
            console.error('Error generating wizard picks:', error);
            return [];
        }
    }, 3600000); // Cache for 1 hour
}
