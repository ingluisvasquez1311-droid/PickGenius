"use client";

import ReferralCard from '@/components/ReferralCard';
import { Users, Gift, Zap, TrendingUp } from 'lucide-react';

export default function ReferralsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/10 blur-[180px] rounded-full opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[70%] bg-purple-600/10 blur-[200px] rounded-full opacity-30"></div>
            </div>

            <div className="relative z-10 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 w-fit">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">PROGRAMA DE REFERIDOS</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
                            COMPARTE <span className="text-primary">GANA</span>
                        </h1>
                        <p className="text-gray-500 font-black uppercase tracking-widest text-sm">
                            Invita amigos y desbloquea recompensas exclusivas
                        </p>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Gift,
                            title: '500 PGc por Amigo',
                            description: 'Créditos instantáneos cada vez que alguien usa tu código',
                            color: 'text-green-500',
                            bgColor: 'bg-green-500/10',
                            borderColor: 'border-green-500/20'
                        },
                        {
                            icon: Zap,
                            title: 'VIP 30 Días (5 Refs)',
                            description: 'Acceso premium completo al alcanzar 5 invitaciones',
                            color: 'text-primary',
                            bgColor: 'bg-primary/10',
                            borderColor: 'border-primary/20'
                        },
                        {
                            icon: TrendingUp,
                            title: 'VIP Permanente (10 Refs)',
                            description: 'Acceso ilimitado de por vida con solo 10 amigos',
                            color: 'text-amber-500',
                            bgColor: 'bg-amber-500/10',
                            borderColor: 'border-amber-500/20'
                        }
                    ].map((benefit, i) => (
                        <div key={i} className={`p-8 ${benefit.bgColor} border ${benefit.borderColor} rounded-[2.5rem] space-y-4 hover:scale-[1.02] transition-all`}>
                            <div className={`w-12 h-12 rounded-2xl ${benefit.bgColor} border ${benefit.borderColor} flex items-center justify-center`}>
                                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                            </div>
                            <h3 className={`text-xl font-black italic uppercase tracking-tight ${benefit.color}`}>
                                {benefit.title}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Referral Card */}
                <ReferralCard />
            </div>
        </div>
    );
}
