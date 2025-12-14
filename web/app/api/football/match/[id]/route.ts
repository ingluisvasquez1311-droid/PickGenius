import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_KEY = process.env.FOOTBALL_API_KEY_1 || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Next.js 15+ params await pattern
    const { id } = await params;

    try {
        if (!API_KEY) {
            return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
        }

        if (!id) {
            return NextResponse.json({ success: false, error: 'Match ID required' }, { status: 400 });
        }

        console.log(`⚽ Fetching Match Details for ID ${id} from API-Sports...`);

        // Fetch Fixture Details usually gives stats, lineups, events in one go
        const response = await fetch(`${BASE_URL}/fixtures?id=${id}`, {
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

        if (data.results === 0) {
            return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });
        }

        const match = data.response[0];

        // Normalizar estructura para el frontend
        // El frontend espera: details, stats, lineups, incidents (events), h2h
        const normalizedData = {
            event: {
                id: match.fixture.id,
                tournament: {
                    name: match.league.name,
                    id: match.league.id
                },
                season: { id: match.league.season },
                homeTeam: {
                    id: match.teams.home.id,
                    name: match.teams.home.name,
                    logo: match.teams.home.logo
                },
                awayTeam: {
                    id: match.teams.away.id,
                    name: match.teams.away.name,
                    logo: match.teams.away.logo
                },
                homeScore: { current: match.goals.home },
                awayScore: { current: match.goals.away },
                status: {
                    type: match.fixture.status.short === 'NS' ? 'notstarted' :
                        match.fixture.status.short === 'FT' ? 'finished' : 'inprogress',
                    description: match.fixture.status.long
                },
                startTimestamp: match.fixture.timestamp
            },
            statistics: {
                statistics: (() => {
                    const homeStats = match.statistics?.find((s: any) => s.team.id === match.teams.home.id)?.statistics || [];
                    const awayStats = match.statistics?.find((s: any) => s.team.id === match.teams.away.id)?.statistics || [];

                    // Map common stats
                    const statsMap = new Map();

                    homeStats.forEach((s: any) => {
                        statsMap.set(s.type, { name: s.type, home: s.value, away: 0 }); // Default away to 0/null
                    });

                    awayStats.forEach((s: any) => {
                        if (statsMap.has(s.type)) {
                            statsMap.get(s.type).away = s.value;
                        } else {
                            statsMap.set(s.type, { name: s.type, home: 0, away: s.value });
                        }
                    });

                    // Convert map to array and group manually since API-Sports doesn't provide groups
                    const allStats = Array.from(statsMap.values());

                    // Manual Grouping Logic
                    const groups = [
                        {
                            groupName: 'General',
                            items: ['Ball Possession', 'Total Shots', 'Corner Kicks', 'Offsides', 'Fouls', 'Yellow Cards', 'Red Cards']
                        },
                        {
                            groupName: 'Disparos',
                            items: ['Shots on Goal', 'Shots off Goal', 'Blocked Shots', 'Shots insidebox', 'Shots outsidebox']
                        },
                        {
                            groupName: 'Pases & Precisión',
                            items: ['Total passes', 'Passes accurate', 'Passes %']
                        },
                        {
                            groupName: 'Defensa',
                            items: ['Goalkeeper saves', 'Tackles', 'Interceptions']
                        }
                    ];

                    const resultGroups = groups.map(g => ({
                        groupName: g.groupName,
                        statisticsItems: allStats.filter(s => g.items.includes(s.name) || (g.groupName === 'General' && !groups.some(og => og.items.includes(s.name) && og.groupName !== 'General')))
                    })).filter(g => g.statisticsItems.length > 0);

                    return [{
                        period: 'ALL',
                        groups: resultGroups
                    }];
                })()
            },
            lineups: (() => {
                // Helper to create a map of player stats
                const createStatsMap = (teamId: number) => {
                    const teamStats = match.players?.find((t: any) => t.team.id === teamId);
                    const map = new Map();
                    if (teamStats && teamStats.players) {
                        teamStats.players.forEach((p: any) => {
                            map.set(p.player.id, p.statistics[0]); // API provides array of stats (usually 1 per game)
                        });
                    }
                    return map;
                };

                const homeStatsMap = createStatsMap(match.teams.home.id);
                const awayStatsMap = createStatsMap(match.teams.away.id);

                const mapLineup = (lineup: any, statsMap: Map<any, any>) => {
                    if (!lineup) return [];
                    return lineup.startXI.map((item: any) => {
                        const stats = statsMap.get(item.player.id);
                        return {
                            player: item.player,
                            position: item.player.pos,
                            shirtNumber: item.player.number,
                            statistics: stats ? {
                                minutesPlayed: stats.games.minutes,
                                rating: stats.games.rating ? parseFloat(stats.games.rating) : null,
                                goals: stats.goals.total || 0,
                                assists: stats.goals.assists || 0
                            } : null
                        };
                    });
                };

                return {
                    home: { players: mapLineup(match.lineups?.[0], homeStatsMap) },
                    away: { players: mapLineup(match.lineups?.[1], awayStatsMap) }
                };
            })(),
            incidents: match.events?.map((e: any) => ({
                id: Math.random().toString(), // Mock ID
                text: e.detail,
                time: e.time.elapsed,
                isHome: e.team.id === match.teams.home.id,
                type: e.type
            })) || []
        };

        return NextResponse.json(normalizedData);

    } catch (error: any) {
        console.error('Match Details API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
