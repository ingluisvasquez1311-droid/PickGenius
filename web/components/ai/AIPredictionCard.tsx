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
                        {/* PROMINENT WINNER BADGE */}
                        <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-center shadow-2xl shadow-yellow-500/30 border-2 border-yellow-400">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg">
                                <span className="text-4xl">🏆</span>
                            </div>
                            <p className="text-black/70 text-xs uppercase font-bold mb-2 mt-2">Ganador Predicho</p>
                            <p className="text-2xl md:text-3xl font-black text-black">{prediction.winner || 'Analizando...'}</p>
                            <div className="mt-3 flex items-center justify-center gap-2">
                                <div className="flex-1 max-w-xs h-3 bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black rounded-full transition-all duration-500"
                                        style={{ width: (typeof prediction.confidence === 'string' ? prediction.confidence : `${prediction.confidence}%`) }}
                                    ></div>
                                </div>
                                <span className="text-black font-black text-xl">
                                    {typeof prediction.confidence === 'number' ? `${prediction.confidence}%` : prediction.confidence}
                                </span>
                            </div>
                            <p className="text-black/60 text-xs mt-2 font-semibold">Confianza de la IA</p>
                        </div>

                        <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-purple-300 text-xs uppercase font-bold mb-2">Análisis de IA</p>
                            <p className="text-gray-200 leading-relaxed text-sm">
                                {prediction.reasoning}
                            </p>
                        </div>


                        {/* UNLOCKED STATS FOR EVERYONE (Goals, Corners, Shots) */}
                        {prediction.predictions && (
                            <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
                                    📈 Estadísticas del Partido
                                </h4>

                                {/* Goals & Shots Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Total Goals */}
                                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-3 rounded-lg border border-green-500/20">
                                        <p className="text-green-300 text-[10px] uppercase font-bold mb-1">Total Goles</p>
                                        <p className="text-white font-bold text-lg">{prediction.predictions.totalGoals || '-'}</p>
                                    </div>

                                    {/* Shots (Summary) */}
                                    {prediction.predictions.shots && (
                                        <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/20">
                                            <p className="text-red-300 text-[10px] uppercase font-bold mb-1">Tiros al Arco</p>
                                            <p className="text-white font-bold text-lg">{prediction.predictions.shots.onTarget || '-'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Corners Detail */}
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
                            </div>
                        )}

                        {/* PREMIUM CONTENT SECTION (Exact Score, Cards, Factors) */}
                        <div className="relative mt-4">

                            {/* Locked Overlay for Non-Premium */}
                            {!user?.isPremium && (
                                <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/60 rounded-lg flex flex-col items-center justify-center text-center p-6 border border-white/10">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(251,191,36,0.4)] animate-pulse-slow">
                                        <span className="text-2xl">👑</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">Análisis VIP Bloqueado</h3>
                                    <p className="text-gray-400 mb-4 max-w-xs text-xs">
                                        Desbloquear Marcador Exacto, Tarjetas, Factores Clave y Picks Exclusivos.
                                    </p>
                                    <a
                                        href="/pricing"
                                        className="bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform text-sm shadow-lg shadow-white/10"
                                    >
                                        Ser Premium ($5)
                                    </a>
                                </div>
                            )}

                            <div className={!user?.isPremium ? 'opacity-10 pointer-events-none select-none filter blur-sm' : ''}>
                                {prediction.predictions && (
                                    <div className="space-y-3">
                                        <h4 className="text-yellow-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 mt-6 mb-2">
                                            🌟 Detalles Premium
                                        </h4>

                                        {/* Exact Score & Cards */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-3 rounded-lg border border-blue-500/20 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-bl">EXACTO</div>
                                                <p className="text-blue-300 text-[10px] uppercase font-bold mb-1">Marcador Exacto</p>
                                                <p className="text-white font-bold text-xl">{prediction.predictions.finalScore || '-'}</p>
                                            </div>

                                            {/* Cards */}
                                            {prediction.predictions.cards && (
                                                <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/20">
                                                    <p className="text-yellow-300 text-[10px] uppercase font-bold mb-1">🟨 Tarjetas</p>
                                                    <p className="text-white font-bold text-lg">
                                                        {prediction.predictions.cards.yellowCards + prediction.predictions.cards.redCards} <span className="text-xs font-normal text-gray-400">Totales</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Key Factors */}
                                        {prediction.keyFactors && prediction.keyFactors.length > 0 && (
                                            <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                                                <p className="text-purple-300 text-xs uppercase font-bold mb-2">🧠 Inteligencia Táctica</p>
                                                <ul className="space-y-2">
                                                    {prediction.keyFactors.map((factor: string, idx: number) => (
                                                        <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                                            <span className="text-green-400 mt-1 text-xs">✓</span>
                                                            <span>{factor}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Offsides */}
                                        {prediction.predictions.offsides && (
                                            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                                                <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">⛔ Fueras de Juego</p>
                                                <p className="text-white font-bold text-lg mb-1">{prediction.predictions.offsides.total} totales</p>
                                            </div>
                                        )}
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
