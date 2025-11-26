'use client';

import { useState } from 'react';
import { generatePrediction, type PredictionRequest, type PredictionResult } from '@/lib/predictionService';
import { useAuth } from '@/contexts/AuthContext';
import PredictionAnalysis from '@/components/analysis/PredictionAnalysis';

interface PredictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameInfo: {
        id: string;
        homeTeam: string;
        awayTeam: string;
        date: Date;
    };
}

export default function PredictionModal({ isOpen, onClose, gameInfo }: PredictionModalProps) {
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const { user, usePrediction, checkPredictionLimit } = useAuth();

    if (!isOpen) return null;

    const handleGeneratePrediction = async () => {
        if (!user) {
            alert('Debes iniciar sesión para ver predicciones');
            return;
        }

        // Check if user can make prediction
        // const { canPredict, remaining } = await checkPredictionLimit();

        // TEMPORARY: Allow all predictions for testing
        // if (!canPredict) {
        //     alert('Has alcanzado tu límite diario de predicciones. Actualiza a Premium para predicciones ilimitadas.');
        //     return;
        // }

        setLoading(true);
        try {
            const request: PredictionRequest = {
                gameId: gameInfo.id,
                homeTeam: gameInfo.homeTeam,
                awayTeam: gameInfo.awayTeam,
                date: gameInfo.date
            };

            const result = await generatePrediction(request);
            setPrediction(result);

            // Increment user's prediction count
            await usePrediction();
        } catch (error) {
            console.error('Error generating prediction:', error);
            alert('Error al generar predicción. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
            <div className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Predicción IA</h2>
                        <p className="text-[var(--text-muted)] text-sm">
                            {gameInfo.homeTeam} vs {gameInfo.awayTeam}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:text-[var(--danger)] transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                {!prediction ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🤖</div>
                        <h3 className="text-xl font-bold mb-2">Análisis con IA</h3>
                        <p className="text-[var(--text-muted)] mb-6">
                            Nuestro modelo de IA analizará miles de datos históricos para darte la mejor predicción
                        </p>

                        {/* Limit display hidden for testing
                        {user && !user.isPremium && (
                            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 mb-6">
                                <p className="text-sm text-[var(--text-muted)]">
                                    Predicciones restantes hoy: <span className="text-[var(--primary)] font-bold">{user.predictionsLimit - user.predictionsUsed}/{user.predictionsLimit}</span>
                                </p>
                            </div>
                        )}
                        */}

                        <button
                            onClick={handleGeneratePrediction}
                            disabled={loading}
                            className="btn-primary px-8 py-3 rounded-lg font-bold disabled:opacity-50"
                        >
                            {loading ? 'Analizando...' : 'Generar Predicción'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Pick */}
                        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-6 rounded-lg text-center">
                            <div className="text-sm font-bold text-black opacity-75 mb-2">PICK RECOMENDADO</div>
                            <div className="text-3xl font-bold text-black mb-2">{prediction.pick}</div>
                            <div className="text-lg text-black opacity-90">{prediction.odds}</div>
                        </div>

                        {/* Confidence */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Confianza</span>
                                <span className="text-sm font-bold text-[var(--primary)]">{prediction.confidence}%</span>
                            </div>
                            <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${prediction.confidence}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Wizard Tip */}
                        <div className="glass-card p-4 border-2 border-[var(--secondary)]">
                            <div className="font-bold text-[var(--secondary)] mb-2">💡 Consejo del Mago</div>
                            <p className="text-sm">{prediction.wizardTip}</p>
                        </div>

                        {/* Analysis & Graph */}
                        <PredictionAnalysis
                            homeTeam={gameInfo.homeTeam}
                            awayTeam={gameInfo.awayTeam}
                            analysis={prediction.analysis}
                            factors={prediction.factors}
                        />

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setPrediction(null);
                                    handleGeneratePrediction();
                                }}
                                className="flex-1 btn-outline py-3 rounded-lg font-bold"
                            >
                                Nueva Predicción
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 btn-primary py-3 rounded-lg font-bold"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                {/* Premium Upsell */}
                {user && !user.isPremium && prediction && (
                    <div className="mt-6 p-4 bg-[rgba(255,255,255,0.05)] border border-[var(--primary)] rounded-lg text-center">
                        <p className="text-sm mb-2">
                            ¿Quieres predicciones ilimitadas?
                        </p>
                        <a href="/profile#upgrade" className="text-[var(--primary)] font-bold hover:underline">
                            Actualiza a Premium →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
