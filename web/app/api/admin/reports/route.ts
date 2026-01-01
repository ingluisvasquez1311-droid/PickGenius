import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

/**
 * ADMIN ONLY: Fetches all comment reports from Firestore.
 */
export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses[0]?.emailAddress === 'luisvasquez1311@gmail.com';

        if (!isAdmin) {
            return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const { db } = await import('@/lib/firebase-admin');
        if (!db) {
            return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
        }

        const reportsSnapshot = await db.collection('comment_reports')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const reports = reportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
        }));

        return NextResponse.json({ reports });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
