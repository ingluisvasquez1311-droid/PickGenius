'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function PricingPage() {
    const { user, refreshUser } = useAuth();

    const handleSubscribe = async () => {
        if (!user) {
            toast.error('Debes iniciar sesión para suscribirte');
            return;
        }

        const loadingToast = toast.loading('Procesando suscripción segura...');

        try {
            // Simulate API call to checkout
            // In real world: const res = await fetch('/api/checkout', { method: 'POST' });
            // const { url } = await res.json();
            // window.location.href = url;

            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.dismiss(loadingToast);
            toast.success('¡Bienvenido al Club Premium! 👑', {
                description: 'Tu cuenta ha sido actualizada.'
            });

            // Simulate upgrade
            // This would normally happen via webhook
            // We force a refresh here for demo purposes if we had a way to mock the backend update
            // For now, we just show the success message.

        } catch (error) {
            toast.error('Error al procesar la suscripción');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                            Desbloquea el
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse-slow">
                            Poder Real
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Deja de adivinar. Empieza a ganar con predicciones de IA avanzadas,
                        datos en tiempo real y herramientas profesionales.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col hover:border-white/20 transition-colors">
                        <div className="mb-4">
                            <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Básico
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">Gratis</h2>
                        <p className="text-gray-400 mb-8">Para empezar a explorar</p>

                        <div className="space-y-4 mb-8 flex-1">
                            <FeatureItem included>Resultados en Vivo</FeatureItem>
                            <FeatureItem included>Stats Básicas</FeatureItem>
                            <FeatureItem included>3 Predicciones IA / día</FeatureItem>
                            <FeatureItem included={false}>Análisis Detallado</FeatureItem>
                            <FeatureItem included={false}>Confianza &gt; 75%</FeatureItem>
                            <FeatureItem included={false}>Ticket Inteligente</FeatureItem>
                        </div>

                        <Link
                            href="/auth/register"
                            className="w-full block text-center py-4 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all"
                        >
                            Crear Cuenta Gratis
                        </Link>
                    </div>

                    {/* Premium Plan */}
                    <div className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-purple-500/30 rounded-3xl p-8 flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.15)] transform md:-translate-y-4 hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-3xl pointer-events-none" />
                        {/* AGGRESSIVE OFFER BADGE */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-extrabold px-6 py-2 rounded-full uppercase tracking-wider shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-pulse-slow z-20 whitespace-nowrap">
                            ¡Oferta Loca: 15 Días GRATIS! 🔥
                        </div>

                        <div className="mb-4 relative">
                            <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-purple-500/30">
                                Pro
                            </span>
                        </div>
                        <h2 className="text-5xl font-bold mb-2 relative">
                            $5 <span className="text-lg text-gray-500 font-normal">/ mes</span>
                        </h2>
                        <p className="text-gray-400 mb-8 relative">
                            <span className="text-green-400 font-bold">15 días de prueba</span> • Cancela cuando quieras
                        </p>

                        <div className="space-y-4 mb-8 flex-1 relative">
                            <FeatureItem included variant="premium">Predicciones Ilimitadas</FeatureItem>
                            <FeatureItem included variant="premium">Análisis Profundo de IA</FeatureItem>
                            <FeatureItem included variant="premium">Probabilidades de Alta Confianza</FeatureItem>
                            <FeatureItem included variant="premium">Ticket de Apuesta Pro</FeatureItem>
                            <FeatureItem included variant="premium">Soporte Prioritario</FeatureItem>
                            <FeatureItem included variant="premium">Acceso Anticipado a Funciones</FeatureItem>
                        </div>

                        <button
                            onClick={handleSubscribe}
                            disabled={user?.isPremium}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg relative overflow-hidden group transition-all
                                ${user?.isPremium
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black hover:shadow-orange-500/25'
                                }`}
                        >
                            {user?.isPremium ? 'Ya eres Premium 💎' : 'Inicia tu Prueba de 15 Días'}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-4">
                            No te cobraremos nada hoy. Disfruta 2 semanas completas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ children, included, variant = 'basic' }: { children: React.ReactNode, included: boolean, variant?: 'basic' | 'premium' }) {
    return (
        <div className={`flex items-center gap-3 ${!included ? 'opacity-40' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                ${included
                    ? (variant === 'premium' ? 'bg-purple-500 text-white' : 'bg-white/20 text-white')
                    : 'bg-white/5 text-gray-500'
                }`}>
                {included ? '✓' : '✕'}
            </div>
            <span className={variant === 'premium' ? 'text-gray-200 font-medium' : 'text-gray-400'}>
                {children}
            </span>
        </div>
    );
}
