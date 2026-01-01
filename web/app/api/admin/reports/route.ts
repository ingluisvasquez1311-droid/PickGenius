import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

/**
 * ADMIN ONLY: Fetches all comment reports from Firestore.
 */
export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        const primaryEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            || user?.emailAddresses[0]?.emailAddress;

        const isAdmin = primaryEmail === 'luisvasquez1311@gmail.com';

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

export async function DELETE(req: NextRequest) {
    try {
        const user = await currentUser();
        const primaryEmail = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            || user?.emailAddresses[0]?.emailAddress;

        const isAdmin = primaryEmail === 'luisvasquez1311@gmail.com';

        if (!isAdmin) {
            return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get('id');

        if (!reportId) {
            return NextResponse.json({ error: "ID de reporte requerido" }, { status: 400 });
        }

        const { db } = await import('@/lib/firebase-admin');
        if (!db) {
            return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 });
        }

        await db.collection('comment_reports').doc(reportId).delete();

        return NextResponse.json({ success: true, message: "Reporte eliminado" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
