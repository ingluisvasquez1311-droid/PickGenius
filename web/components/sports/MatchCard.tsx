import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBettingSlip } from '@/contexts/BettingSlipContext';
import TeamLogo from '@/components/ui/TeamLogo';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Star } from 'lucide-react';

interface MatchCardProps {
    homeTeam: { name: string; id: number };
    awayTeam: { name: string; id: number };
    date: string;
    league: string;
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
}

export default function MatchCard({
    homeTeam,
    awayTeam,
    date,
    league,
    homeScore,
    awayScore,
    status = 'Programado',
    statusDescription,
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

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on interactive elements (buttons usually stop propagation, but just in case)
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }

        if (eventId) {
            const targetSport = sport || 'football'; // Default fallback

            // Redirect to specialized pages for core sports
            if (targetSport === 'football') {
                router.push(`/football-live/${eventId}`);
            } else if (targetSport === 'basketball' || targetSport === 'nba') {
                router.push(`/basketball-live/${eventId}`);
            } else {
                // Universal fallback for others (Tennis, Baseball, etc.)
                router.push(`/match/${targetSport}/${eventId}`);
            }
        } else {
            console.warn('MatchCard: Missing eventId, cannot navigate');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.05)' }}
            className="group glass-card border border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden transition-all duration-300 mb-3 cursor-pointer relative mobile-haptic"
            onClick={handleCardClick}
        >
            {/* Elite Momentum Overlay (Live Only) */}
            {isLive && (
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <motion.div
                        initial={{ width: "50%" }}
                        animate={{ width: ["40%", "60%", "45%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                    />
                </div>
            )}

            {/* League Header */}
            <div className="px-5 py-2 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                        {league}
                    </span>
                    {isLive && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                            <span className="w-1 h-1 rounded-full bg-red-500 animate-ping"></span>
                            <span className="text-[8px] font-black text-red-500 uppercase">
                                {statusDescription || 'Live'}
                            </span>
                        </span>
                    )}
                </div>
                {sport && (
                    <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">
                        {sport}
                    </span>
                )}
            </div>

            <div className="flex items-center p-5 gap-6">
                {/* Time / Score Status Column */}
                <div className="w-20 col-span-1 flex flex-col items-center justify-center border-r border-white/5 pr-6">
                    {isLive ? (
                        <div className="text-center">
                            <div className="text-xl font-black italic text-emerald-400 tabular-nums">
                                {homeScore ?? 0} - {awayScore ?? 0}
                            </div>
                            <div className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mt-1">
                                {statusDescription || 'En Juego'}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-sm font-black text-white/80">{time}</div>
                            <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Hoy</div>
                        </div>
                    )}
                </div>

                {/* Teams Column */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Home Team */}
                    <div className="flex justify-between items-center group/team">
                        <div className="flex items-center gap-4">
                            <div className="p-1.5 bg-white/5 rounded-xl border border-white/5 group-hover/team:bg-white/10 transition-colors">
                                <TeamLogo teamId={homeTeam.id} teamName={homeTeam.name} size="sm" />
                            </div>
                            <span className={`text-sm font-black tracking-tight uppercase italic transition-colors ${homeScore && awayScore && homeScore > awayScore ? 'text-white' : 'text-gray-400 group-hover/team:text-white'}`}>
                                {homeTeam.name}
                            </span>
                        </div>
                        {isLive && (eventId ? eventId % 2 !== 0 : false) && <TrendingUp className="w-3 h-3 text-emerald-500 animate-pulse" />}
                    </div>

                    {/* Away Team */}
                    <div className="flex justify-between items-center group/team">
                        <div className="flex items-center gap-4">
                            <div className="p-1.5 bg-white/5 rounded-xl border border-white/5 group-hover/team:bg-white/10 transition-colors">
                                <TeamLogo teamId={awayTeam.id} teamName={awayTeam.name} size="sm" />
                            </div>
                            <span className={`text-sm font-black tracking-tight uppercase italic transition-colors ${homeScore && awayScore && awayScore > homeScore ? 'text-white' : 'text-gray-400 group-hover/team:text-white'}`}>
                                {awayTeam.name}
                            </span>
                        </div>
                        {isLive && (eventId ? eventId % 2 === 0 : false) && <Activity className="w-3 h-3 text-blue-500 animate-pulse" />}
                    </div>
                </div>

                {/* AI / Odds Column */}
                <div className="flex flex-col gap-2 w-32 border-l border-white/5 pl-6 items-center">
                    {prediction ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToSlip({
                                    matchId: homeTeam.name + awayTeam.name + date,
                                    selection: prediction.pick,
                                    odds: parseFloat(prediction.odds?.replace(/[^0-9.]/g, '') || '1.90'),
                                    matchLabel: `${homeTeam.name} vs ${awayTeam.name}`,
                                    market: 'Ganador'
                                });
                            }}
                            className="w-full relative group/btn"
                        >
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl text-center group-hover/btn:bg-emerald-500/20 transition-all">
                                <div className="text-[10px] font-black text-emerald-400 uppercase mb-0.5">{prediction.pick}</div>
                                <div className="text-xs font-black text-white">{prediction.odds}</div>
                                <div className="absolute -bottom-2 -right-2 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                    <Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                                </div>
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={onPredict}
                            className="group/ia w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all duration-500"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                <Activity className="w-3 h-3 group-hover/ia:animate-spin" /> Análisis IA
                            </span>
                        </button>
                    )}
                </div>

                {/* Favorite Icon */}
                {onFavoriteToggle && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFavoriteToggle();
                        }}
                        className={`transition-all duration-300 transform hover:scale-125 ${isFavorite ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-white/10 hover:text-white/40'}`}
                    >
                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

import { Zap } from 'lucide-react';
