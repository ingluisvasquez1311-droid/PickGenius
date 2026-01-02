"use client";

import { Check, X, Zap, Crown, Shield, Rocket } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useState } from 'react';

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const features = [
        { name: 'Predicciones Diarias', free: '3 Picks', pro: 'Ilimitadas' },
        { name: 'Análisis de IA', free: 'Básico', pro: 'Llama 3.3-70B Deep Analysis' },
        { name: 'SureBets Finder', free: false, pro: true },
        { name: 'Kelly Criterion Calc', free: 'Limitado', pro: 'Full Mode' },
        { name: 'Value Bets (+12% EV)', free: false, pro: true },
        { name: 'Injury Alerts Real-time', free: 'Delay 1h', pro: 'Instantáneo' },
        { name: 'Soporte Prioritario', free: false, pro: true },
        { name: 'Sin Publicidad', free: false, pro: true },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/20 blur-[200px] rounded-full opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 blur-[200px] rounded-full opacity-30"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                        <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">UNLOCK YOUR POTENTIAL</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
                        Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Nivel de Juego</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest max-w-2xl mx-auto text-sm">
                        Deja de apostar por suerte. Empieza a invertir con ventaja matemática.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 pt-8">
                        <span className={clsx("text-xs font-black uppercase tracking-widest transition-colors", billingCycle === 'monthly' ? "text-white" : "text-gray-600")}>Mensual</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-16 h-8 bg-white/10 rounded-full relative border border-white/20 transition-colors hover:border-primary/50"
                        >
                            <div className={clsx("absolute top-1 bottom-1 w-6 bg-primary rounded-full transition-all shadow-glow", billingCycle === 'monthly' ? "left-1" : "left-8")}></div>
                        </button>
                        <span className={clsx("text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2", billingCycle === 'yearly' ? "text-white" : "text-gray-600")}>
                            Anual <span className="px-2 py-0.5 bg-green-500 text-black text-[9px] rounded-md animate-pulse">-20%</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                    {/* Free Plan */}
                    <div className="p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-[#0a0a0a] space-y-8 relative overflow-hidden group hover:border-white/20 transition-all">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black italic uppercase text-gray-500">Rookie</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter">$0</span>
                                <span className="text-gray-500 font-bold uppercase text-xs">/ para siempre</span>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Perfecto para empezar a probar nuestra IA sin compromiso.</p>
                        </div>
                        <Link
                            href="/sign-up"
                            className="block w-full py-4 text-center rounded-2xl border border-white/20 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all"
                        >
                            Crear Cuenta Gratis
                        </Link>
                        <ul className="space-y-4 pt-4">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                                    <span className="text-gray-400 font-bold">{feature.name}</span>
                                    {feature.free === false ? (
                                        <X className="w-4 h-4 text-gray-700" />
                                    ) : (
                                        <span className="text-white font-black">{feature.free}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 md:p-12 rounded-[2.5rem] border-2 border-primary bg-gradient-to-b from-primary/10 to-[#0a0a0a] space-y-8 relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <Crown className="w-32 h-32 text-primary" />
                        </div>
                        <div className="absolute top-6 right-6">
                            <span className="px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full">Más Popular</span>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <h3 className="text-2xl font-black italic uppercase text-primary flex items-center gap-2">
                                God Mode <Zap className="w-5 h-5" />
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black tracking-tighter shadow-glow-text">
                                    ${billingCycle === 'monthly' ? '29' : '24'}
                                </span>
                                <span className="text-gray-400 font-bold uppercase text-xs">/ mes</span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-xs text-green-400 font-black uppercase">Facturado $288 anual (Ahorras $60)</p>
                            )}
                            <p className="text-sm text-gray-300 font-medium max-w-xs">Acceso total al arsenal de herramientas profesionales para ganar consistentemente.</p>
                        </div>

                        <Link
                            href="/checkout"
                            className="block w-full py-5 text-center rounded-2xl bg-primary text-black font-black uppercase text-sm tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(139,92,246,0.4)] relative z-10"
                        >
                            Obtener God Mode
                        </Link>

                        <ul className="space-y-4 pt-4 relative z-10">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                                    <span className="text-gray-300 font-bold">{feature.name}</span>
                                    {feature.pro === true ? (
                                        <Check className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <span className="text-primary font-black shadow-glow-text-sm">{feature.pro}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* Guarantee */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center max-w-3xl mx-auto p-8 rounded-3xl bg-white/5 border border-white/10">
                    <Shield className="w-12 h-12 text-gray-400" />
                    <div className="text-left">
                        <h4 className="text-lg font-black uppercase italic">Garantía de Satisfacción 7 Días</h4>
                        <p className="text-sm text-gray-500">Si no aumentas tu ROI en la primera semana, te devolvemos tu dinero sin preguntas. Cero riesgo.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

function SparklesIcon(props: any) {
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
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
