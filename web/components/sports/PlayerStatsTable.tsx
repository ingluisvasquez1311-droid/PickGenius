'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

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
    const [players, setPlayers] = useState<PlayerStat[]>(MOCK_PLAYERS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTopPerformers() {
            try {
                // Get today's date range
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                // Query player_stats collection for today's top performers
                if (!db) {
                    console.error('Firestore not initialized');
                    setLoading(false);
                    return;
                }
                const statsRef = collection(db, 'player_stats');
                const q = query(
                    statsRef,
                    where('date', '>=', today),
                    where('date', '<', tomorrow),
                    orderBy('date', 'desc'),
                    orderBy('points', 'desc'),
                    limit(5)
                );

                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const topPlayers = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const rating = calculateRating(data.points, data.rebounds, data.assists);

                        return {
                            id: doc.id,
                            name: data.player_name || 'Unknown Player',
                            team: data.team || 'N/A',
                            number: data.jersey_number || '0',
                            position: mapPosition(data.position),
                            pts: data.points || 0,
                            reb: data.rebounds || 0,
                            ast: data.assists || 0,
                            rating: rating,
                            isStarter: data.is_starter || false
                        };
                    });

                    setPlayers(topPlayers);
                } else {
                    // If no data for today, use mock data
                    console.log('No player stats found for today, using mock data');
                }
            } catch (error) {
                console.error('Error fetching top performers:', error);
                // Keep mock data on error
            } finally {
                setLoading(false);
            }
        }

        fetchTopPerformers();
    }, []);

    // Calculate a simple rating based on stats
    function calculateRating(pts: number, reb: number, ast: number): number {
        const score = (pts * 1.0) + (reb * 1.2) + (ast * 1.5);
        const rating = Math.min(10, Math.max(5, score / 10));
        return Math.round(rating * 10) / 10;
    }

    // Map position codes to Spanish names
    function mapPosition(pos: string): string {
        const positionMap: { [key: string]: string } = {
            'G': 'Escolta',
            'F': 'Alero',
            'PG': 'Base',
            'SG': 'Escolta',
            'SF': 'Alero',
            'PF': 'Ala-Pívot',
            'C': 'Pívot'
        };
        return positionMap[pos] || pos;
    }

    if (loading) {
        return (
            <div className="glass-card overflow-hidden">
                <div className="p-3 border-b border-[rgba(255,255,255,0.1)]">
                    <span className="text-[var(--accent)] font-bold text-sm">Leyenda ⓘ</span>
                </div>
                <div className="p-8 text-center text-[var(--text-muted)]">
                    Cargando mejores jugadores...
                </div>
            </div>
        );
    }

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
                {players.map((player) => (
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
