/**
 * Prediction Tracking Service - Sistema de ML para rastrear predicciones
 * Guarda cada predicción y la compara con resultados reales
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, Timestamp } from 'firebase/firestore';

export interface PredictionRecord {
    predictionId: string;
    gameId: string;
    sport: string;
    league?: string;
    homeTeam: string;
    awayTeam: string;

    // Predicción original
    predictedWinner: string;
    predictedScore?: string;
    confidence: number;

    // Mercados predichos
    markets: {
        overUnder?: { prediction: string; line: number; confidence?: string };
        btts?: { prediction: string; confidence?: string };
        corners?: { total: number; pick: string; line: number };
        cards?: { yellowCards: number; redCards: number };
        h2hAnalysis?: {
            averageGoals?: number;
            averagePoints?: number;
            trend?: string;
        };
    };

    // Metadata
    timestamp: Date;
    modelUsed: string;
    temperature: number;
    promptVersion?: string;

    // Resultado real (se llena después)
    actualWinner?: string;
    actualScore?: string;
    actualTotalGoals?: number;
    actualTotalPoints?: number;

    // Evaluación
    wasCorrect?: boolean;
    marketAccuracy?: {
        overUnder?: boolean;
        btts?: boolean;
        corners?: boolean;
    };
    evaluatedAt?: Date;
    accuracyScore?: number; // 0-100
}

export interface AccuracyStats {
    sport: string;
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    marketAccuracy: {
        winner: number;
        overUnder: number;
        btts?: number;
    };
    avgConfidence: number;
    period: 'all' | 'week' | 'month';
}

class PredictionTrackingService {
    /**
     * Guardar nueva predicción
     */
    async savePrediction(prediction: Omit<PredictionRecord, 'predictionId' | 'timestamp'>) {
        try {
            if (!db) {
                console.error('Firebase not initialized');
                return null;
            }

            const trackingRef = collection(db, 'predictionTracking');
            const docRef = await addDoc(trackingRef, {
                ...prediction,
                timestamp: Timestamp.now(),
                evaluatedAt: null,
                wasCorrect: null,
            });

            console.log(`✅ Predicción guardada: ${docRef.id} para juego ${prediction.gameId}`);
            return docRef.id;
        } catch (error) {
            console.error('Error guardando predicción:', error);
            return null;
        }
    }

    /**
     * Evaluar predicción con resultado real
     */
    async evaluatePrediction(predictionId: string, actualResult: {
        winner: string;
        score: string;
        totalGoals?: number;
        totalPoints?: number;
        btts?: boolean;
    }) {
        try {
            if (!db) return false;

            const predRef = doc(db, 'predictionTracking', predictionId);
            const predSnap = await getDoc(predRef);

            if (!predSnap.exists()) {
                console.error(`Predicción ${predictionId} no encontrada`);
                return false;
            }

            const prediction = predSnap.data() as PredictionRecord;

            // Evaluar ganador
            const wasCorrect = prediction.predictedWinner === actualResult.winner;

            // Evaluar mercados
            const marketAccuracy: any = {};

            // OVER/UNDER
            if (prediction.markets.overUnder && actualResult.totalGoals !== undefined) {
                const predictedOver = prediction.markets.overUnder.prediction.toLowerCase().includes('más de');
                const actualOver = actualResult.totalGoals > prediction.markets.overUnder.line;
                marketAccuracy.overUnder = predictedOver === actualOver;
            }

            // BTTS (Both Teams To Score)
            if (prediction.markets.btts && actualResult.btts !== undefined) {
                const predictedBtts = prediction.markets.btts.prediction.toLowerCase() === 'sí';
                marketAccuracy.btts = predictedBtts === actualResult.btts;
            }

            // Calcular score de precisión (0-100)
            let accuracyScore = 0;
            let totalChecks = 1; // ganador siempre cuenta

            if (wasCorrect) accuracyScore += 50;

            if (marketAccuracy.overUnder !== undefined) {
                totalChecks++;
                if (marketAccuracy.overUnder) accuracyScore += 25;
            }

            if (marketAccuracy.btts !== undefined) {
                totalChecks++;
                if (marketAccuracy.btts) accuracyScore += 25;
            }

            accuracyScore = Math.round((accuracyScore / (totalChecks * 50)) * 100);

            // Actualizar documento
            await updateDoc(predRef, {
                actualWinner: actualResult.winner,
                actualScore: actualResult.score,
                actualTotalGoals: actualResult.totalGoals,
                actualTotalPoints: actualResult.totalPoints,
                wasCorrect,
                marketAccuracy,
                accuracyScore,
                evaluatedAt: Timestamp.now(),
            });

            console.log(`✅ Predicción evaluada: ${predictionId} - Correcto: ${wasCorrect}, Score: ${accuracyScore}%`);
            return true;
        } catch (error) {
            console.error('Error evaluando predicción:', error);
            return false;
        }
    }

    /**
     * Obtener estadísticas de precisión
     */
    async getAccuracyStats(sport?: string, period: 'all' | 'week' | 'month' = 'all'): Promise<AccuracyStats[]> {
        try {
            if (!db) return [];

            let q = query(
                collection(db, 'predictionTracking'),
                where('evaluatedAt', '!=', null),
                orderBy('evaluatedAt', 'desc')
            );

            if (sport) {
                q = query(q, where('sport', '==', sport));
            }

            // Filtro de período
            if (period !== 'all') {
                const now = new Date();
                const daysAgo = period === 'week' ? 7 : 30;
                const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
                q = query(q, where('evaluatedAt', '>=', Timestamp.fromDate(cutoffDate)));
            }

            const snapshot = await getDocs(q);
            const predictions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PredictionRecord));

            // Agrupar por deporte
            const statsBySport = new Map<string, {
                total: number;
                correct: number;
                overUnderCorrect: number;
                overUnderTotal: number;
                bttsCorrect: number;
                bttsTotal: number;
                totalConfidence: number;
            }>();

            predictions.forEach(pred => {
                const sportKey = pred.sport;
                if (!statsBySport.has(sportKey)) {
                    statsBySport.set(sportKey, {
                        total: 0,
                        correct: 0,
                        overUnderCorrect: 0,
                        overUnderTotal: 0,
                        bttsCorrect: 0,
                        bttsTotal: 0,
                        totalConfidence: 0,
                    });
                }

                const stats = statsBySport.get(sportKey)!;
                stats.total++;
                stats.totalConfidence += pred.confidence;
                if (pred.wasCorrect) stats.correct++;

                if (pred.marketAccuracy?.overUnder !== undefined) {
                    stats.overUnderTotal++;
                    if (pred.marketAccuracy.overUnder) stats.overUnderCorrect++;
                }

                if (pred.marketAccuracy?.btts !== undefined) {
                    stats.bttsTotal++;
                    if (pred.marketAccuracy.btts) stats.bttsCorrect++;
                }
            });

            // Convertir a formato AccuracyStats
            const results: AccuracyStats[] = [];
            statsBySport.forEach((stats, sportKey) => {
                results.push({
                    sport: sportKey,
                    totalPredictions: stats.total,
                    correctPredictions: stats.correct,
                    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
                    marketAccuracy: {
                        winner: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
                        overUnder: stats.overUnderTotal > 0
                            ? Math.round((stats.overUnderCorrect / stats.overUnderTotal) * 100)
                            : 0,
                        btts: stats.bttsTotal > 0
                            ? Math.round((stats.bttsCorrect / stats.bttsTotal) * 100)
                            : 0,
                    },
                    avgConfidence: stats.total > 0 ? Math.round(stats.totalConfidence / stats.total) : 0,
                    period,
                });
            });

            return results.sort((a, b) => b.totalPredictions - a.totalPredictions);
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return [];
        }
    }

    /**
     * Obtener predicciones pendientes de evaluación
     */
    async getPendingEvaluations(limitCount = 50) {
        try {
            if (!db) return [];

            const q = query(
                collection(db, 'predictionTracking'),
                where('evaluatedAt', '==', null),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PredictionRecord));
        } catch (error) {
            console.error('Error obteniendo predicciones pendientes:', error);
            return [];
        }
    }
}

export const predictionTrackingService = new PredictionTrackingService();
