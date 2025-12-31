import { NextResponse } from 'next/server';
import { sofafetch } from '@/lib/api-utils';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    try {
        console.log(`[Proxy Bridge] Fetching: ${targetUrl}`);
        const data = await sofafetch(targetUrl);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`[Proxy Bridge Error]:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
