"use client";

import { useUser } from '@clerk/nextjs';
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
import { ACHIEVEMENTS } from '@/lib/gamification';

export default function UserDashboard() {
    const { user, isLoaded } = useUser();
    const [isGeneratingPortal, setIsGeneratingPortal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState({
        streak: 0,
        accuracy: 0,
        totalPicks: 0
    });

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
        <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Hero Profile Section */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/10 to-transparent blur-3xl opacity-50 group-hover/dash:opacity-75 transition-opacity" />
                    <div className="relative glass-card p-10 md:p-14 rounded-[4rem] border-white/5 bg-white/[0.02] flex flex-col md:flex-row items-center gap-10">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-blue-600 rounded-full blur-xl animate-pulse opacity-40" />
                            <img
                                src={user?.imageUrl}
                                alt={user?.fullName || 'User'}
                                className="w-32 h-32 md:w-44 md:h-44 rounded-[3rem] border-4 border-white/10 relative z-10 object-cover"
                            />
                            {isGold && (
                                <div className="absolute -top-3 -right-3 bg-gradient-to-tr from-amber-400 to-yellow-600 p-4 rounded-3xl shadow-glow z-20">
                                    <Crown className="w-6 h-6 text-black" />
                                </div>
                            )}
                        </div>

                        <div className="flex-grow text-center md:text-left space-y-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                    ¡HOLA, <span className="text-primary">{user?.firstName?.toUpperCase()}</span>!
                                </h1>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Tu centro de operaciones PickGenius</p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <Badge icon={Mail} label={user?.primaryEmailAddress?.emailAddress} />
                                <Badge
                                    icon={Shield}
                                    label={`Membresía ${isGold ? 'GOLD' : 'PRO'}`}
                                    active={isGold}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            {isGold ? (
                                <ActionButton icon={CreditCard} label="MI SUSCRIPCIÓN" onClick={() => handleAction('portal')} loading={isGeneratingPortal} />
                            ) : (
                                <Link href="/payment" className="px-10 py-5 bg-primary text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-glow flex items-center justify-center gap-3">
                                    <Crown className="w-4 h-4" />
                                    PASAR A GOLD
                                </Link>
                            )}
                            <SignOutButton>
                                <button className="px-10 py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-3">
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </SignOutButton>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left & Center: Progress & History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon={Trophy} label="Racha Actual" value="7" unit="Wins" color="primary" />
                            <StatCard icon={TrendingUp} label="Efectividad" value="82" unit="%" color="green-500" />
                            <StatCard icon={Activity} label="Picks Totales" value="148" unit="" color="blue-500" />
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Historial de Predicciones</h3>
                                <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                                    Detalles Completos <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-gray-600">31 DIC</p>
                                                <p className="text-sm font-black">13:20</p>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div>
                                                <p className="text-[8px] font-black text-primary uppercase">NBA Basketball</p>
                                                <h4 className="text-sm font-black uppercase italic">Lakers vs Celtics • Over 225.5</h4>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-[9px] font-black text-green-500 uppercase tracking-widest">
                                            GANADO
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!isGold && (
                                <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] text-center space-y-4">
                                    <h4 className="text-sm font-black uppercase italic">¿Quieres ver todo tu historial?</h4>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Los usuarios PRO solo ven los últimos 3 picks. Pásate a GOLD para desbloquear el historial infinito.</p>
                                    <Link href="/payment" className="inline-block text-[10px] font-black text-primary uppercase underline tracking-[0.2em] hover:text-white transition-colors">DESBLOQUEAR AHORA</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Gamification & Social */}
                    <div className="space-y-8">
                        {/* Achievements */}
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
                            <h3 className="text-xl font-black italic uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                <Star className="w-5 h-5 text-amber-500" /> Logros
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {ACHIEVEMENTS.map((ach) => (
                                    <div key={ach.id} className={clsx(
                                        "p-5 rounded-[2rem] border flex flex-col items-center gap-4 transition-all text-center",
                                        ach.unlocked ? "bg-white/5 border-white/10" : "bg-black opacity-30 border-white/5"
                                    )}>
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                                            <Trophy className={clsx("w-5 h-5", ach.unlocked ? "text-primary" : "text-gray-700")} />
                                        </div>
                                        <p className="text-[8px] font-black uppercase tracking-widest">{ach.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[3rem] p-10 space-y-6">
                            <h3 className="text-xl font-black italic uppercase italic tracking-tighter text-primary">Programa Pioneros</h3>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Invita a tus amigos. Por cada uno que se una a GOLD, tú recibes <span className="text-primary font-bold">1 MES GRATIS</span>.</p>

                            <div className="flex gap-2">
                                <div className="flex-grow bg-black/40 px-5 py-4 rounded-2xl border border-white/5 truncate font-mono text-[9px] text-gray-500">
                                    {referralLink}
                                </div>
                                <button onClick={handleCopy} className="p-4 bg-primary text-black rounded-2xl hover:scale-105 transition-all">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Smart Alerts */}
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                            <h3 className="text-xl font-black italic uppercase italic tracking-tighter">Alertas Smart</h3>
                            <div className="space-y-4">
                                <ToggleItem icon={Smartphone} label="Push Notifications" active={true} />
                                <ToggleItem icon={Mail} label="Deep Report Semanal" active={false} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, unit, color }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 flex flex-col gap-4 group hover:bg-white/[0.08] transition-all">
            <div className={`w-12 h-12 bg-${color}/10 rounded-2xl flex items-center justify-center text-${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-black">{value}</span>
                    <span className="text-[10px] font-black uppercase text-gray-600 mb-1">{unit}</span>
                </div>
            </div>
        </div>
    );
}

function Badge({ icon: Icon, label, active = false }: any) {
    return (
        <div className={clsx(
            "px-5 py-2.5 rounded-2xl border flex items-center gap-3 transition-all",
            active ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-gray-500"
        )}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}

function ActionButton({ icon: Icon, label, onClick, loading }: any) {
    return (
        <button onClick={onClick} disabled={loading} className="px-10 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
            <Icon className={clsx("w-4 h-4", loading && "animate-spin")} />
            {loading ? 'CARGANDO...' : label}
        </button>
    );
}

function ToggleItem({ icon: Icon, label, active }: any) {
    return (
        <div className={clsx("flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-3xl", !active && "opacity-30")}>
            <div className="flex items-center gap-4">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className={clsx("w-10 h-5 rounded-full relative cursor-pointer", active ? "bg-primary" : "bg-white/10")}>
                <div className={clsx("absolute top-1 w-3 h-3 bg-black rounded-full transition-all", active ? "right-1" : "left-1")} />
            </div>
        </div>
    );
}
