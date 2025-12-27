import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ status: 'ok', server: 'Next.js API is running' });
}
