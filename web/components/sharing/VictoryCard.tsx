'use client';

import { forwardRef } from 'react';
import { Trophy, TrendingUp, Target, Zap } from 'lucide-react';

interface VictoryCardProps {
    playerName: string;
    prediction: string;
    line: string | number;
    probability: number;
    result: 'win' | 'loss';
    sport: 'football' | 'basketball';
    date: Date;
}

const VictoryCard = forwardRef<HTMLDivElement, VictoryCardProps>(
    ({ playerName, prediction, line, probability, result, sport, date }, ref) => {
        const isWin = result === 'win';

        return (
            <div
                ref={ref}
                className="w-[500px] bg-gradient-to-br from-[#0a0a0a] to-[#050505] text-white p-8 relative overflow-hidden rounded-3xl border border-white/10 font-sans"
                style={{
                    backgroundImage: isWin
                        ? 'radial-gradient(circle at top right, rgba(34,197,94,0.15), transparent 60%)'
                        : 'radial-gradient(circle at top right, rgba(239,68,68,0.15), transparent 60%)',
                }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>

                {/* Header */}
                <div className="relative z-10 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="text-3xl">{sport === 'football' ? '⚽' : '🏀'}</div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    PickGenius
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    {date.toLocaleDateString('es', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                        {isWin ? (
                            <Trophy className="w-12 h-12 text-green-500" />
                        ) : (
                            <Target className="w-12 h-12 text-red-500" />
                        )}
                    </div>

                    {/* Result Badge */}
                    <div
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-2xl uppercase tracking-tight ${isWin
                                ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border-2 border-red-500/30'
                            }`}
                    >
                        {isWin ? '✓ VICTORIA' : '✗ FALLIDA'}
                    </div>
                </div>

                {/* Prediction Details */}
                <div className="relative z-10 mb-6">
                    <div className="text-3xl font-black mb-2">{playerName}</div>
                    <div className="text-xl text-gray-300 mb-4">
                        {prediction} {line}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold">{probability}% Confianza</span>
                        </div>
                        {isWin && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-bold text-green-400">Acertada</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Predicción generada con IA
                        </div>
                        <div className="text-sm font-black uppercase tracking-wider text-purple-400">
                            PickGenius.com
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                {isWin && (
                    <>
                        <div className="absolute top-4 right-4 text-6xl opacity-10">🎯</div>
                        <div className="absolute bottom-4 left-4 text-6xl opacity-10">🔥</div>
                    </>
                )}
            </div>
        );
    }
);

VictoryCard.displayName = 'VictoryCard';

export default VictoryCard;
