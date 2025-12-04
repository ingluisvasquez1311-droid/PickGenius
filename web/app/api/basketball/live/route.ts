import { NextRequest, NextResponse } from 'next/server';

const NBA_API_URL = 'https://api-nba-v1.p.rapidapi.com';
const NBA_API_KEY = process.env.NEXT_PUBLIC_NBA_API_KEY;

export async function GET(request: NextRequest) {
    try {
        if (!NBA_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'NBA API key not configured'
            }, { status: 500 });
        }

        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(
            `${NBA_API_URL}/games?date=${today}`,
            {
                headers: {
                    'x-rapidapi-key': NBA_API_KEY,
                    'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`NBA API error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data: data.response || [],
            count: data.response?.length || 0
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
