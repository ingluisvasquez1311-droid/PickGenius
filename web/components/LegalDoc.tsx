"use client";

import { Shield, ChevronLeft, FileText, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

interface LegalDocProps {
    title: string;
    subtitle: string;
    lastUpdated: string;
    content: { heading: string; body: string }[];
}

export function LegalDoc({ title, subtitle, lastUpdated, content }: LegalDocProps) {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-black font-sans pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-primary/5 blur-[150px] rounded-full"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <main className="relative z-10 pt-32 px-4 md:px-8 max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-6 text-center md:text-left">
                    <Link href="/more" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
                        <ChevronLeft className="w-3 h-3" /> Volver al Menú
                    </Link>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mx-auto md:mx-0">
                            <Shield className="w-3 h-3 text-gray-400" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Documento Oficial</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{title}</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-2xl">{subtitle}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
                        <span className="flex items-center gap-2 bg-white/[0.02] px-3 py-2 rounded-lg border border-white/5"><Globe className="w-3 h-3" /> Jurisdicción Global</span>
                        <span className="flex items-center gap-2 bg-white/[0.02] px-3 py-2 rounded-lg border border-white/5"><Lock className="w-3 h-3" /> Encriptado SHA-256</span>
                        <span className="flex items-center gap-2 bg-white/[0.02] px-3 py-2 rounded-lg border border-white/5"><FileText className="w-3 h-3" /> Actualizado: {lastUpdated}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                    {content.map((section, i) => (
                        <div key={i} className="glass-card p-8 md:p-12 rounded-[2.5rem] border-white/5 space-y-4 hover:border-white/10 transition-colors">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                                <span className="text-primary/50">0{i + 1}.</span> {section.heading}
                            </h2>
                            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent"></div>
                            <p className="text-sm font-medium text-gray-400 leading-relaxed whitespace-pre-line text-justify">
                                {section.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center pt-12 pb-20 opacity-30">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em]">PickGenius Legal Department • 2024</p>
                </div>
            </main>
        </div>
    );
}
