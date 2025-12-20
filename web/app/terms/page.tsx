'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-4xl font-black mb-8 italic tracking-tighter">TÉRMINOS Y CONDICIONES</h1>

                <div className="glass-card p-8 space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Uso del Servicio</h2>
                        <p>PickGenius es una plataforma de análisis deportivo basada en Inteligencia Artificial. No somos una casa de apuestas y no procesamos pagos de apuestas.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Exclusión de Responsabilidad</h2>
                        <p>Las predicciones generadas por nuestra IA son herramientas informativas. El éxito en las apuestas no está garantizado. El usuario es responsable de cualquier pérdida financiera.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Restricciones de Edad</h2>
                        <p>Debes ser mayor de 18 años para utilizar este servicio.</p>
                    </section>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-purple-400 hover:underline">Volver al Inicio</Link>
                </div>
            </div>
        </main>
    );
}
