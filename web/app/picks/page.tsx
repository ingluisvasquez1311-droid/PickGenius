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
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8">

            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/20 animate-pulse">
                    <Brain className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest gap-2">Motor PICKGENIUS IA Activo</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                    PREDICCIONES <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">INTELIGENTES</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Consulta a nuestro oráculo deportivo. Escribe un partido (ej: "Real Madrid vs Barcelona") y recibe un análisis profundo.
                </p>
            </div>

            {/* Analysis Interface */}
            <div className="glass-card p-1 rounded-3xl border-primary/20 shadow-[0_0_50px_-10px_rgba(139,92,246,0.1)]">
                <div className="bg-[#0a0a0a] rounded-[22px] p-6 md:p-10 space-y-6">

                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ej: Analiza el partido Lakers vs Warriors de hoy. ¿Quién tiene más probabilidad de ganar y por qué?"
                            className="w-full bg-[#121212] text-white p-6 rounded-2xl border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none resize-none h-40 font-medium text-lg placeholder:text-gray-600"
                        />
                        <button
                            onClick={handlePredict}
                            disabled={loading || !prompt}
                            className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-xl font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                                    Analizando...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 fill-current" />
                                    Generar Pick
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Area */}
                    {prediction && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-4 text-primary">
                                <CheckCircle2 className="w-6 h-6" />
                                <h3 className="font-black uppercase tracking-widest">Análisis Completado</h3>
                            </div>
                            <div className="glass bg-white/5 p-6 md:p-8 rounded-2xl border-white/5">
                                <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-purple-300">
                                    {/* Basic rendering for now, later we can use Markdown */}
                                    <div className="whitespace-pre-wrap leading-relaxed font-light">
                                        {prediction}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}
