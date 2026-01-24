"use client";

import { Zap, Target, Shield, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface AIAnalysisCardProps {
    content: string;
    isGold: boolean;
    onUpgrade: () => void;
}

export function AIAnalysisCard({ content, isGold, onUpgrade }: AIAnalysisCardProps) {
    if (!content) return null;

    // Parsing logic for the structured prompt
    const sections = {
        pick: content.match(/🎯 \*\*EL PICK DE ORO\*\*([\s\S]*?)(?=🔥 \*\*LA LECTURA\*\*|📊 \*\*PROYECCIÓN REALISTA\*\*|⚠️ \*\*FACTOR Miedo\*\*|$)/i)?.[1]?.trim(),
        lectura: content.match(/🔥 \*\*LA LECTURA\*\*([\s\S]*?)(?=📊 \*\*PROYECCIÓN REALISTA\*\*|⚠️ \*\*FACTOR Miedo\*\*|$)/i)?.[1]?.trim(),
        proyeccion: content.match(/📊 \*\*PROYECCIÓN REALISTA\*\*([\s\S]*?)(?=⚠️ \*\*FACTOR Miedo\*\*|$)/i)?.[1]?.trim(),
        miedo: content.match(/⚠️ \*\*FACTOR Miedo\*\*([\s\S]*?)$/i)?.[1]?.trim()
    };

    // If parsing fails (old format or different structure), just show the raw content
    const hasStructuredData = sections.pick || sections.lectura;

    if (!hasStructuredData) {
        return (
            <div className={clsx(
                "prose prose-invert prose-sm max-w-none text-[13px] leading-relaxed text-gray-300 font-medium bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden",
                !isGold && "blur-md select-none opacity-50"
            )}>
                <div className="whitespace-pre-wrap">{content}</div>
                {!isGold && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                        <Shield className="w-8 h-8 text-primary mb-4 animate-bounce-short" />
                        <button onClick={onUpgrade} className="px-6 py-2 bg-primary text-black font-black text-[10px] rounded-full uppercase tracking-widest">Desbloquear Análisis</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Pick de Oro (High Impact Card) */}
            {sections.pick && (
                <div className={clsx(
                    "relative group overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-br from-primary via-purple-500 to-secondary animate-in fade-in slide-in-from-bottom-4 duration-700",
                    !isGold && "blur-[8px] select-none opacity-40 pointer-events-none"
                )}>
                    <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/40 transition-colors"></div>
                    <div className="relative bg-[#080808] rounded-[2.4rem] p-8 md:p-10 space-y-6 overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Target className="w-32 h-32 text-primary rotate-12" />
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">EL PICK DE ORO</h3>
                                <p className="text-[9px] font-black text-primary/80 uppercase tracking-[0.4em]">Predicción Determinista</p>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl md:rounded-3xl relative z-10">
                            <p className="text-xl md:text-3xl font-black italic uppercase text-white leading-tight tracking-tight">
                                {sections.pick}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className={clsx(
                "grid grid-cols-1 md:grid-cols-2 gap-6",
                !isGold && "blur-[8px] select-none opacity-40 pointer-events-none"
            )}>
                {/* La Lectura */}
                {sections.lectura && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Zap className="w-4 h-4 fill-current" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">LA LECTURA TÁCTICA</h4>
                        </div>
                        <div className="text-[13px] text-gray-300 leading-relaxed font-medium italic whitespace-pre-wrap">
                            {sections.lectura}
                        </div>
                    </div>
                )}

                {/* Proyección Realista */}
                {sections.proyeccion && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">PROYECCIÓN REALISTA</h4>
                        </div>
                        <div className="text-[13px] text-gray-300 leading-relaxed font-medium italic whitespace-pre-wrap">
                            {sections.proyeccion}
                        </div>
                    </div>
                )}
            </div>

            {/* Factor Miedo (Risk Card) */}
            {sections.miedo && (
                <div className={clsx(
                    "bg-red-500/[0.02] border border-red-500/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700 delay-300",
                    !isGold && "blur-[8px] select-none opacity-40 pointer-events-none"
                )}>
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                        <AlertTriangle className="w-7 h-7 text-red-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">FACTOR MIEDO (RIESGO DETECTADO)</h4>
                        <p className="text-[13px] text-gray-400 font-medium italic">
                            {sections.miedo}
                        </p>
                    </div>
                </div>
            )}

            {/* Lock Overlay for non-Gold */}
            {!isGold && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm rounded-[2.5rem] pointer-events-auto">
                    <div className="p-6 bg-[#080808] border border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center space-y-5 max-w-sm px-10">
                        <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-bounce-short">
                            <Shield className="w-8 h-8 text-black fill-current" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">ANÁLISIS BLOQUEADO</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Este nivel de detalle es solo para miembros GOLD</p>
                        </div>
                        <button
                            onClick={onUpgrade}
                            className="w-full py-4 bg-primary text-black font-black text-[10px] rounded-2xl uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-glow-sm"
                        >
                            Pasar a Gold Ahora
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
