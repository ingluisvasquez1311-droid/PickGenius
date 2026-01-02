"use client";

import { useState } from 'react';
import {
    Zap, TrendingUp, Shield, Users,
    CheckCircle, ArrowRight, Sparkles,
    BarChart3, Target, Crown
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const [joined, setJoined] = useState(false);
    const [waitlistCount, setWaitlistCount] = useState(847); // Simulated counter

    const handleJoinWaitlist = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Save to localStorage (in production, send to API)
        const waitlist = JSON.parse(localStorage.getItem('pg_waitlist') || '[]');
        waitlist.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('pg_waitlist', JSON.stringify(waitlist));

        setWaitlistCount(prev => prev + 1);
        setJoined(true);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/10 blur-[200px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[70%] bg-cyan-500/10 blur-[200px] rounded-full animate-pulse"></div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10 pt-32 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
                <div className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                    {/* Beta Badge */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                            Early Access Beta • Solo {1000 - waitlistCount} Spots Restantes
                        </span>
                    </div>

                    {/* Main Headline */}
                    <div className="space-y-6">
                        <h1 className="text-6xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.85]">
                            <span className="block text-white">El Futuro</span>
                            <span className="block bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
                                De Las Apuestas
                            </span>
                        </h1>
                        <p className="text-xl md:text-3xl font-bold text-gray-400 max-w-3xl mx-auto leading-relaxed uppercase tracking-wide">
                            Predicciones IA • Kelly Criterion • SureBets • Bankroll Pro
                        </p>
                    </div>

                    {/* Waitlist Form */}
                    {!joined ? (
                        <form onSubmit={handleJoinWaitlist} className="max-w-2xl mx-auto space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem]">
                                <input
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent px-6 py-5 text-lg font-bold placeholder:text-gray-600 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="px-10 py-5 bg-primary text-black font-black uppercase tracking-[0.2em] text-sm rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)] flex items-center justify-center gap-3"
                                >
                                    <Zap className="w-5 h-5" />
                                    ACCESO ANTICIPADO
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    Sin Tarjeta de Crédito
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    100% Gratis en Beta
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="max-w-2xl mx-auto p-12 bg-green-500/10 border border-green-500/30 rounded-[3rem] space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase text-white">¡Estás Dentro!</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                                Te notificaremos cuando PickGenius Pro esté listo. Eres el usuario #{waitlistCount}.
                            </p>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase text-xs rounded-2xl hover:scale-105 transition-all"
                            >
                                Crear Cuenta Ahora
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    {/* Social Proof */}
                    <div className="flex items-center justify-center gap-8 pt-8">
                        <div className="text-center">
                            <p className="text-4xl font-black italic text-primary">{waitlistCount}+</p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">En Lista de Espera</p>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-4xl font-black italic text-green-500">87%</p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Precisión IA</p>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <p className="text-4xl font-black italic text-cyan-500">24/7</p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Análisis Live</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="relative z-10 py-32 px-4 md:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
                        Todo lo que <span className="text-primary">Necesitas</span>
                    </h2>
                    <p className="text-gray-500 font-black uppercase tracking-widest">En una sola plataforma</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Zap,
                            title: 'Predicciones IA',
                            description: 'Motor de IA con Llama 3.3-70B para análisis predictivo en tiempo real',
                            color: 'text-yellow-500',
                            bgColor: 'bg-yellow-500/10',
                            borderColor: 'border-yellow-500/20'
                        },
                        {
                            icon: TrendingUp,
                            title: 'Kelly Criterion',
                            description: 'Cálculo matemático del stake óptimo basado en edge y probabilidad',
                            color: 'text-primary',
                            bgColor: 'bg-primary/10',
                            borderColor: 'border-primary/20'
                        },
                        {
                            icon: Shield,
                            title: 'SureBets Finder',
                            description: 'Detecta oportunidades de arbitraje con profit garantizado sin riesgo',
                            color: 'text-green-500',
                            bgColor: 'bg-green-500/10',
                            borderColor: 'border-green-500/20'
                        },
                        {
                            icon: BarChart3,
                            title: 'Bankroll Tracker',
                            description: 'Dashboard avanzado con ROI, win rate y gráficos de evolución',
                            color: 'text-blue-500',
                            bgColor: 'bg-blue-500/10',
                            borderColor: 'border-blue-500/20'
                        },
                        {
                            icon: Target,
                            title: 'Value Bets Hunter',
                            description: 'Encuentra apuestas con edge >12% usando análisis estadístico profundo',
                            color: 'text-cyan-500',
                            bgColor: 'bg-cyan-500/10',
                            borderColor: 'border-cyan-500/20'
                        },
                        {
                            icon: Crown,
                            title: 'Gamificación Pro',
                            description: 'Sistema de niveles, logros y leaderboard para competir con la élite',
                            color: 'text-amber-500',
                            bgColor: 'bg-amber-500/10',
                            borderColor: 'border-amber-500/20'
                        }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className={`p-8 ${feature.bgColor} border ${feature.borderColor} rounded-[2.5rem] space-y-6 hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className={`text-xl font-black italic uppercase tracking-tight ${feature.color}`}>
                                {feature.title}
                            </h3>
                            <p className="text-[11px] font-bold text-gray-500 uppercase leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 py-32 px-4 md:px-12 max-w-5xl mx-auto">
                <div className="p-16 bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/30 rounded-[4rem] text-center space-y-8 backdrop-blur-xl">
                    <Users className="w-16 h-16 text-primary mx-auto" />
                    <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">
                        Únete a la <span className="text-primary">Elite</span>
                    </h2>
                    <p className="text-lg font-bold text-gray-400 uppercase tracking-wide max-w-2xl mx-auto">
                        Más de {waitlistCount} apostadores profesionales ya están usando PickGenius Pro
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-3 px-12 py-6 bg-white text-black font-black uppercase text-sm tracking-[0.2em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-glow"
                    >
                        EMPEZAR GRATIS
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 py-12 px-4 border-t border-white/5 text-center">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                    © 2026 PickGenius Pro • El Futuro de las Apuestas Inteligentes
                </p>
            </div>
        </div>
    );
}
