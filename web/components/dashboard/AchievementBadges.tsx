'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Zap, Target, TrendingUp, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: any;
    unlocked: boolean;
    progress?: number;
    requirement: number;
    color: string;
}

export default function AchievementBadges() {
    const { user, getHistory } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBadges();
    }, [user]);

    const loadBadges = async () => {
        if (!user) return;

        try {
            // Fetch history for Hot Picks calculation
            const history = await getHistory(50);

            // Real Stats from User Profile
            const total = user.totalPredictions || 0;
            const stats = user.stats || {
                totalWins: 0,
                totalLosses: 0,
                currentStreak: 0,
                bestStreak: 0,
                winRate: 0,
                vroi: 0
            };

            // Safe access for potentially missing properties in older profiles
            const safeStats = stats as any;
            const bestStreak = safeStats.bestStreak || safeStats.longestStreak || 0;
            const winRate = safeStats.winRate || 0;

            // Calculate metrics
            // Note: Hot Picks logic would ideally come from a specific counter in DB, 
            // but for now we can approximate or use history if needed. 
            // For efficiency we'll skip complex history filtering for this specific badge unless critical.
            // Let's rely on history for Hot Picks count if available, otherwise 0.
            const hotPicks = history.filter((p: any) => (p.probability || 0) >= 75).length;

            const allBadges: Badge[] = [
                {
                    id: 'first_prediction',
                    name: 'Primera Predicción',
                    description: 'Haz tu primera predicción',
                    icon: Star,
                    unlocked: total >= 1,
                    progress: Math.min(total, 1),
                    requirement: 1,
                    color: 'text-blue-400',
                },
                {
                    id: 'veteran',
                    name: 'Veterano',
                    description: 'Completa 10 predicciones',
                    icon: Trophy,
                    unlocked: total >= 10,
                    progress: Math.min(total, 10),
                    requirement: 10,
                    color: 'text-purple-400',
                },
                {
                    id: 'hot_pick_master',
                    name: 'Hot Pick Master',
                    description: 'Genera 5 Hot Picks (>75%)',
                    icon: Zap,
                    unlocked: hotPicks >= 5,
                    progress: Math.min(hotPicks, 5),
                    requirement: 5,
                    color: 'text-orange-400',
                },
                {
                    id: 'sharp_shooter',
                    name: 'Francotirador',
                    description: 'Win Rate > 55% (min 5)',
                    icon: Target,
                    unlocked: total >= 5 && winRate >= 55,
                    progress: Math.min(winRate, 55),
                    requirement: 55,
                    color: 'text-green-400',
                },
                {
                    id: 'streak_master',
                    name: 'En Racha',
                    description: 'Racha de 3 victorias',
                    icon: TrendingUp,
                    unlocked: bestStreak >= 3,
                    progress: Math.min(bestStreak, 3),
                    requirement: 3,
                    color: 'text-yellow-400',
                },
                {
                    id: 'legend',
                    name: 'Leyenda',
                    description: 'Completa 50 predicciones',
                    icon: Award,
                    unlocked: total >= 50,
                    progress: Math.min(total, 50),
                    requirement: 50,
                    color: 'text-pink-400',
                },
            ];

            setBadges(allBadges);
        } catch (error) {
            console.error('Error loading badges:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                        <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-white/5 rounded mb-2"></div>
                        <div className="h-3 bg-white/5 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-wider text-white">
                    Logros Desbloqueados
                </h3>
                <div className="text-sm font-bold text-gray-400">
                    {badges.filter(b => b.unlocked).length} / {badges.length}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge, i) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-card p-6 text-center relative overflow-hidden ${badge.unlocked ? 'border-white/20' : 'opacity-50'
                            }`}
                    >
                        {badge.unlocked && (
                            <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            </div>
                        )}

                        <div
                            className={`w-16 h-16 rounded-full ${badge.unlocked ? 'bg-white/10' : 'bg-white/5'
                                } flex items-center justify-center mx-auto mb-4`}
                        >
                            <badge.icon className={`w-8 h-8 ${badge.unlocked ? badge.color : 'text-gray-600'}`} />
                        </div>

                        <h4 className="text-sm font-black uppercase tracking-wider mb-1 text-white">
                            {badge.name}
                        </h4>
                        <p className="text-xs text-gray-400 mb-3">{badge.description}</p>

                        {!badge.unlocked && badge.progress !== undefined && (
                            <div className="space-y-1">
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full ${badge.color.replace('text', 'bg')} transition-all`}
                                        style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-gray-500 font-bold">
                                    {badge.progress} / {badge.requirement}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
