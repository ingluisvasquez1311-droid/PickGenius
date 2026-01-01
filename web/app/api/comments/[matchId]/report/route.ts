import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(
    req: NextRequest,
    { params }: { params: { matchId: string } }
) {
    try {
        const { matchId } = params;
        const user = await currentUser();
        const { commentId, reason } = await req.json();

        if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

        const { db } = await import('@/lib/firebase-admin');
        if (db) {
            await db.collection('comment_reports').add({
                matchId,
                commentId,
                reporterId: user.id,
                reporterName: user.firstName || user.username,
                reason: reason || 'Inapropiado',
                timestamp: new Date(),
                status: 'pending'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
