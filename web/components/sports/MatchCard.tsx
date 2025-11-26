import React from 'react';

interface MatchCardProps {
    homeTeam: string;
    awayTeam: string;
    date: string;
    league: string;
    homeScore?: number | null;
    awayScore?: number | null;
    status?: 'Programado' | 'En Vivo' | 'Finalizado';
    prediction?: {
        pick: string;
        odds?: string;
        confidence?: number;
    };
    onFavoriteToggle?: () => void;
    isFavorite?: boolean;
    onPredict?: (e: React.MouseEvent) => void;
}

export default function MatchCard({
    homeTeam,
    awayTeam,
    date,
    league,
    homeScore,
    awayScore,
    status = 'Programado',
    prediction,
    onFavoriteToggle,
    isFavorite,
    onPredict
}: MatchCardProps) {
    const isLive = status === 'En Vivo';
    const time = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="glass-card hover:bg-[rgba(255,255,255,0.08)] transition-colors duration-200 mb-2 fade-in">
            <div className="flex items-center p-3 gap-4">

                {/* Time / Status Column */}
                <div className="w-16 flex flex-col items-center justify-center border-r border-[rgba(255,255,255,0.1)] pr-4">
                    {isLive ? (
                        <>
                            <span className="text-[var(--danger)] font-bold text-xs animate-pulse">EN VIVO</span>
                            <span className="text-[var(--accent)] text-xs font-mono">Q4</span>
                        </>
                    ) : (
                        <span className="text-[var(--text-muted)] text-sm font-medium">{time}</span>
                    )}
                </div>

                {/* Teams Column */}
                <div className="flex-1 flex flex-col gap-2">
                    {/* Home Team */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[10px] font-bold">
                                {homeTeam.substring(0, 1)}
                            </div>
                            <span className={`font-medium ${homeScore && awayScore && homeScore > awayScore ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                                {homeTeam}
                            </span>
                        </div>
                        <span className="font-mono font-bold">{homeScore ?? '-'}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[10px] font-bold">
                                {awayTeam.substring(0, 1)}
                            </div>
                            <span className={`font-medium ${homeScore && awayScore && awayScore > homeScore ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                                {awayTeam}
                            </span>
                        </div>
                        <span className="font-mono font-bold">{awayScore ?? '-'}</span>
                    </div>
                </div>

                {/* Favorite Button */}
                {onFavoriteToggle && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFavoriteToggle();
                        }}
                        className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded transition-all duration-200 transform hover:scale-110"
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                        <span className={`text-xl transition-all ${isFavorite ? 'animate-pulse' : ''}`}>
                            {isFavorite ? '⭐' : '☆'}
                        </span>
                    </button>
                )}

                {/* Odds / Info Column (Hidden on small screens) */}
                <div className="hidden md:flex flex-col gap-1 w-24 border-l border-[rgba(255,255,255,0.1)] pl-4">
                    {prediction ? (
                        <div className="text-xs text-center">
                            <div className="text-[var(--primary)] font-bold">{prediction.pick}</div>
                            <div className="text-[var(--text-muted)]">{prediction.odds}</div>
                        </div>
                    ) : (
                        <button
                            onClick={onPredict}
                            className="text-xs bg-[rgba(255,255,255,0.1)] hover:bg-[var(--primary)] hover:text-black transition-colors px-2 py-1 rounded"
                        >
                            🤖 IA Pick
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
