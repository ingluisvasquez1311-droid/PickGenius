"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        if (sessionId) {
            // We could verify the session here if needed, 
            // but the webhook will handle the backend activation.
            setStatus('success');
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />

            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center relative z-10 backdrop-blur-xl">
                <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow-sm">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>

                <h1 className="text-4xl font-black italic text-white mb-4 tracking-tighter">
                    ¡BIENVENIDO A <span className="text-primary italic">GOLD</span>!
                </h1>

                <p className="text-gray-400 mb-10 leading-relaxed">
                    Tu suscripción ha sido activada con éxito. Ahora tienes acceso total a las mejores predicciones de IA y herramientas premium.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/props"
                        className="flex items-center justify-center gap-3 w-full py-5 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-glow"
                    >
                        Ver Player Props
                        <ArrowRight className="w-5 h-5" />
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
