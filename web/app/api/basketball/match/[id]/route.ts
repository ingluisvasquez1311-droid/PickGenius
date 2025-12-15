import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = 'https://api.sofascore.com/api/v1';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Force git update

    if (!id) {
        return NextResponse.json({ success: false, error: 'Match ID is required' }, { status: 400 });
    }

    try {
        console.log(`🏀 Fetching Basketball Match Details for ID ${id}...`);

        // Fetch details from Sofascore (Server-side avoids CORS)
        const response = await fetch(`${BASE_URL}/event/${id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.sofascore.com/'
            }
        });

        if (!response.ok) {
            console.error(`❌ Sofascore Error: ${response.status}`);
            return NextResponse.json({ success: false, error: 'Provider unavailable' }, { status: response.status });
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data: data.event
        });

    } catch (error: any) {
        console.error('❌ Basketball Match API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
