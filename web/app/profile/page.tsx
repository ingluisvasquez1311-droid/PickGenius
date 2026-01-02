"use client";

import { useUser } from '@/components/ClerkSafeProvider';
import { useState, useEffect } from 'react';
import {
    User, Mail, Crown, Settings, ChevronRight,
    CreditCard, Star, Clock, Trophy, Target,
    TrendingUp, Shield, LogOut, Flame, Users,
    Share2, Copy, Check, BellRing, Smartphone,
    ArrowRight, Activity
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { SignOutButton } from '@clerk/nextjs';
import { useBankroll } from '@/hooks/useBankroll';
import { useGamification } from '@/hooks/useGamification';
import * as LucideIcons from 'lucide-react';

export default function UserDashboard() {
    const { user, isLoaded } = useUser();
    const { entries, totalProfit, winRate } = useBankroll();
    const { points, level, achievements, progress } = useGamification();
    const [isGeneratingPortal, setIsGeneratingPortal] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isLoaded) return null;

    const isGold = user?.publicMetadata?.isGold === true || user?.publicMetadata?.role === 'admin';
    const referralLink = `https://pickgenius.com/join?ref=${user?.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAction = async (type: 'portal' | 'upgrade') => {
        setIsGeneratingPortal(true);
        try {
            const endpoint = type === 'portal' ? '/api/checkout/portal' : '/api/checkout/session';
            const res = await fetch(endpoint, { method: 'POST' });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            console.error('Stripe action error:', e);
        } finally {
            setIsGeneratingPortal(false);
        }
    };

    return (

        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 pt-24 pb-20 px-4 md:px-8 max-w-[90rem] mx-auto space-y-12">

                {/* Hero Profile Section */}
                <div className="relative group animate-fade-in-up">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
                    <div className="relative glass-card p-8 md:p-14 rounded-[3rem] border-white/10 bg-[#080808]/80 backdrop-blur-xl flex flex-col md:flex-row items-center gap-10 shadow-2xl">
                        <div className="relative group/avatar">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-blue-600 rounded-full blur-xl opacity-20 group-hover/avatar:opacity-40 transition-opacity duration-500" />
                            <div className="relative rounded-[2.5rem] p-1 bg-gradient-to-br from-white/20 to-transparent">
                                <img
                                    src={user?.imageUrl}
                                    alt={user?.fullName || 'User'}
                                    className="w-32 h-32 md:w-44 md:h-44 rounded-[2.3rem] border-4 border-black relative z-10 object-cover shadow-inner"
                                />
                            </div>
                            {isGold && (
                                <div className="absolute -top-4 -right-4 bg-gradient-to-tr from-amber-300 via-amber-500 to-amber-700 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] z-20 animate-bounce-short">
                                    <Crown className="w-6 h-6 text-black fill-current" />
                                </div>
                            )}
                        </div>

                        <div className="flex-grow text-center md:text-left space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9] drop-shadow-lg">
                                    ¡HOLA, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary animate-gradient-x">{user?.firstName?.toUpperCase()}</span>!
                                </h1>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Tu centro de operaciones PickGenius
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <Badge icon={Mail} label={user?.primaryEmailAddress?.emailAddress} />
                                <Badge
                                    icon={Shield}
                                    label={`Membresía ${isGold ? 'GOLD' : 'PRO'}`}
                                    active={isGold}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto relative z-10">
                            {isGold ? (
                                <ActionButton icon={CreditCard} label="MI SUSCRIPCIÓN" onClick={() => handleAction('portal')} loading={isGeneratingPortal} />
                            ) : (
                                <Link href="/payment" className="group relative px-10 py-5 bg-primary text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center gap-3 overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <Crown className="w-4 h-4 fill-black animate-pulse" />
                                    <span className="relative">PASAR A GOLD</span>
                                </Link>
                            )}
                            <SignOutButton>
                                <button className="px-10 py-5 bg-white/5 border border-white/10 text-red-500 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center gap-3 group">
                                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    Cerrar Sesión
                                </button>
                            </SignOutButton>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left & Center: Progress & History */}
                    <div className="lg:col-span-2 space-y-8 animate-fade-in-up delay-100">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon={LucideIcons.Trophy} label="Win Rate" value={winRate.toFixed(1)} unit="%" color="primary" />
                            <StatCard icon={LucideIcons.TrendingUp} label="Total Profit" value={`$${totalProfit.toFixed(0)}`} unit="" color="green-500" />
                            <StatCard icon={LucideIcons.Activity} label="Picks" value={entries.length} unit="" color="blue-500" />
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card p-1 rounded-[3rem] border-white/10">
                            <div className="bg-[#080808]/90 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-12 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                                <div className="flex items-center justify-between relative z-10">
                                    <h3 className="text-2xl font-black italic uppercase italic tracking-tighter text-white">Historial de Predicciones</h3>
                                    <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">
                                        Detalles Completos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {entries.slice(0, 5).map((entry) => (
                                        <div key={entry.id} className="group flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center min-w-[3rem]">
                                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                                        {new Date(entry.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                    </p>
                                                    <p className="text-sm font-black text-white italic">@{entry.odds.toFixed(2)}</p>
                                                </div>
                                                <div className="w-px h-10 bg-white/10 group-hover:bg-primary/50 transition-colors" />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={clsx("w-1.5 h-1.5 rounded-full", entry.type === 'W' ? 'bg-green-500' : 'bg-red-500')}></span>
                                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">STAKE: ${entry.stake}</p>
                                                    </div>
                                                    <h4 className="text-base font-black uppercase italic text-white group-hover:text-primary transition-colors">{entry.match}</h4>
                                                </div>
                                            </div>
                                            <div className={clsx(
                                                "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm",
                                                entry.type === 'W' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                            )}>
                                                {entry.type === 'W' ? 'GANADO' : entry.type === 'L' ? 'PERDIDO' : 'PUSH'}
                                            </div>
                                        </div>
                                    ))}
                                    {entries.length === 0 && (
                                        <p className="text-center py-10 text-gray-600 text-[10px] font-black uppercase">No hay actividad reciente.</p>
                                    )}
                                </div>

                                {!isGold && (
                                    <div className="relative p-10 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] text-center space-y-5 overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary animate-bounce-short">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-lg font-black uppercase italic text-white">¿Quieres ver todo tu historial?</h4>
                                            <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-widest max-w-lg mx-auto leading-relaxed">Los usuarios PRO solo ven los últimos 3 picks. Pásate a GOLD para desbloquear el historial infinito y análisis detallado.</p>
                                            <Link href="/payment" className="inline-flex items-center gap-2 mt-4 px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg">
                                                DESBLOQUEAR AHORA <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Gamification & Social */}
                    <div className="space-y-8 animate-fade-in-up delay-200">
                        {/* Achievements */}
                        <div className="glass-card p-1 rounded-[3rem] border-white/10">
                            <div className="bg-[#080808]/90 backdrop-blur-xl rounded-[2.8rem] p-10 h-full relative overflow-hidden">
                                <h3 className="text-xl font-black italic uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-white">
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" /> Logros Desbloqueados
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {achievements.map((ach) => {
                                        const Icon = (LucideIcons as any)[ach.icon] || LucideIcons.Trophy;
                                        return (
                                            <div key={ach.id} className={clsx(
                                                "p-6 rounded-[2rem] border flex flex-col items-center gap-4 transition-all duration-300 text-center group hover:scale-[1.02]",
                                                ach.unlocked
                                                    ? `bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:border-primary/30`
                                                    : "bg-[#050505] opacity-40 border-white/5 grayscale"
                                            )}>
                                                <div className={clsx(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                                                    ach.unlocked ? `${ach.color.replace('text', 'bg')}/20 ${ach.color} group-hover:bg-primary group-hover:text-black` : "bg-white/5 text-gray-600"
                                                )}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white">{ach.title}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div className="relative overflow-hidden rounded-[3rem] p-[1px] bg-gradient-to-br from-primary/50 to-purple-600/50">
                            <div className="bg-[#0a0a0a] rounded-[2.9rem] p-10 space-y-6 relative h-full">
                                <div className="absolute top-0 right-0 p-20 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

                                <h3 className="text-2xl font-black italic uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-white relative z-10">Programa Pioneros</h3>
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed tracking-wide relative z-10">Invita a tus amigos. Por cada uno que se una a GOLD, tú recibes <span className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded">1 MES GRATIS</span>.</p>

                                <div className="flex gap-3 relative z-10">
                                    <div className="flex-grow bg-black/60 px-6 py-4 rounded-2xl border border-white/10 truncate font-mono text-[10px] text-gray-400 shadow-inner flex items-center">
                                        {referralLink}
                                    </div>
                                    <button onClick={handleCopy} className="p-4 bg-primary text-black rounded-2xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Smart Alerts */}
                        <div className="glass-card p-1 rounded-[3rem] border-white/10">
                            <div className="bg-[#080808]/90 backdrop-blur-xl rounded-[2.8rem] p-10 space-y-8">
                                <h3 className="text-xl font-black italic uppercase italic tracking-tighter text-white flex items-center gap-3">
                                    <BellRing className="w-5 h-5 text-gray-400" /> Configuración
                                </h3>
                                <div className="space-y-4">
                                    <ToggleItem icon={Smartphone} label="Push Notifications" active={true} />
                                    <ToggleItem icon={Mail} label="Deep Report Semanal" active={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, unit, color }: any) {
    return (
        <div className="glass-card p-1 rounded-[3rem] border-white/5 transition-transform hover:-translate-y-1 duration-300">
            <div className="bg-[#0A0A0A] rounded-[2.8rem] p-8 flex flex-col gap-5 h-full relative overflow-hidden group">
                {/* Hover Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${color}/10 rounded-full blur-2xl group-hover:bg-${color}/20 transition-colors duration-500`}></div>

                <div className={`w-14 h-14 bg-${color}/10 rounded-2xl flex items-center justify-center text-${color} border border-${color}/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{value}</span>
                        <span className={`text-[11px] font-black uppercase text-${color} mb-2 tracking-widest`}>{unit}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ icon: Icon, label, active = false }: any) {
    return (
        <div className={clsx(
            "px-6 py-2.5 rounded-2xl border flex items-center gap-3 transition-all backdrop-blur-md",
            active ? "bg-primary/20 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
        )}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}

function ActionButton({ icon: Icon, label, onClick, loading }: any) {
    return (
        <button onClick={onClick} disabled={loading} className="px-10 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg group">
            <Icon className={clsx("w-4 h-4", loading ? "animate-spin" : "group-hover:text-primary transition-colors")} />
            {loading ? 'CARGANDO...' : label}
        </button>
    );
}

function ToggleItem({ icon: Icon, label, active }: any) {
    return (
        <div className={clsx("flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] transition-colors cursor-pointer group", !active && "opacity-60 hover:opacity-100")}>
            <div className="flex items-center gap-4">
                <div className={clsx("p-2 rounded-xl transition-colors", active ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-500")}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">{label}</span>
            </div>
            <div className={clsx("w-12 h-6 rounded-full relative transition-colors duration-300 shadow-inner", active ? "bg-primary" : "bg-white/10")}>
                <div className={clsx("absolute top-1 w-4 h-4 bg-black rounded-full transition-all duration-300 shadow-md", active ? "translate-x-7" : "translate-x-1")} />
            </div>
        </div>
    );
}
