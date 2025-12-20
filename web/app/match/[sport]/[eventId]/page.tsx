'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import MatchLiveView from '@/components/sports/MatchLiveView';

export default function UniversalMatchPage() {
    const params = useParams();
    const sport = params.sport as string;
    const eventId = params.eventId as string;

    // Map sport names if necessary (e.g., 'basketball' -> 'basketball')
    const mappedSport = sport === 'nba' ? 'basketball' :
        sport === 'mlb' ? 'baseball' :
            sport === 'nhl' ? 'nhl' :
                sport === 'tennis' ? 'tennis' : sport;

    return <MatchLiveView sport={mappedSport} eventId={eventId} />;
}
