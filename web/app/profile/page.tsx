'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { type PredictionRecord, updateUserProfile } from '@/lib/userService';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Settings,
    Shield,
    History,
    Trophy,
    Star,
    Crown,
    Camera,
    Save,
    LogOut,
    ChevronRight,
    Target,
    Zap
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import PerformanceChart from '@/components/profile/PerformanceChart';
import Link from 'next/link';
import { toast } from 'sonner';

type TabType = 'overview' | 'settings' | 'history' | 'security';

export default function ProfilePage() {
    const { user, loading, getHistory, signOut, updateUser } = useAuth();
    const [history, setHistory] = useState<PredictionRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        displayName: '',
        bio: '',
        phoneNumber: ''
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
                phoneNumber: user.phoneNumber || ''
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
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUser(editData);
            toast.success('Perfil actualizado correctamente');
            setIsEditing(false);
        } catch (error) {
            toast.error('Error al actualizar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const navItems = [
        { id: 'overview', icon: User, label: 'Resumen' },
        { id: 'settings', icon: Settings, label: 'Ajustes' },
        { id: 'history', icon: History, label: 'Historial' },
        { id: 'security', icon: Shield, label: 'Seguridad' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">

                {/* Header Profile Section */}
                <div className="mb-12 pt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl"
                    >
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 to-blue-600">
                                <div className="w-full h-full rounded-full bg-[#050505] overflow-hidden flex items-center justify-center border-4 border-[#050505]">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black italic">{user.email?.[0].toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const url = prompt('Introduce la URL de tu nueva imagen de perfil:', user.photoURL || '');
                                    if (url !== null) updateUser({ photoURL: url });
                                }}
                                className="absolute bottom-1 right-1 p-2 bg-purple-600 rounded-lg border border-white/20 hover:scale-110 transition-transform shadow-lg z-20"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2">
                                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                                    {user.displayName || user.email?.split('@')[0]}
                                </h1>
                                {user.isPremium && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest mb-1 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                        <Crown className="w-3 h-3" />
                                        PRO MEMBER
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm font-medium italic mb-4 max-w-md">
                                {user.bio || "No hay biografía disponible. ¡Añade una en ajustes!"}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    <span className="text-xs font-black uppercase italic tracking-wider">RANK #24</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                    <Star className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-black uppercase italic tracking-wider">1,250 PTS</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <PremiumButton onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'secondary' : 'primary'}>
                                {isEditing ? 'Cancelar' : 'Editar Perfil'}
                            </PremiumButton>
                            <PremiumButton onClick={signOut} variant="danger">
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </PremiumButton>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar Nav */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-28 space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as TabType)}
                                    className={`
                                        w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group
                                        ${activeTab === item.id
                                            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white shadow-xl'
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-purple-400' : 'group-hover:text-white'}`} />
                                        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'rotate-90 text-purple-400' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeTab === 'overview' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-8"
                                    >
                                        {/* Stats Matrix - Brutal Trading Style */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Rank Mundial', value: `#${user.stats?.rank || '1.2k'}`, trend: '+12%', color: 'from-blue-500 to-purple-600' },
                                                { label: 'Win Rate', value: `${user.stats?.winRate || '78'}%`, trend: '+5.2%', color: 'from-emerald-500 to-teal-600' },
                                                { label: 'Racha Actual', value: `${user.stats?.streak || '5'}W`, trend: '🔥', color: 'from-orange-500 to-red-600' },
                                                { label: 'ROI Mensual', value: `+${user.stats?.vroi || '14.2'}%`, trend: '📈', color: 'from-pink-500 to-rose-600' }
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
                                                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">Actualizado en Vivo</div>
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
                                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all duration-300 group border-b border-white/5 last:border-0">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg border border-white/5 group-hover:border-[var(--primary)]/30 group-hover:bg-[var(--primary)]/5 transition-all">
                                                                        {record.sport === 'football' ? '⚽' : '🏀'}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <span className="text-sm font-black italic uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">
                                                                                {record.playerName}
                                                                            </span>
                                                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${record.confidence === 'Alta' ? 'border-green-500/30 text-green-500' : 'border-yellow-500/30 text-yellow-500'}`}>
                                                                                {record.confidence}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                                                                            {record.prediction} {record.line} • {new Date(record.timestamp).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xl font-black italic tracking-tighter">{record.probability}%</div>
                                                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Probabilidad</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-12 text-center text-gray-500 uppercase font-black text-[10px] tracking-widest text-white/20">No hay actividad registrada</div>
                                                )}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
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
                                                    <div key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">
                                                                {record.sport === 'football' ? '⚽' : '🏀'}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-purple-400 transition-colors">{record.playerName}</h4>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                                    {record.prediction} {record.line} • {new Date(record.timestamp).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-black italic tracking-tighter text-purple-500">{record.probability}%</p>
                                                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Éxito Estimado</p>
                                                        </div>
                                                    </div>
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

