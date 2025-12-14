import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, prediction, gameId } = body;

        if (!userId || !prediction || !gameId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
        }

        // Save to specific user's history
        const userHistoryRef = collection(db, 'users', userId, 'predictions');
        await addDoc(userHistoryRef, {
            gameId,
            prediction,
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString()
        });

        // Optionally save to global history statistics
        const globalRef = collection(db, 'stats_predictions');
        await addDoc(globalRef, {
            gameId,
            pick: prediction.pick,
            confidence: prediction.confidence,
            timestamp: serverTimestamp()
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving prediction history:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
