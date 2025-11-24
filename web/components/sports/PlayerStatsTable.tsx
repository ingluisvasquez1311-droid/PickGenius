import React from 'react';

interface PlayerStat {
    id: string;
    name: string;
    team: string;
    number: string;
    position: string;
    pts: number;
    reb: number;
    ast: number;
    rating: number;
    isStarter?: boolean;
}

const MOCK_PLAYERS: PlayerStat[] = [
    { id: '1', name: 'Norman Powell', team: 'MIA', number: '24', position: 'Escolta', pts: 32, reb: 4, ast: 1, rating: 7.8, isStarter: true },
    { id: '2', name: 'Tyrese Maxey', team: 'PHI', number: '0', position: 'Escolta', pts: 27, reb: 3, ast: 6, rating: 7.4, isStarter: true },
    { id: '3', name: 'Jaime Jaquez Jr.', team: 'MIA', number: '11', position: 'Alero', pts: 22, reb: 2, ast: 7, rating: 7.3, isStarter: true },
    { id: '4', name: 'Kel\'el Ware', team: 'MIA', number: '7', position: 'Pivot', pts: 20, reb: 16, ast: 0, rating: 8.2, isStarter: true },
    { id: '5', name: 'Bam Adebayo', team: 'MIA', number: '13', position: 'Centro', pts: 18, reb: 13, ast: 1, rating: 7.0, isStarter: true },
];

export default function PlayerStatsTable() {
    return (
        <div className="glass-card overflow-hidden">
            <div className="p-3 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center">
                <span className="text-[var(--accent)] font-bold text-sm">Leyenda ⓘ</span>
                <div className="flex gap-4 text-xs text-[var(--text-muted)] font-bold">
                    <span className="w-8 text-center text-[var(--primary)]">PTS</span>
                    <span className="w-6 text-center">REB</span>
                    <span className="w-6 text-center">AST</span>
                    <span className="w-8 text-center">RTG</span>
                </div>
            </div>

            <div className="flex flex-col">
                {MOCK_PLAYERS.map((player) => (
                    <div key={player.id} className="flex items-center p-3 border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">

                        {/* Avatar */}
                        <div className="relative mr-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                                {/* Placeholder for player image */}
                                <div className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-800 flex items-center justify-center text-xs">
                                    {player.name.charAt(0)}
                                </div>
                            </div>
                            {player.isStarter && (
                                <div className="absolute -bottom-1 -right-1 bg-[var(--warning)] text-black text-[8px] font-bold px-1 rounded-full border border-black">
                                    Titular
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{player.name}</div>
                            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-red-900 flex items-center justify-center text-[8px]">{player.team}</span>
                                <span>{player.number}</span>
                                <span className="text-gray-500">•</span>
                                <span>{player.position}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 text-sm font-mono items-center">
                            <span className="w-8 text-center text-[var(--primary)] font-bold">{player.pts}</span>
                            <span className="w-6 text-center">{player.reb}</span>
                            <span className="w-6 text-center">{player.ast}</span>
                            <div className={`w-8 h-6 flex items-center justify-center rounded text-xs font-bold text-black ${player.rating >= 8 ? 'bg-[var(--accent)]' : player.rating >= 7 ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'}`}>
                                {player.rating}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            <div className="p-2 text-center text-xs text-[var(--accent)] cursor-pointer hover:underline">
                Ver todos los jugadores ▾
            </div>
        </div>
    );
}
