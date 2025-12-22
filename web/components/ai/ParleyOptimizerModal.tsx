'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, TrendingUp, Target, X, Star, Crown } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';

interface StrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const strategies = [
    {
        title: "Correlación de Props NBA",
        description: "Nuestro algoritmo detecta cuando el Over de puntos de un jugador estrella está infravalorado respecto a la victoria de su equipo. Combinamos ambos para maximizar el multiplicador con riesgo controlado.",
        icon: Target,
        impact: "Alto",
        successRate: "78%",
        color: "text-purple-400"
    },
    {
        title: "Hedge de Volatilidad",
        description: "Estrategia para parleys de 3+ piernas. Combinamos dos 'Lock Picks' (90%+ prob) con un prop de alto valor basado en cuotas mal puestas por la casa. La IA ajusta el peso de cada selección.",
        icon: Shield,
        impact: "Medio-Alto",
        successRate: "72%",
        color: "text-blue-400"
    },
    {
        title: "Detección de Rachas (Streak-Rider)",
        description: "Utiliza el motor de 'Streak Finder' para identificar jugadores que han superado su línea en los últimos 5 partidos. El sistema optimiza el parley seleccionando solo rachas con momentum ascendente.",
        icon: TrendingUp,
        impact: "Extremo",
        successRate: "81%",
        color: "text-orange-400"
    }
];

export default function ParleyOptimizerModal({ isOpen, onClose }: StrategyModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)]"
                    >
                        {/* Header Image/Gradient */}
                        <div className="h-32 bg-gradient-to-br from-orange-600 to-purple-700 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute inset-0 flex items-center px-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Crown className="w-3 h-3 text-yellow-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Premium Intelligence</span>
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Parley Optimizer</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-10">
                            <p className="text-gray-400 text-sm font-medium italic mb-8">
                                Selecciona una de nuestras estrategias optimizadas por IA para construir tus combinadas con ventaja matemática real.
                            </p>

                            <div className="space-y-4">
                                {strategies.map((strategy, i) => (
                                    <div
                                        key={i}
                                        className="group p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start gap-5">
                                            <div className={`p-4 rounded-2xl bg-white/5 ${strategy.color}`}>
                                                <strategy.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-lg font-black italic uppercase tracking-tight text-white">{strategy.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Hit {strategy.successRate}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed mb-4">{strategy.description}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Zap className="w-3 h-3 text-yellow-500" />
                                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Impacto: {strategy.impact}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Star className="w-3 h-3 text-purple-500 fill-purple-500" />
                                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">AI Tier 1</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <PremiumButton className="w-full py-5 rounded-2xl">
                                    Generar Parley Optimizado con IA
                                </PremiumButton>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
