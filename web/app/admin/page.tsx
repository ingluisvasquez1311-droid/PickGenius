'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Activity,
    ShieldAlert,
    HardDrive,
    Clock,
    Server,
    Database,
    Cpu,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [isFetchingStats, setIsFetchingStats] = useState(true);

    const isAdmin = user?.role === 'admin' ||
        user?.email === 'ingluisvasquez1311@gmail.com' ||
        user?.email === 'pickgenius@gmail.com' ||
        user?.email === 'luisvasquez1311@gmail.com';

    useEffect(() => {
        if (!loading && !isAdmin) {
            toast.error('Acceso denegado: Se requiere rol de administrador');
            router.push('/');
        }
    }, [isAdmin, loading]);

    const fetchStats = async () => {
        setIsFetchingStats(true);
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            toast.error('Error al conectar con el servidor de monitoreo');
        } finally {
            setIsFetchingStats(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchStats();
            const interval = setInterval(fetchStats, 30000); // 30s auto-refresh
            return () => clearInterval(interval);
        } else {
            setIsFetchingStats(false);
        }
    }, [isAdmin]);

    if ((loading || isFetchingStats) && !stats) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
                    <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">Iniciando Consola de Mando...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-[#050505] text-white pb-20 pt-28">
            <div className="container">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-8 bg-purple-600 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.5)]"></div>
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                                Admin <span className="text-purple-500">Dashboard</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">Panel de Control de Infraestructura • PickGenius v2.0</p>
                    </div>

                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetchingStats ? 'animate-spin' : ''}`} />
                        Actualizar Ahora
                    </button>
                </div>

                {/* Core Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <MetricCard
                        title="Estado del Sistema"
                        value={stats?.api?.status === 'healthy' ? 'OPTIMAL' : 'WARNING'}
                        icon={<Activity className="text-emerald-500" />}
                        subtext="Conexión en tiempo real"
                        trend="online"
                    />
                    <MetricCard
                        title="Uso de Memoria"
                        value={stats?.system?.memory?.usage || '0%'}
                        icon={<Cpu className="text-blue-500" />}
                        subtext={`${Math.round((stats?.system?.memory?.total || 0) / 1024 / 1024 / 1024)}GB Total RAM`}
                        trend="stable"
                    />
                    <MetricCard
                        title="Alertas Activas"
                        value={stats?.logs?.errorsCount || 0}
                        icon={<ShieldAlert className="text-red-500" />}
                        subtext="Últimas 24 horas"
                        trend={stats?.logs?.errorsCount > 0 ? 'down' : 'up'}
                    />
                    <MetricCard
                        title="Tiempo de Actividad"
                        value={`${Math.floor((stats?.system?.uptime || 0) / 3600)}h`}
                        icon={<Clock className="text-purple-500" />}
                        subtext="Uptime acumulado"
                        trend="up"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* System Logs / Error Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        <section className="glass-card p-8 border border-white/5 bg-white/[0.02] rounded-[3rem]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
                                    <Database className="w-5 h-5 text-purple-500" />
                                    Terminal de Logs
                                </h3>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                    {stats?.logs?.totalEntries || 0} Entradas
                                </div>
                            </div>

                            <div className="bg-black/60 rounded-2xl border border-white/5 p-6 font-mono text-[11px] leading-relaxed overflow-hidden h-[400px] flex flex-col">
                                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                                    <div className="text-emerald-400 opacity-80">[OK] Root server initialized on port 3001</div>
                                    <div className="text-purple-400 opacity-80">[OK] Connected to Firestore Database</div>
                                    <div className="text-blue-400 opacity-80">[OK] AI Engine: Groq 2.0 Balanced Enabled</div>
                                    <div className="text-gray-500 border-t border-white/5 pt-2 mt-4 font-bold text-[9px] uppercase tracking-widest mb-2">Live stream:</div>

                                    {stats?.logs?.lastEntry && (
                                        <div className="text-blue-300">
                                            {stats.logs.lastEntry}
                                        </div>
                                    )}

                                    <div className="text-gray-600 italic">Waiting for new events...</div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-purple-500/60 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                                    PickGenius Monitoring Service Active
                                </div>
                            </div>
                        </section>

                        {/* Recent API Keys Health */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 border border-white/5 bg-white/[0.01] rounded-3xl">
                                <h4 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                                    <Server className="w-3 h-3" />
                                    Carga de Servidor
                                </h4>
                                <div className="space-y-4">
                                    <LoadBar label="CPU Load (1m)" value={Math.round((stats?.system?.load?.[0] || 0) * 10)} color="purple" />
                                    <LoadBar label="CPU Load (5m)" value={Math.round((stats?.system?.load?.[1] || 0) * 10)} color="blue" />
                                    <LoadBar label="CPU Load (15m)" value={Math.round((stats?.system?.load?.[2] || 0) * 10)} color="gray" />
                                </div>
                            </div>
                            <div className="glass-card p-6 border border-white/5 bg-white/[0.01] rounded-3xl">
                                <h4 className="text-[10px] font-black uppercase text-gray-500 mb-4 tracking-widest flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3 text-red-400" />
                                    Seguridad & Filtros
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Rate Limiting</span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Activo</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">CORS Policy</span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Restricted</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">SSL Verification</span>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Valid</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar: Quick Actions & Status */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="glass-card p-6 border border-white/10 bg-gradient-to-br from-purple-900/20 to-black rounded-[2.5rem]">
                            <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                Alertas Rápidas
                            </h3>
                            <div className="space-y-4">
                                <AlertItem level="info" msg="Sistema escalado automáticamente" time="2h atrás" />
                                <AlertItem level="warning" msg="Alta latencia en SofaScore API" time="5m atrás" />
                                <AlertItem level="error" msg="Fallo detección de H2H para partido ID 4522" time="Ahora" />
                            </div>
                        </section>

                        <div className="glass-card p-8 bg-black border border-white/5 rounded-[3rem] text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Server className="w-8 h-8 text-white/40" />
                            </div>
                            <h4 className="text-lg font-black italic mb-2">INFRAESTRUCTURA HÍBRIDA</h4>
                            <p className="text-xs text-gray-500 leading-relaxed mb-8">
                                Estás conectado a través del túnel local con puente residencial. Monitoreando desde <span className="text-white font-bold">{stats?.system?.platform}</span>.
                            </p>
                            <div className="py-4 border-y border-white/5 flex justify-around mb-8">
                                <div>
                                    <div className="text-[8px] text-gray-600 font-bold uppercase mb-1">Status</div>
                                    <div className="text-xs font-black text-emerald-500 uppercase italic">Live</div>
                                </div>
                                <div className="border-l border-white/5 pl-4">
                                    <div className="text-[8px] text-gray-600 font-bold uppercase mb-1">Region</div>
                                    <div className="text-xs font-black text-white uppercase italic">Local-Bridge</div>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_10px_30px_rgba(147,51,234,0.3)]">
                                Reiniciar Caché Global
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

function MetricCard({ title, value, icon, subtext, trend }: any) {
    return (
        <div className="glass-card p-6 border border-white/5 bg-white/2 rounded-[2rem] hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-black rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className={`text-[8px] font-black uppercase tracking-widest ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-blue-500'}`}>
                    {trend === 'up' ? '▲ POSITIVO' : trend === 'down' ? '▼ CRÍTICO' : '• ESTABLE'}
                </div>
            </div>
            <div className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">{title}</div>
            <div className="text-3xl font-black italic tracking-tighter mb-1">{value}</div>
            <div className="text-[9px] text-gray-600 font-bold uppercase">{subtext}</div>
        </div>
    );
}

function LoadBar({ label, value, color }: any) {
    const bgColor = color === 'purple' ? 'bg-purple-500' : color === 'blue' ? 'bg-blue-500' : 'bg-gray-500';
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between px-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase">{label}</span>
                <span className="text-[9px] font-black text-white">{value}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${bgColor} transition-all duration-1000`}
                    style={{ width: `${Math.min(100, value)}%` }}
                ></div>
            </div>
        </div>
    );
}

function AlertItem({ level, msg, time }: any) {
    const colors = {
        info: 'text-blue-400 bg-blue-500/10',
        warning: 'text-yellow-400 bg-yellow-500/10',
        error: 'text-red-400 bg-red-500/10',
    } as any;

    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/5">
            <div className={`w-2 h-2 rounded-full ${level === 'info' ? 'bg-blue-500' : level === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-300 leading-tight truncate">{msg}</p>
                <span className="text-[8px] text-gray-600 font-black uppercase">{time}</span>
            </div>
        </div>
    );
}
