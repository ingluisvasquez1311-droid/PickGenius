import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:3000';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await context.params;

    if (!eventId) {
        return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`${API_URL}/api/sofascore/basketball/game/${eventId}/stats`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}
