'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { generatePrediction } from '@/lib/predictionService';
import { useAuth } from '@/contexts/AuthContext';

import { API_URL } from '@/lib/api';

interface AIPredictionCardProps {
    eventId: string;
    sport: string;
}

export default function AIPredictionCard({ eventId, sport }: AIPredictionCardProps) {
    const { user } = useAuth();
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        try {
            setLoading(true);
            setError(null);
            const toastId = toast.loading('Analizando estadísticas del partido...');

            // Use the centralized prediction service
            // details are fetched server-side by the API now, so we only need ID and sport
            const result = await generatePrediction({
                gameId: eventId,
                sport: sport as 'basketball' | 'football'
            });

            if (result) {
                setPrediction(result);
                toast.success('¡Predicción generada con éxito!', { id: toastId });

                // Trigger Confetti if confidence is high
                if (result.confidence && (
                    (typeof result.confidence === 'number' && result.confidence >= 75) ||
                    (typeof result.confidence === 'string' && parseInt(result.confidence) >= 75)
                )) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#a855f7', '#06b6d4', '#ffffff'] // Brand colors
                    });
                }

            } else {
                setError('No se pudo generar la predicción');
                toast.error('No se pudo generar la predicción', { id: toastId });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al generar predicción');
            toast.error(err.message || 'Error al generar predicción');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 shadow-2xl border border-purple-500/30 mt-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">✨</span> PickGenius AI
                    </h2>
                    {!prediction && (
                        <button
                            onClick={handlePredict}
                            disabled={loading}
                            className="px-6 py-2 bg-white text-purple-900 font-bold rounded-full hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-purple-900 border-t-transparent rounded-full"></div>
                                    Analizando...
                                </>
                            ) : (
                                'Generar Predicción'
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {prediction && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/30 p-4 rounded-lg">
                                <p className="text-purple-300 text-xs uppercase font-bold mb-1">Ganador Probable</p>
                                <p className="text-xl font-bold text-white">{prediction.winner || 'N/A'}</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-lg">
                                <p className="text-purple-300 text-xs uppercase font-bold mb-1">Confianza</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-400 rounded-full"
                                            style={{ width: (typeof prediction.confidence === 'string' ? prediction.confidence : `${prediction.confidence}%`) }}
                                        ></div>
                                    </div>
                                    <span className="text-white font-bold">
                                        {typeof prediction.confidence === 'number' ? `${prediction.confidence}%` : prediction.confidence}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-purple-300 text-xs uppercase font-bold mb-2">Análisis de IA</p>
                            <p className="text-gray-200 leading-relaxed text-sm">
                                {prediction.reasoning}
                            </p>
                        </div>

                        {/* PREMIUM CONTENT SECTION */}
                        <div className="relative">

                            {/* Locked Overlay for Non-Premium */}
                            {!user?.isPremium && (
                                <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/50 rounded-lg flex flex-col items-center justify-center text-center p-6 border border-white/10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse-slow">
                                        <span className="text-3xl">🔒</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Análisis Profesional Bloqueado</h3>
                                    <p className="text-gray-300 mb-6 max-w-xs text-sm">
                                        Obtén acceso a predicciones de goles, córners, tarjetas y factores clave.
                                    </p>
                                    <a
                                        href="/pricing"
                                        className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10"
                                    >
                                        Desbloquear Premium ($5)
                                    </a>
                                </div>
                            )}

                            <div className={!user?.isPremium ? 'opacity-20 pointer-events-none select-none filter blur-sm' : ''}>
                                {/* COMPREHENSIVE PREDICTIONS */}
                                {prediction.predictions && (
                                    <div className="space-y-3">
                                        <h4 className="text-yellow-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                            📊 Predicciones Detalladas <span className="bg-yellow-400/20 text-yellow-300 text-[10px] px-2 rounded-full border border-yellow-400/30">PRO</span>
                                        </h4>

                                        {/* Score & Goals */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-3 rounded-lg border border-blue-500/20">
                                                <p className="text-blue-300 text-[10px] uppercase font-bold mb-1">Marcador Final</p>
                                                <p className="text-white font-bold text-lg">{prediction.predictions.finalScore || '-'}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-3 rounded-lg border border-green-500/20">
                                                <p className="text-green-300 text-[10px] uppercase font-bold mb-1">Total Goles</p>
                                                <p className="text-white font-bold text-lg">{prediction.predictions.totalGoals || '-'}</p>
                                            </div>
                                        </div>

                                        {/* Corners */}
                                        {prediction.predictions.corners && (
                                            <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-500/20">
                                                <p className="text-orange-300 text-[10px] uppercase font-bold mb-2">🚩 Córners Esperados</p>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div className="text-center">
                                                        <p className="text-gray-400">Local</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.corners.home}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">Total</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.corners.total}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">Visitante</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.corners.away}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Shots */}
                                        {prediction.predictions.shots && (
                                            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/20">
                                                <p className="text-red-300 text-[10px] uppercase font-bold mb-2">🎯 Tiros Esperados</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                    <div className="text-center">
                                                        <p className="text-gray-400">Local</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.shots.home}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">Visitante</p>
                                                        <p className="text-white font-bold text-lg">{prediction.predictions.shots.away}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 text-xs">{prediction.predictions.shots.onTarget}</p>
                                            </div>
                                        )}

                                        {/* Cards */}
                                        {prediction.predictions.cards && (
                                            <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/20">
                                                <p className="text-yellow-300 text-[10px] uppercase font-bold mb-2">🟨 Tarjetas</p>
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                    <div className="text-center">
                                                        <p className="text-gray-400">Amarillas</p>
                                                        <p className="text-yellow-400 font-bold text-lg">{prediction.predictions.cards.yellowCards}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-gray-400">Rojas</p>
                                                        <p className="text-red-400 font-bold text-lg">{prediction.predictions.cards.redCards}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 text-xs">{prediction.predictions.cards.details}</p>
                                            </div>
                                        )}

                                        {/* Offsides */}
                                        {prediction.predictions.offsides && (
                                            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                                                <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">⛔ Fueras de Juego</p>
                                                <p className="text-white font-bold text-lg mb-1">{prediction.predictions.offsides.total} totales</p>
                                                <p className="text-gray-300 text-xs">{prediction.predictions.offsides.details}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Key Factors */}
                                {prediction.keyFactors && prediction.keyFactors.length > 0 && (
                                    <div className="bg-black/30 p-4 rounded-lg mt-3">
                                        <p className="text-purple-300 text-xs uppercase font-bold mb-2">🔑 Factores Clave</p>
                                        <ul className="space-y-1">
                                            {prediction.keyFactors.map((factor: string, idx: number) => (
                                                <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                                    <span className="text-purple-400 mt-0.5">•</span>
                                                    <span>{factor}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {prediction.bettingTip && (
                                    <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg flex items-start gap-3 mt-3">
                                        <span className="text-2xl">💰</span>
                                        <div>
                                            <p className="text-green-300 text-xs uppercase font-bold mb-1">Recomendación de Apuesta</p>
                                            <p className="text-white font-bold">{prediction.bettingTip}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <button
                                onClick={handlePredict}
                                className="text-xs text-purple-300 hover:text-white underline"
                            >
                                Actualizar Análisis
                            </button>
                        </div>
                    </div>
                )}

                {!prediction && !loading && !error && (
                    <p className="text-purple-200 text-sm opacity-80">
                        Haz clic para que Gemini analice las estadísticas en tiempo real y prediga el resultado.
                    </p>
                )}
            </div>
        </div>
    );
}
