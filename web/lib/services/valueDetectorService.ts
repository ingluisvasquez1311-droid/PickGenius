/**
 * Value Detector - Sistema de cálculo de Expected Value (EV)
 * Detecta apuestas con valor positivo comparando IA vs mercado
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export interface ValueOpportunity {
    id?: string;
    gameId: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    market: string; // 'winner', 'overUnder', 'btts', etc

    // Probabilidad de la IA
    aiProbability: number; // 0-1
    aiConfidence: number; // 0-100

    // Cuota del mercado
    marketOdds: number; // Ej: 2.50
    impliedProbability: number; // Probabilidad implícita de la cuota

    // Cálculo de valor
    expectedValue: number; // EV en porcentaje
    kellyStake?: number; // Kelly Criterion stake %

    // Metadata
    recommendation: string;
    timestamp: Date;
    expiresAt: Date;

    // Seguimiento
    wasTriggered?: boolean;
    actualResult?: string;
    profit?: number;
}

class ValueDetectorService {
    /**
     * Calcular Expected Value
     * EV = (Probabilidad_IA × Cuota_Mercado) - 1
     */
    calculateEV(aiProbability: number, marketOdds: number): number {
        const ev = (aiProbability * marketOdds) - 1;
        return Math.round(ev * 10000) / 100; // Porcentaje con 2 decimales
    }

    /**
     * Calcular probabilidad implícita desde cuota
     */
    calculateImpliedProbability(odds: number): number {
        return 1 / odds;
    }

    /**
     * Calcular Kelly Criterion para stake óptimo
     * Kelly % = (probabilidad × cuota - 1) / (cuota - 1)
     */
    calculateKelly(probability: number, odds: number): number {
        const kelly = (probability * odds - 1) / (odds - 1);
        // Usar Kelly fraccional (25% del Kelly completo para ser conservadores)
        const fractionalKelly = kelly * 0.25;
        return Math.max(0, Math.min(fractionalKelly, 0.05)); // Max 5% del bankroll
    }

    /**
     * Detectar valor en una predicción
     */
    async detectValue(params: {
        gameId: string;
        sport: string;
        homeTeam: string;
        awayTeam: string;
        market: string;
        aiProbability: number;
        aiConfidence: number;
        marketOdds: number;
    }): Promise<ValueOpportunity | null> {
        try {
            const {
                gameId,
                sport,
                homeTeam,
                awayTeam,
                market,
                aiProbability,
                aiConfidence,
                marketOdds,
            } = params;

            // Calcular métricas
            const impliedProbability = this.calculateImpliedProbability(marketOdds);
            const expectedValue = this.calculateEV(aiProbability, marketOdds);
            const kellyStake = this.calculateKelly(aiProbability, marketOdds);

            // Solo considerar si EV > 10% (threshold de valor)
            if (expectedValue < 10) {
                return null;
            }

            // Determinar recomendación
            let recommendation = '';
            if (expectedValue >= 20) {
                recommendation = '🔥 VALOR ALTO - Apuesta fuerte recomendada';
            } else if (expectedValue >= 15) {
                recommendation = '⚡ BUEN VALOR - Apuesta moderada';
            } else {
                recommendation = '✓ VALOR DETECTADO - Apuesta pequeña';
            }

            // Expira 2 horas después (partidos generalmente empiezan en 2-4h)
            const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

            const opportunity: ValueOpportunity = {
                gameId,
                sport,
                homeTeam,
                awayTeam,
                market,
                aiProbability,
                aiConfidence,
                marketOdds,
                impliedProbability,
                expectedValue,
                kellyStake,
                recommendation,
                timestamp: new Date(),
                expiresAt,
            };

            // Guardar en Firestore si es valor alto (>15%)
            if (expectedValue >= 15 && db) {
                const valueRef = collection(db, 'valueOpportunities');
                const docRef = await addDoc(valueRef, {
                    ...opportunity,
                    timestamp: Timestamp.now(),
                    expiresAt: Timestamp.fromDate(expiresAt),
                });
                opportunity.id = docRef.id;

                console.log(`💎 Valor detectado: ${expectedValue}% EV en ${homeTeam} vs ${awayTeam} (${market})`);
            }

            return opportunity;
        } catch (error) {
            console.error('Error detecting value:', error);
            return null;
        }
    }

    /**
     * Obtener oportunidades activas de valor
     */
    async getActiveOpportunities(sport?: string, minEV = 10): Promise<ValueOpportunity[]> {
        try {
            if (!db) return [];

            const now = new Date();
            let q = query(
                collection(db, 'valueOpportunities'),
                where('expiresAt', '>', Timestamp.fromDate(now)),
                where('expectedValue', '>=', minEV),
                orderBy('expiresAt', 'asc'),
                orderBy('expectedValue', 'desc'),
                limit(50)
            );

            if (sport) {
                q = query(q, where('sport', '==', sport));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate(),
                expiresAt: doc.data().expiresAt?.toDate(),
            } as ValueOpportunity));
        } catch (error) {
            console.error('Error fetching value opportunities:', error);
            return [];
        }
    }

    /**
     * Simular valor para cuotas ficticias (para testing)
     */
    simulateFromConfidence(confidence: number): {
        aiProbability: number;
        suggestedOdds: number;
        minOddsForValue: number;
    } {
        // Convertir confianza de IA a probabilidad
        const aiProbability = confidence / 100;

        // Cuota justa (sin margen de la casa)
        const fairOdds = 1 / aiProbability;

        // Cuota mínima para tener 10% EV
        const minOddsForValue = 1.1 / aiProbability;

        return {
            aiProbability,
            suggestedOdds: Math.round(fairOdds * 100) / 100,
            minOddsForValue: Math.round(minOddsForValue * 100) / 100,
        };
    }
}

export const valueDetectorService = new ValueDetectorService();
