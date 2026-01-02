"use client";

import { useState, useMemo } from 'react';
import { TrendingUp, Target, Info, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface KellyCalculatorProps {
    currentBankroll: number;
    onApplyStake?: (stake: number) => void;
}

export default function KellyCalculator({ currentBankroll, onApplyStake }: KellyCalculatorProps) {
    const [winProb, setWinProb] = useState(55);
    const [odds, setOdds] = useState(2.0);
    const [useHalfKelly, setUseHalfKelly] = useState(true);
    const [showInfo, setShowInfo] = useState(false);

    const kellyResults = useMemo(() => {
        const b = odds - 1; // Net odds
        const p = winProb / 100;
        const q = 1 - p;

        if (b <= 0 || p <= 0 || p >= 1) {
            return { fraction: 0, stake: 0, expected: 0, valid: false };
        }

        // Kelly Criterion formula: f* = (bp - q) / b
        let fraction = (b * p - q) / b;

        // Apply Half-Kelly if selected (more conservative)
        if (useHalfKelly) fraction = fraction / 2;

        const stake = Math.max(0, fraction * currentBankroll);
        const expected = stake * (p * b - q);

        return {
            fraction: Math.max(0, fraction),
            stake,
            expected,
            valid: fraction > 0
        };
    }, [winProb, odds, currentBankroll, useHalfKelly]);

    return (
        <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Kelly Criterion</h3>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Optimización Matemática de Stake</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <Info className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Info Panel */}
            {showInfo && (
                <div className="p-6 bg-black/40 border border-white/10 rounded-2xl animate-in slide-in-from-top-4 duration-200">
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase">
                        El <span className="text-primary">Kelly Criterion</span> calcula el porcentaje óptimo de tu bankroll a apostar
                        basándose en la probabilidad de éxito y las cuotas. <span className="text-white">Half-Kelly</span> reduce
                        la volatilidad a la mitad, siendo más conservador.
                    </p>
                </div>
            )}

            {/* Mode Toggle */}
            <div className="flex p-1.5 bg-white/5 rounded-xl border border-white/10">
                <button
                    type="button"
                    onClick={() => setUseHalfKelly(false)}
                    className={clsx(
                        "flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        !useHalfKelly ? "bg-white text-black" : "text-gray-500 hover:text-white"
                    )}
                >
                    Full Kelly
                </button>
                <button
                    type="button"
                    onClick={() => setUseHalfKelly(true)}
                    className={clsx(
                        "flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        useHalfKelly ? "bg-primary text-black" : "text-gray-500 hover:text-white"
                    )}
                >
                    Half-Kelly (Safe)
                </button>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Win Probability Slider */}
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Prob. de Ganar</label>
                        <span className="text-2xl font-black italic text-white">{winProb}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="99"
                        value={winProb}
                        onChange={(e) => setWinProb(Number(e.target.value))}
                        className="w-full accent-primary bg-white/10 h-2 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                {/* Odds Input */}
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cuota (Odds)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="1.01"
                        value={odds}
                        onChange={(e) => setOdds(Number(e.target.value))}
                        className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-2xl font-black italic text-center focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>
            </div>

            {/* Results Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Kelly %</p>
                    <p className="text-2xl font-black italic text-white">{(kellyResults.fraction * 100).toFixed(2)}%</p>
                </div>
                <div className="p-6 bg-black/40 border border-primary/20 rounded-2xl space-y-2">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Stake Sugerido</p>
                    <p className="text-2xl font-black italic text-primary">${kellyResults.stake.toFixed(2)}</p>
                </div>
                <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">EV Esperado</p>
                    <p className={clsx(
                        "text-2xl font-black italic",
                        kellyResults.expected >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                        ${kellyResults.expected.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Apply Button */}
            {onApplyStake && kellyResults.valid && (
                <button
                    type="button"
                    onClick={() => onApplyStake(kellyResults.stake)}
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-glow-sm"
                >
                    <Target className="w-4 h-4" />
                    APLICAR STAKE ÓPTIMO
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            {!kellyResults.valid && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">
                        No hay Edge matemático. Ajusta probabilidad o cuota.
                    </p>
                </div>
            )}
        </div>
    );
}
