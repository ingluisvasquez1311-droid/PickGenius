'use client';

import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-4xl font-black mb-8 italic tracking-tighter">CONTACTO</h1>

                <div className="glass-card p-8 text-center space-y-6 text-gray-300">
                    <p className="text-lg">¿Tienes alguna duda o sugerencia? Estamos aquí para ayudarte.</p>

                    <div className="py-8">
                        <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Email de Soporte</p>
                        <p className="text-2xl font-black text-purple-400">soporte@pickgenius.ai</p>
                    </div>

                    <p className="text-sm">Nuestro equipo suele responder en menos de 24 horas.</p>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-purple-400 hover:underline">Volver al Inicio</Link>
                </div>
            </div>
        </main>
    );
}
