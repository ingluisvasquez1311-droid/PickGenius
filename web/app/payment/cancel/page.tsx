'use client';

import React from 'react';
import Link from 'next/link';

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card p-12 text-center border border-white/10 bg-[#0a0a0a] rounded-[3rem]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mx-auto mb-8">🛑</div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">Proceso Cancelado</h1>
                <p className="text-gray-400 mb-10 leading-relaxed">No se realizó ningún cargo. Si tuviste problemas con el pago o tienes dudas, puedes intentarlo de nuevo más tarde o contactar con soporte.</p>
                <Link href="/profile" className="inline-block w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-colors">
                    Volver a mi Perfil
                </Link>
            </div>
        </div>
    );
}
