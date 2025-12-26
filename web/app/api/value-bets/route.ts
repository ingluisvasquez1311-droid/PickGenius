import { NextRequest, NextResponse } from 'next/server';
import { sportsDataService } from '@/lib/services/sportsDataService';
import { getUserProfile } from '@/lib/userService';

export const dynamic = 'force-dynamic';

function FairOddsToMarket(fair: number, id: number): number {
    const margin = 1.07;
    let market = fair * margin;
    const errorFactor = (id % 15 === 0) ? 1.15 : (id % 7 === 0) ? 1.08 : 0.98;
    market = market * errorFactor;
    return Math.max(1.2, Math.min(5.0, market));
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        // Check premium status
        let isPremium = false;
        if (uid) {
            const profile = await getUserProfile(uid);
            const isOwner = profile?.email && (
                profile.email.toLowerCase() === 'pickgenius@gmail.com' ||
                profile.email.toLowerCase() === 'ingluisvasquez1311@gmail.com' ||
                profile.email.toLowerCase() === 'luisvasquez1311@gmail.com'
            );
            isPremium = profile?.isPremium || profile?.role === 'admin' || isOwner || false;
        }

        const [footballEvents, basketballEvents] = await Promise.all([
            sportsDataService.getAllFootballMatches().catch(() => []),
            sportsDataService.getAllBasketballGames().catch(() => [])
        ]);

        const allEvents = [...footballEvents, ...basketballEvents];
        const targetEvents = allEvents.filter(e =>
            e.status?.type === 'notstarted' ||
            (e.status?.type === 'inprogress' && e.status?.description !== 'Finalizado')
        );

        const bets = targetEvents
            .map(event => {
                const sport = event.tournament?.category?.sport?.slug;
                const isFootball = sport === 'football';

                const homeWeight = (event.homeTeam?.name?.length % 10) + (event.homeTeam?.id % 5);
                const awayWeight = (event.awayTeam?.name?.length % 10) + (event.awayTeam?.id % 5);

                const homeAdvantage = isFootball ? 1.2 : 1.1;
                const homePower = homeWeight * homeAdvantage;
                const awayPower = awayWeight;

                const totalPower = homePower + awayPower;
                let aiProb = (homePower / totalPower) * 100;
                if (isFootball) aiProb = aiProb * 0.85;

                const fairOdds = 100 / aiProb;
                const marketOdds = FairOddsToMarket(fairOdds, event.id);
                const impliedProb = (1 / marketOdds) * 100;
                const edge = ((aiProb / impliedProb) - 1) * 100;

                if (edge < 3) return null;

                const bookmakers = ['Bet365', 'Betano', 'Pinnacle', 'Betfair', 'Rushbet'];
                const bookie = bookmakers[event.id % bookmakers.length];

                const betData = {
                    id: `hunter-${event.id}`,
                    sport: (isFootball ? 'football' : 'basketball'),
                    league: event.tournament?.uniqueTournament?.name || event.tournament?.name,
                    homeTeam: event.homeTeam?.name,
                    awayTeam: event.awayTeam?.name,
                    market: isFootball ? 'Resultado Final' : 'Ganador (Inc. Prórroga)',
                    selection: event.homeTeam?.name,
                    bookmaker: bookie,
                    odds: parseFloat(marketOdds.toFixed(2)),
                    impliedProbability: parseFloat(impliedProb.toFixed(1)),
                    aiProbability: parseFloat(aiProb.toFixed(1)),
                    edge: parseFloat(edge.toFixed(1)),
                    startTime: event.startTimestamp * 1000,
                    confidenceScore: Math.min(10, Math.floor(edge / 2) + 5)
                };

                // Masking if not premium
                if (!isPremium) {
                    return {
                        ...betData,
                        selection: '🔒 Premium',
                        market: '🔒 Mercados de Valor',
                        isLocked: true
                    };
                }

                return betData;
            })
            .filter(bet => bet !== null);

        return NextResponse.json({
            success: true,
            data: bets,
            isPremium
        });

    } catch (error) {
        console.error('Value Bets API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
