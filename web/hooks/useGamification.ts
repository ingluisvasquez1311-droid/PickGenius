"use client";

import { useState, useEffect, useMemo } from 'react';
import { useBankroll } from './useBankroll';
import { useUser } from '@/components/ClerkSafeProvider';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    color: string;
}

export const useGamification = () => {
    const { entries, totalProfit, winRate } = useBankroll();
    const { user } = useUser();
    const [points, setPoints] = useState(0);
    const [level, setLevel] = useState(1);

    const isGold = user?.publicMetadata?.isGold === true;

    const achievements: Achievement[] = useMemo(() => [
        {
            id: 'gold-member',
            title: 'Socio Gold',
            description: 'Desbloqueaste el estatus de élite.',
            icon: 'Crown',
            color: 'text-amber-400',
            unlocked: isGold
        },
        {
            id: 'first_bet',
            title: 'Bautismo',
            description: 'Tu primera apuesta en la terminal.',
            icon: 'Zap',
            color: 'text-primary',
            unlocked: entries.length >= 1
        },
        {
            id: 'profit_king',
            title: 'Inversor Pro',
            description: 'Profit positivo acumulado.',
            icon: 'TrendingUp',
            color: 'text-green-500',
            unlocked: totalProfit > 0
        },
        {
            id: 'high_roller',
            title: 'Estratega',
            description: 'Más de 10 picks analizados.',
            icon: 'Target',
            color: 'text-blue-500',
            unlocked: entries.length >= 10
        }
    ], [entries.length, totalProfit, isGold]);

    useEffect(() => {
        let calculatedPoints = 0;
        calculatedPoints += entries.length * 25;
        calculatedPoints += entries.filter(e => e.type === 'W').length * 100;
        if (isGold) calculatedPoints += 1000;

        achievements.forEach(a => {
            if (a.unlocked) calculatedPoints += 200;
        });

        setPoints(calculatedPoints);
        setLevel(Math.floor(calculatedPoints / 1000) + 1);
    }, [entries, achievements, isGold]);

    return {
        points,
        level,
        achievements,
        nextLevelThreshold: (level) * 1000,
        progress: (points % 1000) / 10 // Percentage for current level
    };
};
