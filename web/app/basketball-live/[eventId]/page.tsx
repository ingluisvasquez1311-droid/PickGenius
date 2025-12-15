'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import AIPredictionCard from '@/components/ai/AIPredictionCard';
import MatchPlayerStats from '@/components/sports/MatchPlayerStats';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function BasketballLivePage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGameDetails() {
            if (!eventId) return;

            try {
                // Use our new Proxy API Route
                const response = await fetch(`/api/basketball/match/${eventId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setGame(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching game details:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchGameDetails();
    }, [eventId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] pb-20">
                <div className="container pt-24">
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] pb-20 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold">Partido no encontrado</h2>
                    <button onClick={() => router.back()} className="mt-4 btn-primary px-4 py-2 rounded">
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const isLive = game.status.type === 'inprogress';

    return (
        <div className="min-h-screen bg-[#0b0b0b] pb-20">

            <div className="container pt-24 md:pt-28">
                {/* Header / Scoreboard */}
                <div className="glass-card p-6 mb-6">
                    <div className="flex justify-between items-center text-center">
                        <div className="flex-1">
                            <h2 className="text-xl md:text-3xl font-bold mb-2">{game.homeTeam.name}</h2>
                            <div className="text-4xl md:text-6xl font-bold font-mono">
                                {game.homeScore?.current || 0}
                            </div>
                        </div>

                        <div className="px-4">
                            <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${isLive ? 'text-red-500 animate-pulse' : 'text-[var(--text-muted)]'}`}>
                                {isLive ? 'EN VIVO' : game.status.description}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                                {new Date(game.startTimestamp * 1000).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl md:text-3xl font-bold mb-2">{game.awayTeam.name}</h2>
                            <div className="text-4xl md:text-6xl font-bold font-mono">
                                {game.awayScore?.current || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3-Column Layout (Matching Football) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 w-full">

                    {/* Left Column: Home Players (3 cols) */}
                    <div className="md:col-span-3 order-2 md:order-1 min-w-0">
                        <ErrorBoundary>
                            <MatchPlayerStats
                                eventId={parseInt(eventId)}
                                sport="basketball"
                                team="home"
                            />
                        </ErrorBoundary>
                    </div>

                    {/* Center Column: AI + Quarter Scores (6 cols) */}
                    <div className="md:col-span-6 order-1 md:order-2 space-y-4 min-w-0">
                        {/* AI Prediction */}
                        <ErrorBoundary>
                            <AIPredictionCard
                                sport="basketball"
                                eventId={eventId}
                            />
                        </ErrorBoundary>

                        {/* Quarter Scores Table */}
                        <div className="glass-card p-4">
                            <h3 className="text-sm font-bold uppercase mb-4 border-b border-[rgba(255,255,255,0.1)] pb-2">Marcador por Cuartos</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-[var(--text-muted)] border-b border-[rgba(255,255,255,0.05)]">
                                            <th className="text-left py-2">Equipo</th>
                                            <th className="text-center py-2">C1</th>
                                            <th className="text-center py-2">C2</th>
                                            <th className="text-center py-2">C3</th>
                                            <th className="text-center py-2">C4</th>
                                            <th className="text-right py-2 font-bold">T</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-[rgba(255,255,255,0.05)]">
                                            <td className="py-2 font-bold">{game.homeTeam.name}</td>
                                            <td className="text-center">{game.homeScore?.period1}</td>
                                            <td className="text-center">{game.homeScore?.period2}</td>
                                            <td className="text-center">{game.homeScore?.period3}</td>
                                            <td className="text-center">{game.homeScore?.period4}</td>
                                            <td className="text-right font-bold text-lg">{game.homeScore?.current}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 font-bold">{game.awayTeam.name}</td>
                                            <td className="text-center">{game.awayScore?.period1}</td>
                                            <td className="text-center">{game.awayScore?.period2}</td>
                                            <td className="text-center">{game.awayScore?.period3}</td>
                                            <td className="text-center">{game.awayScore?.period4}</td>
                                            <td className="text-right font-bold text-lg">{game.awayScore?.current}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Away Players (3 cols) */}
                    <div className="md:col-span-3 order-3 md:order-3 min-w-0">
                        <ErrorBoundary>
                            <MatchPlayerStats
                                eventId={parseInt(eventId)}
                                sport="basketball"
                                team="away"
                            />
                        </ErrorBoundary>
                    </div>

                </div>
            </div>
        </div>
    );
}
