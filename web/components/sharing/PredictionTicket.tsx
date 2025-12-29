'use client';

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Zap, TrendingUp, Trophy } from 'lucide-react';

interface PredictionTicketProps {
    player: {
        name: string;
        team: string;
        image?: string;
    } | null;
    match?: {
        homeTeam: string;
        awayTeam: string;
        time: string;
        tournament: string;
    };
    prediction: {
        type: string; // e.g., "Puntos", "Asistencias"
        line: number;
        prediction: 'Over' | 'Under';
        probability: number;
    };
}

export const PredictionTicket = forwardRef<HTMLDivElement, PredictionTicketProps>(({ player, match, prediction }, ref) => {
    const isHighConfidence = prediction.probability > 75;

    return (
        <div
            ref={ref}
            className="w-[400px] bg-[#050505] text-white p-6 relative overflow-hidden rounded-3xl border border-white/10 font-sans selection:bg-none"
            style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 60%)' }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        <Zap className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="font-black text-xl italic tracking-tighter leading-none">PICKGENIUS</h1>
                        <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">INTELIGENCIA ARTIFICIAL</p>
                    </div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Verificado
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 bg-white/5 rounded-2xl p-4 border border-white/10 mb-6 backdrop-blur-sm">

                {/* Match Info */}
                {match && (
                    <div className="text-center mb-4 border-b border-white/5 pb-4">
                        <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{match.tournament}</div>
                        <div className="text-sm font-bold text-gray-200">{match.homeTeam} vs {match.awayTeam}</div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {/* Player Image */}
                    {player?.image ? (
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)] bg-black/40">
                                <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-purple-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-white/10">
                                IA
                            </div>
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                            <Trophy className="w-8 h-8 text-gray-600" />
                        </div>
                    )}

                    {/* Prediction Details */}
                    <div className="flex-1">
                        <h2 className="font-black text-lg leading-tight uppercase italic mb-1">{player?.name || 'Predicción del Partido'}</h2>
                        <div className="text-xs font-bold text-gray-400 mb-2">{player?.team}</div>

                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 rounded-lg shadow-lg">
                                <span className="text-xs font-black uppercase tracking-wider">{prediction.type}</span>
                            </div>
                            <div className="text-2xl font-black italic">{prediction.prediction} {prediction.line}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Stats */}
            <div className="relative z-10 flex justify-between items-end">
                <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">PROBABILIDAD IA</div>
                    <div className={`text-4xl font-black italic tracking-tighter ${isHighConfidence ? 'text-emerald-400' : 'text-blue-400'} flex items-center gap-2`}>
                        {prediction.probability}%
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-2 rounded-xl">
                    <QRCodeSVG
                        value="https://pickgenius.ai"
                        size={50}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="L"
                    />
                </div>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-white/20 font-black tracking-[1em] uppercase whitespace-nowrap z-0">
                ENABLED BY PICKGENIUS.AI
            </div>
        </div>
    );
});

PredictionTicket.displayName = 'PredictionTicket';
