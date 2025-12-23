'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    RefreshCw,
    ShieldCheck,
    ShieldAlert,
    Activity,
    BarChart3,
    Trophy,
    Cpu,
    Database,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function GroqDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/admin/groq-stats');
            const data = await res.json();
            if (data.success) {
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching Groq stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('¿Estás seguro de resetear las estadísticas de uso?')) return;
        try {
            await fetch('/api/admin/groq-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset' })
            });
            fetchStats();
        } catch (error) {
            console.error('Error resetting stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-6 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400/80">Nexus Intelligence Hub</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
                        GROQ ORACLE <span className="text-purple-500">CONTROL</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl text-sm md:text-base font-medium leading-relaxed uppercase tracking-tight">
                        Monitoreo en tiempo real del pool de <span className="text-white font-bold">{stats?.rotator?.totalKeys} llaves</span> de rotación cuántica.
                        Garantizando predicciones de <span className="text-purple-400 font-bold italic">ELITE</span> sin interrupciones.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={fetchStats}
                        disabled={refreshing}
                        className="group relative px-6 py-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all active:scale-95"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <RefreshCw className={`w-4 h-4 text-purple-400 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Actualizar</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-100%] group-hover:translate-x-[100%] duration-1000"></div>
                    </button>

                    <button
                        onClick={handleReset}
                        className="px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                        Reset Stats
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SummaryCard
                        title="Tasa de Éxito"
                        value={stats?.rotator?.successRate}
                        icon={<Trophy className="w-5 h-5 text-yellow-500" />}
                        description="Veredictos validados"
                    />
                    <SummaryCard
                        title="Llaves Activas"
                        value={`${stats?.rotator?.activeKeys} / ${stats?.rotator?.totalKeys}`}
                        icon={<Cpu className="w-5 h-5 text-purple-500" />}
                        description="Pool de procesamiento"
                    />
                    <SummaryCard
                        title="Total Requests"
                        value={stats?.rotator?.totalRequests?.toLocaleString()}
                        icon={<Activity className="w-5 h-5 text-emerald-500" />}
                        description="Carga histórica analizada"
                    />
                    <SummaryCard
                        title="Keys Bloqueadas"
                        value={stats?.rotator?.blockedKeys}
                        icon={<ShieldAlert className="w-5 h-5 text-red-500" />}
                        description="En Rate Limit temporal"
                        isWarning={stats?.rotator?.blockedKeys > 0}
                    />
                </div>

                {/* Key Grid */}
                <div className="glass-card bg-[#0a0a0a]/80 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                        <Database className="w-32 h-32" />
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <h2 className="text-xl font-black uppercase tracking-widest italic">Análisis Detallado por Nodo</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {stats?.keys?.map((key: any, idx: number) => (
                            <KeyCard key={idx} stats={key} />
                        ))}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="flex items-center justify-center py-12 opacity-30 select-none">
                    <p className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-500">PickGenius PRO Quantum Infrastructure</p>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, description, isWarning = false }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-6 rounded-[2rem] border transition-all duration-500 ${isWarning ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-[#0a0a0a]'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl">
                    {icon}
                </div>
                <div className={`w-2 h-2 rounded-full ${isWarning ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`}></div>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{title}</h3>
            <div className={`text-4xl font-black italic tracking-tighter mb-1 ${isWarning ? 'text-red-400' : 'text-white'}`}>{value}</div>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{description}</p>
        </motion.div>
    );
}

function KeyCard({ stats }: any) {
    const isBlocked = stats.status.includes('Blocked');

    return (
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${isBlocked ? 'bg-red-900/10 border-red-500/20 grayscale opacity-60' : 'bg-white/5 border-white/5 hover:border-purple-500/30'}`}>
            <div className="flex justify-between items-center mb-3">
                <span className={`text-[9px] font-black tracking-widest uppercase ${isBlocked ? 'text-red-400' : 'text-purple-400'}`}>
                    {stats.key}
                </span>
                {isBlocked ? <ShieldAlert className="w-3 h-3 text-red-500" /> : <ShieldCheck className="w-3 h-3 text-emerald-500" />}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[8px] font-black text-gray-600 uppercase">Requests</span>
                    <span className="text-xs font-bold text-white tabular-nums">{stats.totalRequests}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${isBlocked ? 'bg-red-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(100, (stats.successes / (stats.totalRequests || 1)) * 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                    <span className="text-[8px] font-black text-gray-600 uppercase">Residuo</span>
                    <span className={`text-[10px] font-black ${isBlocked ? 'text-red-500' : 'text-emerald-400'}`}>{stats.remaining}</span>
                </div>
            </div>
        </div>
    );
}
