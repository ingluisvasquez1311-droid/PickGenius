"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/components/ClerkSafeProvider';
import {
    Activity, Shield, Zap, Database,
    Globe, Server, HardDrive, Terminal,
    RefreshCw, CheckCircle2, AlertTriangle,
    Key, BarChart3, Settings, Flag, Trash2,
    Users, Mail, ArrowRight, UserCheck, LogOut
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const [stats, setStats] = useState({
        ngrok: { status: 'loading', url: '' },
        redis: { status: 'loading', latency: '0ms' },
        groq: { status: 'loading', keys: 0 },
        apiHealth: { status: 'loading', uptime: '99.9%' }
    });
    const [reports, setReports] = useState<any[]>([]);
    const [isFlushing, setIsFlushing] = useState(false);
    const [isSyncingOdds, setIsSyncingOdds] = useState(false);
    const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'system' | 'moderation' | 'users'>('system');

    const isAdmin = user?.emailAddresses[0]?.emailAddress === 'luisvasquez1311@gmail.com';

    const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
    };

    const fetchData = async () => {
        if (!isAdmin) return;
        try {
            // Fetch System Status
            const sysRes = await fetch('/api/admin/system');
            const sysData = await sysRes.json();
            setStats({
                ngrok: { status: sysData.bridge?.status || 'offline', url: sysData.bridge?.url || '--' },
                redis: { status: sysData.cache?.redisStatus || 'error', latency: sysData.cache?.redisStatus === 'connected' ? '< 5ms' : '--' },
                groq: { status: 'active', keys: 30 },
                apiHealth: { status: 'healthy', uptime: '99.9%' }
            });

            // Fetch Reports
            const repRes = await fetch('/api/admin/reports');
            const repData = await repRes.json();
            setReports(repData.reports || []);

            addLog('Sync completo del panel de control', 'success');
        } catch (e) {
            addLog('Error al sincronizar datos administrativos', 'error');
        }
    };

    useEffect(() => {
        if (isLoaded && isAdmin) {
            fetchData();
            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        }
    }, [isLoaded, isAdmin]);

    const handleFlushCache = async () => {
        setIsFlushing(true);
        addLog('Invocando purga global de caché...', 'warn');
        try {
            const res = await fetch('/api/admin/system', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'flush_cache' })
            });
            if (res.ok) addLog('Caché global purgada con éxito', 'success');
        } catch (e) {
            addLog('Fallo al purgar caché', 'error');
        } finally {
            setIsFlushing(false);
        }
    };

    const handleSyncOdds = async () => {
        setIsSyncingOdds(true);
        addLog('Invocando motor Python para descarga de Odds...');
        try {
            const res = await fetch('/api/admin/system', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'refresh_odds' })
            });
            const data = await res.json();
            if (res.ok) {
                addLog('Sincronización de BetPlay completada', 'success');
            } else {
                addLog(`Error en motor: ${data.error}`, 'error');
            }
        } catch (e) {
            addLog('Fallo crítico en la comunicación con el motor', 'error');
        } finally {
            setIsSyncingOdds(false);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este reporte?')) return;
        addLog(`Eliminando reporte ${id}...`, 'warn');
        try {
            const res = await fetch(`/api/admin/reports?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setReports(prev => prev.filter(r => r.id !== id));
                addLog('Reporte eliminado con éxito', 'success');
            }
        } catch (e) {
            addLog('Error al eliminar reporte', 'error');
        }
    };

    const handleSendNewsletter = async () => {
        if (!confirm('¿Deseas enviar el newsletter a todos los suscriptores ahora?')) return;
        setIsSendingNewsletter(true);
        addLog('Iniciando campaña de Newsletter...', 'info');
        try {
            const res = await fetch('/api/admin/newsletter/send', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                addLog(`Newsletter enviado con éxito a ${data.sentCount} usuarios`, 'success');
            } else {
                addLog(`Fallo en Newsletter: ${data.error}`, 'error');
            }
        } catch (e) {
            addLog('Error crítico en servicio de correo', 'error');
        } finally {
            setIsSendingNewsletter(false);
        }
    };

    if (!isLoaded) return null;
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center">
                    <Shield className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-4xl font-black italic uppercase italic tracking-tighter text-white">Acceso Restringido</h1>
                <p className="text-gray-500 max-w-md">No tienes permisos para acceder al centro de mando. Contacta con soporte si crees que esto es un error.</p>
                <Link href="/" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                    Volver al Cuartel General
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black">
            {/* Nav Lateral Simplificada */}
            <div className="fixed left-0 top-0 bottom-0 w-24 bg-black border-r border-white/5 flex flex-col items-center py-10 gap-8 z-[60]">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-glow-sm">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    {[
                        { id: 'system', icon: Activity },
                        { id: 'moderation', icon: Flag },
                        { id: 'users', icon: Users }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setActiveTab(btn.id as any)}
                            className={clsx(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                activeTab === btn.id ? "bg-primary text-black" : "text-gray-600 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <btn.icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
                <Link href="/" className="w-14 h-14 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <LogOut className="w-5 h-5" />
                </Link>
            </div>

            {/* Content Area */}
            <div className="pl-24">
                <header className="px-12 py-10 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-xl">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase italic tracking-tighter">CENTRO DE <span className="text-red-600">MANDO</span></h1>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mt-1">Admin Panel • Ver 4.2 Pro</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-6 py-3 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Servidores Operativos</span>
                        </div>
                    </div>
                </header>

                <main className="p-12 space-y-12">
                    {activeTab === 'system' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* System Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatusCard title="Ngrok Tunnel" icon={Globe} value={stats.ngrok.url} status={stats.ngrok.status} />
                                <StatusCard title="Redis Cache" icon={Database} value={stats.redis.latency} status={stats.redis.status} />
                                <StatusCard title="IA Engine" icon={Zap} value="30 Keys Active" status="healthy" />
                                <StatusCard title="Security" icon={Shield} value="WAF Active" status="secure" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Acciones Críticas</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <AdminAction
                                            title="Limpieza Global de Caché"
                                            desc="Purga todos los datos temporales en Redis y Memoria."
                                            icon={RefreshCw}
                                            onClick={handleFlushCache}
                                            loading={isFlushing}
                                        />
                                        <AdminAction
                                            title="Sincronizar Odds BetPlay"
                                            desc="Fuerza la descarga de cuotas reales mediante el motor Python."
                                            icon={Database}
                                            onClick={handleSyncOdds}
                                            loading={isSyncingOdds}
                                        />
                                        <AdminAction
                                            title="Enviar Newsletter Semanal"
                                            desc="Envía los mejores picks a todos los suscriptores registrados."
                                            icon={Mail}
                                            onClick={handleSendNewsletter}
                                            loading={isSendingNewsletter}
                                        />
                                    </div>
                                </div>
                                <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 font-mono">
                                    <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Terminal className="w-4 h-4" /> Live System Logs
                                    </h3>
                                    <div className="h-64 overflow-y-auto custom-scrollbar space-y-2 text-[10px]">
                                        {logs.map((log, i) => (
                                            <p key={i} className="text-gray-400">
                                                <span className="text-primary/50">#</span> {log}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'moderation' && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Moderación de Comunidad</h2>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">{reports.length} reportes pendientes</p>
                                </div>
                                <button
                                    onClick={fetchData}
                                    className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 group"
                                >
                                    <RefreshCw className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Refrescar</span>
                                </button>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Reportero</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Razón</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Fecha</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-white/[0.01] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black">
                                                            {report.reporterName?.[0]}
                                                        </div>
                                                        <span className="text-sm font-bold text-white tracking-tight">{report.reporterName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black text-red-500 uppercase">
                                                        {report.reason}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-[10px] font-mono text-gray-500 italic">
                                                    {new Date(report.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <button className="p-2 text-gray-600 hover:text-white transition-colors" title="Ver Comentario">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReport(report.id)}
                                                            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {reports.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center text-gray-600 italic font-medium">
                                                    No hay reportes que procesar hoy. ¡Paz en la comunidad!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Gestión de Usuarios</h2>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Próximamente: Control total de membresías GOLD</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center">
                                <Users className="w-12 h-12 text-gray-700 mx-auto mb-6" />
                                <p className="text-gray-500 font-medium">El módulo de usuarios está en desarrollo. Pronto podrás gestionar suscripciones y roles directamente desde aquí.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function StatusCard({ title, icon: Icon, value, status }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.08] transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className={clsx(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    status === 'online' || status === 'connected' || status === 'healthy' || status === 'secure'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                )}>
                    {status}
                </div>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-xl font-black text-white italic truncate">{value}</p>
        </div>
    );
}

function AdminAction({ title, desc, icon: Icon, onClick, loading }: any) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-[2rem] hover:border-white/20 transition-all text-left group"
        >
            <div className="flex items-center gap-6">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                    <Icon className={clsx("w-5 h-5", loading && "animate-spin")} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-white uppercase italic">{title}</h4>
                    <p className="text-[10px] text-gray-600 font-medium">{desc}</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-all translate-x-0 group-hover:translate-x-2" />
        </button>
    );
}


function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
