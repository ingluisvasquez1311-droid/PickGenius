"use client";

import { X, Trophy, TrendingUp, Activity, MapPin } from 'lucide-react';
import Image from 'next/image';
import { getPlayerImage, getTeamImage, getBlurDataURL } from '@/lib/image-utils';
import clsx from 'clsx';

interface PlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    player: {
        id: number;
        name: string;
        position: string;
        shirtNumber?: number;
        teamId?: number;
        teamName?: string;
    } | null;
    stats?: Record<string, string | number>;
    sport?: string;
}

export const PlayerModal = ({ isOpen, onClose, player, stats, sport = 'football' }: PlayerModalProps) => {
    if (!isOpen || !player) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300"
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none"></div>
            </div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl glass-card border border-white/10 rounded-[3rem] p-1 shadow-[0_0_80px_-20px_rgba(var(--primary-rgb),0.3)] animate-in zoom-in-50 duration-500 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-600/10 opacity-50 pointer-events-none"></div>

                <div className="bg-[#080808]/90 backdrop-blur-xl rounded-[2.9rem] relative overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header / Hero */}
                    <div className="relative h-64 md:h-80 w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-[#080808]"></div>

                        {/* Team Logo Background */}
                        {player.teamId && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10 blur-sm pointer-events-none">
                                <Image
                                    src={getTeamImage(player.teamId)}
                                    alt="Team"
                                    width={384}
                                    height={384}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        {/* Player Image */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 md:w-80 h-full flex items-end justify-center z-10">
                            <Image
                                src={getPlayerImage(player.id)}
                                alt={player.name}
                                width={320}
                                height={320}
                                className="object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] mask-linear-fade"
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-black/40 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20 group/close backdrop-blur-md"
                        >
                            <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-8 md:p-10 space-y-8 relative z-10 -mt-10">
                        {/* Player Info */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/60 border border-white/10 rounded-full backdrop-blur-md shadow-lg mb-2">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{player.position}</span>
                                {player.shirtNumber && <span className="text-[10px] font-black text-white/50 border-l border-white/10 pl-2">#{player.shirtNumber}</span>}
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{player.name}</h2>
                            {player.teamName && (
                                <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    {player.teamName}
                                </p>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats ? Object.entries(stats).map(([key, value], idx) => (
                                <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center hover:border-primary/20 transition-all group/stat">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover/stat:text-white transition-colors">{key}</p>
                                    <p className="text-2xl font-black text-white italic font-mono">{value}</p>
                                </div>
                            )) : (
                                // Mock/Placeholder Stats if none provided
                                <>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center opacity-50">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Rating</p>
                                        <p className="text-2xl font-black text-white italic font-mono">-.-</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center opacity-50">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Forma</p>
                                        <p className="text-2xl font-black text-white italic font-mono">N/A</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Recent Activity / AI Insight Stub */}
                        <div className="bg-gradient-to-br from-primary/5 to-transparent border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity className="w-5 h-5 text-primary animate-pulse" />
                                <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">Impacto en Tiempo Real</h3>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                Análisis detallado de rendimiento y tendencias de {player.name} no disponible durante la fase Beta del motor v4.2.
                                <br /><span className="text-primary/70 block mt-2">Próximamente: Mapas de calor y Proyecciones de Props.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
