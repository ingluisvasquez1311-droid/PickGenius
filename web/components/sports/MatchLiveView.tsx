'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMatchDetails, useMatchBestPlayers } from '@/hooks/useMatchData';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import AIPredictionCard from '@/components/ai/AIPredictionCard';
import MatchPlayerStats from '@/components/sports/MatchPlayerStats';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import TopPlayersCard from '@/components/sports/TopPlayersCard';
import TeamLogo from '@/components/ui/TeamLogo';
import PlayerDetailModal from '@/components/basketball/PlayerDetailModal';
import MatchStatsSummary from '@/components/sports/MatchStatsSummary';
import { toast } from 'sonner';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MatchLiveViewProps {
    sport: string;
    eventId: string;
}

export default function MatchLiveView({ sport, eventId }: MatchLiveViewProps) {
    const router = useRouter();
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const { data: game, isLoading: gameLoading, error: gameError } = useMatchDetails(sport, eventId);
    const { data: bestPlayers, isLoading: playersLoading } = useMatchBestPlayers(sport, eventId);

    // Generate random data once for chart
    const [chartData] = useState(() => Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: 40 + Math.random() * 20 + (i > 10 ? 10 : -10)
    })));

    // Derived state
    const loading = gameLoading;
    const isLive = game?.status?.type === 'inprogress';

    useEffect(() => {
        if (isLive && game) {
            toast('🤖 Análisis en Vivo Activado', {
                description: `PickGenius AI está monitoreando el ${game.homeTeam.name} vs ${game.awayTeam.name} en tiempo real.`,
                icon: '⚡',
                duration: 5000,
            });
        }
    }, [isLive, game?.id]);

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
            <div className="min-h-screen bg-[#0b0b0b] pb-20 flex items-center justify-center text-center px-4">
                <div className="glass-card p-10 max-w-md w-full border border-red-500/20">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl text-red-500">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-black text-white italic mb-2">PARTIDO NO ENCONTRADO</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        No pudimos conectar con los terminales de Sofascore para este ID: <span className="text-red-400 font-mono">{eventId}</span>.
                        {gameError && (
                            <span className="block mt-2 p-2 bg-red-500/10 rounded text-[10px] text-red-300 font-mono">
                                ERROR: {(gameError as any).message || 'Unknown source error'}
                            </span>
                        )}
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-[#0b0b0b] pb-20">
            <div className="container pt-24 md:pt-28">

                {/* Tournament Info & Flag */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    {game.tournament?.category?.id && (
                        <img
                            src={`/api/proxy/category-image/${game.tournament.category.id}`}
                            alt={game.tournament.category.name}
                            className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    )}
                    <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                        {game.tournament?.name}
                    </h1>
                </div>

                {/* Header / Scoreboard */}
                <div className="glass-card p-6 mb-6">
                    <div className="flex justify-between items-center text-center">
                        <div className="flex-1 flex flex-col items-center gap-3">
                            <TeamLogo teamId={game.homeTeam.id} teamName={game.homeTeam.name} size="xl" />
                            <div>
                                <h2 className="text-xl md:text-3xl font-bold mb-2">{game.homeTeam.name}</h2>
                                <div className="text-4xl md:text-6xl font-black font-mono tracking-tighter">
                                    {(game.homeScore?.current !== undefined ? game.homeScore.current :
                                        game.homeScore?.display !== undefined ? game.homeScore.display :
                                            (game.status?.type === 'notstarted' ? '-' : 0))}
                                </div>
                            </div>
                        </div>

                        <div className="px-4">
                            <div className={`text-xs font-black uppercase tracking-widest mb-1 ${isLive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                                {isLive ? (() => {
                                    if (game.status?.description?.includes("'") || game.status?.description?.includes(":")) {
                                        return game.status.description;
                                    }
                                    if (sport === 'football' && game.time?.currentPeriodStartTimestamp) {
                                        const now = Math.floor(Date.now() / 1000);
                                        const elapsed = Math.floor((now - game.time.currentPeriodStartTimestamp) / 60);
                                        const offset = (game.status?.description?.toLowerCase().includes('2nd') || game.status?.description?.toLowerCase().includes('2a')) ? 45 : 0;
                                        return `${elapsed + offset}'`;
                                    }
                                    return game.status?.description || 'EN VIVO';
                                })() : game.status?.description || 'PROGRAMADO'}
                            </div>
                            {isLive && (
                                <div className="text-[8px] font-black text-red-500/40 tracking-[0.3em] uppercase mb-2">LIVE MONITORING</div>
                            )}
                            <div className="text-[10px] text-gray-500 font-bold">
                                {new Date(game.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center gap-3">
                            <TeamLogo teamId={game.awayTeam.id} teamName={game.awayTeam.name} size="xl" />
                            <div>
                                <h2 className="text-xl md:text-3xl font-bold mb-2">{game.awayTeam.name}</h2>
                                <div className="text-4xl md:text-6xl font-black font-mono tracking-tighter">
                                    {(game.awayScore?.current !== undefined ? game.awayScore.current :
                                        game.awayScore?.display !== undefined ? game.awayScore.display :
                                            (game.status?.type === 'notstarted' ? '-' : 0))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-start">

                    {/* Left Column: Home Details & Players (3 cols) */}
                    <div className="md:col-span-3 order-2 md:order-1 space-y-4">
                        <ErrorBoundary>
                            <TopPlayersCard
                                title="TOP JUGADORES LOCAL"
                                players={bestPlayers?.allPlayers?.home || []}
                                sport={sport}
                                teamColor="purple"
                                onPlayerClick={setSelectedPlayer}
                            />
                        </ErrorBoundary>

                        <ErrorBoundary>
                            <MatchStatsSummary match={game} sport={sport} eventId={eventId} />
                        </ErrorBoundary>
                    </div>

                    {/* Center Column: AI Oracle Dashboard (6 cols) */}
                    <div className="md:col-span-6 order-1 md:order-2 space-y-4">
                        <ErrorBoundary>
                            <AIPredictionCard
                                sport={sport}
                                eventId={eventId}
                            />
                        </ErrorBoundary>

                        {/* LIVE MOMENTUM TRACKER - Brutal Visual */}
                        <div className="glass-card p-6 border border-white/5 bg-white/[0.02] rounded-[2rem] relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-6 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Live Attack Momentum</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Real-Time</span>
                                </div>
                            </div>

                            <div className="h-[120px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorMomentum" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorMomentum)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>

                                {/* Labels */}
                                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                                    <div className="flex justify-between items-center px-4">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{game.homeTeam.name} Pressing</span>
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{game.awayTeam.name} Pressing</span>
                                    </div>
                                    <div className="h-px w-full bg-white/5 border-t border-dashed border-white/10"></div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Peligro Local</div>
                                    <div className="text-lg font-black italic text-purple-400">ALTO</div>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Peligro Visitante</div>
                                    <div className="text-lg font-black italic text-gray-400">BAJO</div>
                                </div>
                            </div>
                        </div>

                        {/* Period Detail (Generic) */}
                        <div className="glass-card p-6 border border-white/5 bg-white/[0.02] rounded-3xl">
                            <h3 className="text-[10px] font-black uppercase mb-6 border-b border-white/5 pb-3 tracking-widest text-gray-500">Desglose de Periodos</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                                    <span className="font-black text-xs text-gray-300 uppercase italic tracking-tighter">{game.homeTeam.name}</span>
                                    <div className="flex gap-4 font-mono text-lg font-black text-white">
                                        {game.homeScore?.period1 !== undefined && <span className="opacity-40">{game.homeScore.period1}</span>}
                                        {game.homeScore?.period2 !== undefined && <span className="opacity-40">{game.homeScore.period2}</span>}
                                        {game.homeScore?.period3 !== undefined && <span className="opacity-40">{game.homeScore.period3}</span>}
                                        {game.homeScore?.period4 !== undefined && <span className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">{game.homeScore.period4}</span>}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all">
                                    <span className="font-black text-xs text-gray-300 uppercase italic tracking-tighter">{game.awayTeam.name}</span>
                                    <div className="flex gap-4 font-mono text-lg font-black text-white">
                                        {game.awayScore?.period1 !== undefined && <span className="opacity-40">{game.awayScore.period1}</span>}
                                        {game.awayScore?.period2 !== undefined && <span className="opacity-40">{game.awayScore.period2}</span>}
                                        {game.awayScore?.period3 !== undefined && <span className="opacity-40">{game.awayScore.period3}</span>}
                                        {game.awayScore?.period4 !== undefined && <span className="text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">{game.awayScore.period4}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Away Details & MVP (3 cols) */}
                    <div className="md:col-span-3 order-3 md:order-3 space-y-4">
                        {/* MVP Spotlight Moved Here */}
                        {bestPlayers?.mvp && (
                            <div className="glass-card overflow-hidden relative group">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-lg z-10">MVP</div>
                                <div className="p-4 flex flex-col gap-4">
                                    <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 relative overflow-hidden">
                                        <img src={bestPlayers.mvp.imageUrl} alt={bestPlayers.mvp.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">{bestPlayers.ai?.title || 'DOMINIO'}</p>
                                        <h3 className="text-xl font-black text-white italic tracking-tighter mb-1">{bestPlayers.mvp.name}</h3>
                                        <p className="text-gray-400 text-[10px] leading-relaxed">{bestPlayers.ai?.description || 'Rendimiento superior esta jornada.'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <ErrorBoundary>
                            <TopPlayersCard
                                title="TOP JUGADORES VISITANTE"
                                players={bestPlayers?.allPlayers?.away || []}
                                sport={sport}
                                teamColor="orange"
                                onPlayerClick={setSelectedPlayer}
                            />
                        </ErrorBoundary>
                    </div>

                </div>
            </div>

            {selectedPlayer && (
                <PlayerDetailModal
                    isOpen={!!selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    player={selectedPlayer}
                    teamColor="purple"
                />
            )}
        </div>
    );
}
