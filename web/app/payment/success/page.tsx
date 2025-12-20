'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
    useEffect(() => {
        // 🎉 Launch confetti!
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card p-12 text-center border border-green-500/30 bg-gradient-to-br from-[#0a0a0a] to-black rounded-[3rem] shadow-2xl shadow-green-500/10">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">👑</div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4">¡BIENVENIDO AL CLUB!</h1>
                <p className="text-gray-400 mb-10 leading-relaxed font-medium">Tu suscripción <span className="text-green-400 font-bold uppercase">Premium</span> ha sido activada con éxito. Ahora tienes acceso ilimitado a todos nuestros análisis de IA.</p>
                <Link href="/props" className="inline-block w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.05] transition-transform shadow-xl">
                    Ir al Panel de Props ☄️
                </Link>
            </div>
        </div>
    );
}
