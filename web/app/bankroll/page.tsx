"use client";

import { useState, useMemo } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Target,
    Plus, History, BarChart3, PieChart as PieChartIcon,
    Trash2, AlertCircle, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useBankroll, BankrollEntry } from '@/hooks/useBankroll';
import clsx from 'clsx';

export default function BankrollDashboard() {
    const {
        entries, initialBankroll, currentBankroll, totalProfit,
        winRate, roi, addEntry, deleteEntry, setInitialBankroll, isLoaded
    } = useBankroll();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tempInitial, setTempInitial] = useState(initialBankroll.toString());
    const [newBet, setNewBet] = useState({
        match: '',
        stake: '',
        odds: '',
        type: 'W' as 'W' | 'L' | 'P'
    });

    // Chart Data Transformation
    const chartData = useMemo(() => {
        let runningTotal = initialBankroll;
        const historyData = [...entries].reverse().map((entry) => {
            runningTotal += entry.profit;
            return {
                date: new Date(entry.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
                balance: runningTotal,
                profit: entry.profit
            };
        });

        return [
            { date: 'Inicio', balance: initialBankroll, profit: 0 },
            ...historyData
        ];
    }, [entries, initialBankroll]);

    const pieData = useMemo(() => [
        { name: 'Wins', value: entries.filter(e => e.type === 'W').length, color: '#8B5CF6' },
        { name: 'Losses', value: entries.filter(e => e.type === 'L').length, color: '#EF4444' },
        { name: 'Push', value: entries.filter(e => e.type === 'P').length, color: '#3B82F6' },
    ], [entries]);

    const handleSaveInitial = (e: React.FormEvent) => {
        e.preventDefault();
        setInitialBankroll(Number(tempInitial));
        setIsSettingsOpen(false);
    };

    const handleAddBet = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBet.match || !newBet.stake || !newBet.odds) return;

        addEntry({
            date: new Date().toISOString(),
            match: newBet.match,
            stake: Number(newBet.stake),
            odds: Number(newBet.odds),
            type: newBet.type
        });

        setNewBet({ match: '', stake: '', odds: '', type: 'W' });
        setIsAddOpen(false);
    };

    if (!isLoaded) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Zap className="w-10 h-10 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black pb-24 font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full"></div>
            </div>

            <main className="relative z-10 pt-32 px-4 md:px-12 max-w-7xl mx-auto space-y-12">

                {/* Header & Main Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 w-fit">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">FINANCIAL TERMINAL</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            BANKROLL <span className="text-primary">CORE</span>
                        </h1>
                    </div>

                    <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-[2rem] gap-2">
                        <button
                            onClick={() => {
                                setTempInitial(initialBankroll.toString());
                                setIsSettingsOpen(true);
                            }}
                            className="px-6 py-5 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-white/10 transition-all flex items-center gap-3"
                        >
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            CONFIGURAR CAPITAL
                        </button>
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="px-8 py-5 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                        >
                            <Plus className="w-5 h-5" />
                            REGISTRAR APUESTA
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'BALANCE ACTUAL', value: `$${currentBankroll.toFixed(2)}`, sub: 'Capital Disponible', icon: Wallet, color: 'text-white' },
                        { label: 'PROFIT TOTAL', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`, sub: 'Ganancia Neta', icon: totalProfit >= 0 ? ArrowUpRight : ArrowDownRight, color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
                        { label: 'WIN RATE', value: `${winRate.toFixed(1)}%`, sub: 'Efectividad', icon: Target, color: 'text-primary' },
                        { label: 'ROI', value: `${roi.toFixed(1)}%`, sub: 'Retorno Inversión', icon: TrendingUp, color: 'text-blue-400' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/[0.05] transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <m.icon className="w-16 h-16" />
                            </div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">{m.label}</p>
                            <h3 className={clsx("text-4xl font-black italic tracking-tighter mb-1", m.color)}>{m.value}</h3>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{m.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Evolution Chart */}
                    <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 p-10 rounded-[3.5rem] space-y-8 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Crecimiento de Capital</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Desempeño acumulado histórico</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <BarChart3 className="w-5 h-5 text-primary" />
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#4b5563"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ dy: 10 }}
                                    />
                                    <YAxis
                                        stroke="#4b5563"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `$${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff10', borderRadius: '1rem', border: '1px solid #ffffff10' }}
                                        itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#8B5CF6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorBalance)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3.5rem] flex flex-col items-center justify-between space-y-8">
                        <div className="w-full space-y-1 text-left">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-left">Distribución</h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aciertos vs Errores</p>
                        </div>

                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-5xl font-black italic text-white tracking-tighter">{entries.length}</p>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">PICKS</p>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            {pieData.map((p, i) => (
                                <div key={i} className="flex justify-between items-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                                        <span className="text-[10px] font-black uppercase text-gray-400">{p.name}</span>
                                    </div>
                                    <span className="text-sm font-black italic">{p.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <History className="w-6 h-6 text-gray-600" />
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Historial Beta-Terminal</h2>
                    </div>

                    <div className="overflow-x-auto rounded-[2.5rem] border border-white/5 bg-[#0a0a0a]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Fecha</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Evento</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Stake</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Cuota</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Resultado</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Profit</th>
                                    <th className="px-8 py-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length > 0 ? entries.map((e) => (
                                    <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-mono text-gray-500">
                                                {new Date(e.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black uppercase italic tracking-tight">{e.match}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-bold">${e.stake}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-mono">@{e.odds.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={clsx(
                                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                e.type === 'W' ? 'bg-primary/20 text-primary border border-primary/30' :
                                                    e.type === 'L' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                        'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                                            )}>
                                                {e.type === 'W' ? 'WIN' : e.type === 'L' ? 'LOSS' : 'PUSH'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={clsx("text-lg font-black italic", e.profit >= 0 ? 'text-green-400' : 'text-red-400')}>
                                                {e.profit >= 0 ? '+' : ''}{e.profit.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => deleteEntry(e.id)}
                                                className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-gray-600">
                                                <TrendingUp className="w-12 h-12 opacity-10" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin movimientos registrados</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal: Registrar Apuesta */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] p-10 md:p-16 space-y-12 shadow-[0_0_100px_rgba(139,92,246,0.1)]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Nueva <span className="text-primary">Inversión</span></h2>
                            <button onClick={() => setIsAddOpen(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                <Trash2 className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleAddBet} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">EVENTO / MERCADO</label>
                                    <input
                                        autoFocus
                                        required
                                        type="text"
                                        placeholder="Messi Over 1.5 SOT"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold uppercase placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all"
                                        value={newBet.match}
                                        onChange={e => setNewBet(prev => ({ ...prev, match: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">RESULTADO</label>
                                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                                        {(['W', 'L', 'P'] as const).map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewBet(prev => ({ ...prev, type }))}
                                                className={clsx(
                                                    "flex-1 py-4 rounded-xl text-[10px] font-black uppercase transition-all",
                                                    newBet.type === type ? "bg-white text-black" : "text-gray-500 hover:text-white"
                                                )}
                                            >
                                                {type === 'W' ? 'WIN' : type === 'L' ? 'LOSS' : 'PUSH'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">STAKE ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="100.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all"
                                        value={newBet.stake}
                                        onChange={e => setNewBet(prev => ({ ...prev, stake: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">CUOTA (ODDS)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="1.90"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all"
                                        value={newBet.odds}
                                        onChange={e => setNewBet(prev => ({ ...prev, odds: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-6 bg-primary text-black font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] hover:scale-[1.01] active:scale-95 transition-all shadow-[0_20px_40px_rgba(139,92,246,0.2)]"
                            >
                                CONFIRMAR REGISTRO
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal: Configurar Capital Inicial */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSettingsOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] p-10 md:p-12 space-y-8 shadow-[0_0_100px_rgba(139,92,246,0.1)]">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Capital <span className="text-primary">Base</span></h2>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">Configura el fondo inicial de tu cartera para cálculos de ROI</p>
                        </div>

                        <form onSubmit={handleSaveInitial} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">MONTO INICIAL ($)</label>
                                <input
                                    autoFocus
                                    required
                                    type="number"
                                    step="0.01"
                                    placeholder="1000.00"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-bold placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all text-center"
                                    value={tempInitial}
                                    onChange={e => setTempInitial(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-[1.5rem] hover:scale-[1.01] active:scale-95 transition-all shadow-glow-sm"
                            >
                                GUARDAR CONFIGURACIÓN
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
