export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlocked: boolean;
    progress?: number;
    goal?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'gold-member',
        title: 'Socio Gold',
        description: 'Desbloqueaste el estatus de élite.',
        icon: 'Crown',
        color: 'text-amber-400',
        unlocked: false
    },
    {
        id: 'streak-5',
        title: 'Racha de Fuego',
        description: 'Lograste 5 victorias consecutivas.',
        icon: 'Flame',
        color: 'text-orange-500',
        unlocked: true,
        progress: 5,
        goal: 5
    },
    {
        id: 'picks-100',
        title: 'Analista Pro',
        description: 'Has analizado más de 100 picks.',
        icon: 'Target',
        color: 'text-blue-500',
        unlocked: true,
        progress: 148,
        goal: 100
    },
    {
        id: 'referral-1',
        title: 'Embajador',
        description: 'Invitaste a tu primer amigo.',
        icon: 'Users',
        color: 'text-purple-500',
        unlocked: false,
        progress: 0,
        goal: 1
    }
];
