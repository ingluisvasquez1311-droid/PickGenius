import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBettingSlip } from '@/contexts/BettingSlipContext';
import TeamLogo from '@/components/ui/TeamLogo';

interface MatchCardProps {
    homeTeam: { name: string; id: number };
    awayTeam: { name: string; id: number };
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
    eventId?: number;
    sport?: string;
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
    eventId,
    sport,
    onFavoriteToggle,
    isFavorite,
    onPredict
}: MatchCardProps) {
    const router = useRouter();
    const { addToSlip } = useBettingSlip();
    const isLive = status === 'En Vivo';
    const time = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleCardClick = () => {
        if (eventId && sport) {
            router.push(`/match/${sport}/${eventId}`);
        }
    };

    return (
        <div
            className="glass-card hover:bg-[rgba(255,255,255,0.08)] transition-colors duration-200 mb-2 fade-in cursor-pointer"
            onClick={handleCardClick}
        >
            {/* League Header */}
            <div className="px-3 py-1.5 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider truncate">
                    {league}
                </span>
                {sport && (
                    <span className="text-[9px] text-[var(--text-muted)] uppercase font-medium">
                        {sport}
                    </span>
                )}
            </div>
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
                            <TeamLogo teamId={homeTeam.id} teamName={homeTeam.name} size="sm" />
                            <span className={`font-medium ${homeScore && awayScore && homeScore > awayScore ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                                {homeTeam.name}
                            </span>
                        </div>
                        <span className="font-mono font-bold">{homeScore ?? '-'}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <TeamLogo teamId={awayTeam.id} teamName={awayTeam.name} size="sm" />
                            <span className={`font-medium ${homeScore && awayScore && awayScore > homeScore ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                                {awayTeam.name}
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToSlip({
                                    matchId: homeTeam.name + awayTeam.name + date, // Simple ID generation
                                    selection: prediction.pick,
                                    odds: parseFloat(prediction.odds?.replace(/[^0-9.]/g, '') || '1.90'), // Parse odds or default
                                    matchLabel: `${homeTeam.name} vs ${awayTeam.name}`,
                                    market: 'Match Winner'
                                });
                            }}
                            className="text-xs text-center hover:bg-[rgba(255,255,255,0.1)] p-1 rounded transition-colors w-full"
                            title="Agregar al ticket"
                        >
                            <div className="text-[var(--primary)] font-bold">{prediction.pick}</div>
                            <div className="text-[var(--text-muted)]">{prediction.odds}</div>
                            <div className="text-[10px] text-[var(--success)] opacity-0 hover:opacity-100 transition-opacity">+ Ticket</div>
                        </button>
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
