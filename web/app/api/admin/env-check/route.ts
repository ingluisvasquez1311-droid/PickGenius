import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
    const vars = {
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_SERVICE_ACCOUNT_BASE64: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NODE_ENV: process.env.NODE_ENV
    };

    return NextResponse.json({
        success: true,
        environment: vars,
        message: 'If PRIVATE_KEY or SERVICE_ACCOUNT_BASE64 are false, Admin SDK cannot start.'
    });
}