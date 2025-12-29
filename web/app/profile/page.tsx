'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    History,
    Settings,
    User as UserIcon,
    Shield,
    CreditCard,
    Save,
    Zap,
    Bell,
    CheckCircle,
    Smartphone,
    Mail,
    AlertTriangle,
    Send,
    Trophy,
    Star,
    Crown,
    Camera,
    LogOut,
    ChevronRight,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import PerformanceChart from '@/components/profile/PerformanceChart';
import Link from 'next/link';
import { toast } from 'sonner';
import PerformanceStats from '@/components/dashboard/PerformanceStats';
import AchievementBadges from '@/components/dashboard/AchievementBadges';
import ReferralCard from '@/components/dashboard/ReferralCard';
import PredictionHistoryItem from '@/components/profile/PredictionHistoryItem';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type TabType = 'overview' | 'stats' | 'badges' | 'referrals' | 'settings' | 'history' | 'security';

export default function ProfilePage() {
    const { user, loading, getHistory, signOut, updateUser, recalculateStats } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        displayName: '',
        bio: '',
        phoneNumber: '',
        preferences: {
            notifications: true,
            theme: 'dark' as 'dark' | 'light',
            language: 'es' as 'es' | 'en',
            pushAlerts: {
                hotPicks: true,
                matchResults: true,
                valueHunter: false,
                bankrollAlerts: false,
                discord: false,
                telegram: false
            },
            discordId: '',
            telegramId: ''
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        } else if (user) {
            setEditData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                phoneNumber: user.phoneNumber || '',
                preferences: {
                    notifications: user.preferences?.notifications ?? true,
                    theme: user.preferences?.theme ?? 'dark',
                    language: user.preferences?.language ?? 'es',
                    pushAlerts: {
                        hotPicks: user.preferences?.pushAlerts?.hotPicks ?? true,
                        matchResults: user.preferences?.pushAlerts?.matchResults ?? true,
                        valueHunter: user.preferences?.pushAlerts?.valueHunter ?? false,
                        bankrollAlerts: user.preferences?.pushAlerts?.bankrollAlerts ?? false,
                        discord: user.preferences?.pushAlerts?.discord ?? false,
                        telegram: user.preferences?.pushAlerts?.telegram ?? false
                    },
                    discordId: user.preferences?.discordId || '',
                    telegramId: user.preferences?.telegramId || ''
                }
            });
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchHistory() {
            if (user) {
                try {
                    const data = await getHistory(10);
                    setHistory(data);
                } catch (error) {
                    console.error('Error al cargar el historial:', error);
                } finally {
                    setLoadingHistory(false);
                }
            }
        }
        if (user && activeTab === 'overview') fetchHistory();
    }, [user, getHistory, activeTab]);

    const handleSaveProfile = async () => {
        if (!user?.uid || !db) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: editData.displayName,
                bio: editData.bio,
                phoneNumber: editData.phoneNumber,
                preferences: {
                    ...editData.preferences
                },
                updatedAt: new Date()
            });

            toast.success('Perfil actualizado con éxito');
            if (updateUser) await updateUser(editData as any);
            setIsSaving(false);
            setIsEditing(false);
        } catch (error) {
            console.error('Error al guardar perfil:', error);
            toast.error('Error al guardar los cambios');
            setIsSaving(false);
        }
    };

    const handleRefreshStats = async () => {
        if (!user || isSaving) return;
        setIsSaving(true);
        try {
            if (recalculateStats) await recalculateStats();
            toast.success('Estadísticas sincronizadas');
        } catch (error) {
            toast.error('Error al sincronizar estadísticas');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#050510] flex items-center justify-center">
                <div className="text-white font-black italic text-2xl animate-pulse">PICKGENIUS PRO</div>
            </div>
        );
    }

    const isPremium = user.isPremium || user.role === 'admin';

    return (
        <div className="min-h-screen bg-[#050510] text-white selection:bg-purple-500/30">
            {/* Header / Nav de perfil */}
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-[#050510]" />
                <div className="max-w-7xl mx-auto px-6 h-full flex items-end pb-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 p-1 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-[1.8rem] bg-[#050510] flex items-center justify-center overflow-hidden">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black italic tracking-tighter uppercase">{user.displayName || 'Usuario Pro'}</h1>
                                {isPremium && (
                                    <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-lg text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> PRO MEMBER
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{user.bio || 'No hay biografía disponible. ¡Añade una en ajustes!'}</p>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Rank #24</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                    <Star className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">1,250 PTS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ml-auto flex flex-col gap-3">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all text-center"
                        >
                            Editar Perfil
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="px-8 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Nav */}
                    <div className="lg:w-80 flex flex-col gap-2">
                        {[
                            { id: 'overview', label: 'Resumen', icon: Zap },
                            { id: 'stats', label: 'Estadísticas', icon: Target },
                            { id: 'badges', label: 'Logros', icon: Trophy },
                            { id: 'referrals', label: 'Referidos', icon: Star },
                            { id: 'history', label: 'Historial', icon: History },
                            { id: 'settings', label: 'Ajustes', icon: Settings },
                            { id: 'security', label: 'Seguridad', icon: Shield },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 group ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white shadow-lg shadow-purple-600/20 translate-x-2'
                                    : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[3px]' : 'group-hover:scale-110 transition-transform'}`} />
                                <span className="font-black italic uppercase text-xs tracking-widest">{tab.label}</span>
                                {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4 ml-2" />}
                            </button>
                        ))}

                        <div className="mt-8 p-6 glass-card bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-3xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Suscripción</p>
                            <h4 className="font-black italic uppercase text-lg mb-4">{isPremium ? 'Plan Pro Activo' : 'Versión Free'}</h4>
                            <Link href="/pricing" className="w-full">
                                <PremiumButton className="w-full justify-center text-[10px]">{isPremium ? 'Manejar Plan' : 'Mejorar a Pro'}</PremiumButton>
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="min-h-[500px]"
                            >
                                {activeTab === 'overview' && (
                                    <motion.div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { label: 'Racha Actual', value: `W${(user.stats as any)?.rachaActual || (user.stats as any)?.streak || 0}`, trend: '+3', color: 'from-emerald-400 to-teal-600' },
                                                { label: 'Precisión Gral.', value: `${(user.stats as any)?.precision || (user.stats as any)?.winRate || 0}%`, trend: '+1.2%', color: 'from-purple-400 to-blue-600' },
                                                { label: 'Unidades', value: `+${(user.stats as any)?.unidades || (user.stats as any)?.vroi || 0}`, trend: '+12.5u', color: 'from-amber-400 to-orange-600' },
                                            ].map((stat, i) => (
                                                <div key={i} className="glass-card p-6 border border-white/5 bg-white/[0.02] rounded-3xl group hover:border-[var(--primary)]/30 transition-all duration-500">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{stat.label}</div>
                                                        <div className="text-[10px] font-bold text-emerald-400">{stat.trend}</div>
                                                    </div>
                                                    <div className={`text-3xl font-black italic bg-gradient-to-br ${stat.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left`}>
                                                        {stat.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Performance Analysis Graph */}
                                        <div className="glass-card p-8 border border-white/5 bg-white/[0.02] rounded-[2.5rem] relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <div className="text-8xl font-black italic tracking-tighter">DATA</div>
                                            </div>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                                <div>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Performance Analytics</h3>
                                                    <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Análisis de precisión de los últimos 7 días</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleRefreshStats}
                                                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                                    >
                                                        {isSaving ? 'Sincronizando...' : 'Sincronizar Datos'}
                                                    </button>
                                                </div>
                                            </div>
                                            <PerformanceChart />
                                        </div>

                                        {/* Main Stats Grouped */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <GlassCard className="p-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">🕒</div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Horarios</p>
                                                <p className="text-3xl font-black italic">{user.stats?.horarios || 0}</p>
                                                <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 w-[45%]"></div>
                                                </div>
                                            </GlassCard>
                                            <GlassCard className="p-6">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">⚽</div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Resultados</p>
                                                <p className="text-3xl font-black italic">{user.stats?.resultados || 0}</p>
                                                <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-[72%]"></div>
                                                </div>
                                            </GlassCard>
                                            <GlassCard className="p-6">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">🎯</div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Anotadores</p>
                                                <p className="text-3xl font-black italic">{user.stats?.anotadores || 0}</p>
                                                <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500 w-[30%]"></div>
                                                </div>
                                            </GlassCard>
                                            <GlassCard className="p-6">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">🤝</div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Asistentes</p>
                                                <p className="text-3xl font-black italic">{user.stats?.asistentes || 0}</p>
                                                <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                    <div className="h-full bg-orange-500 w-[15%]"></div>
                                                </div>
                                            </GlassCard>
                                        </div>
                                        {/* Activity History - Integrated in Overview */}
                                        <GlassCard hover={false} className="mt-8">
                                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                                <h3 className="text-lg font-black italic tracking-tighter uppercase">Actividad Reciente</h3>
                                                <PremiumButton variant="secondary" className="px-4 py-1.5 h-auto">Ver Todo</PremiumButton>
                                            </div>
                                            <div className="p-2">
                                                {loadingHistory ? (
                                                    <div className="p-12 text-center text-gray-500 uppercase font-black text-[10px] tracking-widest">Cargando Historial...</div>
                                                ) : history.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {history.map((record, i) => (
                                                            <PredictionHistoryItem key={record.id || i} record={record} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-12 text-center text-gray-500 uppercase font-black text-[10px] tracking-widest text-white/20">No hay actividad registrada</div>
                                                )}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                )}

                                {activeTab === 'stats' && (
                                    <div className="space-y-6">
                                        <PerformanceStats />
                                    </div>
                                )}

                                {activeTab === 'badges' && (
                                    <div className="space-y-6">
                                        <AchievementBadges />
                                    </div>
                                )}

                                {activeTab === 'referrals' && (
                                    <div className="space-y-6">
                                        <ReferralCard />
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <GlassCard hover={false} className="p-8">
                                        <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <History className="w-4 h-4 text-blue-500" />
                                            </div>
                                            Historial Completo
                                        </h3>
                                        {loadingHistory ? (
                                            <div className="py-20 text-center text-gray-500 uppercase font-black text-[10px] tracking-widest animate-pulse">Analizando registros...</div>
                                        ) : history.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {history.map((record, i) => (
                                                    <PredictionHistoryItem key={record.id || i} record={record} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center text-gray-600">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] mb-4">No has realizado ninguna predicción aún</p>
                                                <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-400 underline">Ir al panel principal</Link>
                                            </div>
                                        )}
                                    </GlassCard>
                                )}

                                {activeTab === 'settings' && (
                                    <GlassCard hover={false} className="p-8">
                                        <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center">
                                                <Settings className="w-4 h-4 text-gray-400" />
                                            </div>
                                            Configuración de Perfil
                                        </h3>
                                        <div className="space-y-6 max-w-xl">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre Visible</label>
                                                <input
                                                    type="text"
                                                    value={editData.displayName}
                                                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                                    placeholder="Tu nombre de usuario"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Biografía</label>
                                                <textarea
                                                    value={editData.bio}
                                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors min-h-[100px]"
                                                    placeholder="Cuéntanos sobre tu estilo de apuestas..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Teléfono (Opcional)</label>
                                                <input
                                                    type="tel"
                                                    value={editData.phoneNumber}
                                                    onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>

                                            {/* Notificaciones Granulares */}
                                            <div className="pt-6 border-t border-white/5 mt-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-6 flex items-center gap-2">
                                                    <Zap className="w-3 h-3" /> Preferencias de Alertas
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {[
                                                        { key: 'hotPicks', label: 'Hot Picks AI', desc: 'Alertas de alta probabilidad' },
                                                        { key: 'matchResults', label: 'Resultados Finales', desc: 'Resumen de tus apuestas' },
                                                        { key: 'valueHunter', label: 'Value Hunter', desc: 'Detección de cuotas desajustadas' },
                                                        { key: 'bankrollAlerts', label: 'Gestión Bankroll', desc: 'Alertas de riesgo y stake' },
                                                        { key: 'discord', label: 'Discord Sync', desc: 'Enviar alertas a Discord' },
                                                        { key: 'telegram', label: 'Telegram Sync', desc: 'Enviar alertas a Telegram' }
                                                    ].map((item) => (
                                                        <label key={item.key} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors group">
                                                            <div className="flex-1">
                                                                <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">{item.label}</div>
                                                                <div className="text-[9px] text-gray-500 uppercase font-medium">{item.desc}</div>
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={(editData.preferences.pushAlerts as any)?.[item.key]}
                                                                onChange={(e) => {
                                                                    const newPushAlerts = {
                                                                        ...(editData.preferences.pushAlerts || {}),
                                                                        [item.key]: e.target.checked
                                                                    };
                                                                    setEditData({
                                                                        ...editData,
                                                                        preferences: {
                                                                            ...editData.preferences,
                                                                            pushAlerts: newPushAlerts as any
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500/50 transition-all accent-purple-500"
                                                            />
                                                        </label>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discord Webhook</label>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!editData.preferences.discordId) {
                                                                        toast.error('Configura un Webhook primero');
                                                                        return;
                                                                    }
                                                                    const res = await fetch('/api/notifications/test', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ type: 'discord', target: editData.preferences.discordId })
                                                                    });
                                                                    if (res.ok) toast.success('Prueba de Discord enviada 🚀');
                                                                    else toast.error('Error al enviar prueba');
                                                                }}
                                                                className="text-[9px] font-black text-purple-400 uppercase tracking-tighter hover:text-white transition-colors"
                                                            >
                                                                Probar
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={editData.preferences.discordId || ''}
                                                            onChange={(e) => setEditData({
                                                                ...editData,
                                                                preferences: { ...editData.preferences, discordId: e.target.value }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                                            placeholder="https://discord.com/api/webhooks/..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Telegram Chat ID</label>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!editData.preferences.telegramId) {
                                                                        toast.error('Configura un Chat ID primero');
                                                                        return;
                                                                    }
                                                                    const res = await fetch('/api/notifications/test', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ type: 'telegram', target: editData.preferences.telegramId })
                                                                    });
                                                                    if (res.ok) toast.success('Prueba de Telegram enviada 🚀');
                                                                    else toast.error('Error al enviar prueba');
                                                                }}
                                                                className="text-[9px] font-black text-blue-400 uppercase tracking-tighter hover:text-white transition-colors"
                                                            >
                                                                Probar
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={editData.preferences.telegramId || ''}
                                                            onChange={(e) => setEditData({
                                                                ...editData,
                                                                preferences: { ...editData.preferences, telegramId: e.target.value }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                                            placeholder="-100..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4">
                                                <PremiumButton
                                                    onClick={handleSaveProfile}
                                                    loading={isSaving}
                                                    className="w-full justify-center"
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Guardar Cambios
                                                </PremiumButton>
                                            </div>
                                        </div>
                                    </GlassCard>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6">
                                        <GlassCard hover={false} className="p-8">
                                            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                    <Shield className="w-4 h-4 text-red-500" />
                                                </div>
                                                Seguridad de la Cuenta
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-bold">Email de acceso</h4>
                                                        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Verificado</span>
                                                </div>
                                                <div className="p-6 border border-white/5 rounded-2xl flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent">
                                                    <div>
                                                        <h4 className="text-sm font-bold">Autenticación de Dos Pasos</h4>
                                                        <p className="text-xs text-gray-500 mt-1 italic">Capa extra de blindaje para tus datos.</p>
                                                    </div>
                                                    <PremiumButton variant="secondary" className="text-[9px] py-2">Configurar</PremiumButton>
                                                </div>
                                                <div className="pt-6 mt-6 border-t border-white/5">
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4">Zona de Peligro</h4>
                                                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500 transition-colors">Solicitar eliminación de datos del núcleo</button>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
