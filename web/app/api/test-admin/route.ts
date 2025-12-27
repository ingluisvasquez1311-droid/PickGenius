import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json({ success: false, error: 'Admin DB is null (Init failed)' }, { status: 200 });
        }

        // Try a simple read
        const testCheck = await adminDb.collection('games').limit(1).get();

        return NextResponse.json({
            success: true,
            message: 'Firebase Admin SDK acts with FULL POWER ⚡',
            docsFound: testCheck.size
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 200 });
    }
}
