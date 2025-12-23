'use client';

import React from 'react';
import ParleyOptimizerBanner from '@/components/ai/ParleyOptimizerBanner';
import { Bot, Zap, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

export default function AIPicksPage() {
    return (
        <main className="min-h-screen pb-24 bg-[#050505] text-white">
            {/* Hero Section */}
            <div className="relative h-48 overflow-hidden mb-8 flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-black z-0"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="container relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(147,51,234,0.4)] animate-pulse">
                            🤖
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-px w-6 bg-purple-500"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Genius Intelligence</span>
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
                                IA <span className="text-purple-500">PICKS CENTRAL</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container space-y-8">
                {/* Herramientas IA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/football-live" className="group">
                        <div className="bg-gradient-to-br from-green-900/20 to-black border border-green-500/20 p-6 rounded-3xl relative overflow-hidden transition-all hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                            <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-5 rotate-12 group-hover:rotate-0 transition-transform">⚽</div>
                            <div className="relative z-10">
                                <div className="bg-green-500/20 w-10 h-10 rounded-full flex items-center justify-center mb-4 text-green-400">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic mb-2">Predicciones Fútbol</h3>
                                <p className="text-gray-400 text-sm">Analiza partidos en vivo con nuestro modelo predictivo de goles y resultados.</p>
                                <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider">
                                    <span>Ir al Analizador</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/basketball-live" className="group">
                        <div className="bg-gradient-to-br from-orange-900/20 to-black border border-orange-500/20 p-6 rounded-3xl relative overflow-hidden transition-all hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                            <div className="absolute right-[-20px] top-[-20px] text-9xl opacity-5 rotate-12 group-hover:rotate-0 transition-transform">🏀</div>
                            <div className="relative z-10">
                                <div className="bg-orange-500/20 w-10 h-10 rounded-full flex items-center justify-center mb-4 text-orange-400">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic mb-2">NBA & Basket</h3>
                                <p className="text-gray-400 text-sm">Player props, spreads y análisis de rendimiento jugador por jugador.</p>
                                <div className="mt-4 flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
                                    <span>Ver Props</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Parley Optimizer */}
                <div>
                    <h3 className="text-xl font-black italic uppercase tracking-widest flex items-center gap-3 mb-4">
                        <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                        Constructor de Parleys
                    </h3>
                    <ParleyOptimizerBanner />
                </div>

                {/* Value Bets Explanation */}
                <div className="glass-card p-6 border border-white/5 bg-white/5 rounded-3xl">
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500/20 p-3 rounded-xl">
                            <Zap className="text-yellow-400" size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">¿Cómo funciona la IA?</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                PickGenius analiza miles de puntos de datos históricos y en tiempo real.
                                Busca ineficiencias en las cuotas de las casas de apuestas para encontrar
                                <span className="text-yellow-400 font-bold"> Value Bets</span> (Apuestas de Valor)
                                donde la probabilidad real es mayor a la implícita.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
