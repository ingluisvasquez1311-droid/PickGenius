"use client";

import Link from 'next/link';
import {
    Shield, FileText, HelpCircle, Mail,
    Users, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

export default function MorePage() {
    const { signOut } = useClerk();

    const sections = [
        {
            title: "Soporte y Ayuda",
            items: [
                { label: "Centro de Ayuda", href: "/help", icon: HelpCircle },
                { label: "Contactar Soporte", href: "/contact", icon: Mail },
                { label: "Reportar un Bug", href: "/report", icon: Shield },
            ]
        },
        {
            title: "Legal",
            items: [
                { label: "Términos y Condiciones", href: "/terms", icon: FileText },
                { label: "Política de Privacidad", href: "/privacy", icon: Shield },
                { label: "Juego Responsable", href: "/responsible-gaming", icon: Users },
            ]
        },
        {
            title: "Cuenta",
            items: [
                { label: "Configuración", href: "/settings", icon: Settings },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">Más Opciones</h1>

                <div className="space-y-6">
                    {sections.map((section, i) => (
                        <div key={i} className="space-y-3">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-4">{section.title}</h3>
                            <div className="glass-card rounded-[2rem] overflow-hidden">
                                {section.items.map((item, j) => (
                                    <Link
                                        key={j}
                                        href={item.href}
                                        className="flex items-center justify-between p-5 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-primary/20 transition-all">
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-wide">{item.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => signOut({ redirectUrl: '/' })}
                        className="w-full p-5 mt-8 glass-card rounded-[2rem] flex items-center justify-between hover:bg-red-500/10 hover:border-red-500/30 transition-all group border border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-red-400 uppercase tracking-wide">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
