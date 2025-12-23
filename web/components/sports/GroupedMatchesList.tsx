'use client';

import React from 'react';
import MatchCard from './MatchCard';
import { type SportsDataEvent } from '@/lib/services/sportsDataService';

interface GroupedMatchesListProps {
    games: SportsDataEvent[];
    sport: string;
}

export default function GroupedMatchesList({ games, sport }: GroupedMatchesListProps) {
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    // Group by date first (Hoy/Mañana), then by league
    const todayStr = new Date().toLocaleDateString();
    const groupedByDate = games.reduce((acc, game) => {
        const gameDate = new Date(game.startTimestamp * 1000).toLocaleDateString();
        const dateLabel = gameDate === todayStr ? 'Hoy' : 'Mañana';

        if (!acc[dateLabel]) acc[dateLabel] = [];
        acc[dateLabel].push(game);
        return acc;
    }, {} as Record<string, SportsDataEvent[]>);

    // Auto-expand all groups when data loads
    React.useEffect(() => {
        if (games.length > 0) {
            const allKeys = new Set<string>();
            Object.entries(groupedByDate).forEach(([dateLabel, dateGames]) => {
                dateGames.forEach(game => {
                    const countryName = game.tournament.category?.name || 'Internacional';
                    const leagueName = game.tournament.name;
                    allKeys.add(`${dateLabel}-${countryName}: ${leagueName}`);
                });
            });
            setExpandedGroups(allKeys);
        }
    }, [games.length]);

    return (
        <div className="space-y-8">
            {Object.entries(groupedByDate).map(([dateLabel, dateGames]) => (
                <div key={dateLabel} className="space-y-4">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl font-black uppercase tracking-tight text-white/90">
                            {dateLabel}
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                        <div className="text-sm font-bold text-gray-500">
                            {dateGames.length} {dateGames.length === 1 ? 'partido' : 'partidos'}
                        </div>
                    </div>

                    {/* Group by league within this date */}
                    {(() => {
                        const groupedByLeague = dateGames.reduce((acc, game) => {
                            const countryName = game.tournament.category?.name || 'Internacional';
                            const countryId = game.tournament.category?.id;
                            const leagueName = game.tournament.name;
                            const key = `${dateLabel}-${countryName}: ${leagueName}`;
                            if (!acc[key]) acc[key] = {
                                displayName: `${countryName}: ${leagueName}`,
                                countryId: countryId,
                                countryName: countryName,
                                games: []
                            };
                            acc[key].games.push(game);
                            return acc;
                        }, {} as Record<string, { displayName: string; countryId?: number; countryName: string; games: SportsDataEvent[] }>);

                        // Prioritize TOP leagues
                        const topLeagues = [
                            'Premier League', 'LaLiga', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
                            'UEFA Champions League', 'UEFA Europa League',
                            'NBA', 'Euroleague', 'ACB', 'NCAA',
                            'Copa Libertadores', 'Copa Sudamericana', 'Brasileirão', 'Liga Profesional'
                        ];

                        const sortedLeagues = Object.entries(groupedByLeague).sort(([keyA, dataA], [keyB, dataB]) => {
                            const isTopA = topLeagues.some(top => dataA.displayName.includes(top));
                            const isTopB = topLeagues.some(top => dataB.displayName.includes(top));

                            if (isTopA && !isTopB) return -1;
                            if (!isTopA && isTopB) return 1;
                            return 0; // Keep original order for same priority
                        });

                        return sortedLeagues.map(([leagueKey, { displayName, countryId, countryName, games: leagueGames }]) => {
                            const isExpanded = expandedGroups.has(leagueKey);

                            return (
                                <div key={leagueKey} className="space-y-4">
                                    <button
                                        onClick={() => toggleGroup(leagueKey)}
                                        className="w-full flex items-center justify-between gap-3 border-l-4 border-[var(--primary)] pl-4 py-3 bg-white/5 rounded-r-xl transition-all hover:bg-white/10 group/header"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Flag/Icon */}
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm overflow-hidden border border-white/5">
                                                {countryId ? (
                                                    <img
                                                        src={`/api/proxy/category-image/${countryId}`}
                                                        className="w-full h-full object-cover"
                                                        alt={countryName}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            target.parentElement!.innerText = sport === 'basketball' ? '🏀' : sport === 'football' ? '⚽' : '🏆';
                                                        }}
                                                    />
                                                ) : (
                                                    sport === 'basketball' ? '🏀' : sport === 'football' ? '⚽' : '🏆'
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                                                {displayName}
                                            </h3>
                                            <span className="text-xs font-bold bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full border border-[var(--primary)]/30">
                                                {leagueGames.length}
                                            </span>
                                        </div>
                                        <div className={`transition-transform duration-300 transform ${isExpanded ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5 text-gray-500 group-hover/header:text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {leagueGames.map((game) => (
                                                <MatchCard
                                                    key={game.id}
                                                    eventId={game.id}
                                                    sport={sport}
                                                    homeTeam={{ name: game.homeTeam.name, id: game.homeTeam.id }}
                                                    awayTeam={{ name: game.awayTeam.name, id: game.awayTeam.id }}
                                                    homeScore={game.homeScore.current}
                                                    awayScore={game.awayScore.current}
                                                    date={new Date(game.startTimestamp * 1000).toISOString()}
                                                    status={game.status.type === 'inprogress' ? 'En Vivo' : game.status.type === 'finished' ? 'Finalizado' : 'Programado'}
                                                    league={displayName}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            ))}
        </div>
    );
}
