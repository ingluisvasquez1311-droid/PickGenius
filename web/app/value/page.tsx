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
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[200px]"></div>
                <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-purple-600/5 blur-[180px]"></div>
                <div className="absolute inset-0 checkered-bg opacity-[0.02]"></div>
            </div>

            <main className="relative z-10 pt-32 pb-32 px-4 md:px-12 max-w-[90rem] mx-auto space-y-12">
                {/* Header terminal-style */}
                <div className="space-y-6 text-center">
                    <div className="flex justify-center flex-col items-center gap-4">
                        <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">VALUE SCANNER PRO v5.0</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none select-none">
                            VALUE <span className="text-primary italic">BETS</span>
                        </h1>
                    </div>
                    <p className="max-w-3xl mx-auto text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px] leading-relaxed">
                        Nuestro algoritmo escanea cuotas en tiempo real comparándolas con proyecciones estadísticas para encontrar ineficiencias en el mercado.
                    </p>
                </div>

                {/* Filter Controls Row */}
                <div className="space-y-6">
                    <div className="flex flex-wrap justify-center gap-4 bg-white/[0.02] p-2 rounded-full border border-white/5 w-fit mx-auto">
                        {sports.map((sport) => (
                            <button
                                key={sport.id}
                                onClick={() => setSelectedSport(sport.id)}
                                className={clsx(
                                    "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                    selectedSport === sport.id
                                        ? "bg-white text-black shadow-xl"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <sport.icon className="w-4 h-4" />
                                {sport.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 py-4 px-8 bg-white/[0.01] border border-white/5 rounded-[2rem] max-w-4xl mx-auto backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">MIN EDGE (%)</span>
                            <input
                                type="range"
                                min="2" max="25" step="1"
                                value={minEdge}
                                onChange={(e) => setMinEdge(parseInt(e.target.value))}
                                className="w-32 accent-primary transition-all cursor-pointer"
                            />
                            <span className="text-sm font-black text-primary italic min-w-[3ch]">{minEdge}%</span>
                        </div>

                        <div className="w-px h-4 bg-white/10 hidden sm:block"></div>

                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">BOOKMAKER</span>
                            <select
                                value={selectedBookmaker}
                                onChange={(e) => setSelectedBookmaker(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black text-white uppercase tracking-widest pointer outline-none"
                            >
                                <option value="all" className="bg-black">TODOS</option>
                                <option value="betplay" className="bg-black">BETPLAY</option>
                                <option value="wplay" className="bg-black">WPLAY</option>
                                <option value="rushbet" className="bg-black">RUSHBET</option>
                            </select>
                        </div>

                        <div className="w-px h-4 bg-white/10 hidden sm:block"></div>

                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">RESULTADOS</span>
                            <span className="text-xs font-black text-white">{valueBets.filter(b => parseInt(b.edge) >= minEdge).length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-96 rounded-[3rem] bg-white/[0.03] border border-white/5 animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                        ))
                    ) : valueBets.filter(b => parseInt(b.edge) >= minEdge).length === 0 ? (
                        <div className="col-span-full py-32 text-center space-y-6">
                            <Search className="w-16 h-16 text-gray-800 mx-auto" />
                            <p className="text-gray-500 font-black uppercase tracking-widest">No se detectaron ineficiencias con Edge {'>'}={minEdge}%</p>
                        </div>
                    ) : (
                        valueBets
                            .filter(b => parseInt(b.edge) >= minEdge)
                            .map((bet) => (
                                <div key={bet.id} className="group relative bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-1 shadow-2xl hover:border-primary/30 transition-all hover:-translate-y-2">
                                    <div className="p-10 space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2.8rem]">
                                        {/* Edge Badge Overlay */}
                                        <div className="absolute top-8 right-8">
                                            <div className="bg-primary/20 text-primary px-4 py-1.5 rounded-full border border-primary/20 flex items-center gap-2">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black tracking-widest">{bet.edge} EDGE</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                                                    {bet.league}
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                            </div>
                                            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white transition-colors group-hover:text-primary">
                                                {bet.match}
                                            </h3>
                                        </div>

                                        <div className="p-6 bg-black/60 rounded-[2.5rem] border border-white/5 space-y-6 backdrop-blur-xl">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Mercado Detectado</p>
                                                    <p className="text-xl font-black italic uppercase text-white leading-none tracking-tight">{bet.market}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="bg-primary px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                                                        <p className="text-2xl font-black text-black leading-none">{bet.odds}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Probability Comparison Line */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                    <span className="text-gray-500">Implícita ({bet.impliedProb})</span>
                                                    <span className="text-primary">Real IA ({bet.realProb})</span>
                                                </div>
                                                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                    <div className="h-full bg-white/10 rounded-full relative">
                                                        {/* Implied Marker */}
                                                        <div
                                                            className="absolute top-0 bottom-0 bg-white/40 w-0.5 z-10 blur-[1px]"
                                                            style={{ left: bet.impliedProb }}
                                                        ></div>
                                                        {/* Real Progress */}
                                                        <div
                                                            className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-1000 ease-out"
                                                            style={{ width: bet.realProb }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Staking Kelly</p>
                                                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight w-fit">
                                                        {bet.kellyStake || "1u"}
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Veredicto</p>
                                                    <p className={clsx(
                                                        "text-xl font-black italic tracking-tighter",
                                                        bet.verdict?.includes('ALTO') || bet.verdict === 'EXCELENTE' ? "text-primary" : "text-blue-400"
                                                    )}>{bet.verdict}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 font-medium leading-relaxed italic border-t border-white/5 pt-4">
                                                "{bet.reasoning}"
                                            </p>
                                        </div>

                                        <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-[2rem] text-[10px] hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02]">
                                            APOSTAR ESTE VALUE
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* Footer Insight */}
                <div className="flex flex-col items-center gap-12 pt-12">
                    <div className="max-w-2xl text-center space-y-6">
                        <AlertCircle className="w-10 h-10 text-gray-800 mx-auto" />
                        <p className="text-[10px] font-bold text-gray-600 leading-loose uppercase tracking-[0.3em] px-8 py-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                            *El "Value Edge" representa la diferencia entre la probabilidad estimada por nuestro Oráculo IA y la implícita en la cuota de la casa. Un Edge superior al 10% se considera una oportunidad de alta rentabilidad a largo plazo. Las cuotas son obtenidas de BetPlay.
                        </p>
                    </div>

                    <Link href="/" className="px-12 py-5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-4 group">
                        <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-2 transition-transform" />
                        VOLVER AL TERMINAL PRINCIPAL
                    </Link>
                </div>
            </main>
        </div>
    );
}
