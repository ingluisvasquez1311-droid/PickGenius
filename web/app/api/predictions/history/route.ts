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
// ... POST method ...

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }

        if (!db) {
            return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
        }

        // Fetch user's history
        const userHistoryRef = collection(db, 'users', userId, 'predictions');
        // Sort by timestamp desc implementation would require an index, simpler to fetch and sort in memory if small,
        // or use simple query. Since this is "history", usually we want latest.
        // For strict ordering we need composite index `predictions/{id} -> timestamp`.
        // We'll trust default ordering or client sorting for MVP to avoid index creation Requirement on user.
        // Actually, let's try strict sort.
        // const q = query(userHistoryRef, orderBy('timestamp', 'desc')); 
        // Failing indexes, let's just get docs.
        const snapshot = await getDocs(userHistoryRef);

        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a: any, b: any) => {
            // Memory sort by timestamp
            const tA = a.timestamp?.seconds || 0;
            const tB = b.timestamp?.seconds || 0;
            return tB - tA;
        });

        return NextResponse.json({ success: true, history });

    } catch (error: any) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
