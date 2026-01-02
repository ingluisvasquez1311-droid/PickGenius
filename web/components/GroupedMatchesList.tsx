"use client";

import React from 'react';
import { MatchCard } from './MatchCard';
import { Trophy, ChevronDown, Activity, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface TournamentGroup {
    id: string;
    name: string;
    matches: any[];
    accentColor?: string;
}

interface GroupedMatchesListProps {
    groups: TournamentGroup[];
    sport?: string;
    title?: string;
    icon?: any;
    priority?: boolean;
}

export const GroupedMatchesList: React.FC<GroupedMatchesListProps> = ({
    groups,
    sport = 'football',
    title = 'Partidos Destacados',
    icon: Icon = Trophy,
    priority = false
}) => {
    if (!groups || groups.length === 0) {
        return (
            <div className="p-20 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 border-dashed">
                <Icon className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No se encontraron eventos disponibles</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* List Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                        priority ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white"
                    )}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                {groups.reduce((acc, g) => acc + g.matches.length, 0)} EVENTOS ACTIVOS
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content per Tournament */}
            <div className="space-y-16">
                {groups.map((group) => (
                    <div key={group.id} className="space-y-6">
                        <div className="flex items-center gap-3 group/header cursor-pointer">
                            <div className={clsx(
                                "h-8 w-1 rounded-full bg-gradient-to-b",
                                group.accentColor === 'blue' ? 'from-blue-500 to-indigo-600' :
                                    group.accentColor === 'purple' ? 'from-purple-500 to-pink-600' :
                                        'from-primary to-orange-600'
                            )} />
                            <h3 className="text-sm font-black italic uppercase tracking-widest text-white/80 group-hover/header:text-white transition-colors">
                                {group.name}
                            </h3>
                            <div className="flex-1 h-[1px] bg-white/5 group-hover/header:bg-white/10 transition-colors" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {group.matches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    accentColor={group.accentColor || 'primary'}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
