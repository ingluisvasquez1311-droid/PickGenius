"use client";

import { useState, useEffect } from 'react';
import { Flame, Trophy, TrendingUp, Zap, ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function StreaksPage() {
    const [streaks, setStreaks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Mock data for immediate visualization while we build the backend
    useEffect(() => {
        setTimeout(() => {
            setStreaks([
                { id: 1, team: 'Real Madrid', sport: 'football', streak: '5 Wins', diff: '+12', next: 'vs Barcelona' },
                { id: 2, team: 'Lakers', sport: 'basketball', streak: '4 Wins', diff: '+35', next: 'vs Warriors' },
                { id: 3, team: 'Man City', sport: 'football', streak: '8 Games Unbeaten', diff: '+18', next: 'vs Liverpool' },
                { id: 4, team: 'Celtics', sport: 'basketball', streak: '10 Home Wins', diff: '+80', next: 'vs Heat' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase relative">
                            ZONE <span className="text-orange-500">ON FIRE</span>
                            <Flame className="w-8 h-8 text-orange-500 absolute -top-4 -right-8 animate-bounce" />
                        </h1>
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Identificando equipos intocables en tiempo real</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="space-y-4">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {streaks.map((s) => (
                                <div key={s.id} className="glass-card p-6 rounded-3xl border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all"></div>

                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                                <Trophy className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{s.sport}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Serie Activa</span>
                                                </div>
                                                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">{s.team}</h3>
                                                <p className="text-xs text-gray-400 mt-1 font-medium">Próximo: <span className="text-white">{s.next}</span></p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-3xl font-black italic text-orange-500 tracking-tighter">{s.streak}</div>
                                            <div className="text-xs font-bold text-green-400 uppercase tracking-wider">Diff {s.diff}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                        <TrendingUp className="w-10 h-10 text-orange-500 mb-6" />
                        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">Algoritmo de Momentum</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Nuestro sistema analiza las últimas 10 actuaciones de cada equipo, ponderando la dificultad del oponente y el margen de victoria.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
