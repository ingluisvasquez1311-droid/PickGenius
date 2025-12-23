'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Zap, Shield, TrendingUp, Target, X, Star, Crown, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePrediction } from '@/lib/predictionService';
import { useAuth } from '@/contexts/AuthContext';

import { API_URL } from '@/lib/api';

interface AIPredictionCardProps {
    eventId: string | number;
    sport: string;
}

export default function AIPredictionCard({ eventId, sport }: AIPredictionCardProps) {
    const { user, notify } = useAuth();
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        try {
            setLoading(true);
            setError(null);

            const toastId = toast.loading('Consultando el Oráculo de PickGenius...', {
                description: 'Invocando estadísticas históricas y momentum...'
            });

            // Simulate steps for a more "pro" feeling
            setTimeout(() => {
                toast.loading('Analizando alineaciones y mística del campo...', { id: toastId });
            }, 1000);

            setTimeout(() => {
                toast.loading('Calculando probabilidades con el Motor Genius...', { id: toastId });
            }, 2500);

            const result = await generatePrediction({
                gameId: eventId.toString(),
                sport: sport as any
            });

            if (result) {
                const confidenceVal = typeof result.confidence === 'number'
                    ? result.confidence
                    : parseInt(result.confidence || '0');

                setPrediction(result);
                toast.success('¡Revelación Estratégica Finalizada!', {
                    id: toastId,
                    description: `Veredicto: ${result.winner || 'Listo'} con ${confidenceVal}% de acierto.`,
                    duration: 5000
                });

                // Notificar si la confianza es alta (>= 75)
                if (confidenceVal >= 75) {
                    await notify(
                        '🏆 PICK TOP DETECTADO',
                        `Nueva predicción para ${sport}: ${result.winner || 'Análisis listo'} con ${confidenceVal}% de confianza.`,
                        'success',
                        `/match/${sport}/${eventId}`
                    );

                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ['#a855f7', '#06b6d4', '#ffffff', '#fbbf24']
                    });
                }

            } else {
                setError('No se pudo generar la predicción');
                toast.error('Fallo en la conexión mística', { id: toastId });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al generar predicción');
            toast.error('Error crítico en el Motor Genius');
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
                        <span className="text-3xl">🧙</span> PickGenius Oracle
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
                    <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-4 border border-red-500/30">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div className="flex-1">
                                <p className="font-bold text-sm mb-1">Error en el Análisis</p>
                                <p className="text-xs opacity-90">{error}</p>
                                <button
                                    onClick={handlePredict}
                                    className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    Reintentar Análisis
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {prediction && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* PROMINENT WINNER BADGE */}
                        <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-center shadow-2xl shadow-yellow-500/30 border-2 border-yellow-400">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg">
                                <span className="text-4xl">🏆</span>
                            </div>
                            <p className="text-black/70 text-xs uppercase font-bold mb-2 mt-2">Veredicto del Genio</p>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <p className="text-2xl md:text-3xl font-black text-black">
                                    {(!prediction.winner || prediction.winner.toLowerCase().includes('undefined')) ? 'Resultado Analizado' : prediction.winner}
                                </p>
                                {prediction.isValueBet && (
                                    <span className="bg-black text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-400 animate-pulse">
                                        VALUE BET
                                    </span>
                                )}
                            </div>

                            {/* Betting Tip Area - Masked if needed */}
                            <div className="mt-4 px-4 py-2 bg-black/10 rounded-xl border border-black/10">
                                <p className="text-[10px] text-black/50 uppercase font-black mb-1">Pick Recomendado</p>
                                <p className={`text-lg font-black text-black ${prediction.isMasked ? 'blur-sm select-none' : ''}`}>
                                    {prediction.bettingTip || 'Analizando...'}
                                </p>
                                {prediction.isMasked && (
                                    <button
                                        className="mt-2 text-[10px] bg-black text-white px-3 py-1 rounded-full font-bold hover:bg-black/80 transition-all"
                                        onClick={() => window.location.href = '/pricing'}
                                    >
                                        ⭐ Desbloquear con Premium
                                    </button>
                                )}
                            </div>
                            <div className="mt-3 flex items-center justify-center gap-2">
                                <div className="flex-1 max-w-xs h-3 bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black rounded-full transition-all duration-500"
                                        style={{ width: `${typeof prediction.confidence === 'number' ? prediction.confidence : parseInt(prediction.confidence || '0')}%` }}
                                    ></div>
                                </div>
                                <span className="text-black font-black text-xl">
                                    {typeof prediction.confidence === 'number' ? `${prediction.confidence}%` : (prediction.confidence ? `${parseInt(prediction.confidence)}%` : '-%')}
                                </span>
                            </div>
                            <p className="text-black/60 text-xs mt-2 font-semibold">Precisión del Oráculo</p>
                        </div>

                        {/* VALUE BET ANALYSIS - Only if it's a value bet */}
                        {prediction.isValueBet && prediction.valueAnalysis && (
                            <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-yellow-400 text-lg">💎</span>
                                    <p className="text-yellow-300 text-xs uppercase font-black">¿Por qué es Value Bet?</p>
                                </div>
                                <p className="text-gray-200 leading-relaxed text-sm">
                                    {prediction.valueAnalysis}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] text-yellow-400/70 font-mono">
                                    <span>⚡</span>
                                    <span>El mercado subestima esta predicción según nuestro análisis</span>
                                </div>
                            </div>
                        )}

                        <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-purple-300 text-xs uppercase font-bold mb-2">Visión del Genio</p>
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
                                        <p className="text-green-300 text-[10px] uppercase font-bold mb-1">
                                            {sport === 'basketball' ? 'Total Puntos' : 'Total Goles'}
                                        </p>
                                        <p className="text-white font-bold text-lg">
                                            {sport === 'basketball' ? (prediction.predictions.totalPoints || '-') : (prediction.predictions.totalGoals || '-')}
                                        </p>
                                    </div>

                                    {/* Shots (Summary) - ONLY FOR FOOTBALL */}
                                    {sport !== 'basketball' && prediction.predictions.shots && (
                                        <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/20">
                                            <p className="text-red-300 text-[10px] uppercase font-bold mb-1">Tiros al Arco</p>
                                            <p className="text-white font-bold text-lg">{prediction.predictions.shots.onTarget || '-'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Basketball Specific Detail (Spread & O/U) */}
                                {sport === 'basketball' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {prediction.predictions.spread && (
                                            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/20">
                                                <p className="text-blue-300 text-[10px] uppercase font-bold mb-1">Hándicap (Spread)</p>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-white font-bold text-lg">{prediction.predictions.spread.line}</p>
                                                    <p className="text-[9px] text-gray-400 uppercase">{prediction.predictions.spread.favorite}</p>
                                                </div>
                                            </div>
                                        )}
                                        {prediction.predictions.overUnder && (
                                            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                                                <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">Over/Under</p>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-white font-bold text-lg">{prediction.predictions.overUnder.line}</p>
                                                    <p className="text-[9px] text-gray-400 uppercase">{prediction.predictions.overUnder.pick}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Corners Detail - ONLY FOR FOOTBALL */}
                                {sport !== 'basketball' && prediction.predictions.corners && (
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

                            {/* Locked Overlay for Non-Premium (BYPASSED FOR NOW) */}
                            {/* {!user?.isPremium && ( ... )} */}

                            <div className=""> {/* Removed blur/opacity class */}
                                {prediction.predictions && (
                                    <div className="space-y-3">
                                        <h4 className="text-yellow-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2 mt-6 mb-2">
                                            🌟 Detalles Premium
                                            {prediction.isMasked && <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full">Locked</span>}
                                        </h4>

                                        {prediction.isMasked ? (
                                            <div className="bg-black/40 p-6 rounded-2xl border border-yellow-500/20 text-center space-y-4">
                                                <div className="flex justify-center">
                                                    <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center">
                                                        <Crown className="w-6 h-6 text-yellow-400" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold mb-1">Mercados de Alto Valor Bloqueados</p>
                                                    <p className="text-gray-400 text-xs">Accede a Córners exactos, Tarjetas, Offsides y Props de Jugadores con Elite.</p>
                                                </div>
                                                <button
                                                    onClick={() => window.location.href = '/pricing'}
                                                    className="w-full py-3 bg-yellow-400 text-black font-black rounded-xl text-xs hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Pasar a Premium <Crown className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>

                                                {/* Exact Score & Cards */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-3 rounded-lg border border-blue-500/20 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-bl">
                                                            {sport === 'basketball' ? 'ESTIMADO' : 'EXACTO'}
                                                        </div>
                                                        <p className="text-blue-300 text-[10px] uppercase font-bold mb-1">
                                                            {sport === 'basketball' ? 'Resultado Final' : 'Marcador Exacto'}
                                                        </p>
                                                        <p className="text-white font-bold text-xl">{prediction.predictions.finalScore || '-'}</p>
                                                    </div>

                                                    {/* Cards - ONLY FOR FOOTBALL */}
                                                    {sport !== 'basketball' && prediction.predictions.cards && (
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

                                                {/* Offsides - ONLY FOR FOOTBALL */}
                                                {sport !== 'basketball' && prediction.predictions.offsides && (
                                                    <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                                                        <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">⛔ Fueras de Juego</p>
                                                        <p className="text-white font-bold text-lg mb-1">{prediction.predictions.offsides.total} totales</p>
                                                    </div>
                                                )}
                                            </>
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
            </div>
        </div>
    );
}
