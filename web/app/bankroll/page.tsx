'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon,
    History,
    Target,
    Activity,
    LifeBuoy,
    ShieldCheck as ShieldCheckIcon
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function BankrollPage() {
    const { user } = useAuth();
    const [totalBankroll, setTotalBankroll] = useState(1250); // Initial mock total

    // Mock growth data
    const data = [
        { name: 'Lun', value: 1000 },
        { name: 'Mar', value: 1050 },
        { name: 'Mie', value: 1020 },
        { name: 'Jue', value: 1150 },
        { name: 'Vie', value: 1100 },
        { name: 'Sab', value: 1250 },
    ];

    const stats = [
        { label: 'Beneficio Total', value: '+$250', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'ROI Estimado', value: '12.4%', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Win Rate IA', value: '68%', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Riesgo Actual', value: 'Bajo', icon: ShieldCheckIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    const distribution = [
        { name: 'Fútbol', value: 450, color: '#22c55e' },
        { name: 'Baloncesto', value: 300, color: '#f97316' },
        { name: 'Tenis', value: 200, color: '#a855f7' },
        { name: 'Otros', value: 300, color: '#3b82f6' },
    ];

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 pb-32 pt-24">

            {/* Header Area */}
            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Gestión de Capital</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">
                            BANKROLL <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">TERMINAL</span>
                        </h1>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-end min-w-[240px]">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Balance Actual</span>
                        <div className="text-4xl font-black italic text-white">${totalBankroll.toLocaleString()}</div>
                        <div className="mt-2 text-[10px] font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> +25% esta semana
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* STATS GRID */}
                    <div className="lg:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-white/10 transition-all">
                                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${stat.bg}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black italic text-white uppercase">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* MAIN CHART */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] relative overflow-hidden">
                            <div className="flex justify-between items-center mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Crecimiento de Capital</h2>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Historial de Rendimiento Semanal</p>
                                </div>
                            </div>

                            <div className="h-[300px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', borderRadius: '15px', color: '#fff' }}
                                            itemStyle={{ color: '#10b981' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem]">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-500" />
                                Historial Reciente
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white italic truncate max-w-[150px] lg:max-w-none uppercase">Valor Detectado: Real Madrid</p>
                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Hace 2 horas • Cuota 1.95</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-green-400">+$45.20</p>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase">GANADA</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ALLOCATION AREA */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center">
                            <h3 className="text-sm font-black italic uppercase tracking-widest mb-8">Distribución de Inversión</h3>
                            <div className="h-[180px] w-full flex items-center justify-center my-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distribution}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {distribution.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-gray-400">{item.name}</span>
                                        </div>
                                        <span className="text-white">${item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ADVANCED TOOLS */}
                        <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[3rem]">
                            <h3 className="text-sm font-black italic uppercase tracking-widest mb-6">Herramientas Pro</h3>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all group">
                                    <span className="text-[9px] font-black uppercase tracking-widest">Optimizar Stake (Kelly)</span>
                                    <LifeBuoy className="w-4 h-4" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all group">
                                    <span className="text-[9px] font-black uppercase tracking-widest">Simulador de Riesgo</span>
                                    <PieChartIcon className="w-4 h-4" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all group">
                                    <span className="text-[9px] font-black uppercase tracking-widest">Reporte Mensual PDF</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
