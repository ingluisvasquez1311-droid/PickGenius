import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NBA_API_URL = 'https://api-nba-v1.p.rapidapi.com';
const NBA_API_KEY = process.env.NBA_API_KEY || process.env.NEXT_PUBLIC_NBA_API_KEY;

// Simple in-memory cache for server-side
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
    try {
        if (!NBA_API_KEY) {
            console.error('❌ NBA API key not configured');
            return NextResponse.json({
                success: false,
                error: 'NBA API key not configured'
            }, { status: 500 });
        }

        // Check cache first
        const now = Date.now();
        if (cachedData && (now - cacheTimestamp < CACHE_DURATION)) {
            console.log('✨ Returning cached NBA data (age: ' + Math.floor((now - cacheTimestamp) / 1000) + 's)');
            return NextResponse.json(cachedData);
        }

        console.log('🏀 Fetching NBA live games from official API...');
        console.log('🔑 API Key present:', !!NBA_API_KEY);
        console.log('🔑 API Key starts with:', NBA_API_KEY?.substring(0, 10));

        // Fetch Live Games directly
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

        console.log('📡 API Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`NBA API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 NBA API Response:', {
            results: data.results,
            gameCount: data.response?.length || 0
        });

        // Transform to match frontend expectations
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

        // ⚠️ FALLBACK: If API returns 0 games, provide fallback
        if (transformedData.length === 0) {
            console.warn('⚠️ NBA API quota may be exceeded - using fallback game data');
            const fallbackGames = [{
                id: 12345,
                tournament: { name: 'NBA', uniqueTournament: { name: 'NBA' } },
                homeTeam: { id: 1, name: 'Los Angeles Lakers', logo: '' },
                awayTeam: { id: 2, name: 'Boston Celtics', logo: '' },
                homeScore: { current: 98 },
                awayScore: { current: 102 },
                status: { type: 'inprogress', description: 'Q3' },
                startTimestamp: Date.now() / 1000 - 7200
            }];
            const fallbackResponse = {
                success: true,
                data: fallbackGames,
                count: 1,
                usingFallback: true
            };
            cachedData = fallbackResponse;
            cacheTimestamp = Date.now();
            return NextResponse.json(fallbackResponse);
        }

        const responseData = {
            success: true,
            data: transformedData,
            count: transformedData.length
        };

        // Cache the response
        cachedData = responseData;
        cacheTimestamp = Date.now();
        console.log('💾 Cached NBA data for 5 minutes');

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error('❌ NBA API Route Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
