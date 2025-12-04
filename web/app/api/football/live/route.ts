import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

export async function GET(request: NextRequest) {
    try {
        if (!API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'API key not configured'
            }, { status: 500 });
        }

        const today = new Date().toISOString().split('T')[0];

        const response = await fetch(
            `${BASE_URL}/fixtures?date=${today}&season=2024`,
            {
                headers: {
                    'x-apisports-key': API_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(`API-Sports error: ${response.status}`);
        }

        const data = await response.json();

        // Filter for major football leagues
        const leagueIds = [39, 140, 135, 78, 61]; // Premier League, La Liga, Serie A, Bundesliga, Ligue 1
        const matches = data.response?.filter((item: any) =>
            leagueIds.includes(item.league.id)
        ) || [];

        return NextResponse.json({
            success: true,
            data: matches,
            count: matches.length
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
