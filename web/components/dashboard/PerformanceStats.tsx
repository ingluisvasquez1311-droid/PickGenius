'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Target, Trophy, Zap } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface Stats {
    totalPredictions: number;
    winRate: number;
    hotPicks: number;
    currentStreak: number;
    bestSport: string;
    chartData: { date: string; wins: number }[];
}

export default function PerformanceStats() {
    const { user, getHistory } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalPredictions: 0,
        winRate: 0,
        hotPicks: 0,
        currentStreak: 0,
        bestSport: 'N/A',
        chartData: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        if (!user) return;

        try {
            const history = await getHistory(100);

            // Calculate stats
            const total = history.length;
            const wins = history.filter(p => p.result === 'win').length;
            const winRate = total > 0 ? (wins / total) * 100 : 0;
            const hotPicks = history.filter(p => p.probability >= 75).length;

            // Calculate current streak
            let streak = 0;
            for (let i = 0; i < history.length; i++) {
                if (history[i].result === 'win') streak++;
                else break;
            }

            // Find best sport
            const sportCounts: Record<string, { total: number; wins: number }> = {};
            history.forEach(p => {
                if (!sportCounts[p.sport]) {
                    sportCounts[p.sport] = { total: 0, wins: 0 };
                }
                sportCounts[p.sport].total++;
                if (p.result === 'win') sportCounts[p.sport].wins++;
            });

            let bestSport = 'N/A';
            let bestRate = 0;
            Object.entries(sportCounts).forEach(([sport, data]) => {
                const rate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestSport = sport;
                }
            });

            // Chart data (last 7 days)
            const chartData = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toLocaleDateString('es', { month: 'short', day: 'numeric' });

                const dayWins = history.filter(p => {
                    const pDate = p.timestamp.toDate();
                    return pDate.toDateString() === date.toDateString() && p.result === 'win';
                }).length;

                return { date: dateStr, wins: dayWins };
            });

            setStats({
                totalPredictions: total,
                winRate: Math.round(winRate),
                hotPicks,
                currentStreak: streak,
                bestSport,
                chartData,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                        <div className="h-12 bg-white/5 rounded mb-2"></div>
                        <div className="h-6 bg-white/5 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            icon: Target,
            label: 'Win Rate',
            value: `${stats.winRate}%`,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: Trophy,
            label: 'Total Predicciones',
            value: stats.totalPredictions,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
        },
        {
            icon: Zap,
            label: 'Hot Picks',
            value: stats.hotPicks,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
        },
        {
            icon: TrendingUp,
            label: 'Racha Actual',
            value: `${stats.currentStreak} 🔥`,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="glass-card p-6 hover:border-white/20 transition-all">
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className={`text-3xl font-black mb-1 ${stat.color}`}>
                            {stat.value}
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Chart */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-black uppercase tracking-wider mb-4 text-white">
                    Rendimiento (Últimos 7 Días)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stats.chartData}>
                        <defs>
                            <linearGradient id="colorWins" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="wins"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorWins)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Best Sport */}
            {stats.bestSport !== 'N/A' && (
                <div className="glass-card p-6 text-center">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Mejor Deporte
                    </div>
                    <div className="text-2xl font-black text-purple-400 uppercase">
                        {stats.bestSport}
                    </div>
                </div>
            )}
        </div>
    );
}
