'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🔥 Global Error Caught:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
                    <div className="absolute inset-0 overflow-hidden z-0">
                        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-red-500/5 blur-[120px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
                    </div>

                    <div className="relative z-10 glass-card max-w-lg w-full p-8 md:p-12 rounded-[2rem] border border-white/10 text-center shadow-2xl backdrop-blur-xl bg-black/40">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 animate-pulse">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-3xl font-black italic tracking-tighter mb-2">
                            ALGO SALIÓ <span className="text-red-500">MAL</span>
                        </h1>

                        <p className="text-gray-400 mb-8 font-mono text-sm leading-relaxed">
                            {this.state.error?.message || "Ha ocurrido un error inesperado en el sistema. Nuestro equipo de IA ya ha sido notificado."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all hover:scale-105"
                            >
                                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Reintentar
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all hover:border-white/20"
                            >
                                <Home className="w-5 h-5" />
                                Ir al Inicio
                            </button>
                        </div>

                        <div className="mt-8 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                            Error Code: 500 • System Breach
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
