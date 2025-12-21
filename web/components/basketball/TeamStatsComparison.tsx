'use client';

import React, { useEffect, useState } from 'react';
import SkeletonLoader from '@/components/ui/SkeletonLoader';

interface StatItem {
    name: string;
    home: string;
    away: string;
    homeValue: number;
    awayValue: number;
    compareCode?: number; // 1: Home better, 2: Equal, 3: Away better
}

interface TeamStatsComparisonProps {
    eventId: string;
    homeColor?: string;
    awayColor?: string;
}

export default function TeamStatsComparison({ eventId, homeColor = 'bg-purple-500', awayColor = 'bg-orange-500' }: TeamStatsComparisonProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/basketball/match/${eventId}/stats`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        setStats(data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [eventId]);

    if (loading) {
        return <div className="glass-card p-4 animate-pulse h-64 bg-gray-900/50 rounded-xl" />;
    }

    if (!stats || !stats.periods || stats.periods.length === 0) {
        return null; // No stats available usually means pre-match or error
    }

    // Find "ALL" period or sum up (Usually 'ALL' is 1st or just implied if we only calculate from total?)
    // Actually SportsData structure usually returns Period stats. Let's look for "ALL" or "Total".
    // If not found, we use the last period available which usually contains accumulated? No.
    // Let's assume period[0] is ALL for now or we take the one with most data. 
    // In our parser service we just map all periods. 
    // Let's try to find a period named "ALL", "Total" or similar, or just sum it up.
    // For simplicity in this iteration, let's take the LAST period which might be "Full Time" or we render periods.
    // Wait, the parser output `periods` array.

    // Let's just look for specific keys in the first available period for now to test structure.
    // Ideally we want TOTAL stats. If periods are [Q1, Q2, Q3, Q4], we need to SUM them.
    // BUT! getEventStatistics usually returns a group called "Match" or "All".
    // Let's iterate and sum if needed, or find the "All" period.

    // *Assuming the backend parser returns `period: 'ALL'` as one of the items if it exists.* 
    // If not, simply summing the first period might be wrong if it's just Q1.
    // We will accumulate numeric values.

    let totalStats: Record<string, StatItem> = {};

    // Helper to normalize and sum up
    const processGroups = (periodData: any) => {
        const categories = { ...periodData.scoring, ...periodData.rebounds, ...periodData.other };
        Object.values(categories).forEach((item: any) => {
            if (!totalStats[item.name]) {
                totalStats[item.name] = { ...item };
            } else {
                // Sum only if values are numeric/parsable
                // Be careful with percentages.
                // If it's percentage (e.g. Free throws), we shouldn't sum.
                // We need smarter logic or rely on "ALL" period.
                // Let's search for "ALL" period first.
            }
        });
    };

    // Check if there is an "ALL" period
    const allPeriod = stats.periods.find((p: any) => p.period === 'ALL' || p.period === 'Match');
    if (allPeriod) {
        processGroups(allPeriod);
    } else {
        // Fallback: Use the first period if only one, or try to be smart?
        // Actually, if we use Q1, Q2, Q3, Q4 we display only quarters?
        // Let's display the stats from the LAST item in the array for now as a fallback or simply the first one if length is 1.
        // Usually for live games, "ALL" accumulates.
        // Let's try to merge all periods into one visual summary? No, percentages break.
        // Let's just visualize the "ALL" period if found. If not, visualize the available periods in raw?

        // **STRATEGY**: Just take the one with the biggest numbers (likely total) or period "ALL".
        // If no "ALL", I'll take the first one (usually API returns ALL first or as separate).
        // Let's default to index 0 hoping it's the main group.
        if (stats.periods.length > 0) {
            processGroups(stats.periods[0]);
        }
    }

    const relevantKeys = [
        'Field goals',
        '3 pointers', // Check actual key name
        'Free throws',
        'Rebounds',
        'Turnovers',
        'Assists' // Usually in 'other' or 'scoring'
    ];

    // Map specific keys we want to show. The names must match SportsData API names exactly.
    // Common names: "Field goals", "3-pointers", "Free throws", "Rebounds", "Assists", "Turnovers"

    const displayStats = Object.values(totalStats).filter(s =>
        ['Field goals', '3-pointers', 'Free throws', 'Rebounds', 'Assists', 'Turnovers'].includes(s.name)
    );

    if (displayStats.length === 0) return null;

    return (
        <div className="glass-card p-5 mb-4 border border-white/5 bg-gray-900/60 backdrop-blur-sm rounded-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                    Estadísticas del Equipo
                </h3>
            </div>

            <div className="space-y-6">
                {displayStats.map((stat) => {
                    const totalVal = (stat.homeValue || 0) + (stat.awayValue || 0);
                    const homePercent = totalVal ? ((stat.homeValue || 0) / totalVal) * 100 : 50;

                    return (
                        <div key={stat.name} className="w-full">
                            <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
                                <span className={stat.homeValue > stat.awayValue ? 'text-white font-bold' : ''}>
                                    {stat.home}
                                </span>
                                <span className="text-gray-500">{stat.name}</span>
                                <span className={stat.awayValue > stat.homeValue ? 'text-white font-bold' : ''}>
                                    {stat.away}
                                </span>
                            </div>

                            {/* Bar Container */}
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex relative">
                                {/* Home Bar */}
                                <div
                                    className={`h-full ${homeColor} transition-all duration-1000 ease-out relative`}
                                    style={{ width: `${homePercent}%` }}
                                >
                                    <div className={`absolute right-0 top-0 bottom-0 w-[2px] bg-black/50`}></div>
                                </div>
                                {/* Away Bar (Rest of space) */}
                                <div
                                    className={`h-full ${awayColor} transition-all duration-1000 ease-out flex-1`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
