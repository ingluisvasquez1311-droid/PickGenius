import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_KEY = process.env.FOOTBALL_API_KEY_1 || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

export async function GET(request: NextRequest) {
    try {
        if (!API_KEY) {
            console.error('❌ Football API key not configured');
            return NextResponse.json({
                success: false,
                error: 'API key not configured'
            }, { status: 500 });
        }

        console.log('⚽ Fetching Live Football matches from official API...');

        // Fetch Live Matches: https://v3.football.api-sports.io/fixtures?live=all
        const response = await fetch(`${BASE_URL}/fixtures?live=all`, {
            headers: {
                'x-apisports-key': API_KEY,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`API-Sports error: ${response.status}`);
        }

        const data = await response.json();

        // Transform to match frontend expectations
        // The frontend expects: tournament, homeTeam, awayTeam, scores (goals)
        const matches = data.response?.map((item: any) => ({
            id: item.fixture.id,
            tournament: {
                name: item.league.name,
                uniqueTournament: { name: item.league.name }
            },
            homeTeam: {
                id: item.teams.home.id,
                name: item.teams.home.name,
                logo: item.teams.home.logo
            },
            awayTeam: {
                id: item.teams.away.id,
                name: item.teams.away.name,
                logo: item.teams.away.logo
            },
            homeScore: {
                current: item.goals.home
            },
            awayScore: {
                current: item.goals.away
            },
            status: {
                type: 'inprogress',
                description: `${item.fixture.status.elapsed}'`
            },
            startTimestamp: item.fixture.timestamp
        })) || [];

        return NextResponse.json({
            success: true,
            data: matches,
            count: matches.length
        });
    } catch (error: any) {
        console.error('Football API Route Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
