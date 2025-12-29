'use client';

import { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function PWAInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>(() => {
        if (typeof window === 'undefined') return 'other';
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
        if (/android/.test(userAgent)) return 'android';
        return 'other';
    });

    useEffect(() => {
        // 1. Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        if (isStandalone) return;

        // 3. Show prompt after a delay (don't annoy immediately)
        const timer = setTimeout(() => {
            const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
            if (!hasSeenPrompt) {
                setShowPrompt(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_seen', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="glass-card bg-black/90 border border-purple-500/30 p-5 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <img src="/icon-192.png" alt="PickGenius" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-sm">Instalar PickGenius Pro</h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-tighter">Acceso rápido desde tu pantalla de inicio</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {platform === 'ios' ? (
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-gray-300">
                            <p className="flex items-center gap-2 mb-2">
                                1. Toca el botón <Share className="w-4 h-4 text-blue-400" /> "Compartir" en Safari.
                            </p>
                            <p className="flex items-center gap-2">
                                2. Desliza y elige <PlusSquare className="w-4 h-4 text-gray-300" /> "Añadir a pantalla de inicio".
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-gray-300">
                            <p className="flex items-center gap-2 mb-2">
                                Toca los tres puntos <span className="font-bold text-white">⋮</span> y selecciona
                            </p>
                            <p className="flex items-center gap-2 font-bold text-white uppercase tracking-widest text-[9px]">
                                <Download className="w-4 h-4 text-green-400" /> Instalar Aplicación
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleClose}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-purple-500/10"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
