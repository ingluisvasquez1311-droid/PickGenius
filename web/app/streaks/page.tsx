"use client";

import { useState, useEffect } from 'react';
import { Flame, Trophy, TrendingUp, Zap, ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function StreaksPage() {
    const [streaks, setStreaks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sport, setSport] = useState('all');
    const router = useRouter();

    const fetchStreaks = async (targetSport: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/streaks?sport=${targetSport}`);
            const data = await res.json();
            setStreaks(data.streaks || []);
        } catch (e) {
            console.error("Error fetching streaks:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreaks(sport);
    }, [sport]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-orange-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-8 relative">
                    <div className="absolute bottom-0 left-0 w-32 h-1 bg-gradient-to-r from-orange-500 to-transparent"></div>
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <Link href="/" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10 group">
                                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                            </Link>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 backdrop-blur-md">
                                <Flame className="w-4 h-4 text-orange-500 animate-fire" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Heat Check Protocol</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-[5.5rem] font-black italic tracking-tighter uppercase relative leading-none text-white drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                            ZONE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">ON FIRE</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-orange-500" />
                            Identificando equipos intocables en tiempo real
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                            {[
                                { id: 'all', name: 'Todos', icon: Activity },
                                { id: 'football', name: 'Fútbol', icon: Trophy },
                                { id: 'basketball', name: 'NBA', icon: Zap }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSport(s.id)}
                                    className={clsx(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                        sport === s.id ? "bg-orange-500 text-black shadow-glow-sm" : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    <s.icon className="w-3 h-3" />
                                    {s.name}
                                </button>
                            ))}
                        </div>
                        <div className="text-right hidden md:block border-l border-white/5 pl-8">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Streaks</p>
                            <p className="text-3xl font-black italic text-white leading-none">
                                {streaks.length} <span className="text-orange-500">ACTIVE</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main List */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-40 bg-white/5 rounded-[2rem] animate-pulse border border-white/5"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {streaks.map((s) => (
                                    <div key={s.id} className="glass-card p-1 rounded-[2.5rem] border border-white/10 hover:border-orange-500/50 hover:cyber-border transition-all duration-500 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#080808] to-black rounded-[2.5rem]"></div>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all duration-700"></div>

                                        <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="flex items-center gap-6 w-full md:w-auto">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                        <Trophy className="w-8 h-8 text-white drop-shadow-glow" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-black border border-white/20 px-2 py-1 rounded-lg text-[9px] font-black text-orange-500 shadow-xl uppercase tracking-wider">
                                                        #{s.id} Rank
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-2 py-0.5 rounded bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest text-orange-400">{s.sport}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                                                            <Activity className="w-3 h-3" /> Serie Activa
                                                        </span>
                                                    </div>
                                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{s.team}</h3>
                                                    <p className="text-[10px] text-gray-400 mt-1 font-bold tracking-wide uppercase">Próximo: <span className="text-white border-b border-white/20 pb-0.5">{s.next}</span></p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right">
                                                    <div className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-600 tracking-tighter drop-shadow-sm">{s.streak}</div>
                                                    <div className="text-[9px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded inline-block mt-1">+ {s.diff} Diff</div>
                                                </div>
                                                <div className="h-12 w-[1px] bg-white/10 hidden md:block"></div>
                                                <button className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black transition-all group/btn hidden md:block">
                                                    <TrendingUp className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0c0c0c] to-black border border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                            <div className="absolute top-0 right-0 p-20 bg-orange-500/5 rounded-full blur-[60px]"></div>

                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <TrendingUp className="w-7 h-7 text-orange-500" />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3 text-white">Algoritmo de Momentum</h3>
                                <p className="text-[10px] text-gray-400 leading-relaxed font-bold tracking-wide uppercase">
                                    Nuestro sistema analiza las últimas 10 actuaciones de cada equipo, ponderando la dificultad del oponente y el margen de victoria para detectar anomalías estadísticas.
                                </p>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        Win Streak &gt; 3
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        Cover ROI &gt; 15%
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        Dominance Factor
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
