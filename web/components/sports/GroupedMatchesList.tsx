'use client';

import React from 'react';
import MatchCard from './MatchCard';
import { type SportsDataEvent } from '@/lib/services/sportsDataService';
import { useAuth } from '@/contexts/AuthContext';

interface GroupedMatchesListProps {
    games: SportsDataEvent[];
    sport: string;
}

export default function GroupedMatchesList({ games, sport }: GroupedMatchesListProps) {
    const { user, addFavorite, removeFavorite } = useAuth();
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

    const isTeamFavorite = (teamName: string) => {
        return user?.favoriteTeams?.includes(teamName) || false;
    };

    const handleToggleFavorite = async (teamName: string) => {
        if (!user) return;
        if (isTeamFavorite(teamName)) {
            await removeFavorite(teamName);
        } else {
            await addFavorite(teamName);
        }
    };

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

    // Priority Leagues Configuration
    const topLeagues = [
        'NBA', 'Euroleague', 'FIBA', 'LNB', 'Liga Nacional', 'Liga Argentina', 'ACB', // Basketball Priority
        'Champions League', 'Premier League', 'LaLiga', 'Serie A', 'Bundesliga', 'Ligue 1', // Football Priority
        'Copa Libertadores', 'Copa Sudamericana', 'Brasileirão', 'Liga Profesional', // South America Priority
        'NHL', 'MLB', 'NFL', 'ATP', 'WTA' // Other Sports
    ];

    // Status Separation
    const liveGames = games.filter(g => g.status.type === 'inprogress');
    const upcomingGames = games.filter(g => g.status.type === 'notstarted');
    const finishedGames = games.filter(g => g.status.type === 'finished');

    // Helper to render a list of games grouped by league
    const renderLeagueGroups = (gameList: SportsDataEvent[]) => {
        // Group by league
        const groupedByLeague = gameList.reduce((acc, game) => {
            const countryName = game.tournament.category?.name || 'Internacional';
            const countryId = game.tournament.category?.id;
            const leagueName = game.tournament.name;
            const key = `${countryName}|${leagueName}`;

            if (!acc[key]) acc[key] = {
                displayName: `${countryName}: ${leagueName}`,
                countryId: countryId,
                countryName: countryName,
                games: []
            };
            acc[key].games.push(game);
            return acc;
        }, {} as Record<string, { displayName: string; countryId?: number; countryName: string; games: SportsDataEvent[] }>);

        // Sort Leagues by Priority
        const sortedLeagues = Object.entries(groupedByLeague).sort(([keyA, dataA], [keyB, dataB]) => {
            const isTopA = topLeagues.some(top => dataA.displayName.includes(top));
            const isTopB = topLeagues.some(top => dataB.displayName.includes(top));

            if (isTopA && !isTopB) return -1;
            if (!isTopA && isTopB) return 1;

            return dataA.displayName.localeCompare(dataB.displayName);
        });

        return sortedLeagues.map(([leagueKey, { displayName, countryId, countryName, games: leagueGames }]) => {
            const isExpanded = expandedGroups.has(leagueKey) || leagueGames.some(g => g.status.type === 'inprogress');

            return (
                <div key={leagueKey} className="space-y-4 mb-4">
                    <button
                        onClick={() => toggleGroup(leagueKey)}
                        className={`w-full flex items-center justify-between gap-3 border-l-4 pl-4 py-3 rounded-r-xl transition-all hover:bg-white/10 active:bg-white/20 mobile-haptic group/header
                             ${leagueGames.some(g => g.status.type === 'inprogress') ? 'border-red-500 bg-red-500/5' : 'border-[var(--primary)] bg-white/5'}
                        `}
                    >
                        <div className="flex items-center gap-3">
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
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-none">
                                {displayName}
                            </h3>
                            <span className="text-xs font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
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
                                    statusDescription={game.status.description}
                                    league={displayName}
                                    leagueId={game.tournament.id}
                                    isFavorite={isTeamFavorite(game.homeTeam.name) || isTeamFavorite(game.awayTeam.name)}
                                    onFavoriteToggle={() => handleToggleFavorite(game.homeTeam.name)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        });
    };

    // Auto-expand all groups when data loads
    React.useEffect(() => {
        if (games.length > 0) {
            const allKeys = new Set<string>();
            const addKeys = (list: SportsDataEvent[]) => {
                list.forEach(game => {
                    const countryName = game.tournament.category?.name || 'Internacional';
                    const leagueName = game.tournament.name;
                    allKeys.add(`${countryName}|${leagueName}`);
                });
            };
            addKeys(games);
            setExpandedGroups(allKeys);
        }
    }, [games.length]);

    if (games.length === 0) return null;

    return (
        <div className="space-y-12">
            {liveGames.length > 0 && (
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                            EN VIVO <span className="text-red-500 text-sm align-top ml-1">({liveGames.length})</span>
                        </h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-red-900/50 to-transparent"></div>
                    </div>
                    {renderLeagueGroups(liveGames)}
                </div>
            )}

            {upcomingGames.length > 0 && (
                <div className="animate-in fade-in duration-700 delay-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-white/90">
                            PRÓXIMOS
                        </h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-blue-900/50 to-transparent"></div>
                    </div>
                    {renderLeagueGroups(upcomingGames)}
                </div>
            )}

            {finishedGames.length > 0 && (
                <div className="animate-in fade-in duration-1000 delay-200 opacity-80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-400">
                            RESULTADOS RECIENTES
                        </h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>
                    {renderLeagueGroups(finishedGames)}
                </div>
            )}
        </div>
    );
}
