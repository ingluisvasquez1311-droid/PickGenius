import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NBA_API_URL = 'https://api-nba-v1.p.rapidapi.com';
const NBA_API_KEY = process.env.NBA_API_KEY || process.env.NEXT_PUBLIC_NBA_API_KEY;

export async function GET(request: NextRequest) {
    try {
        if (!NBA_API_KEY) {
            console.error('❌ NBA API key not configured');
            return NextResponse.json({
                success: false,
                error: 'NBA API key not configured'
            }, { status: 500 });
        }

        console.log('🏀 Fetching NBA live games from official API...');

        // Fetch Live Games directly: https://api-nba-v1.p.rapidapi.com/games?live=all
        const response = await fetch(
            `${NBA_API_URL}/games?live=all`,
            {
                headers: {
                    'x-rapidapi-key': NBA_API_KEY,
                    'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com'
                },
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            throw new Error(`NBA API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform to match frontend expectations if necessary
        // The frontend expects: tournament, homeTeam, awayTeam, scores
        const transformedData = data.response?.map((game: any) => ({
            id: game.id,
            tournament: {
                name: 'NBA',
                uniqueTournament: { name: 'NBA' }
            },
            homeTeam: {
                id: game.teams.home.id,
                name: game.teams.home.name,
                logo: game.teams.home.logo
            },
            awayTeam: {
                id: game.teams.visitors.id,
                name: game.teams.visitors.name,
                logo: game.teams.visitors.logo
            },
            homeScore: {
                current: game.scores.home.points
            },
            awayScore: {
                current: game.scores.visitors.points
            },
            status: {
                type: 'inprogress',
                description: `${game.periods.current}Q - ${game.clock}`
            },
            startTimestamp: new Date(game.date.start).getTime() / 1000
        })) || [];

        return NextResponse.json({
            success: true,
            data: transformedData,
            count: transformedData.length
        });
    } catch (error: any) {
        console.error('NBA API Route Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
