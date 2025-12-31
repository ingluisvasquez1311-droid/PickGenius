"use client";

import { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp, DollarSign, Target, Activity,
    ArrowLeft, Download, Zap, Shield, AlertCircle, Plus, X, Save, Trash2
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useBankroll, BankrollEntry } from '@/hooks/useBankroll';

export default function BankrollPage() {
    const {
        entries, currentBankroll, totalProfit, winRate, roi,
        addEntry, deleteEntry, initialBankroll, setInitialBankroll, isLoaded
    } = useBankroll();

    const [timeframe, setTimeframe] = useState('30D');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBet, setNewBet] = useState({
        match: '',
        type: 'W' as 'W' | 'L' | 'P',
        stake: 1,
        odds: 1.90,
        date: new Date().toISOString().split('T')[0]
    });

    // Dynamic Chart Data
    const chartData = useMemo(() => {
        if (!isLoaded || entries.length === 0) return [
            { day: '01', value: initialBankroll },
            { day: '30', value: initialBankroll }
        ];

        let runningTotal = initialBankroll;
        const data = [...entries].reverse().map((e) => {
            runningTotal += e.profit;
            return {
                day: new Date(e.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
                value: runningTotal,
                profit: e.profit
            };
        });

        // Add initial point
        return [{ day: 'Inicio', value: initialBankroll }, ...data];
    }, [entries, initialBankroll, isLoaded]);

    const stats = [
        { label: 'Bankroll Total', value: `${currentBankroll.toFixed(2)}u`, icon: DollarSign, color: 'text-white' },
        { label: 'Win Rate Real', value: `${winRate.toFixed(1)}%`, icon: Target, color: 'text-green-500' },
        { label: 'ROI Acumulado', value: `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`, icon: TrendingUp, color: 'text-primary' },
        { label: 'Profit Total', value: `${totalProfit > 0 ? '+' : ''}${totalProfit.toFixed(1)}u`, icon: Zap, color: 'text-yellow-500' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addEntry(newBet);
        setIsModalOpen(false);
        setNewBet({
            match: '',
            type: 'W',
            stake: 1,
            odds: 1.90,
            date: new Date().toISOString().split('T')[0]
        });
    };

    if (!isLoaded) return <div className="min-h-screen bg-[#020202] flex items-center justify-center"><Activity className="animate-spin text-primary w-12 h-12" /></div>;

    return (
        <div className="min-h-screen bg-[#020202] text-white pt-24 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden selection:bg-primary selection:text-black">
            {/* Brutalist Background Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[250px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col gap-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b-2 border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="group p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-primary transition-all duration-500">
                                <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-black" />
                            </Link>
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                                Ledger Analytics v2.0
                            </span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] flex flex-col">
                            <span className="text-white">BANKROLL</span>
                            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>CONTROL</span>
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-glow"
                        >
                            <Plus className="w-5 h-5" />
                            Registrar Apuesta
                        </button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-[#080808] border-2 border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between hover:border-primary/30 transition-all group">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</p>
                                <h4 className={clsx("text-4xl font-black italic tracking-tighter", stat.color)}>{stat.value}</h4>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Primary Graph: ROI Evolution */}
                    <div className="lg:col-span-8 bg-[#080808] border-2 border-white/5 rounded-[3.5rem] p-10 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Activity className="w-64 h-64 text-primary" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Evolución de Unidades</h3>
                            </div>
                        </div>

                        <div className="h-[400px] w-full mt-10 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#ffffff20"
                                        fontSize={10}
                                        fontWeight="900"
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#ffffff20"
                                        fontSize={10}
                                        fontWeight="900"
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0a0a0a',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                        }}
                                        itemStyle={{ color: '#8b5cf6' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary: History Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#080808] border-2 border-white/5 rounded-[3rem] p-10 space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h4 className="text-xs font-black uppercase text-gray-500 tracking-[0.3em]">Historial Reciente</h4>
                                <Download className="w-4 h-4 text-gray-700 hover:text-white cursor-pointer transition-colors" />
                            </div>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {entries.length === 0 ? (
                                    <div className="text-center py-12 opacity-30 italic text-sm">No hay registros aún</div>
                                ) : entries.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border border-white/5",
                                                item.type === 'W' ? "bg-green-500/10 text-green-500" :
                                                    item.type === 'L' ? "bg-red-500/10 text-red-500" : "bg-gray-500/10 text-gray-500"
                                            )}>
                                                {item.type}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{item.match}</span>
                                                <span className="text-[8px] font-mono text-gray-600">Odds: {item.odds ? item.odds.toFixed(2) : '—'} | Stake: {item.stake}u</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={clsx("font-mono font-black text-sm", item.profit > 0 ? "text-green-500" : item.profit < 0 ? "text-red-500" : "text-gray-500")}>
                                                {item.profit > 0 ? '+' : ''}{(item.profit || 0).toFixed(2)}u
                                            </span>
                                            <button
                                                onClick={() => deleteEntry(item.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation Widget */}
                        <div className="bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-10 space-y-6 relative overflow-hidden group shadow-glow-sm">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Shield className="w-16 h-16 text-primary" />
                            </div>
                            <h4 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-primary" />
                                Smart Stake
                            </h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed tracking-wider">
                                Basado en tu win rate actual ({(winRate || 0).toFixed(1)}%), el algoritmo sugiere un stake máximo por evento de <span className="text-primary">{((currentBankroll || 0) * 0.02).toFixed(1)}u (2%)</span> para gestión conservadora.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Agregar Apuesta */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-[#080808] border-4 border-primary/20 rounded-[3rem] p-10 w-full max-w-lg shadow-[0_0_100px_rgba(139,92,246,0.1)] scale-in-center">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Registrar <span className="text-primary">Operación</span></h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Evento / Equipo</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="EJ: LAKERS VS CELTICS"
                                    className="w-full bg-white/5 border-2 border-white/5 focus:border-primary/50 rounded-2xl p-4 font-black uppercase tracking-widest text-xs outline-none transition-all"
                                    value={newBet.match}
                                    onChange={e => setNewBet({ ...newBet, match: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cuota</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-white/5 border-2 border-white/5 focus:border-primary/50 rounded-2xl p-4 font-black text-xs outline-none transition-all"
                                        value={newBet.odds}
                                        onChange={e => setNewBet({ ...newBet, odds: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Stake (u)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.1"
                                        className="w-full bg-white/5 border-2 border-white/5 focus:border-primary/50 rounded-2xl p-4 font-black text-xs outline-none transition-all"
                                        value={newBet.stake}
                                        onChange={e => setNewBet({ ...newBet, stake: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resultado</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'W', label: 'WIN', color: 'peer-checked:bg-green-500' },
                                        { id: 'L', label: 'LOSS', color: 'peer-checked:bg-red-500' },
                                        { id: 'P', label: 'PUSH', color: 'peer-checked:bg-gray-500' }
                                    ].map(opt => (
                                        <label key={opt.id} className="flex-1 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="type"
                                                className="hidden peer"
                                                checked={newBet.type === opt.id}
                                                onChange={() => setNewBet({ ...newBet, type: opt.id as any })}
                                            />
                                            <div className={clsx(
                                                "py-3 text-center rounded-xl font-black text-[10px] transition-all border-2 border-white/5",
                                                opt.color,
                                                newBet.type === opt.id ? "text-black shadow-glow-sm" : "bg-white/5 text-gray-500 group-hover:text-white"
                                            )}>
                                                {opt.label}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-primary text-black rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-glow mt-8"
                            >
                                <Save className="w-5 h-5" />
                                Guardar Registro
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
