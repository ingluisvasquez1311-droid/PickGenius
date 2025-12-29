import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBettingSlip } from '@/contexts/BettingSlipContext';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Star, ShieldCheck, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface MatchCardProps {
    homeTeam: { name: string; id: number; logo?: string };
    awayTeam: { name: string; id: number; logo?: string };
    date: string;
    league: string;
    leagueId?: number | string;
    homeScore?: number | null;
    awayScore?: number | null;
    status?: 'Programado' | 'En Vivo' | 'Finalizado';
    statusDescription?: string;
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
    isEnriched?: boolean;
}

export default function MatchCard({
    homeTeam,
    awayTeam,
    date,
    league,
    leagueId,
    homeScore,
    awayScore,
    status = 'Programado',
    statusDescription,
    prediction,
    eventId,
    sport,
    onFavoriteToggle,
    isFavorite,
    onPredict,
    isEnriched
}: MatchCardProps) {
    const router = useRouter();
    const { addToSlip } = useBettingSlip();
    const isLive = status === 'En Vivo';

    const handleCardClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;

        if (eventId) {
            const targetSport = sport || 'football';
            if (targetSport === 'football') {
                router.push(`/football-live/${eventId}`);
            } else if (targetSport === 'basketball' || targetSport === 'nba') {
                router.push(`/basketball-live/${eventId}`);
            } else {
                router.push(`/match/${targetSport}/${eventId}`);
            }
        }
    };

    const getLogoUrl = (teamId: number | string | undefined) => {
        if (!teamId || teamId === 'undefined') return '/img/placeholder-team.png';
        return `/api/proxy/team-logo/${teamId}`;
    };

    const getLeagueLogoUrl = (leagueId: number | string | undefined) => {
        if (!leagueId || leagueId === 'undefined') return null;
        return `/api/proxy/league-logo/${leagueId}`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleCardClick}
            className="group relative bg-[#0F1115]/80 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 rounded-xl p-3 md:p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/5 mb-3"
        >
            {/* Indicador Genius DB */}
            {isEnriched && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider hidden xs:inline">Genius DB</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Cabecera Móvil (Liga/Tiempo) */}
                <div className="flex md:hidden w-full justify-between items-center mb-1 px-1">
                    <div className="flex items-center gap-1.5">
                        {leagueId && (
                            <img
                                src={`/api/proxy/league-logo/${leagueId}`}
                                className="w-4 h-4 object-contain opacity-80"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        )}
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{league}</span>
                    </div>
                    {isLive && (
                        <span className="text-[9px] font-bold text-red-500 uppercase">{statusDescription || 'LIVE'}</span>
                    )}
                </div>

                <div className="flex items-center justify-between w-full md:w-auto flex-1 gap-2 md:gap-6">
                    {/* Equipo Local */}
                    <div className="flex-1 flex flex-col items-center text-center gap-2">
                        <div className="relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/5 rounded-full p-2">
                            <img
                                src={getLogoUrl(homeTeam?.id)}
                                alt={homeTeam?.name}
                                className="w-full h-full object-contain"
                                onError={(e) => (e.currentTarget.src = '/img/placeholder-team.png')}
                            />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-white/90 line-clamp-1">{homeTeam?.name}</span>
                    </div>

                    {/* Marcador */}
                    <div className="flex flex-col items-center justify-center min-w-[70px] md:min-w-[100px]">
                        <div className="flex items-center gap-2 md:gap-3">
                            <span className={`text-xl md:text-3xl font-black ${isLive ? 'text-blue-400' : 'text-white/20'}`}>
                                {homeScore ?? 0}
                            </span>
                            <span className="text-white/10 font-light text-xl">:</span>
                            <span className={`text-xl md:text-3xl font-black ${isLive ? 'text-blue-400' : 'text-white/20'}`}>
                                {awayScore ?? 0}
                            </span>
                        </div>
                        <div className="mt-1">
                            {isLive ? (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                                    <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-bold text-red-500 uppercase">{statusDescription || 'LIVE'}</span>
                                </div>
                            ) : (
                                <span className="text-[10px] md:text-xs font-medium text-white/30 uppercase">
                                    {format(new Date(date), 'HH:mm')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Equipo Visitante */}
                    <div className="flex-1 flex flex-col items-center text-center gap-2">
                        <div className="relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/5 rounded-full p-2">
                            <img
                                src={getLogoUrl(awayTeam?.id)}
                                alt={awayTeam?.name}
                                className="w-full h-full object-contain"
                                onError={(e) => (e.currentTarget.src = '/img/placeholder-team.png')}
                            />
                        </div>
                        <span className="text-xs md:text-sm font-bold text-white/90 line-clamp-1">{awayTeam?.name}</span>
                    </div>
                </div>

                {/* Columna de Acción (Móvil: abajo, MD: a la derecha) */}
                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
                    {prediction ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToSlip({
                                    matchId: String(eventId || date),
                                    selection: prediction.pick,
                                    odds: parseFloat(prediction.odds?.replace(/[^0-9.]/g, '') || '1.90'),
                                    matchLabel: `${homeTeam.name} vs ${awayTeam.name}`,
                                    market: 'Ganador'
                                });
                            }}
                            className="flex-1 md:w-32 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-2 rounded-xl transition-all"
                        >
                            <div className="text-[9px] font-bold text-emerald-400 uppercase">{prediction.pick}</div>
                            <div className="text-xs font-black text-white">{prediction.odds}</div>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCardClick(e); }}
                            className="flex-1 md:w-32 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase tracking-widest italic"
                        >
                            Ver Detalles
                        </button>
                    )}

                    {onFavoriteToggle && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}
                            className={`p-2 rounded-xl border border-white/5 transition-all ${isFavorite ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-white/20'}`}
                        >
                            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
