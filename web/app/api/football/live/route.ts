import { NextRequest, NextResponse } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Football API called');
        console.log('API_KEY exists:', !!API_KEY);
        console.log('API_KEY (first 10 chars):', API_KEY?.substring(0, 10));

        if (!API_KEY) {
            console.error('❌ API key not configured');
            return NextResponse.json({
                success: false,
                error: 'API key not configured'
            }, { status: 500 });
        }

        const today = new Date().toISOString().split('T')[0];
        console.log('📅 Fetching matches for date:', today);

        const url = `${BASE_URL}/fixtures?date=${today}&season=2024`;
        console.log('🌐 Fetching from:', url);

        const response = await fetch(url, {
            headers: {
                'x-apisports-key': API_KEY
            }
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API-Sports error:', response.status, errorText);
            throw new Error(`API-Sports error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📊 Response data:', JSON.stringify(data).substring(0, 200));

        // Filter for major football leagues
        const leagueIds = [39, 140, 135, 78, 61]; // Premier League, La Liga, Serie A, Bundesliga, Ligue 1
        const matches = data.response?.filter((item: any) =>
            leagueIds.includes(item.league.id)
        ) || [];

        console.log(`✅ Found ${matches.length} matches`);

        return NextResponse.json({
            success: true,
            data: matches,
            count: matches.length
        });
    } catch (error: any) {
        console.error('💥 Caught error:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
