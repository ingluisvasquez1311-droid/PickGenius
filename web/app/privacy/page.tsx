'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-4xl font-black mb-8 italic tracking-tighter">POLÍTICA DE PRIVACIDAD</h1>

                <div className="glass-card p-8 space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Datos que Recolectamos</h2>
                        <p>Solo recolectamos tu correo electrónico al registrarte para personalizar tu experiencia y gestionar tu suscripción.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Uso de la Información</h2>
                        <p>Tus datos no son compartidos con terceros con fines comerciales. Los usamos únicamente para mejorar el algoritmo de predicción y comunicarnos contigo.</p>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-purple-400 hover:underline">Volver al Inicio</Link>
                </div>
            </div>
        </main>
    );
}
