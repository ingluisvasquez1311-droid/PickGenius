'use client';

import React from 'react';
import Link from 'next/link';
import TeamLogo from './ui/TeamLogo';

interface LiveEvent {
    id: string;
    homeTeam: {
        name: string;
        id: number;
        logo?: string;
    };
    awayTeam: {
        name: string;
        id: number;
        logo?: string;
    };
    homeScore?: {
        current: number;
        redCards?: number;
    };
    awayScore?: {
        current: number;
        redCards?: number;
    };
    status: {
        description: string;
        type: string;
    };
    tournament: {
        name: string;
        category?: {
            id: number;
            name: string;
        };
    };
    roundInfo?: {
        round?: number;
        name?: string;
    };
    time?: {
        currentPeriodStartTimestamp?: number;
        initial?: number;
        max?: number;
        played?: number;
    };
    startTimestamp?: number;
}

interface EventCardProps {
    event: LiveEvent;
    sport: 'basketball' | 'football';
}

const EventCard: React.FC<EventCardProps> = ({ event, sport }) => {
    const isLive = event.status.type === 'inprogress';
    const isFinished = event.status.type === 'finished';
    const isScheduled = event.status.type === 'scheduled' || event.status.type === 'notstarted';

    // Helper to get formatted elapsed time
    const getElapsedTime = () => {
        if (!isLive) return null;

        // If description already has time (e.g. 45', 90+2, Q1, HT)
        if (event.status.description?.includes("'") ||
            event.status.description?.includes(":") ||
            event.status.description === 'HT') {
            return event.status.description;
        }

        // Calculation fallback for football
        if (sport === 'football' && event.time?.currentPeriodStartTimestamp) {
            const now = Math.floor(Date.now() / 1000);
            const elapsedSeconds = now - event.time.currentPeriodStartTimestamp;
            let minutes = Math.floor(elapsedSeconds / 60);

            // Basic logic for halves
            if (event.status.description?.toLowerCase().includes('2nd') ||
                event.status.description?.toLowerCase().includes('2a')) {
                minutes += 45;
            }

            return `${minutes}'`;
        }

        // Fallback for basketball (usually in description, but if not)
        if (sport === 'basketball' && event.status.description) {
            return event.status.description;
        }

        return 'LIVE';
    };

    // Format Match Start Time
    const matchTime = event.startTimestamp
        ? new Date(event.startTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    // Status Display
    let statusContent;
    let statusClass = "text-gray-400 font-mono";

    if (isLive) {
        const timeText = getElapsedTime();
        statusContent = (
            <div className="flex flex-col items-center">
                <span className="text-red-500 font-black animate-pulse text-[10px] tracking-tighter">
                    {timeText}
                </span>
                <span className="text-[7px] text-red-500/60 font-black uppercase tracking-widest leading-none mt-0.5">
                    LIVE
                </span>
            </div>
        );
    } else if (isFinished) {
        statusContent = "Finalizado";
        statusClass = "text-gray-500 font-bold text-[10px] uppercase";
    } else {
        const matchDate = new Date(event.startTimestamp! * 1000);
        const today = new Date();
        const isToday = matchDate.toDateString() === today.toDateString();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

        const dayPrefix = isToday ? 'HOY' : isTomorrow ? 'MAÑ' : `${matchDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase()}`;
        statusContent = (
            <div className="flex flex-col items-center">
                <span className="text-[7px] text-gray-500 font-black mb-0.5 tracking-widest">{dayPrefix}</span>
                <span className="font-bold text-white/70">{matchTime}</span>
            </div>
        );
    }

    return (
        <Link
            href={`/${sport}-live/${event.id}`}
            className="group flex items-center gap-2 sm:gap-4 p-3 bg-[#111] border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
        >
            {/* Time / Status Column */}
            <div className="w-14 items-center justify-center flex flex-col border-r border-white/5 pr-2 sm:pr-4">
                <span className={`text-xs text-center ${statusClass}`}>
                    {statusContent}
                </span>
                {event.roundInfo?.round && (
                    <span className="text-[9px] text-gray-600 mt-0.5">R{event.roundInfo.round}</span>
                )}
            </div>

            {/* Teams & Scores Grid */}
            <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                {/* Home Team */}
                <div className="flex items-center justify-end gap-2 sm:gap-3 text-right overflow-hidden">
                    <div className="flex flex-col items-end min-w-0">
                        <span className={`text-sm font-bold truncate ${isLive || isFinished ? 'text-white' : 'text-gray-300'} group-hover:text-white transition-colors`}>
                            {event.homeTeam.name}
                        </span>
                    </div>
                    {event.homeScore?.redCards && event.homeScore.redCards > 0 && (
                        <div className="w-2 h-3 bg-red-600 rounded-[1px] shadow-sm flex-shrink-0" title="Red Card" />
                    )}
                    <TeamLogo teamId={event.homeTeam.id} teamName={event.homeTeam.name} size="sm" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                </div>

                {/* Score Center */}
                <div className="flex items-center justify-center min-w-[50px] sm:min-w-[60px] font-mono font-black text-lg bg-black/20 rounded px-2 py-1">
                    {isScheduled ? (
                        <span className="text-gray-600 text-sm">VS</span>
                    ) : (
                        <div className="flex gap-1 text-white">
                            <span>{event.homeScore?.current ?? 0}</span>
                            <span className="text-gray-500">-</span>
                            <span>{event.awayScore?.current ?? 0}</span>
                        </div>
                    )}
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-start gap-2 sm:gap-3 text-left overflow-hidden">
                    <TeamLogo teamId={event.awayTeam.id} teamName={event.awayTeam.name} size="sm" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    {event.awayScore?.redCards && event.awayScore.redCards > 0 && (
                        <div className="w-2 h-3 bg-red-600 rounded-[1px] shadow-sm flex-shrink-0" title="Red Card" />
                    )}
                    <span className={`text-sm font-bold truncate ${isLive || isFinished ? 'text-white' : 'text-gray-300'} group-hover:text-white transition-colors`}>
                        {event.awayTeam.name}
                    </span>
                </div>
            </div>

            {/* Odds / Action (Hidden on very small screens) */}
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/5">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-500 uppercase font-black">Prob. IA</span>
                    <span className="text-xs text-green-400 font-bold">76%</span>
                </div>
                <div className="text-gray-500 group-hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
};

import SkeletonLoader from './ui/SkeletonLoader';

// ... (existing interfaces)

interface LiveEventsListProps {
    events: LiveEvent[];
    sport: 'basketball' | 'football';
    title: string;
    loading?: boolean;
}

export default function LiveEventsList({ events, sport, title, loading }: LiveEventsListProps) {
    // Priority Leagues Configuration
    // Priority Leagues Configuration
    const getPriorityLeagues = (sportParam: 'basketball' | 'football') => {
        if (sportParam === 'basketball') {
            return [
                'NBA',
                'Euroleague',
                'FIBA',
                'World Cup',
                'Liga Nacional', // Argentina
                'LNB', // Argentina alt
                'ACB', // Spain
                'Basket League', // Greece
                'Lega A' // Italy
            ];
        }
        return [
            // Tier 1: Top European Leagues
            'UEFA Champions League',
            'UEFA Europa League',
            'Premier League',
            'LaLiga',
            'Serie A',
            'Bundesliga',
            'Ligue 1',

            // Tier 2: Strong European Secondary Leagues
            'Championship', // England 2nd tier
            'Eredivisie', // Netherlands
            'Primeira Liga', // Portugal
            'Belgian Pro League',
            'Scottish Premiership',
            'Turkish Super Lig',
            'Russian Premier League',

            // Tier 3: South American Leagues (High betting volume)
            'Primera Division', // Argentina
            'Liga Profesional de Fútbol', // Argentina formal
            'Copa de la Liga Profesional', // Argentina
            'Brasileirão Série A',
            'Brasileirão Série B', // Brazil 2nd tier (good markets)
            'Copa Libertadores',
            'Copa Sudamericana',
            'Chilean Primera División',
            'Colombian Primera A',
            'Ecuadorian Serie A',

            // Tier 4: North/Central America
            'Major League Soccer',
            'Liga MX',
            'Liga MX Apertura',
            'Liga MX Clausura',

            // Tier 5: Asian Leagues (Growing markets)
            'J1 League', // Japan
            'K League 1', // South Korea
            'Chinese Super League',

            // Tier 6: Other European Competitions
            'UEFA Conference League',
            'La Liga 2', // Spain 2nd tier
            'Serie B', // Italy 2nd tier
            '2. Bundesliga', // Germany 2nd tier
            'Ligue 2' // France 2nd tier
        ];
    };

    const PRIORITY_LEAGUES = getPriorityLeagues(sport);

    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

    // Effect to auto-expand priority leagues on load
    React.useEffect(() => {
        if (loading || events.length === 0) return;

        const initialExpanded = new Set<string>();

        events.forEach(event => {
            const countryName = event.tournament.category?.name || 'Internacional';
            const leagueName = event.tournament.name;
            const key = `${countryName}|${leagueName}`;

            const isPriority = PRIORITY_LEAGUES.some(pl => leagueName.includes(pl)) ||
                PRIORITY_LEAGUES.some(pl => countryName.includes(pl));

            if (isPriority) {
                initialExpanded.add(key);
            }
        });

        // Expand at least the first group if nothing is priority
        if (initialExpanded.size === 0 && events.length > 0) {
            const countryName = events[0].tournament.category?.name || 'Internacional';
            const leagueName = events[0].tournament.name;
            initialExpanded.add(`${countryName}|${leagueName}`);
        }

        setExpandedGroups(initialExpanded);
    }, [loading, events.length]);


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

    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonLoader key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No hay eventos en este momento</p>
            </div>
        );
    }

    const groupedEvents = events.reduce((acc, event) => {
        const countryName = event.tournament.category?.name || 'Internacional';
        const countryId = event.tournament.category?.id;
        const leagueName = event.tournament.name;
        // Unique Key for the League
        const key = `${countryName}|${leagueName}`;

        if (!acc[key]) {
            acc[key] = {
                country: countryName,
                countryId: countryId,
                league: leagueName,
                events: [],
                isPriority: PRIORITY_LEAGUES.some(pl => leagueName.includes(pl)) || PRIORITY_LEAGUES.some(pl => countryName.includes(pl))
            };
        }
        acc[key].events.push(event);
        return acc;
    }, {} as Record<string, { country: string; countryId?: number; league: string; events: LiveEvent[]; isPriority: boolean }>);

    // Sort Groups: Priority First, then Alphabetical
    const sortedGroups = Object.entries(groupedEvents).sort(([, a], [, b]) => {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        return a.country.localeCompare(b.country) || a.league.localeCompare(b.league);
    });

    return (
        <div className="space-y-4">
            {title && <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>}

            {sortedGroups.map(([key, group], index) => {
                // Generate a unique ID for expansion state if key isn't enough
                const isExpanded = expandedGroups.has(key);
                // Also default expand the first few priority groups if user hasn't interacted? 
                // We'll rely on state. To auto-expand, we can use a mount effect, but simple is better.

                const hasLiveGames = group.events.some(e => e.status.type === 'inprogress');
                const liveCount = group.events.filter(e => e.status.type === 'inprogress').length;

                // Sort events inside the group: Live first, then by date
                const sortedEvents = [...group.events].sort((a, b) => {
                    const aLive = a.status.type === 'inprogress';
                    const bLive = b.status.type === 'inprogress';
                    if (aLive && !bLive) return -1;
                    if (!aLive && bLive) return 1;
                    return (a.startTimestamp || 0) - (b.startTimestamp || 0);
                });

                return (
                    <div key={key} className="rounded-xl overflow-hidden bg-[#080808] border border-white/5">
                        <button
                            onClick={() => toggleGroup(key)}
                            className={`w-full flex items-center justify-between px-4 py-4 transition-all hover:bg-white/5 
                                ${isExpanded ? 'bg-white/5 border-b border-white/5' : ''}
                                ${group.isPriority ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-transparent'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                {/* Country Flag Placeholder or Icon */}
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg overflow-hidden border border-white/5">
                                    {group.countryId ? (
                                        <img
                                            src={`/api/proxy/category-image/${group.countryId}`}
                                            className="w-full h-full object-cover"
                                            alt={group.country}
                                            onError={(e) => {
                                                // Fallback to emoji if image fails
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerText = getCountryFlag(group.country) || (sport === 'football' ? '⚽' : '🏀');
                                                }
                                            }}
                                        />
                                    ) : (
                                        getCountryFlag(group.country) || (sport === 'football' ? '⚽' : '🏀')
                                    )}
                                </div>

                                <div className="text-left">
                                    <div className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-0.5">
                                        {group.country}
                                    </div>
                                    <div className="text-sm font-bold text-white leading-none">
                                        {group.league}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {liveCount > 0 && (
                                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-500 text-[10px] font-black uppercase animate-pulse">
                                        {liveCount} EN VIVO
                                    </span>
                                )}
                                <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                                    {group.events.length}
                                </span>
                                <div className={`transition-transform duration-300 transform ${isExpanded ? 'rotate-180' : ''}`}>
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
                                {sortedEvents.map((event) => (
                                    <EventCard key={event.id} event={event} sport={sport} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Simple helper for flags (can be expanded)
function getCountryFlag(country: string): string {
    const map: Record<string, string> = {
        'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'Spain': '🇪🇸',
        'Italy': '🇮🇹',
        'Germany': '🇩🇪',
        'France': '🇫🇷',
        'Portugal': '🇵🇹',
        'Netherlands': '🇳🇱',
        'Brazil': '🇧🇷',
        'Argentina': '🇦🇷',
        'USA': '🇺🇸',
        'Europe': '🇪🇺',
        'World': '🌍',
        'International': '🌍',
        'Africa': '🌍',
        'Colombia': '🇨🇴',
        'Mexico': '🇲🇽',
        'DR Congo': '🇨🇩',
        'Congo DR': '🇨🇩',
        'Ethiopia': '🇪🇹',
        'Libya': '🇱🇾',
        'Tanzania': '🇹🇿',
        'Egypt': '🇪🇬',
        'Nigeria': '🇳🇬',
        'Morocco': '🇲🇦',
        'Algeria': '🇩🇿',
        'Tunisia': '🇹🇳',
        'Uruguay': '🇺🇾',
        'Chile': '🇨🇱',
        'Ecuador': '🇪🇨',
        'Peru': '🇵🇪',
        'Paraguay': '🇵🇾',
        'Venezuela': '🇻🇪'
    };
    // Fuzzy match or direct
    return map[country] || map[Object.keys(map).find(k => country.toLowerCase().includes(k.toLowerCase())) || ''] || '';
}
