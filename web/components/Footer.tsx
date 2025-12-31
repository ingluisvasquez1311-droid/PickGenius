"use client";

import { Trophy, Instagram, Twitter, Shield, Mail, Globe } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="relative bg-black border-t border-white/5 pt-20 pb-10 px-6 md:px-8 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">

                {/* Brand & Mission */}
                <div className="col-span-1 md:col-span-1 space-y-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white italic">
                            PICK<span className="text-primary">GENIUS</span>
                        </span>
                    </Link>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                        Redefiniendo el análisis deportivo con inteligencia artificial de vanguardia. Datos en tiempo real para la próxima generación de ganadores.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
                    </div>
                </div>

                {/* Sports Quick Links */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase text-white tracking-[0.3em] italic">Ecosistema</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {['Fútbol', 'NBA', 'NHL', 'NFL', 'MLB', 'Tenis'].map(sport => (
                            <Link
                                key={sport}
                                href={`/${sport.toLowerCase() === 'fútbol' ? 'football' : sport.toLowerCase() === 'béisbol' ? 'baseball' : sport.toLowerCase()}`}
                                className="text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest"
                            >
                                {sport}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Company & Support */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase text-white tracking-[0.3em] italic">Plataforma</h4>
                    <nav className="flex flex-col gap-3">
                        <Link href="/live" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">En Vivo</Link>
                        <Link href="/picks" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">IA Picks</Link>
                        <a href="#" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Comunidad</a>
                        <a href="#" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Afiliados</a>
                    </nav>
                </div>

                {/* Newsletter / Status */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase text-white tracking-[0.3em] italic">Estado Global</h4>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Sistemas Operativos</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Analizando latencia mundial: <span className="text-white">24ms</span><br />
                            Nodos activos: <span className="text-white">12</span>
                        </p>
                    </div>
                </div>

            </div>

            {/* Bottom Copyright */}
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    <a href="#" className="hover:text-white transition-colors">Términos</a>
                    <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                    <a href="#" className="hover:text-white transition-colors">Cookies</a>
                </div>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">
                    © 2025 PICKGENIUS AI CORP. BORN TO WIN.
                </p>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black uppercase text-gray-400">Secure Protocol v2.5</span>
                </div>
            </div>
        </footer>
    );
}
