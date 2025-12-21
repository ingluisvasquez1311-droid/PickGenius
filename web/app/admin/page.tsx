'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, UserProfile } from '@/lib/userService';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Navbar from '@/components/layout/Navbar';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
                return;
            }

            const fetchData = async () => {
                const data = await getAllUsers();
                setUsers(data);
                setIsLoadingData(false);
            };
            fetchData();
        }
    }, [user, loading, router]);

    // Mock trend data for charts
    const trendData = useMemo(() => [
        { name: 'Lun', value: 400 },
        { name: 'Mar', value: 300 },
        { name: 'Mie', value: 600 },
        { name: 'Jue', value: 800 },
        { name: 'Vie', value: 500 },
        { name: 'Sab', value: 900 },
        { name: 'Dom', value: 1100 },
    ], []);

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-black tracking-tighter italic">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                CARGANDO DATA MASTER...
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.isPremium).length;
    const revenue = premiumUsers * 5;
    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0';

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 container mx-auto pt-32 pb-20 px-4 max-w-7xl">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-px w-8 bg-purple-500"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Control Center</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            ADMIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">DASHBOARD</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl">
                        <div className="px-4 py-2 border-r border-white/10">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                                <span className="text-xs font-black uppercase">Online</span>
                            </div>
                        </div>
                        <div className="px-4 py-2">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Last Update</p>
                            <span className="text-xs font-black uppercase">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Usuarios Totales', value: totalUsers, color: '#a855f7', prefix: '' },
                        { label: 'Suscripciones Pro', value: premiumUsers, color: '#3b82f6', prefix: '' },
                        { label: 'Ingresos Mensuales', value: revenue, color: '#22c55e', prefix: '$' },
                        { label: 'Conversión', value: `${conversionRate}%`, color: '#f59e0b', prefix: '' }
                    ].map((kpi, i) => (
                        <div key={i} className="group relative bg-white/5 border border-white/10 p-6 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{kpi.label}</p>
                                <p className="text-4xl font-black italic tracking-tighter mb-4">{kpi.prefix}{kpi.value}</p>
                            </div>

                            {/* Sparkline */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={kpi.color} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={kpi.color} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="value" stroke={kpi.color} fillOpacity={1} fill={`url(#color-${i})`} strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* User Management Table */}
                    <div className="lg:col-span-12 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-2xl">
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter">GESTIÓN DE USUARIOS</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Base de datos centralizada</p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-xs focus:border-purple-500 outline-none transition-colors"
                                />
                                <button className="bg-white text-black text-[10px] font-black px-6 py-2 rounded-xl hover:bg-gray-200 uppercase tracking-widest transition-transform active:scale-95">
                                    Exportar CSV
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/[0.03] text-gray-500 text-[9px] font-black uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-left">Usuario</th>
                                        <th className="px-8 py-5 text-left">Nivel Acceso</th>
                                        <th className="px-8 py-5 text-left">Membresía</th>
                                        <th className="px-8 py-5 text-left">Actividad</th>
                                        <th className="px-8 py-5 text-right">Comandos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((u) => (
                                        <tr key={u.uid} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-black text-sm border border-white/10 shadow-lg shadow-purple-900/20">
                                                        {u.email?.[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{u.email}</p>
                                                        <p className="text-[9px] text-gray-600 font-mono">{u.uid}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.role === 'admin'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-white/5 text-gray-400 border-white/10'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {u.isPremium ? (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                                            Premium
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-white/5 text-gray-600 border border-white/5 text-[9px] font-black uppercase tracking-widest">
                                                            Estándar
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/10 group/del">
                                                        <svg className="w-4 h-4 text-gray-600 group-hover/del:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
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
        </main>
    );
}

