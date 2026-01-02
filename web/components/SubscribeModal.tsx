"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, Zap } from 'lucide-react';
import clsx from 'clsx';

interface SubscribeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SubscribeModal = ({ isOpen, onClose }: SubscribeModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailInput = (e.target as any).querySelector('input[type="email"]');
        const email = emailInput?.value;

        if (!email) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    setIsSuccess(false);
                    onClose();
                }, 2000);
            } else {
                const data = await res.json();
                alert(data.error || "Error al suscribirse");
            }
        } catch (err) {
            console.error("Subscription error:", err);
            alert("Error crítico de conexión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop with texture */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300"
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>
            </div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg glass-card border border-white/10 rounded-[3rem] p-1 shadow-[0_0_80px_-20px_rgba(var(--primary-rgb),0.3)] animate-in zoom-in-50 duration-500 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <div className="bg-[#080808]/90 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-12 relative overflow-hidden">
                    {/* Interior Glow Effects */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none animate-pulse-slow"></div>
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600/20 blur-[100px] pointer-events-none animate-pulse-slow delay-700"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/5 rounded-full border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20 group/close"
                    >
                        <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform" />
                    </button>

                    {isSuccess ? (
                        <div className="text-center py-20 space-y-8 animate-in zoom-in duration-300 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse"></div>
                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center mx-auto relative z-10 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                    <CheckCircle2 className="w-12 h-12 text-black animate-bounce-short" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">¡ACCESO CONCEDIDO!</h3>
                                <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Iniciando protocolo de bienvenida...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="space-y-6 mb-10 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                                    <Zap className="w-3 h-3 text-primary animate-pulse" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Early Access v4.2</span>
                                </div>
                                <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">
                                    DOMINA EL <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary animate-shine">JUEGO AHORA.</span>
                                </h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-sm">
                                    Únete a la élite del análisis deportivo. Sin riesgo, solo datos puros y predicciones IA de alto calibre.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative">
                                <div className="space-y-2 group/input">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-4 group-focus-within/input:text-primary transition-colors">Email Profesional</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="email"
                                            placeholder="tu@terminal.com"
                                            className="w-full h-16 bg-[#050505] border border-white/10 rounded-2xl px-6 text-white text-lg font-medium placeholder:text-gray-700 focus:outline-none focus:border-primary/50 focus:bg-[#0a0a0a] transition-all shadow-inner"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/50 opacity-0 group-focus-within/input:opacity-100 transition-opacity animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 group/select">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-4 group-focus-within/select:text-primary transition-colors">Foco Principal</label>
                                        <div className="relative">
                                            <select className="w-full h-16 bg-[#050505] border border-white/10 rounded-2xl px-6 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 appearance-none cursor-pointer hover:bg-[#0a0a0a] transition-all">
                                                <option>PARLEY PRO</option>
                                                <option>LIVE RADAR</option>
                                                <option>HEDGING OPS</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            disabled={isSubmitting}
                                            className={clsx(
                                                "w-full h-16 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-primary hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]",
                                                isSubmitting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isSubmitting ? (
                                                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    UNIRSE <Zap className="w-4 h-4 fill-black" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-[8px] text-center text-gray-600 font-black uppercase tracking-widest pt-2 opacity-60">
                                    Al unirte aceptas nuestras Operaciones de Privacidad e IA Protocol.
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
