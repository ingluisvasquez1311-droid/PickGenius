import React from 'react';

export interface LeaderboardEntry {
    id: string;
    rank: number;
    username: string;
    avatar?: string;
    roi: number; // Percentage
    winRate: number; // Percentage
    profit: number; // Virtual currency
    streak: number; // Current winning streak
    isPremium?: boolean;
}

interface LeaderboardTableProps {
    data: LeaderboardEntry[];
    currentUserRank?: number;
}

export default function LeaderboardTable({ data, currentUserRank }: LeaderboardTableProps) {
    return (
        <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 p-4 border-b border-[rgba(255,255,255,0.1)] text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">
                <div className="col-span-2 md:col-span-1 text-center">#</div>
                <div className="col-span-6 md:col-span-4">Usuario</div>
                <div className="col-span-4 md:col-span-2 text-center">ROI</div>
                <div className="hidden md:block md:col-span-2 text-center">Win Rate</div>
                <div className="hidden md:block md:col-span-2 text-center">Racha</div>
                <div className="hidden md:block md:col-span-1 text-center">Profit</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col">
                {data.map((entry) => (
                    <div
                        key={entry.id}
                        className={`grid grid-cols-12 gap-2 p-4 items-center border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)] transition-colors ${entry.rank === currentUserRank ? 'bg-[rgba(var(--primary-rgb),0.1)] border-l-2 border-l-[var(--primary)]' : ''
                            }`}
                    >
                        {/* Rank */}
                        <div className="col-span-2 md:col-span-1 flex justify-center">
                            {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                            {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                            {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                            {entry.rank > 3 && <span className="font-mono font-bold text-[var(--text-muted)]">{entry.rank}</span>}
                        </div>

                        {/* User */}
                        <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-xs border border-[rgba(255,255,255,0.1)]">
                                {entry.avatar ? (
                                    <img src={entry.avatar} alt={entry.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    entry.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className={`font-bold text-sm ${entry.isPremium ? 'text-[var(--accent)]' : 'text-white'}`}>
                                    {entry.username}
                                    {entry.isPremium && <span className="ml-1 text-[10px] bg-[var(--accent)] text-black px-1 rounded font-bold">PRO</span>}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] md:hidden">
                                    WR: {entry.winRate}% • {entry.streak}🔥
                                </span>
                            </div>
                        </div>

                        {/* ROI */}
                        <div className="col-span-4 md:col-span-2 text-center">
                            <span className={`font-bold font-mono ${entry.roi > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                                {entry.roi > 0 ? '+' : ''}{entry.roi}%
                            </span>
                        </div>

                        {/* Win Rate (Desktop) */}
                        <div className="hidden md:block md:col-span-2 text-center text-sm font-mono">
                            {entry.winRate}%
                        </div>

                        {/* Streak (Desktop) */}
                        <div className="hidden md:block md:col-span-2 text-center">
                            <span className="text-sm font-bold text-[var(--warning)]">{entry.streak} 🔥</span>
                        </div>

                        {/* Profit (Desktop) */}
                        <div className="hidden md:block md:col-span-1 text-center text-sm font-mono text-[var(--success)]">
                            ${entry.profit.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
