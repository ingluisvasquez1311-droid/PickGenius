'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, TrendingUp, Target, X, Star, Crown, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface StrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const strategies = [
    {
        title: "Correlación de Props (Elite)",
        description: "Nuestro algoritmo detecta cuando el mercado de un jugador estrella (Puntos, Goles, Hits) está infravalorado respecto a la victoria de su equipo. Maximiza el multiplicador con riesgo controlado.",
        icon: Target,
        impact: "Alto",
        successRate: "78%",
        color: "text-purple-400",
        highlight: "bg-purple-500/10"
    },
    {
        title: "Hedge de Volatilidad",
        description: "Estrategia para parleys de 3+ piernas. Combinamos apuestas de alta probabilidad con un mercado de valor. La IA ajusta el peso de cada selección para garantizar equilibrio.",
        icon: Shield,
        impact: "Medio-Alto",
        successRate: "72%",
        color: "text-blue-400",
        highlight: "bg-blue-500/10"
    },
    {
        title: "Detección de Rachas (Streak-Rider)",
        description: "Encuentra jugadores o equipos que han superado sus líneas de forma consecutiva. El sistema optimiza el parley seleccionando solo rachas con momentum ascendente en todos los deportes.",
        icon: TrendingUp,
        impact: "Extremo",
        successRate: "81%",
        color: "text-orange-400",
        highlight: "bg-orange-500/10"
    }
];

export default function ParleyOptimizerModal({ isOpen, onClose }: StrategyModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<'selection' | 'loading' | 'result'>('selection');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setStep('loading');

            const response = await fetch('/api/predictions/parley', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    strategyIndex: selectedIndex,
                    uid: user?.uid
                })
            });

            const data = await response.json();

            if (data.success && data.data) {
                setResult(data.data);
                setStep('result');
            } else {
                toast.error(data.error || "No se pudo generar el parley");
                setStep('selection');
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión");
            setStep('selection');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('selection');
        setResult(null);
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)]"
                    >
                        {/* Header Gradient */}
                        <div className="h-24 bg-gradient-to-br from-orange-600 to-purple-700 relative">
                            {!loading && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-20"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <div className="absolute inset-0 flex items-center px-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Crown className="w-3 h-3 text-yellow-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Premium Intelligence</span>
                                    </div>
                                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Parley Optimizer</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {step === 'selection' && (
                                    <motion.div
                                        key="selection"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <p className="text-gray-400 text-sm font-medium italic mb-6">
                                            Selecciona una de nuestras estrategias optimizadas por IA para construir tus combinadas con ventaja matemática real.
                                        </p>

                                        <div className="space-y-3">
                                            {strategies.map((strategy, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        if (i > 0 && !user?.isPremium) {
                                                            toast.info("Estrategia Premium", {
                                                                description: "Actualiza a Elite para desbloquear análisis de alto riesgo y valor."
                                                            });
                                                            return;
                                                        }
                                                        setSelectedIndex(i);
                                                    }}
                                                    className={`group p-5 rounded-3xl transition-all cursor-pointer border-2 relative overflow-hidden ${selectedIndex === i
                                                        ? 'bg-white/5 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                                        } ${i > 0 && !user?.isPremium ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                                >
                                                    {i > 0 && !user?.isPremium && (
                                                        <div className="absolute top-3 right-3">
                                                            <Lock className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-3 rounded-xl bg-white/5 ${selectedIndex === i ? strategy.color : 'text-gray-500'}`}>
                                                            <strategy.icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className={`text-base font-black italic uppercase tracking-tight ${selectedIndex === i ? 'text-white' : 'text-gray-400'}`}>
                                                                    {strategy.title}
                                                                </h4>
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Hit {strategy.successRate}</span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 leading-tight mb-3">{strategy.description}</p>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                                    <Zap className="w-3 h-3" />
                                                                    <span className="text-[8px] font-black uppercase tracking-widest">Impacto: {strategy.impact}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                                    <Star className="w-3 h-3 fill-gray-600" />
                                                                    <span className="text-[8px] font-black uppercase tracking-widest">AI Tier 1</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8">
                                            <PremiumButton
                                                onClick={handleGenerate}
                                                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 group"
                                            >
                                                Generar Parley Optimizado con IA <Zap className="w-4 h-4 group-hover:animate-pulse" />
                                            </PremiumButton>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 'loading' && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="py-20 flex flex-col items-center text-center"
                                    >
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-orange-500/20 blur-[40px] rounded-full animate-pulse"></div>
                                            <Loader2 className="w-16 h-16 text-orange-500 animate-spin relative z-10" />
                                        </div>
                                        <h3 className="text-xl font-black italic uppercase tracking-widest mb-2 animate-pulse">Analizando Mercado...</h3>
                                        <p className="text-gray-500 text-sm max-w-xs">
                                            Nuestra IA está simulando miles de resultados basados en la estrategia <span className="text-orange-400">"{strategies[selectedIndex].title}"</span>
                                        </p>
                                    </motion.div>
                                )}

                                {step === 'result' && result && (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">{result.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Riesgo: {result.riskLevel}</span>
                                            </div>
                                        </div>

                                        {/* Ticket Display */}
                                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                                            {/* Header with Total Odds */}
                                            <div className="bg-white/[0.03] border-b border-white/5 p-6 flex justify-between items-center">
                                                <div>
                                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Ticket Generado
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Cuota Total</div>
                                                    <div className="text-2xl font-black text-orange-400">@{result.totalOdds?.toFixed(2)}</div>
                                                </div>
                                            </div>

                                            <div className="p-4 md:p-6 space-y-4">
                                                {result.legs.map((leg: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-xl group/leg">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white group-hover/leg:bg-orange-500/20 group-hover/leg:text-orange-400 transition-colors">
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{leg.matchName}</div>
                                                                {(leg.pick.toLowerCase().includes('puntos') || leg.pick.toLowerCase().includes('rebotes') || leg.pick.toLowerCase().includes('hits') || leg.pick.toLowerCase().includes('home run') || leg.pick.toLowerCase().includes('strikeout')) && (
                                                                    <span className="text-[8px] font-black bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Player Prop</span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                                                {leg.pick}
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[9px] font-black text-emerald-500 uppercase">{leg.confidence}% Conf.</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Analysis Box */}
                                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Análisis IA de Combinada</span>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed italic">
                                                "{result.analysis}"
                                            </p>
                                        </div>

                                        <div className="flex gap-3 mt-8">
                                            <button
                                                onClick={reset}
                                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                Nuevo Cálculo
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20"
                                            >
                                                Cerrar Terminal
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
