'use client';

import Navbar from '@/components/layout/Navbar';
import PropsDashboard from '@/components/sports/PropsDashboard';

export default function PropsPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Hero Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-black tracking-[0.3em] uppercase animate-pulse">
                            SISTEMA PREDICTIVO V2.5
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase">
                            PANEL DE <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">PROPS</span> DE JUGADORES
                        </h1>
                        <p className="text-white/40 max-w-2xl mx-auto font-medium text-sm md:text-base">
                            Análisis masivo de mercados de jugadores impulsado por Inteligencia Artificial de última generación y datos en tiempo real de SofaScore.
                        </p>
                    </div>

                    <PropsDashboard />
                </div>
            </div>

            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-purple-900/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-blue-900/10 blur-[150px] rounded-full"></div>
            </div>
        </main>
    );
}
