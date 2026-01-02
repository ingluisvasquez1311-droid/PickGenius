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
        <div className="glass-card border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:cyber-border transition-all duration-500">
            {/* Animated Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 animate-pulse-slow delay-1000"></div>
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] relative group/icon overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover/icon:translate-y-0 transition-transform duration-300"></div>
                        <Calculator className="w-7 h-7 text-primary relative z-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-glow">Kelly Criterion <span className="text-primary/80 text-sm ml-1 font-mono">v4.0</span></h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mt-1.5 flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full animate-blink"></span>
                            Algoritmo de Gestión de Bankroll Pro
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_infinite]"></div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Active Calculator</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                {/* Inputs */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                            <Wallet className="w-3 h-3 text-primary" /> Capital Total en Bankroll ($)
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <input
                                type="number"
                                value={bankroll}
                                onChange={(e) => setBankroll(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 font-black italic text-2xl text-white focus:border-primary/50 outline-none transition-all shadow-inner relative z-10 placeholder-white/20"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm font-bold z-20">$</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Cuota Real (Odds)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={odds}
                                onChange={(e) => setOdds(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 font-black italic text-2xl text-white focus:border-primary/50 outline-none transition-all shadow-inner hover:bg-white/[0.02]"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Prob. IA (%)</label>
                            <input
                                type="number"
                                value={probability}
                                onChange={(e) => setProbability(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 font-black italic text-2xl text-white focus:border-primary/50 outline-none transition-all shadow-inner hover:bg-white/[0.02]"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center ml-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Factor de Agresividad</label>
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]">
                                {fraction === 1 ? 'Full' : fraction === 0.5 ? 'Half' : 'Quarter'} Kelly
                            </span>
                        </div>
                        <div className="flex gap-3 p-1.5 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm">
                            {[0.25, 0.5, 1].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFraction(f)}
                                    className={clsx(
                                        "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn",
                                        fraction === f
                                            ? "text-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                            : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    <div className={clsx("absolute inset-0 transition-colors", fraction === f ? "bg-primary" : "bg-transparent group-hover/btn:bg-white/5")}></div>
                                    <span className="relative z-10">{f * 100}%</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                <div className="bg-gradient-to-br from-primary/10 via-black/80 to-black/90 border border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group/result shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -top-20 -right-20 p-8 opacity-5 group-hover/result:opacity-10 transition-opacity duration-700">
                        <Percent className="w-60 h-60" />
                    </div>

                    {/* Scanning Line Animation */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent bg-[length:100%_200%] animate-scan pointer-events-none"></div>

                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] mb-8 relative z-10 font-mono">Stake Sugerido PickGenius</p>

                    {result.stake > 0 ? (
                        <div className="relative z-10 space-y-6">
                            <div className="flex flex-col items-center">
                                <p className="text-[5rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter drop-shadow-2xl leading-none transition-all duration-300 group-hover/result:scale-105">
                                    ${result.stake}
                                </p>
                                <div className="mt-6 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-[10px] font-black italic uppercase tracking-widest shadow-[0_0_15px_#22c55e] border border-white/20">
                                    {result.percent}% del bankroll
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 text-orange-500/90 p-8 rounded-[2rem] border border-orange-500/20 bg-orange-500/10 backdrop-blur-md max-w-[280px] shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                            <Flame className="w-8 h-8 mx-auto mb-4 animate-bounce drop-shadow-glow" />
                            <p className="font-black uppercase italic tracking-tighter text-2xl leading-tight text-orange-100">Valor No Encontrado</p>
                            <p className="text-[9px] font-bold mt-3 opacity-80 leading-relaxed uppercase tracking-widest text-orange-200/60">La probabilidad estimada no compensa el riesgo del mercado.</p>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 flex items-start gap-4 text-left w-full relative z-10">
                        <div className="p-2 bg-white/5 rounded-lg shrink-0 border border-white/5">
                            <Info className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                            Este criterio maximiza el crecimiento del capital a largo plazo. El <span className="text-primary font-black">Quarter Kelly (25%)</span> es la norma profesional para minimizar la volatilidad.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
