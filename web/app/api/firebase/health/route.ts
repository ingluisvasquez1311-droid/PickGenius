import { NextResponse } from 'next/server';
import { getFirebaseHealth } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const health = await getFirebaseHealth();

    if (!health.connected) {
        return NextResponse.json(
            { status: 'error', firebase: health },
            { status: 500 }
        );
    }

    return NextResponse.json({
        status: 'ok',
        firebase: health,
        serverTime: new Date().toISOString()
    });
}
