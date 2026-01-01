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
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(139,92,246,0.2)] animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px]" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {isSuccess ? (
                    <div className="text-center py-20 space-y-6 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">¡ACCESO CONCEDIDO!</h3>
                        <p className="text-gray-400 font-medium tracking-tight">Estamos preparando tu terminal personalizada...</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                                <Zap className="w-3 h-3" /> Early Access v4.2
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black italic uppercase italic tracking-tighter leading-none">
                                DOMINA EL <br /> <span className="text-primary italic">JUEGO AHORA.</span>
                            </h3>
                            <p className="text-gray-400 font-medium">Únete a la élite del análisis deportivo. Sin riesgo, solo datos.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Email Profesional</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="tu@terminal.com"
                                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-lg font-medium focus:outline-none focus:border-primary focus:bg-primary/5 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Foco</label>
                                    <select className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary">
                                        <option>PARLEY PRO</option>
                                        <option>LIVE RADAR</option>
                                        <option>HEDGING OPS</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        disabled={isSubmitting}
                                        className={clsx(
                                            "w-full h-16 bg-primary text-black font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-white hover:scale-105 active:scale-95 flex items-center justify-center gap-2",
                                            isSubmitting && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : 'UNIRSE'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-[9px] text-center text-gray-600 font-black uppercase tracking-widest">
                                Al unirte aceptas nuestras Operaciones de Privacidad e IA Protocol.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
