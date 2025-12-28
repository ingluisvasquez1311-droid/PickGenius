import { NextResponse } from 'next/server';
import { firebaseReadService } from '@/lib/FirebaseReadService';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

try {
    initializeFirebaseAdmin();
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;

    try {
        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        // 1. Intentar obtener de Firebase (Instantáneo)
        const event = await firebaseReadService.getEventById(eventId);

        if (event) {
            return NextResponse.json({ event }, {
                headers: { 'X-Data-Source': 'firebase' }
            });
        }

        // 2. Si no está en Firebase, devolver 404 para que el frontend use el Bridge como fallback
        return NextResponse.json({ error: 'Event not found in Firebase' }, { status: 404 });

    } catch (error) {
        console.error(`❌ Error fetching event ${eventId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
