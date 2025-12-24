'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Zap, Target, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ParleyLeg {
    id: string;
    fixture: string;
    sport: 'football' | 'basketball' | 'american-football';
    selection: string;
    odds: number;
    aiProbability: number;
}

export default function SmartParleyPage() {
    const { user, saveParley } = useAuth();
    const [legs, setLegs] = useState<ParleyLeg[]>([]);
    const [bankroll, setBankroll] = useState(100);
    const [isSaving, setIsSaving] = useState(false);

    // AI Calculations
    const totalOdds = useMemo(() => {
        if (legs.length === 0) return 0;
        return legs.reduce((acc, leg) => acc * leg.odds, 1);
    }, [legs]);

    const combinedAiProb = useMemo(() => {
        if (legs.length === 0) return 0;
        // In real parlays, probability is product of probabilities
        return legs.reduce((acc, leg) => acc * (leg.aiProbability / 100), 1) * 100;
    }, [legs]);

    const suggestedStake = useMemo(() => {
        if (legs.length === 0 || totalOdds <= 1) return 0;
        // Simplified Kelly Criterion
        // f* = (bp - q) / b
        // b = decimal odds - 1
        // p = probability
        // q = 1 - p
        const b = totalOdds - 1;
        const p = combinedAiProb / 100;
        const q = 1 - p;
        const kelly = (b * p - q) / b;

        // We use fractional Kelly (10% of full Kelly) for safety
        const safeKelly = Math.max(0, kelly * 0.1) * 100;
        return Math.min(5, safeKelly); // Cap at 5% of bankroll
    }, [totalOdds, combinedAiProb]);

    const potentialPayout = (bankroll * (suggestedStake / 100)) * totalOdds;

    const addMockLeg = () => {
        const mockLegs: ParleyLeg[] = [
            { id: Math.random().toString(), fixture: 'Real Madrid vs Barcelona', sport: 'football', selection: 'Real Madrid WIN', odds: 1.85, aiProbability: 62 },
            { id: Math.random().toString(), fixture: 'Lakers vs Celtics', sport: 'basketball', selection: 'Over 220.5', odds: 1.90, aiProbability: 58 },
            { id: Math.random().toString(), fixture: 'Kansas City vs Eagles', sport: 'american-football', selection: 'KC Chiefs -3', odds: 1.95, aiProbability: 55 },
        ];
        const random = mockLegs[legs.length % mockLegs.length];
        setLegs([...legs, random]);
    };

    const removeLeg = (id: string) => {
        setLegs(legs.filter(l => l.id !== id));
    };

    const handleSave = async () => {
        if (legs.length < 2) {
            toast.error('Necesitas al menos 2 selecciones para un Parley.');
            return;
        }
        setIsSaving(true);
        try {
            await saveParley({
                legs,
                totalOdds,
                combinedAiProb,
                stake: suggestedStake,
                timestamp: new Date()
            });
            toast.success('Parley Estratégico Guardado');
        } catch (error) {
            toast.error('Error al guardar el parley');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 pb-32 pt-24">

            {/* Header */}
            <header className="relative py-12 text-center overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Zap className="w-3 h-3 fill-purple-400" />
                        Algorithmic Multiplier
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
                        SMART <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">PARLAY</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Combina la potencia de nuestras predicciones IA y deja que el algoritmo sugiera el stake óptimo basado en valor matemático.
                    </p>
                </div>
            </header>

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

                    {/* LEFT: SELECTIONS */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Tus Selecciones</h2>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Añade eventos para calcular el multiplicador</p>
                            </div>
                            <button
                                onClick={addMockLeg}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Añadir Pick
                            </button>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {legs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center"
                                >
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Target className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Tu boleto está vacío</p>
                                    <p className="text-[10px] text-gray-700 mt-1 uppercase">Empieza añadiendo selecciones con valor positivo</p>
                                </motion.div>
                            ) : (
                                legs.map((leg, index) => (
                                    <motion.div
                                        key={leg.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative group bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] hover:border-purple-500/30 transition-all"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-xl">
                                                    {leg.sport === 'football' ? '⚽' : leg.sport === 'basketball' ? '🏀' : '🏈'}
                                                </div>
                                                <div>
                                                    <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{leg.fixture}</h3>
                                                    <p className="text-lg font-black italic uppercase text-white tracking-tighter">{leg.selection}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <span className="text-[8px] text-gray-600 uppercase font-black block mb-1">Cuota</span>
                                                    <span className="text-xl font-black italic font-mono text-purple-400">{leg.odds.toFixed(2)}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeLeg(leg.id)}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: SMART ANALYSIS */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-32 glass-card border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <TrendingUp className="w-48 h-48 text-purple-500" />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                                    Genius Analysis
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5">
                                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2 block">Cuota Total</span>
                                        <div className="text-3xl font-black italic text-white">{totalOdds.toFixed(2)}</div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-purple-500/5 border border-purple-500/10">
                                        <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest mb-2 block">Prob. Real IA</span>
                                        <div className="text-3xl font-black italic text-purple-400">{combinedAiProb.toFixed(1)}%</div>
                                    </div>
                                </div>

                                {/* Bankroll Settings */}
                                <div className="mb-8 p-6 bg-black/40 rounded-3xl border border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tu Bankroll Actual</span>
                                        <span className="text-sm font-black text-white">${bankroll}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="10000"
                                        step="10"
                                        value={bankroll}
                                        onChange={(e) => setBankroll(parseInt(e.target.value))}
                                        className="w-full h-1 bg-purple-500/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                {/* STAKE RECOMMENDATION */}
                                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-purple-600/20 to-indigo-600/10 border border-purple-500/20 relative overflow-hidden mb-8">
                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Stake Sugerido (Kelly Criterion)</span>
                                        <div className="text-6xl font-black italic text-white tracking-tighter mb-1">
                                            {suggestedStake.toFixed(1)}%
                                        </div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                                            Inversión: ${(bankroll * (suggestedStake / 100)).toFixed(2)}
                                        </div>

                                        <div className="w-full h-px bg-white/10 mb-6" />

                                        <div className="flex justify-between w-full">
                                            <div className="text-left">
                                                <span className="text-[9px] text-gray-500 uppercase font-black block">Retorno Potencial</span>
                                                <span className="text-xl font-black text-green-400">${potentialPayout.toFixed(2)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[9px] text-gray-500 uppercase font-black block">Edge Combinado</span>
                                                <span className="text-xl font-black text-purple-400">+{Math.max(0, combinedAiProb - (1 / totalOdds * 100)).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={legs.length < 2 || isSaving}
                                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {isSaving ? 'PROCESANDO...' : 'GUARDAR ESTRATEGIA'}
                                </button>

                                <div className="mt-6 flex items-start gap-2 p-4 bg-white/5 rounded-2xl">
                                    <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] text-gray-500 leading-relaxed uppercase font-bold">
                                        Basado en el Criterio de Kelly fraccionado (10%). Esta configuración minimiza la volatilidad mientras maximiza el crecimiento logarítmico del bankroll.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
