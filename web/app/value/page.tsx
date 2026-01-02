"use client";

import { useState, useEffect } from 'react';
import {
    Zap, Target, TrendingUp, Shield, BarChart3,
    ChevronRight, ArrowLeft, Activity, Star,
    AlertCircle, Sparkles, Filter, Search
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function ValueBetsPage() {
    const [loading, setLoading] = useState(true);
    const [valueBets, setValueBets] = useState<any[]>([]);
    const [selectedSport, setSelectedSport] = useState('all');
    const [minEdge, setMinEdge] = useState(5);
    const [selectedBookmaker, setSelectedBookmaker] = useState('all');

    const sports = [
        { id: 'all', name: 'TODOS LOS DEPORTES', icon: Filter },
        { id: 'football', name: 'FÚTBOL', icon: Activity },
        { id: 'basketball', name: 'NBA', icon: Zap },
        { id: 'tennis', name: 'TENIS', icon: Target }
    ];

    useEffect(() => {
        const fetchValueBets = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/value?sport=${selectedSport}`);
                const data = await res.json();
                if (data.valueBets) {
                    setValueBets(data.valueBets);
                }
            } catch (error) {
                console.error("Error fetching value bets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchValueBets();
        const interval = setInterval(fetchValueBets, 60000 * 5);
        return () => clearInterval(interval);
    }, [selectedSport]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 pt-24 pb-20 px-4 md:px-8 max-w-[90rem] mx-auto space-y-12">
                {/* Header terminal-style */}
                <div className="space-y-8 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="flex justify-center flex-col items-center gap-6 relative z-10">
                        <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)] animate-fade-in-up">
                            <div className="relative">
                                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                                <div className="absolute inset-0 bg-primary blur-md opacity-50 animate-pulse"></div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">VALUE SCANNER PRO v5.0</span>
                        </div>
                        <h1 className="text-7xl md:text-[6rem] font-black italic uppercase tracking-tighter leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] animate-fade-in-up delay-100">
                            VALUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary animate-gradient-x">BETS</span>
                        </h1>
                    </div>
                    <p className="max-w-3xl mx-auto text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed animate-fade-in-up delay-200">
                        Nuestro algoritmo escanea cuotas en tiempo real comparándolas con proyecciones estadísticas para encontrar ineficiencias en el mercado.
                    </p>
                </div>

                {/* Filter Controls Row */}
                <div className="space-y-8 animate-fade-in-up delay-300">
                    <div className="flex flex-wrap justify-center gap-3 p-2 rounded-full w-fit mx-auto relative group">
                        <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {sports.map((sport) => (
                            <button
                                key={sport.id}
                                onClick={() => setSelectedSport(sport.id)}
                                className={clsx(
                                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative overflow-hidden group/btn",
                                    selectedSport === sport.id
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105"
                                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/20"
                                )}
                            >
                                {selectedSport === sport.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 translate-x-[-150%] animate-shine"></div>
                                )}
                                <sport.icon className={clsx("w-3.5 h-3.5", selectedSport === sport.id ? "text-primary" : "text-gray-500 group-hover/btn:text-white")} />
                                {sport.name}
                            </button>
                        ))}
                    </div>

                    <div className="glass-card p-1 rounded-[2.5rem] max-w-5xl mx-auto border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-10 bg-[#080808]/80 backdrop-blur-xl rounded-[2.3rem] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 opacity-50"></div>

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full justify-between">
                                <div className="flex items-center gap-6 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner w-full md:w-auto justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3 text-primary" /> MIN EDGE
                                        </span>
                                        <span className="text-xl font-black text-white italic tracking-tighter">{minEdge}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2" max="25" step="1"
                                        value={minEdge}
                                        onChange={(e) => setMinEdge(parseInt(e.target.value))}
                                        className="w-32 accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                                    />
                                </div>

                                <div className="flex items-center gap-6 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner w-full md:w-auto justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-3 h-3 text-purple-500" /> BOOKMAKER
                                        </span>
                                        <select
                                            value={selectedBookmaker}
                                            onChange={(e) => setSelectedBookmaker(e.target.value)}
                                            className="bg-transparent border-none text-sm font-black text-white uppercase tracking-wider cursor-pointer outline-none p-0 focus:ring-0"
                                        >
                                            <option value="all" className="bg-black text-gray-300">TODOS</option>
                                            <option value="betplay" className="bg-black text-gray-300">BETPLAY</option>
                                            <option value="wplay" className="bg-black text-gray-300">WPLAY</option>
                                            <option value="rushbet" className="bg-black text-gray-300">RUSHBET</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20 w-full md:w-auto justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">RESULTADOS</span>
                                    <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{valueBets.filter(b => parseInt(b.edge) >= minEdge).length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-96 rounded-[3rem] bg-white/[0.03] border border-white/5 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>
                            </div>
                        ))
                    ) : valueBets.filter(b => parseInt(b.edge) >= minEdge).length === 0 ? (
                        <div className="col-span-full py-40 text-center space-y-6 animate-fade-in-up">
                            <div className="relative inline-block">
                                <Search className="w-20 h-20 text-gray-800 mx-auto" />
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                            </div>
                            <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No se detectaron ineficiencias con Edge {'>'}={minEdge}%</p>
                        </div>
                    ) : (
                        valueBets
                            .filter(b => parseInt(b.edge) >= minEdge)
                            .map((bet, index) => (
                                <div key={bet.id} className="group relative glass-card rounded-[3rem] p-1 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-[3rem] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity"></div>

                                    <div className="bg-[#0a0a0a] rounded-[2.8rem] p-8 h-full flex flex-col justify-between relative overflow-hidden group-hover:bg-[#080808] transition-colors">
                                        {/* Background Glow */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700"></div>

                                        <div className="space-y-8 relative z-10">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-white/5 text-gray-300 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                                                            {bet.league}
                                                        </div>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></span>
                                                    </div>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-8 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                                        {bet.match}
                                                    </h3>
                                                </div>

                                                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 flex flex-col items-center min-w-[4rem] group-hover:bg-primary group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                                                    <TrendingUp className="w-3.5 h-3.5 mb-0.5" />
                                                    <span className="text-[10px] font-black tracking-widest">{bet.edge}</span>
                                                </div>
                                            </div>

                                            {/* Stats Box */}
                                            <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 space-y-6 backdrop-blur-sm group-hover:border-white/10 transition-colors">
                                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Mercado</p>
                                                        <p className="text-lg font-black italic uppercase text-white leading-none tracking-tight">{bet.market}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="bg-[#050505] px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                                                            <p className="text-xl font-black text-primary leading-none tabular-nums tracking-tighter">{bet.odds}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Probability Comparison Line */}
                                                <div className="space-y-3 pt-1">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                        <span className="text-gray-500">Implícita {bet.impliedProb}</span>
                                                        <span className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]">IA {bet.realProb}</span>
                                                    </div>
                                                    <div className="h-2.5 bg-black rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner relative">
                                                        {/* Markers */}
                                                        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-600 z-10" style={{ left: bet.impliedProb }}></div>
                                                        <div className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000 ease-out" style={{ width: bet.realProb }}></div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-end pt-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Kelly Stake</p>
                                                        <div className="flex items-center gap-1.5 text-green-400">
                                                            <Shield className="w-3 h-3" />
                                                            <span className="text-xs font-black uppercase tracking-tight">{bet.kellyStake || "1u"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={clsx(
                                                            "text-lg font-black italic tracking-tighter uppercase",
                                                            bet.verdict?.includes('ALTO') || bet.verdict === 'EXCELENTE' ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400" : "text-blue-400"
                                                        )}>{bet.verdict}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic px-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                "{bet.reasoning}"
                                            </p>
                                        </div>

                                        <button className="w-full mt-8 py-4 bg-white/[0.03] hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.2em] rounded-[1.5rem] text-[10px] transition-all duration-300 flex items-center justify-center gap-3 border border-white/10 hover:border-transparent group/btn relative overflow-hidden">
                                            <span className="relative z-10 flex items-center gap-2">APOSTAR AHORA <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" /></span>
                                        </button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* Footer Insight */}
                <div className="flex flex-col items-center gap-12 pt-12 pb-20">
                    <div className="max-w-3xl text-center space-y-8 relative">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>
                        <AlertCircle className="w-12 h-12 text-gray-800 mx-auto animate-pulse" />
                        <p className="text-[10px] md:text-xs font-bold text-gray-500 leading-loose uppercase tracking-[0.2em] px-10 py-8 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] relative z-10 shadow-2xl">
                            *El "Value Edge" representa la diferencia entre la probabilidad estimada por nuestro Oráculo IA y la implícita en la cuota de la casa. Un Edge superior al 10% se considera una oportunidad de alta rentabilidad a largo plazo. Las cuotas son obtenidas de BetPlay en tiempo real.
                        </p>
                    </div>

                    <Link href="/" className="px-12 py-5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105 transition-all flex items-center gap-4 group backdrop-blur-md shadow-lg">
                        <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-2 transition-transform" />
                        VOLVER AL TERMINAL PRINCIPAL
                    </Link>
                </div>
            </main>
        </div>
    );
}
