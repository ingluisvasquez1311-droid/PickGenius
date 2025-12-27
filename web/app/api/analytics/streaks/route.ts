import { NextRequest, NextResponse } from 'next/server';
import { streakService } from '@/lib/services/streakService';
import { getUserProfile } from '@/lib/userService';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 1 minute at edge

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        // Check premium status
        let isPremium = false;
        if (uid) {
            const profile = await getUserProfile(uid);
            const isOwner = profile?.email && (
                profile.email.toLowerCase() === 'pickgenius@gmail.com' ||
                profile.email.toLowerCase() === 'ingluisvasquez1311@gmail.com' ||
                profile.email.toLowerCase() === 'luisvasquez1311@gmail.com'
            );
            isPremium = profile?.isPremium || profile?.role === 'admin' || isOwner || false;
        }

        const [streaks, playerStreaks] = await Promise.all([
            streakService.getStreaks(),
            streakService.getPlayerStreaks()
        ]);

        // Mask player streaks for free users
        const finalPlayerStreaks = isPremium ? playerStreaks : playerStreaks.map(p => ({
            ...p,
            playerName: '🔒 Jugador VIP',
            description: 'Suscríbete a Pro para desbloquear tendencias de jugadores.',
            value: 0,
            last5Values: [0, 0, 0, 0, 0],
            isLocked: true
        }));

        return NextResponse.json({
            success: true,
            data: streaks,
            players: finalPlayerStreaks,
            isPremium,
            count: streaks.length,
            source: 'analytics_engine'
        });
    } catch (error: unknown) {
        console.error('❌ Streak Analytics Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}