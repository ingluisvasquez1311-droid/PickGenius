'use client';

import React from 'react';
import Image from 'next/image';
import TeamLogo from '@/components/ui/TeamLogo';

interface PlayerPredictionShowcaseProps {
    player: {
        id: number;
        name: string;
        team: string;
        teamId?: number;
        position: string;
        image: string;
    };
    prop: {
        type: string;
        line: number | string;
        displayName: string;
        icon: string;
    };
    stats: {
        average: number;
        last5: number[];
    };
    prediction?: {
        pick: 'OVER' | 'UNDER' | 'HOME' | 'AWAY' | 'YES' | 'NO';
        confidence: number;
        odds?: number;
    };
    game: {
        homeTeam: string;
        awayTeam: string;
        homeTeamId?: number;
        awayTeamId?: number;
    };
    sport: 'basketball' | 'football' | 'baseball' | 'nhl' | 'tennis' | 'american-football';
    onClose?: () => void;
}

// Sport-specific theming
const sportThemes = {
    basketball: {
        primary: 'from-orange-500 to-amber-600',
        secondary: 'from-orange-600 to-amber-700',
        border: 'border-orange-400',
        accent: 'text-orange-400',
        icon: '🏀',
        courtPattern: 'basketball-court'
    },
    football: {
        primary: 'from-green-500 to-emerald-600',
        secondary: 'from-green-600 to-emerald-700',
        border: 'border-green-400',
        accent: 'text-green-400',
        icon: '⚽',
        courtPattern: 'soccer-field'
    },
    'american-football': {
        primary: 'from-yellow-600 to-amber-700',
        secondary: 'from-yellow-700 to-amber-800',
        border: 'border-yellow-500',
        accent: 'text-yellow-400',
        icon: '🏈',
        courtPattern: 'football-field'
    },
    baseball: {
        primary: 'from-blue-500 to-indigo-600',
        secondary: 'from-blue-600 to-indigo-700',
        border: 'border-blue-400',
        accent: 'text-blue-400',
        icon: '⚾',
        courtPattern: 'baseball-diamond'
    },
    nhl: {
        primary: 'from-cyan-500 to-blue-600',
        secondary: 'from-cyan-600 to-blue-700',
        border: 'border-cyan-400',
        accent: 'text-cyan-400',
        icon: '🏒',
        courtPattern: 'ice-rink'
    },
    tennis: {
        primary: 'from-lime-500 to-green-600',
        secondary: 'from-lime-600 to-green-700',
        border: 'border-lime-400',
        accent: 'text-lime-400',
        icon: '🎾',
        courtPattern: 'tennis-court'
    }
};

export default function PlayerPredictionShowcase({
    player,
    prop,
    stats,
    prediction,
    game,
    sport,
    onClose
}: PlayerPredictionShowcaseProps) {
    const theme = sportThemes[sport];
    const lineValue = typeof prop.line === 'number' ? prop.line : parseFloat(prop.line as string) || 0;
    const maxValue = Math.max(...stats.last5, stats.average, lineValue);

    const isOverUnder = prediction?.pick === 'OVER' || prediction?.pick === 'UNDER';
    const pickColor = isOverUnder
        ? (prediction?.pick === 'OVER' ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600')
        : theme.primary;
    const pickBorder = isOverUnder
        ? (prediction?.pick === 'OVER' ? 'border-green-400' : 'border-red-400')
        : theme.border;

    // Generate realistic dates for last 5 games
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 4; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i * 2 + 1));
            dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        return dates;
    };

    const dates = generateDates();
    const opponents = ['@UTA', 'SAC', '@LAC', 'DEN', '@NOP']; // Mock opponents

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                {/* Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        ✕
                    </button>
                )}

                {/* Background: Sport-specific pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    />
                </div>

                {/* Content Container */}
                <div className="relative z-10 p-8">
                    {/* Top Card: Bet Line */}
                    {prediction && (
                        <div className={`bg-gradient-to-r ${pickColor} rounded-2xl p-5 mb-6 border-2 ${pickBorder} shadow-lg`}>
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="text-white/80 text-xs font-bold uppercase mb-1">
                                        {player.name} - {isOverUnder ? (prediction.pick === 'OVER' ? 'Más de' : 'Menos de') : prediction.pick} {prop.line}
                                    </p>
                                    <p className="text-white text-xl font-black">
                                        {prop.displayName} {theme.icon}
                                    </p>
                                    <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
                                        {game.homeTeamId && <TeamLogo teamId={game.homeTeamId} teamName={game.homeTeam} size="sm" />}
                                        <span>{game.homeTeam} vs {game.awayTeam}</span>
                                        {game.awayTeamId && <TeamLogo teamId={game.awayTeamId} teamName={game.awayTeam} size="sm" />}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-white">
                                        {prediction.odds || '1.86'}
                                    </div>
                                    <div className="text-xs text-white/70 font-bold uppercase">Cuota</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-6">
                        {/* Left: Player Info + Chart */}
                        <div className="flex-1">
                            {/* Player Avatar */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                                    <Image
                                        src={player.image}
                                        alt={player.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white text-2xl font-black">{player.name}</h3>
                                    <p className="text-gray-400 text-sm font-bold flex items-center gap-2">
                                        {player.teamId && <TeamLogo teamId={player.teamId} teamName={player.team} size="sm" />}
                                        <span>{player.position}, {player.team}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Stats Chart */}
                            <div className="bg-black/40 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase">Línea</p>
                                        <p className={`text-white text-3xl font-black flex items-center gap-2 ${theme.accent}`}>
                                            {prediction?.pick === 'OVER' ? '↑' : prediction?.pick === 'UNDER' ? '↓' : ''} {prop.line}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs font-bold uppercase">Cuota</p>
                                        <p className="text-white text-3xl font-black">
                                            {prediction?.odds || '-115'}
                                        </p>
                                    </div>
                                </div>

                                {/* Bar Chart */}
                                <div className="flex items-end justify-between gap-2 h-48">
                                    {stats.last5.map((value, index) => {
                                        const height = (value / maxValue) * 100;
                                        const isAboveLine = value >= lineValue;
                                        const barColor = isAboveLine ? 'bg-green-500' : 'bg-red-500';

                                        return (
                                            <div key={index} className="flex-1 flex flex-col items-center">
                                                <div className="w-full relative" style={{ height: '140px' }}>
                                                    <div
                                                        className={`absolute bottom-0 w-full ${barColor} rounded-t-lg transition-all duration-500 hover:opacity-80`}
                                                        style={{ height: `${height}%` }}
                                                    >
                                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-white text-sm font-black bg-black/50 px-2 py-1 rounded">
                                                            {value}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-gray-400 text-xs font-bold mt-2">
                                                    {dates[index]}
                                                </div>
                                                <div className="text-gray-600 text-[10px] uppercase font-bold">
                                                    {opponents[index]}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Line Reference */}
                                <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span className="text-gray-300 font-bold">Sobre {prop.line}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                                        <span className="text-gray-300 font-bold">Bajo {prop.line}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Player Image */}
                        <div className="relative w-80 h-[500px] flex-shrink-0">
                            <Image
                                src={player.image}
                                alt={player.name}
                                fill
                                className="object-contain object-bottom drop-shadow-2xl"
                                unoptimized
                            />
                            {/* Sport Badge */}
                            <div className={`absolute top-4 right-4 w-20 h-20 bg-gradient-to-br ${theme.primary} rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl`}>
                                <span className="text-4xl">{theme.icon}</span>
                            </div>
                        </div>
                    </div>

                    {/* Confidence Bar */}
                    {prediction && (
                        <div className="mt-6 bg-black/40 rounded-xl p-5 backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-300 text-sm font-bold uppercase">Confianza IA PickGenius</span>
                                <span className="text-white text-2xl font-black">{prediction.confidence}%</span>
                            </div>
                            <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${pickColor} transition-all duration-1000`}
                                    style={{ width: `${prediction.confidence}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
