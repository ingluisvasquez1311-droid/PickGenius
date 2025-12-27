import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!db) return NextResponse.json({ error: 'Firestore not initialized' });

        const gamesRef = collection(db, 'games');
        const marketLinesRef = collection(db, 'marketLines');

        // Snapshot of Games (Limit 50 to avoid massive reads)
        const gamesSnap = await getDocs(query(gamesRef, limit(50)));
        const marketLinesSnap = await getDocs(query(marketLinesRef, limit(20)));

        const stats = {
            totalGamesSample: gamesSnap.size,
            sports: {} as Record<string, number>,
            gamesWithAI: 0,
            gamesWithBetplayPredictions: 0,
            sampleAI: null as any,
            sampleProps: null as any
        };

        gamesSnap.forEach(doc => {
            const data = doc.data();
            stats.sports[data.sport] = (stats.sports[data.sport] || 0) + 1;

            if (data.aiAnalysis) stats.gamesWithAI++;
            if (data.predictions) stats.gamesWithBetplayPredictions++;

            if (!stats.sampleAI && data.aiAnalysis) stats.sampleAI = data.aiAnalysis;
        });

        // Check exact market lines props
        const propsSample = marketLinesSnap.docs.find(d => d.data().props);
        if (propsSample) stats.sampleProps = propsSample.data().props;

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            stats
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
