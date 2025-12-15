'use client';

import React, { useEffect, useState } from 'react';
import { sofascoreService } from '@/lib/services/sofascoreService';

interface Player {
    player: {
        name: string;
        slug: string;
        position: string;
        id: number;
    };
    statistics: {
        rating?: number;
        points?: number;
        goals?: number;
        assists?: number;
        rebounds?: number;
        totalPass?: number;
    };
}

interface MatchPlayerStatsProps {
    eventId: number;
    sport: 'football' | 'basketball';
    team?: 'home' | 'away'; // Optional filter
}

export default function MatchPlayerStats({ eventId, sport, team }: MatchPlayerStatsProps) {
    const [players, setPlayers] = useState<{ home: Player[], away: Player[] }>({ home: [], away: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            try {
                // Try to get best players first (easier API if available)
                const bestPlayers = await sofascoreService.getMatchBestPlayers(eventId);

                if (bestPlayers && bestPlayers.length > 0) {
                    // Normalize best players data structure if needed
                    // For now, simpler to use lineups which contains everyone
                }

                // Fallback to lineups to get all players and sort by rating
                const lineups = await sofascoreService.getMatchLineups(eventId);

                if (lineups) {
                    const processTeam = (teamLineup: any) => {
                        const allPlayers = [...(teamLineup.players || []), ...(teamLineup.bench || [])];
                        return allPlayers
                            .filter((p: any) => p.statistics && (p.statistics.rating > 0 || p.statistics.points > 0))
                            .sort((a: any, b: any) => (b.statistics.rating || 0) - (a.statistics.rating || 0))
                            .slice(0, 5); // Take top 5
                    };

                    setPlayers({
                        home: processTeam(lineups.home),
                        away: processTeam(lineups.away)
                    });
                }
            } catch (error) {
                console.error('Error fetching player stats:', error);
            } finally {
                setLoading(false);
            }
        }

        if (eventId) {
            fetchStats();
        }
    }, [eventId]);

    if (loading) {
        return <div className="animate-pulse h-48 bg-[rgba(255,255,255,0.05)] rounded-lg"></div>;
    }

    if (players.home.length === 0 && players.away.length === 0) {
        return null; // Don't show if no data
    }

    const renderPlayerRow = (p: Player, rank: number) => (
        <div key={p.player.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--text-muted)] w-4">{rank}</span>
                <div>
                    <div className="font-bold text-sm">{p.player.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{p.player.position}</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {sport === 'basketball' ? (
                    <div className="text-xs text-right">
                        <span className="block font-bold text-white">{p.statistics.points || 0} PTS</span>
                        <span className="text-[var(--text-muted)]">{p.statistics.assists || 0} AST</span>
                    </div>
                ) : (
                    <div className="text-xs text-right">
                        {p.statistics.goals && <span className="block font-bold text-[var(--success)]">⚽ {p.statistics.goals}</span>}
                        {!p.statistics.goals && <span className="block font-bold text-white">{p.statistics.rating?.toFixed(1)}</span>}
                    </div>
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${(p.statistics.rating || 0) >= 8 ? 'bg-[var(--success)] text-black' :
                        (p.statistics.rating || 0) >= 7 ? 'bg-[var(--primary)] text-black' :
                            'bg-[rgba(255,255,255,0.1)]'}`}>
                    {p.statistics.rating?.toFixed(1) || '-'}
                </div>
            </div>
        </div>
    );

    // If filtering by team
    if (team === 'home') {
        return (
            <div className="glass-card p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[var(--primary)] pb-2">
                    Top Local
                </h3>
                <div className="flex flex-col">
                    {players.home.map((p, i) => renderPlayerRow(p, i + 1))}
                </div>
            </div>
        );
    }

    if (team === 'away') {
        return (
            <div className="glass-card p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[var(--danger)] pb-2">
                    Top Visitante
                </h3>
                <div className="flex flex-col">
                    {players.away.map((p, i) => renderPlayerRow(p, i + 1))}
                </div>
            </div>
        );
    }

    // Default: Render both side-by-side (legacy mode)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="glass-card p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[var(--primary)] pb-2">
                    Top Jugadores Local
                </h3>
                <div className="flex flex-col">
                    {players.home.map((p, i) => renderPlayerRow(p, i + 1))}
                </div>
            </div>

            <div className="glass-card p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[var(--danger)] pb-2">
                    Top Jugadores Visitante
                </h3>
                <div className="flex flex-col">
                    {players.away.map((p, i) => renderPlayerRow(p, i + 1))}
                </div>
            </div>
        </div>
    );
}
