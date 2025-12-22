'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, UserProfile, setUserRole, upgradeToPremium } from '@/lib/userService';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
    Users,
    Crown,
    DollarSign,
    TrendingUp,
    Shield,
    Search,
    Download,
    MoreVertical,
    UserPlus,
    UserMinus,
    Calendar,
    Activity
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import { toast } from 'sonner';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
                return;
            }

            fetchData();
        }
    }, [user, loading, router]);

    const fetchData = async () => {
        setIsLoadingData(true);
        const data = await getAllUsers();
        setUsers(data);
        setIsLoadingData(false);
    };

    const handleRoleChange = async (uid: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await setUserRole(uid, newRole);
            toast.success(`Usuario actualizado a ${newRole}`);
            fetchData();
        } catch (error) {
            toast.error('Error al actualizar el rol');
        }
    };

    const handleGrantPremium = async (uid: string) => {
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        try {
            await upgradeToPremium(uid, thirtyDaysLater);
            toast.success('Suscripción Premium activada');
            fetchData();
        } catch (error) {
            toast.error('Error al activar suscripción');
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

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
                ACCEDIENDO AL NÚCLEO...
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.isPremium).length;
    const revenue = premiumUsers * 5;
    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0';

    const kpis = [
        { label: 'Usuarios Totales', value: totalUsers, color: '#a855f7', icon: Users, prefix: '' },
        { label: 'Suscripciones Pro', value: premiumUsers, color: '#3b82f6', icon: Crown, prefix: '' },
        { label: 'Ingresos Mensuales', value: revenue, color: '#22c55e', icon: DollarSign, prefix: '$' },
        { label: 'Conversión', value: `${conversionRate}%`, color: '#f59e0b', icon: TrendingUp, prefix: '' }
    ];

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto pt-24 px-4 md:px-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="h-px w-8 bg-purple-500"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Panel de Administración</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            ROOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">ACCESS</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 p-2 rounded-2xl backdrop-blur-xl">
                        <div className="px-4 py-2 border-r border-white/5">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Estado</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                                <span className="text-xs font-black uppercase tracking-widest">Sincronizado</span>
                            </div>
                        </div>
                        <div className="px-4 py-2">
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Última Sync</p>
                            <span className="text-xs font-black uppercase tabular-nums">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {kpis.map((kpi, i) => (
                        <GlassCard key={i} className="p-6 overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                        <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                                    </div>
                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Global</span>
                                </div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-4xl font-black italic tracking-tighter mb-4">{kpi.prefix}{kpi.value}</p>
                            </div>

                            {/* Sparkline */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
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
                        </GlassCard>
                    ))}
                </div>

                {/* User List Section */}
                <GlassCard hover={false} className="border-white/10 shadow-3xl">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01]">
                        <div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Base de Usuarios</h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Gestión en tiempo real</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="FILTRAR POR EMAIL..."
                                    className="w-full bg-black/40 border border-white/10 pl-11 pr-4 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <PremiumButton variant="secondary" className="px-4">
                                <Download className="w-4 h-4" />
                            </PremiumButton>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/[0.02] text-gray-500 text-[9px] font-black uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-left">Identidad</th>
                                    <th className="px-8 py-5 text-left">Privilegios</th>
                                    <th className="px-8 py-5 text-left">Suscripción</th>
                                    <th className="px-8 py-5 text-left">Registro</th>
                                    <th className="px-8 py-5 text-right">Acciones Directas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((u) => (
                                    <tr key={u.uid} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111] to-[#050505] p-[1px] group-hover:from-purple-500 transition-all duration-300">
                                                    <div className="w-full h-full rounded-2xl bg-[#050505] flex items-center justify-center font-black text-lg border border-white/5">
                                                        {u.email?.[0].toUpperCase()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm tracking-tight italic uppercase">{u.displayName || u.email.split('@')[0]}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold tracking-tight">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${u.role === 'admin'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    <Shield className="w-3 h-3" />
                                                    {u.role}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {u.isPremium ? (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                                        <Crown className="w-3 h-3" />
                                                        PRO
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-600 border border-white/5 text-[9px] font-black uppercase tracking-widest">
                                                        FREE
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                <p className="text-[10px] font-black uppercase tracking-tighter">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleRoleChange(u.uid, u.role)}
                                                    title={u.role === 'admin' ? 'Degradar a Usuario' : 'Ascender a Admin'}
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all"
                                                >
                                                    {u.role === 'admin' ? <UserMinus className="w-4 h-4 text-red-400" /> : <UserPlus className="w-4 h-4 text-blue-400" />}
                                                </button>
                                                {!u.isPremium && (
                                                    <button
                                                        onClick={() => handleGrantPremium(u.uid)}
                                                        title="Otorgar 30 días PRO"
                                                        className="p-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg border border-orange-500/20 transition-all"
                                                    >
                                                        <Crown className="w-4 h-4 text-orange-400" />
                                                    </button>
                                                )}
                                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all">
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-20 text-center">
                                <Activity className="w-12 h-12 text-gray-800 mx-auto mb-4 animate-pulse" />
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">No se encontraron registros activos</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}
