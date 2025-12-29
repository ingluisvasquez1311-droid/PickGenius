import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebaseAdmin';
import { archivePredictionOnServer } from '@/lib/services/predictionArchiveService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, prediction, gameId } = body;

        if (!userId || !prediction || !gameId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        await archivePredictionOnServer(userId, {
            gameId,
            sport: prediction.sport || 'football',
            winner: prediction.winner,
            bettingTip: prediction.bettingTip || prediction.pick,
            confidence: prediction.confidence,
            reasoning: prediction.reasoning || ''
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving prediction history via API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }

        const db = getFirestore();

        // Fetch user's history
        const userHistoryRef = db.collection('users').doc(userId).collection('predictions');
        const snapshot = await userHistoryRef.orderBy('timestamp', 'desc').limit(50).get();

        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, history });

    } catch (error: any) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}