'use client';

import React, { useState } from 'react';
import LeaderboardTable, { LeaderboardEntry } from '@/components/leaderboard/LeaderboardTable';

// Mock Data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { id: '1', rank: 1, username: 'PickMaster99', roi: 45.2, winRate: 72, profit: 12500, streak: 8, isPremium: true },
    { id: '2', rank: 2, username: 'BetKing_ES', roi: 38.5, winRate: 68, profit: 9800, streak: 3, isPremium: true },
    { id: '3', rank: 3, username: 'FutbolAnalyst', roi: 32.1, winRate: 65, profit: 8200, streak: 5 },
    { id: '4', rank: 4, username: 'GreenWallet', roi: 28.4, winRate: 62, profit: 6500, streak: 1, isPremium: true },
    { id: '5', rank: 5, username: 'LuckyStrike', roi: 25.0, winRate: 58, profit: 5100, streak: 0 },
    { id: '6', rank: 6, username: 'UnderDogHunter', roi: 22.8, winRate: 55, profit: 4800, streak: 2 },
    { id: '7', rank: 7, username: 'DanielUser', roi: 18.2, winRate: 52, profit: 3200, streak: 1, isPremium: true }, // Mock current user
    { id: '8', rank: 8, username: 'ValueBetz', roi: 15.6, winRate: 50, profit: 2900, streak: 0 },
    { id: '9', rank: 9, username: 'ParlayGod', roi: 12.4, winRate: 48, profit: 1500, streak: 0 },
    { id: '10', rank: 10, username: 'RookieBet', roi: 8.1, winRate: 45, profit: 800, streak: 0 },
];

export default function LeaderboardPage() {
    const [period, setPeriod] = useState<'monthly' | 'alltime'>('monthly');

    return (
        <main className="min-h-screen pb-20 bg-[#0b0b0b]">
            <div className="container pt-8 max-w-4xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            🏆 Ranking de Tipsters
                        </h1>
                        <p className="text-[var(--text-muted)]">
                            Los mejores pronosticadores de la comunidad PickGenius.
                        </p>
                    </div>

                    {/* Period Toggle */}
                    <div className="bg-[rgba(255,255,255,0.05)] p-1 rounded-lg flex">
                        <button
                            onClick={() => setPeriod('monthly')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${period === 'monthly'
                                    ? 'bg-[var(--primary)] text-black shadow-lg'
                                    : 'text-[var(--text-muted)] hover:text-white'
                                }`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setPeriod('alltime')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${period === 'alltime'
                                    ? 'bg-[var(--primary)] text-black shadow-lg'
                                    : 'text-[var(--text-muted)] hover:text-white'
                                }`}
                        >
                            Histórico
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="glass-card p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--primary)] bg-opacity-20 flex items-center justify-center text-2xl">
                            💰
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-muted)] uppercase font-bold">Total Repartido</div>
                            <div className="text-xl font-bold text-[var(--primary)]">$45,200</div>
                        </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--success)] bg-opacity-20 flex items-center justify-center text-2xl">
                            📈
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-muted)] uppercase font-bold">ROI Promedio</div>
                            <div className="text-xl font-bold text-[var(--success)]">+12.5%</div>
                        </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--accent)] bg-opacity-20 flex items-center justify-center text-2xl">
                            👥
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-muted)] uppercase font-bold">Tipsters Activos</div>
                            <div className="text-xl font-bold text-[var(--accent)]">1,240</div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <LeaderboardTable data={MOCK_LEADERBOARD} currentUserRank={7} />

                {/* Info Footer */}
                <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
                    <p>El ranking se actualiza cada 24 horas. Los premios se distribuyen al final de cada mes.</p>
                </div>

            </div>
        </main>
    );
}
