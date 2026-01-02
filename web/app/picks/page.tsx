"use client";

import { useState } from 'react';
import { Zap, Brain, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function PicksPage() {
    const [prompt, setPrompt] = useState('');
    const [prediction, setPrediction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        if (!prompt) return;
        setLoading(true);
        setPrediction(null);

        try {
            const res = await fetch('/api/groq', {
                method: 'POST',
                body: JSON.stringify({ prompt }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            setPrediction(data.content);
        } catch (e) {
            console.error(e);
            setPrediction("Error al generar la predicción. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 pt-24 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] animate-fade-in-up">
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest gap-2">Motor PICKGENIUS IA Activo</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] animate-fade-in-up delay-100">
                        PREDICCIONES <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary animate-gradient-x">INTELIGENTES</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base font-medium leading-relaxed animate-fade-in-up delay-200">
                        Consulta a nuestro oráculo deportivo. Escribe un partido y recibe un análisis profundo con probabilidades en tiempo real.
                    </p>
                </div>

                {/* Analysis Interface */}
                <div className="glass-card p-1 rounded-[2.5rem] border-primary/20 shadow-[0_0_80px_-20px_rgba(139,92,246,0.15)] animate-fade-in-up delay-300 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 rounded-[2.5rem] pointer-events-none"></div>

                    <div className="bg-[#080808]/90 backdrop-blur-xl rounded-[2.3rem] p-6 md:p-12 space-y-8 relative overflow-hidden">
                        {/* Decorative glow inside card */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="relative">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3 ml-2">Tu Consulta</label>
                            <div className="relative group/input">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Ej: Analiza el partido Lakers vs Warriors de hoy. ¿Quién tiene más probabilidad de ganar y por qué?"
                                    className="w-full bg-[#0c0c0c] text-white p-6 md:p-8 rounded-3xl border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none resize-none h-48 font-medium text-lg placeholder:text-gray-700 shadow-inner"
                                />
                                <div className="absolute bottom-4 right-4">
                                    <button
                                        onClick={handlePredict}
                                        disabled={loading || !prompt}
                                        className="bg-primary hover:bg-primary/90 text-black disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-2xl font-black uppercase tracking-wider flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                                                <span className="hidden md:inline">Procesando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5 fill-current animate-bounce-short" />
                                                Generar Pick
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Result Area */}
                        {prediction && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
                                <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent hidden md:block"></div>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                    <h3 className="font-black uppercase tracking-widest text-white text-lg">Análisis de IA Completado</h3>
                                </div>

                                <div className="glass bg-white/5 p-6 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-2xl"></div>
                                    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-primary prose-lg relative z-10">
                                        <div className="whitespace-pre-wrap leading-relaxed font-light text-lg">
                                            {prediction}
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-primary" />
                                            Confianza del Modelo: Alta
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            Tendencia Detectada
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
