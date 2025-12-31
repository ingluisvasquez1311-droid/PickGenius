"use client";

import { useState, useEffect } from 'react';
import { Calculator, Percent, Wallet, Info, Flame } from 'lucide-react';
import clsx from 'clsx';

export default function KellyCalculator() {
    const [bankroll, setBankroll] = useState(1000);
    const [odds, setOdds] = useState(1.90);
    const [probability, setProbability] = useState(60); // 0-100
    const [fraction, setFraction] = useState(0.25); // Fractional Kelly (0.25 = Quarter Kelly)

    const [result, setResult] = useState<{ stake: number, percent: number }>({ stake: 0, percent: 0 });

    useEffect(() => {
        // Kelly Formula: f = (bp - q) / b
        // b = decimal odds - 1
        // p = probability
        // q = 1 - p

        const b = odds - 1;
        const p = probability / 100;
        const q = 1 - p;

        let f = (b * p - q) / b;

        // Apply fractional Kelly for safety (standard pro practice)
        f = f * fraction;

        // Don't bet if no edge (f <= 0)
        if (f <= 0) {
            setResult({ stake: 0, percent: 0 });
        } else {
            setResult({
                stake: Math.floor(bankroll * f),
                percent: parseFloat((f * 100).toFixed(2))
            });
        }
    }, [bankroll, odds, probability, fraction]);

    return (
        <div className="bg-[#080808]/90 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-20 bg-primary/40 blur-lg"></div>

            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl shadow-glow-sm">
                        <Calculator className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Kelly Criterion <span className="text-primary/50 text-sm">v4.0</span></h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mt-1">Algoritmo de Gestión de Bankroll Pro</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Calculator</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Inputs */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-primary" /> Capital Total en Bankroll ($)
                        </label>
                        <div className="relative group">
                            <input
                                type="number"
                                value={bankroll}
                                onChange={(e) => setBankroll(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 font-black italic text-2xl text-white focus:border-primary/50 outline-none transition-all shadow-inner"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 font-mono text-sm">$</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Cuota Real (Odds)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={odds}
                                onChange={(e) => setOdds(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 font-black italic text-2xl text-white focus:border-primary/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Prob. IA (%)</label>
                            <input
                                type="number"
                                value={probability}
                                onChange={(e) => setProbability(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 font-black italic text-2xl text-white focus:border-primary/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center ml-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Factor de Agresividad</label>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                {fraction === 1 ? 'Full' : fraction === 0.5 ? 'Half' : 'Quarter'} Kelly
                            </span>
                        </div>
                        <div className="flex gap-3">
                            {[0.25, 0.5, 1].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFraction(f)}
                                    className={clsx(
                                        "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                        fraction === f
                                            ? "bg-primary text-black border-primary shadow-glow-sm"
                                            : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {f * 100}%
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                <div className="bg-gradient-to-br from-primary/10 via-black to-black border border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-primary/5 opacity-20 animate-pulse"></div>
                    <div className="absolute -top-20 -right-20 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Percent className="w-60 h-60" />
                    </div>

                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em] mb-6 relative z-10 font-mono">Stake Sugerido PickGenius</p>

                    {result.stake > 0 ? (
                        <div className="relative z-10 space-y-4">
                            <div className="flex flex-col items-center">
                                <p className="text-8xl font-black italic text-white tracking-tighter drop-shadow-glow leading-none">
                                    ${result.stake}
                                </p>
                                <div className="mt-6 px-6 py-2.5 bg-green-500 text-black rounded-2xl text-xs font-black italic uppercase tracking-widest shadow-xl">
                                    {result.percent}% del bankroll
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 text-orange-500/80 p-8 rounded-[2.5rem] border border-orange-500/20 bg-orange-500/5 backdrop-blur-sm max-w-[280px]">
                            <Flame className="w-8 h-8 mx-auto mb-4 animate-bounce" />
                            <p className="font-black uppercase italic tracking-tighter text-2xl leading-tight">Valor No Encontrado</p>
                            <p className="text-[10px] font-bold mt-3 opacity-60 leading-relaxed uppercase tracking-widest">La probabilidad estimada no compensa el riesgo del mercado.</p>
                        </div>
                    )}

                    <div className="mt-10 pt-10 border-t border-white/5 flex items-start gap-4 text-left w-full relative z-10">
                        <div className="p-2 bg-white/5 rounded-lg shrink-0">
                            <Info className="w-5 h-5 text-gray-500" />
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                            Este criterio maximiza el crecimiento del capital a largo plazo. El <span className="text-primary">Quarter Kelly (25%)</span> es la norma profesional para minimizar la volatilidad y riesgo de quiebra.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
