"use client";

import { XCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center relative z-10 backdrop-blur-xl">
                <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-4xl font-black italic text-white mb-4 tracking-tighter uppercase">
                    Pago <span className="text-red-500">Cancelado</span>
                </h1>

                <p className="text-gray-400 mb-10 leading-relaxed">
                    No se ha realizado ningún cargo. Si tuviste un problema con el pago, puedes intentarlo de nuevo.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/props"
                        className="flex items-center justify-center gap-3 w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Reintentar
                    </Link>

                    <Link
                        href="/"
                        className="block text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
