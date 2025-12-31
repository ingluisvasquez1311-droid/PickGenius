"use client";

import { useState, useEffect } from 'react';
import {
    Zap, Shield, Globe, Activity, Clock, BarChart3,
    AlertTriangle, CheckCircle2, RefreshCw, Cpu,
    Terminal, Server, Network, Wifi
} from 'lucide-react';
import clsx from 'clsx';

export default function StatusPage() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatus = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/status');
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error("Error fetching system status:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-primary font-black uppercase tracking-[0.5em] text-xs">Conectando con la Terminal Master...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 selection:bg-primary selection:text-black">

            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
                <div className="absolute inset-0 checkered-bg opacity-[0.03]"></div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                                <Terminal className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-4xl font-black uppercase italic tracking-tighter">System <span className="text-primary">Terminal</span></h1>
                        </div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">Panel de Control de Conectividad e Infraestructura</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uptime</span>
                            <span className="text-sm font-black font-mono text-white">{status?.system?.uptime_human || '---'}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
                        <button
                            onClick={fetchStatus}
                            className={clsx(
                                "p-2 rounded-xl transition-all",
                                refreshing ? "animate-spin text-primary" : "text-gray-400 hover:text-white"
                            )}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Grid: Status Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Pillar 1: Overall System */}
                    <StatusCard
                        title="Main System"
                        status={status?.system?.status}
                        icon={Cpu}
                        metrics={[
                            { label: 'Version', value: status?.system?.version },
                            { label: 'Environment', value: status?.system?.environment?.toUpperCase() }
                        ]}
                    />

                    {/* Pillar 2: Sofascore API */}
                    <StatusCard
                        title="Sofascore API"
                        status={status?.connectivity?.sofascore?.status}
                        icon={Network}
                        latency={`${status?.connectivity?.sofascore?.latency_ms}ms`}
                        metrics={[
                            { label: 'Endpoint', value: status?.connectivity?.sofascore?.endpoint },
                            { label: 'Connection', value: 'Encrypted' }
                        ]}
                    />

                    {/* Pillar 3: Media Proxy */}
                    <StatusCard
                        title="Asset Proxy"
                        status={status?.connectivity?.proxy?.status}
                        icon={Globe}
                        metrics={[
                            { label: 'Provider', value: status?.connectivity?.proxy?.provider },
                            { label: 'Optimized', value: 'YES' }
                        ]}
                    />
                </div>

                {/* Middle Section: Real-time Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <BarChart3 className="w-48 h-48" />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-1 bg-primary rounded-full"></div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Métricas Transaccionales</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <BigMetric label="Total Requests" value={status?.metrics?.total_requests} color="text-white" />
                            <BigMetric label="Success" value={status?.metrics?.successful_requests} color="text-primary" />
                            <BigMetric label="Failed" value={status?.metrics?.failed_requests} color="text-red-500" />
                            <BigMetric label="Accuracy" value={status?.metrics?.success_rate} color="text-accent" />
                        </div>

                        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Activity: <span className="text-white">{status?.metrics?.last_request_at ? new Date(status.metrics.last_request_at).toLocaleString() : 'N/A'}</span></span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    Live Stream Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Error Logs */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 flex flex-col">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-lg font-black uppercase italic tracking-tighter">Error Log</h3>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {status?.logs && status.logs.length > 0 ? (
                                status.logs.map((log: string, i: number) => (
                                    <div key={i} className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl space-y-1">
                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Critical Alert</div>
                                        <p className="text-[11px] font-mono text-gray-400 leading-relaxed font-medium">{log}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-30">
                                    <CheckCircle2 className="w-12 h-12 text-primary" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No hay fallos en el sistema</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] pt-12">
                    <span>© 2025 PICKGENIUS_INFRA_ENGINE</span>
                    <span className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        Acceso restringido a nivel Administrador
                    </span>
                </div>

            </main>
        </div>
    );
}

function StatusCard({ title, status, icon: Icon, latency, metrics }: any) {
    const isOnline = status === 'ONLINE' || status === 'HEALTHY';
    const isDegraded = status === 'DEGRADED' || status === 'ISSUES';

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-8 group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                    <Icon className="w-7 h-7" />
                </div>
                <div className={clsx(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    isOnline ? "bg-primary/10 text-primary border-primary/20" :
                        isDegraded ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                            "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                    {status || 'UNKNOWN'}
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{title}</h3>
                    {latency && <p className="text-sm font-black font-mono text-primary italic">Lat: {latency}</p>}
                </div>

                <div className="space-y-3">
                    {metrics.map((m: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                            <span className="text-gray-600">{m.label}</span>
                            <span className="text-gray-300 font-mono">{m.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BigMetric({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
            <div className={clsx("text-4xl font-black font-mono italic leading-none truncate", color)}>
                {value ?? '0'}
            </div>
        </div>
    );
}
