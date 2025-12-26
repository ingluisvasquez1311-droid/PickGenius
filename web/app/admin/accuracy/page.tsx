'use client';

import { useEffect, useState } from 'react';
import { predictionTrackingService, type AccuracyStats } from '@/lib/services/predictionTrackingService';
import { Brain, Target, TrendingUp, Award, BarChart3, Calendar } from 'lucide-react';
import { Line, Bar } from 'recharts';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AccuracyDashboard() {
    const [stats, setStats] = useState<AccuracyStats[]>([]);
    const [period, setPeriod] = useState<'all' | 'week' | 'month'>('month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [period]);

    const loadStats = async () => {
        setLoading(true);
        const data = await predictionTrackingService.getAccuracyStats(undefined, period);
        setStats(data);
        setLoading(false);
    };

    const overallAccuracy = stats.length > 0
        ? Math.round(stats.reduce((sum, s) => sum + s.accuracy, 0) / stats.length)
        : 0;

    const totalPredictions = stats.reduce((sum, s) => sum + s.totalPredictions, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
                <div className="text-center">
                    <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-400">Analizando precisión de IA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] via-[#1a0b2e] to-[#0b0b0b] pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl border border-primary/30">
                            <Brain className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Analytics de Precisión IA
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">Rendimiento histórico de las predicciones</p>
                </div>

                {/* Period Selector */}
                <div className="flex justify-center gap-4 mb-8">
                    {(['week', 'month', 'all'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`
                px-6 py-3 rounded-xl font-semibold transition-all
                ${period === p
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }
              `}
                        >
                            {p === 'week' ? 'Última Semana' : p === 'month' ? 'Último Mes' : 'Histórico'}
                        </button>
                    ))}
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <KPICard
                        title="Precisión General"
                        value={`${overallAccuracy}%`}
                        icon={Target}
                        trend={overallAccuracy >= 70 ? 'up' : overallAccuracy >= 60 ? 'stable' : 'down'}
                    />
                    <KPICard
                        title="Predicciones Totales"
                        value={totalPredictions.toLocaleString()}
                        icon={Brain}
                        trend="stable"
                    />
                    <KPICard
                        title="Deportes Activos"
                        value={stats.length.toString()}
                        icon={Award}
                        trend="up"
                    />
                    <KPICard
                        title="Confianza Promedio"
                        value={`${stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.avgConfidence, 0) / stats.length) : 0}%`}
                        icon={TrendingUp}
                        trend="up"
                    />
                </div>

                {/* Accuracy by Sport */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        Precisión por Deporte
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.map((stat) => (
                            <SportAccuracyCard key={stat.sport} stat={stat} />
                        ))}
                    </div>
                </div>

                {/* Market Accuracy Comparison */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Precisión por Mercado</h2>

                    {stats.length > 0 && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="sport" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1a1a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="marketAccuracy.winner" name="Ganador" fill="#00e5c2" />
                                <Bar dataKey="marketAccuracy.overUnder" name="OVER/UNDER" fill="#8b5cf6" />
                                <Bar dataKey="marketAccuracy.btts" name="BTTS" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend }: any) {
    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        stable: 'text-blue-400',
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
                <Icon className="w-8 h-8 text-primary" />
                <span className={`text-sm font-semibold ${trendColors[trend]}`}>
                    {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}

function SportAccuracyCard({ stat }: { stat: AccuracyStats }) {
    const accuracyColor = stat.accuracy >= 70 ? 'text-green-400' : stat.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400';
    const progressColor = stat.accuracy >= 70 ? 'bg-green-500' : stat.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-white font-bold capitalize">{stat.sport}</h3>
                    <p className="text text-gray-500 text-sm">{stat.totalPredictions} predicciones</p>
                </div>
                <span className={`text-2xl font-black ${accuracyColor}`}>
                    {stat.accuracy}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full ${progressColor} transition-all duration-500`}
                    style={{ width: `${stat.accuracy}%` }}
                />
            </div>

            {/* Market breakdown */}
            <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-400">
                    <span>OVER/UNDER:</span>
                    <span className="text-white font-semibold">{stat.marketAccuracy.overUnder}%</span>
                </div>
                {stat.marketAccuracy.btts !== undefined && (
                    <div className="flex justify-between text-gray-400">
                        <span>BTTS:</span>
                        <span className="text-white font-semibold">{stat.marketAccuracy.btts}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
