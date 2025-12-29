import { NextRequest, NextResponse } from 'next/server';
import redis from '../../../../lib/redis';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const SPORT = 'tennis';
    const TYPE = 'live';

    try {
        const sources = ['sofascore', 'aiscore'];
        let allEvents: any[] = [];

        for (const source of sources) {
            const keyString = `${source}_${SPORT}_${TYPE}`;
            const cacheKey = `sports_cache:${crypto.createHash('md5').update(keyString).digest('hex')}`;
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                const parsed = JSON.parse(cachedData as string);
                const sourceEvents = parsed.data.map((m: any) => ({
                    id: m.id || `${m.home_team}_${m.away_team}_${source}`.toLowerCase(),
                    homeTeam: { name: m.home_team, id: m.home_id },
                    awayTeam: { name: m.away_team, id: m.away_id },
                    homeScore: { current: m.home_score, display: m.home_score },
                    awayScore: { current: m.away_score, display: m.away_score },
                    tournament: {
                        name: m.league_name || 'Tennis Tournament',
                        id: m.league_id,
                        category: {
                            name: 'En Vivo',
                            id: m.league_id
                        }
                    },
                    status: { type: 'inprogress', description: m.start_time_raw || 'LIVE' },
                    startTimestamp: Math.floor(Date.now() / 1000),
                    source: source
                }));
                allEvents = [...allEvents, ...sourceEvents];
            }
        }

        return NextResponse.json({ success: true, events: allEvents, source: 'scraper-redis' });
    } catch (error: any) {
        return NextResponse.json({ success: true, events: [] });
    }
}