"use client";

import { useState, useMemo } from 'react';
import {
    Trophy, Medal, Target, TrendingUp, Zap,
    Crown, Star, ArrowUp, ArrowDown, Search,
    Flame, Globe, Activity, Shield, User
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useBankroll } from '@/hooks/useBankroll';
import { useUser } from '@/components/ClerkSafeProvider';
import clsx from 'clsx';

interface LeaderboardUser {
    rank: number;
    name: string;
    avatar?: string;
    level: number;
    points: number;
    winRate: number;
    roi: number;
    isAI?: boolean;
    trend: 'up' | 'down' | 'stable';
}

export default function LeaderboardPage() {
    const { user } = useUser();
    const { points, level } = useGamification();
    const { winRate, roi, entries } = useBankroll();
    const [searchTerm, setSearchTerm] = useState('');

    // Simulated Top Analysts + Current User
    const players: LeaderboardUser[] = useMemo(() => {
        const bots: LeaderboardUser[] = [
            { rank: 1, name: "THE ORACLE v5", level: 99, points: 154200, winRate: 78.4, roi: 24.5, isAI: true, trend: 'stable' },
            { rank: 2, name: "VEGAS SHARK", level: 85, points: 82400, winRate: 71.2, roi: 18.2, trend: 'up' },
            { rank: 3, name: "PROPHET ANALYTICS", level: 82, points: 79100, winRate: 69.8, roi: 15.6, isAI: true, trend: 'down' },
            { rank: 4, name: "EL MATADOR", level: 78, points: 65000, winRate: 74.1, roi: 21.0, trend: 'up' },
            { rank: 5, name: "DATA WHISPERER", level: 75, points: 58200, winRate: 65.5, roi: 12.8, trend: 'stable' },
            { rank: 6, name: "SHARP BETTOR 3000", level: 72, points: 51000, winRate: 68.2, roi: 14.2, isAI: true, trend: 'up' },
            { rank: 7, name: "STREAK FINDER", level: 68, points: 42300, winRate: 62.1, roi: 9.5, trend: 'down' },
        ];

        const currentUser: LeaderboardUser = {
            rank: 8, // Simplified rank
            name: user?.fullName || user?.username || "TÚ (YOU)",
            level: level,
            points: points,
            winRate: winRate,
            roi: roi,
            trend: 'up'
        };

        const list = [...bots, currentUser].sort((a, b) => b.points - a.points);
        return list.map((p, i) => ({ ...p, rank: i + 1 }));
    }, [user, points, level, winRate, roi]);

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black pb-24 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <main className="relative z-10 pt-32 px-4 md:px-12 max-w-7xl mx-auto space-y-16">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 w-fit mx-auto md:mx-0">
                            <Trophy className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">GLOBAL RANKING TERMINAL</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            LEADER<span className="text-primary">BOARD</span>
                        </h1>
                        <p className="max-w-xl text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.2em] leading-loose">
                            Compite contra la élite. Tu posición se basa en el volumen de análisis (XP), efectividad de picks y ROI acumulado.
                        </p>
                    </div>

                    {/* User Stats Card */}
                    <div className="glass-card p-1 rounded-[2.5rem] border-primary/20 bg-primary/5 min-w-[300px] animate-fade-in-up">
                        <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.3rem] flex flex-col items-center gap-4">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">TU STATUS ACTUAL</p>
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black italic tracking-tighter">#{players.find(p => p.name.includes("TÚ"))?.rank || '8'}</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">GLOBAL</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-1000"
                                    style={{ width: `${(points % 1000) / 10}%` }}
                                ></div>
                            </div>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Nivel {level} • {points.toLocaleString()} XP</p>
                        </div>
                    </div>
                </div>

                {/* Filters & Top 3 Highlights */}
                <div className="space-y-12">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="relative group w-full md:w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                type="text"
                                placeholder="BUSCAR ANALISTA..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['GLOBAL', 'AMIGOS', 'POR DEPORTE'].map((t, i) => (
                                <button key={t} className={clsx(
                                    "px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all",
                                    i === 0 ? "bg-white text-black" : "bg-white/5 text-gray-500 hover:text-white"
                                )}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rankings Table */}
                    <div className="glass-card p-1 rounded-[3rem] border-white/5 overflow-hidden">
                        <div className="bg-[#080808]/90 backdrop-blur-3xl p-2 rounded-[2.8rem]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-8 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] w-24">RANK</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">ANALISTA</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] text-center">NIVEL</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] text-center">PUNTOS XP</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] text-center">WIN RATE</th>
                                            <th className="px-8 py-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] text-center">ROI</th>
                                            <th className="px-8 py-8 text-right text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">TREND</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                                        {filteredPlayers.map((player) => (
                                            <tr
                                                key={player.rank}
                                                className={clsx(
                                                    "group hover:bg-white/[0.02] transition-all",
                                                    player.name.includes("TÚ") && "bg-primary/[0.03]"
                                                )}
                                            >
                                                <td className="px-8 py-10">
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 text-xl font-black italic tracking-tighter group-hover:bg-primary group-hover:text-black transition-all">
                                                        {player.rank}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-[1px]">
                                                                <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center overflow-hidden">
                                                                    {player.isAI ? <Zap className="w-6 h-6 text-primary" /> : <User className="w-6 h-6 text-gray-600" />}
                                                                </div>
                                                            </div>
                                                            {player.rank <= 3 && (
                                                                <div className="absolute -top-2 -right-2 p-1.5 bg-primary rounded-lg text-black">
                                                                    <Crown className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-black italic uppercase tracking-tight text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                                                {player.name}
                                                                {player.isAI && <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded-md">AI PRO</span>}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                                                                {player.isAI ? 'Algoritmo de Predicción' : 'Elite Analyst'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-10 text-center">
                                                    <span className="text-lg font-black italic text-gray-400">Lvl {player.level}</span>
                                                </td>
                                                <td className="px-8 py-10 text-center">
                                                    <span className="text-lg font-black italic text-white">{player.points.toLocaleString()}</span>
                                                </td>
                                                <td className="px-8 py-10 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-lg font-black italic text-green-400">{player.winRate.toFixed(1)}%</span>
                                                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-green-500" style={{ width: `${player.winRate}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-10 text-center">
                                                    <span className={clsx(
                                                        "text-lg font-black italic",
                                                        player.roi >= 0 ? "text-primary" : "text-red-500"
                                                    )}>
                                                        {player.roi >= 0 ? '+' : ''}{player.roi.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="px-8 py-10 text-right">
                                                    <div className="flex justify-end">
                                                        {player.trend === 'up' && <ArrowUp className="w-5 h-5 text-green-500" />}
                                                        {player.trend === 'down' && <ArrowDown className="w-5 h-5 text-red-500" />}
                                                        {player.trend === 'stable' && <Activity className="w-5 h-5 text-gray-600" />}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-8 text-center text-gray-600">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cómputo Seguro</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Sync</span>
                        </div>
                    </div>
                    <p className="max-w-3xl text-[9px] font-bold uppercase tracking-[0.2em] leading-loose opacity-50">
                        *Los rankings se actualizan cada 15 minutos. El cálculo de puntos tiene en cuenta el Stake real, la cuota y la probabilidad de acierto. El abuso de registros manuales falsos resultará en la exclusión permanente de la competición global.
                    </p>
                </div>
            </main>
        </div>
    );
}
