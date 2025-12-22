'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserReferralData, type Referral } from '@/lib/referrals';
import { Copy, Share2, Users, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralCard() {
    const { user } = useAuth();
    const [referralData, setReferralData] = useState<Referral | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReferralData();
    }, [user]);

    const loadReferralData = async () => {
        if (!user) return;

        try {
            const data = await getUserReferralData(user.uid);
            setReferralData(data);
        } catch (error) {
            console.error('Error loading referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (!referralData) return;
        navigator.clipboard.writeText(referralData.code);
        toast.success('¡Código copiado!', {
            description: 'Compártelo con tus amigos'
        });
    };

    const shareReferral = async () => {
        if (!referralData) return;

        const text = `¡Únete a PickGenius con mi código ${referralData.code} y obtén 15 días premium gratis! 🎯`;
        const url = `${window.location.origin}/auth/register?ref=${referralData.code}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'PickGenius', text, url });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(`${text}\n${url}`);
            toast.success('¡Enlace copiado!');
        }
    };

    if (loading) {
        return (
            <div className="glass-card p-8 animate-pulse">
                <div className="h-8 bg-white/5 rounded mb-4"></div>
                <div className="h-12 bg-white/5 rounded"></div>
            </div>
        );
    }

    if (!referralData) return null;

    return (
        <div className="glass-card p-8 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-wider text-white">
                            Invita Amigos
                        </h3>
                        <p className="text-sm text-gray-400">
                            Gana 3 días premium por cada referido
                        </p>
                    </div>
                </div>

                {/* Referral Code */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Tu Código de Referido
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 text-3xl font-black text-purple-400 tracking-wider">
                            {referralData.code}
                        </div>
                        <button
                            onClick={copyCode}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <Copy className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-black text-white mb-1">
                            {referralData.totalReferrals}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">
                            Referidos
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <Gift className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-black text-white mb-1">
                            {referralData.bonusDaysEarned}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">
                            Días Ganados
                        </div>
                    </div>
                </div>

                {/* Share Button */}
                <button
                    onClick={shareReferral}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 rounded-xl font-black uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2"
                >
                    <Share2 className="w-5 h-5" />
                    Compartir Código
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                    Tus amigos obtienen 15 días gratis, tú ganas 3 días por cada uno
                </p>
            </div>
        </div>
    );
}
