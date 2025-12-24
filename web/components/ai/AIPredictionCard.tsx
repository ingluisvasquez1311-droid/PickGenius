'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Zap, Shield, TrendingUp, Target, X, Star, Crown, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generatePrediction } from '@/lib/predictionService';
import { useAuth } from '@/contexts/AuthContext';
import { useBettingSlip } from '@/contexts/BettingSlipContext';

import { API_URL } from '@/lib/api';

interface AIPredictionCardProps {
    eventId: string | number;
    sport: string;
}

export default function AIPredictionCard({ eventId, sport }: AIPredictionCardProps) {
    const { user, notify } = useAuth();
    const { addToSlip } = useBettingSlip();
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estimate odds based on AI confidence (rough approximation)
    const estimateOdds = (confidence: number): number => {
        const probability = confidence / 100;
        return Number((1 / probability).toFixed(2));
    };

    const handlePredict = async () => {
        let timeout1: NodeJS.Timeout | null = null;
        let timeout2: NodeJS.Timeout | null = null;

        try {
            setLoading(true);
            setError(null);

            const toastId = toast.loading('Consultando el Oráculo de PickGenius...', {
                description: 'Invocando estadísticas históricas y momentum...'
            });

            // Simulate steps for a more "pro" feeling
            timeout1 = setTimeout(() => {
                toast.loading('Analizando alineaciones y mística del campo...', { id: toastId });
            }, 1000);

            timeout2 = setTimeout(() => {
                toast.loading('Calculando probabilidades con el Motor Genius...', { id: toastId });
            }, 2500);

            const result = await generatePrediction({
                gameId: eventId.toString(),
                sport: sport as any
            });

            // Limpiar timeouts para que no sobrescriban el éxito
            if (timeout1) clearTimeout(timeout1);
            if (timeout2) clearTimeout(timeout2);

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
            if (timeout1) clearTimeout(timeout1);
            if (timeout2) clearTimeout(timeout2);
            console.error(err);
            setError(err.message || 'Error al generar predicción');
            toast.error('Error crítico en el Motor Genius');
        } finally {
            setLoading(false);
        }
    };

    // Derived values for premium access
    const isPremiumOrAdmin = user?.isPremium || user?.role === 'admin';
    const showMasked = prediction?.isMasked && !isPremiumOrAdmin;

    return (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 shadow-2xl border border-purple-500/30 mt-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-3xl">🧙</span> Oráculo PickGenius
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
                                <p className={`text-lg font-black text-black ${showMasked ? 'blur-sm select-none' : ''}`}>
                                    {prediction.bettingTip || 'Analizando...'}
                                </p>
                                {showMasked && (
                                    <button
                                        className="mt-2 text-[10px] bg-black text-white px-3 py-1 rounded-full font-bold hover:bg-black/80 transition-all"
                                        onClick={() => window.location.href = '/pricing'}
                                    >
                                        ⭐ Desbloquear con Premium
                                    </button>
                                )}

                                {/* Add to Ticket Button - Only for non-masked predictions */}
                                {!showMasked && (
                                    <button
                                        onClick={() => {
                                            const confidence = typeof prediction.confidence === 'number'
                                                ? prediction.confidence
                                                : parseInt(prediction.confidence || '50');
                                            const estimatedOdds = estimateOdds(confidence);

                                            addToSlip({
                                                matchId: eventId.toString(),
                                                selection: prediction.winner || 'Resultado Analizado',
                                                odds: estimatedOdds,
                                                matchLabel: prediction.teamsLabel || `${sport.toUpperCase()} Match`,
                                                market: prediction.bettingTip || 'Ganador'
                                            });

                                            toast.success('¡Añadido al Ticket!', {
                                                description: `Cuota estimada: ${estimatedOdds.toFixed(2)}`
                                            });
                                        }}
                                        className="mt-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-purple-900/30 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span>🎫</span>
                                        <span>Añadir al Ticket</span>
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

                        {/* VALUE BET / ODDS SECTION - ONLY IF IT IS A VALUE BET */}
                        {prediction.isValueBet && (
                            <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-5 rounded-2xl border border-yellow-500/20 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">💰</span>
                                        <div>
                                            <p className="text-yellow-500 text-[10px] font-black uppercase tracking-tighter">Oportunidad de Mercado</p>
                                            <h3 className="text-white font-black text-lg">Casa de Apuestas</h3>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-[10px] font-black">
                                        +{prediction.edge || '12.5'}% EDGE
                                    </span>
                                </div>

                                {/* Comparison Grid */}
                                {!showMasked ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(() => {
                                                const confidence = typeof prediction.confidence === 'number' ? prediction.confidence : 70;
                                                const baseOdds = estimateOdds(confidence);
                                                const houses = [
                                                    { name: 'Betano', odds: (baseOdds * 1.02).toFixed(2) },
                                                    { name: 'BetPlay', odds: (baseOdds * 0.98).toFixed(2) },
                                                    { name: 'Rushbet', odds: (baseOdds * 1.01).toFixed(2) },
                                                    { name: 'Bet365', odds: (baseOdds * 0.99).toFixed(2) },
                                                ];
                                                const bestOdds = Math.max(...houses.map(h => parseFloat(h.odds)));

                                                return houses.map((house) => (
                                                    <div key={house.name} className={`p-3 rounded-xl border transition-all ${parseFloat(house.odds) === bestOdds ? 'bg-green-500/20 border-green-400/50 ring-2 ring-green-400/30' : 'bg-white/5 border-white/10'}`}>
                                                        <div className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">{house.name}</div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-2xl font-black text-white italic">{house.odds}</div>
                                                            {parseFloat(house.odds) === bestOdds && <span className="text-[9px] bg-green-500 text-black px-1.5 py-0.5 rounded-full font-black">TOP</span>}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>

                                        {/* STRATEGY BREAKDOWN - Requested by user */}
                                        <div className="bg-black/40 p-4 rounded-xl border border-yellow-500/10">
                                            <p className="text-[10px] text-yellow-500 uppercase font-black mb-2 flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> Combinación Interna Genius
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-medium">Línea Principal (Market)</span>
                                                    <span className="text-white font-bold">{estimateOdds(prediction.confidence || 70).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-medium">Línea Interna (AI Edge)</span>
                                                    <span className="text-green-400 font-bold">+{((prediction.edge || 12) / 100).toFixed(2)}</span>
                                                </div>
                                                <div className="pt-2 mt-2 border-t border-white/5 flex justify-between items-center">
                                                    <span className="text-xs text-yellow-500 font-black italic">Probabilidad Real</span>
                                                    <span className="text-lg font-black text-white italic">Cuota Meta: {((estimateOdds(prediction.confidence || 70)) * 1.1).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-500 mt-3 italic leading-tight">
                                                * El cliente debe ingresar en la casa de apuesta y verificar si es una línea simple o una combinación interna detallada por el Oráculo.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-black/40 p-6 rounded-2xl border border-yellow-500/20 text-center space-y-3">
                                        <Lock className="w-8 h-8 text-yellow-500 mx-auto opacity-20" />
                                        <p className="text-xs text-gray-400">Las cuotas de valor y el desglose de estrategia están reservados para usuarios Premium.</p>
                                        <button onClick={() => window.location.href = '/pricing'} className="px-6 py-2 bg-yellow-500 text-black font-black rounded-full hover:bg-yellow-400 transition-all text-[10px] uppercase">
                                            Ver Detalles de Valor
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-black/30 p-4 rounded-lg">
                            <p className="text-purple-300 text-xs uppercase font-bold mb-2">Visión del Genio</p>
                            <p className="text-gray-200 leading-relaxed text-sm">
                                {prediction.reasoning}
                            </p>
                        </div>

                        {/* UNLOCKED STATS FOR EVERYONE */}
                        {prediction.predictions && (
                            <div className="space-y-3 mt-4">
                                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">📈 Estadísticas del Partido</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-3 rounded-lg border border-green-500/20">
                                        <p className="text-green-300 text-[10px] uppercase font-bold mb-1">{sport === 'basketball' ? 'Total Puntos' : 'Total Goles'}</p>
                                        <p className="text-white font-bold text-lg">{sport === 'basketball' ? prediction.predictions.totalPoints : prediction.predictions.totalGoals}</p>
                                    </div>
                                    {sport !== 'basketball' && prediction.predictions.shots && (
                                        <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/20">
                                            <p className="text-red-300 text-[10px] uppercase font-bold mb-1">Tiros al Arco</p>
                                            <p className="text-white font-bold text-lg">{prediction.predictions.shots.onTarget}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PREMIUM CONTENT SECTION */}
                        <div className="relative mt-4">
                            {prediction.predictions && (
                                <div className="space-y-3">
                                    <h4 className="text-yellow-400 text-sm font-bold uppercase tracking-wider mt-6 mb-2 flex items-center gap-2">
                                        🌟 Detalles Premium
                                        {showMasked && <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full">Locked</span>}
                                    </h4>

                                    {showMasked ? (
                                        <div className="bg-black/40 p-6 rounded-2xl border border-yellow-500/20 text-center space-y-4">
                                            <Crown className="w-12 h-12 text-yellow-400 mx-auto opacity-20" />
                                            <div>
                                                <p className="text-white font-bold mb-1">Mercados de Alto Valor Bloqueados</p>
                                                <p className="text-gray-400 text-xs">Accede a Marcador Exacto, Tarjetas y Factores Clave con Premium.</p>
                                            </div>
                                            <button onClick={() => window.location.href = '/pricing'} className="w-full py-3 bg-yellow-400 text-black font-black rounded-xl text-xs hover:bg-yellow-300 transition-all">
                                                Pasar a Premium
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-3 rounded-lg border border-blue-500/20">
                                                    <p className="text-blue-300 text-[10px] uppercase font-bold mb-1">{sport === 'basketball' ? 'Est. Final' : 'Marcador Exacto'}</p>
                                                    <p className="text-white font-bold text-xl">{prediction.predictions.finalScore || '-'}</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-3 rounded-lg border border-purple-500/20">
                                                    <p className="text-purple-300 text-[10px] uppercase font-bold mb-1">Mercado O/U (Total)</p>
                                                    <p className="text-white font-bold text-xl">{prediction.predictions.totalPoints || prediction.predictions.overUnder?.line || '-'}</p>
                                                    <p className="text-[9px] text-purple-200/50 font-bold uppercase">{prediction.predictions.overUnder?.pick || 'Analizado'}</p>
                                                </div>
                                            </div>

                                            {/* PLAYER PROJECTIONS (PREMIUM) */}
                                            {prediction.predictions.projections && prediction.predictions.projections.length > 0 && (
                                                <div className="bg-black/40 p-4 rounded-xl border border-yellow-500/20">
                                                    <p className="text-[10px] text-yellow-500 uppercase font-black mb-3 flex items-center gap-2">
                                                        <Crown className="w-3 h-3" /> Proyecciones de Jugadores Pro
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {prediction.predictions.projections.map((p: any, idx: number) => (
                                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 transition-all">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <p className="text-white font-black text-sm italic">{p.name}</p>
                                                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${p.confidence === 'Alta' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                                        }`}>
                                                                        CONF: {p.confidence}
                                                                    </span>
                                                                </div>
                                                                {sport === 'basketball' ? (
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <div className="text-center p-1 bg-black/20 rounded">
                                                                            <p className="text-[7px] text-gray-500 font-bold uppercase">PTS</p>
                                                                            <p className="text-xs font-black text-yellow-500">{p.points}</p>
                                                                        </div>
                                                                        <div className="text-center p-1 bg-black/20 rounded">
                                                                            <p className="text-[7px] text-gray-500 font-bold uppercase">REB</p>
                                                                            <p className="text-xs font-black text-white">{p.rebounds || '-'}</p>
                                                                        </div>
                                                                        <div className="text-center p-1 bg-black/20 rounded">
                                                                            <p className="text-[7px] text-gray-500 font-bold uppercase">AST</p>
                                                                            <p className="text-xs font-black text-white">{p.assists || '-'}</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-black/20 p-2 rounded flex justify-between items-center">
                                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{p.description || 'Pronóstico'}</p>
                                                                        <p className="text-xs font-black text-yellow-500">{p.points}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

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
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-4">
                            <button onClick={handlePredict} className="text-xs text-purple-300 hover:text-white underline">
                                Actualizar Análisis
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
