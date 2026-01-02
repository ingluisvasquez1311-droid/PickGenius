"use client";

import { useState } from 'react';
import KellyCalculator from '@/components/KellyCalculator';
import SureBetsFinder from '@/components/SureBetsFinder';
import { useBankroll } from '@/hooks/useBankroll';
import { Scale, TrendingUp, Bell, Zap } from 'lucide-react';
import clsx from 'clsx';

export default function ToolsPage() {
    const { currentBankroll } = useBankroll();
    const [activeTab, setActiveTab] = useState<'kelly' | 'surebets' | 'alerts'>('kelly');

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-green-500/10 blur-[180px] rounded-full opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[70%] bg-primary/10 blur-[200px] rounded-full opacity-30"></div>
            </div>

            <div className="relative z-10 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 w-fit">
                            <Zap className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">PRO TOOLS SUITE</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            SMART <span className="text-green-500">BETTING</span>
                        </h1>
                        <p className="text-gray-500 font-black uppercase tracking-widest text-sm">
                            Herramientas Matemáticas Avanzadas
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex glass-card p-2 rounded-[2rem] border border-white/10 w-fit">
                    {[
                        { id: 'kelly', label: 'Kelly Criterion', icon: TrendingUp },
                        { id: 'surebets', label: 'SureBets Finder', icon: Scale },
                        { id: 'alerts', label: 'Smart Alerts', icon: Bell }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-black shadow-glow-sm"
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'kelly' && (
                        <KellyCalculator currentBankroll={currentBankroll} />
                    )}
                    {activeTab === 'surebets' && (
                        <SureBetsFinder />
                    )}
                    {activeTab === 'alerts' && (
                        <div className="glass-card p-1 rounded-[3rem]">
                            <div className="bg-[#050505]/90 backdrop-blur-3xl rounded-[2.8rem] p-20 text-center space-y-6">
                                <Bell className="w-16 h-16 text-gray-700 mx-auto" />
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-gray-500">
                                    Smart Alerts <span className="text-primary">PRO</span>
                                </h3>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-widest max-w-md mx-auto">
                                    Sistema de alertas personalizadas por umbrales de cuotas • Próximamente
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
