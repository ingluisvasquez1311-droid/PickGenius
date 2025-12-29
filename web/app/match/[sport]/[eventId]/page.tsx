import React from 'react';
import { Metadata } from 'next';
import MatchLiveView from '@/components/sports/MatchLiveView';
import { sportsDataService } from '@/lib/services/sportsDataService';

interface PageProps {
    params: Promise<{
        sport: string;
        eventId: string;
    }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { sport, eventId } = await params;

    try {
        // Fetch basic event info for SEO
        const response = await sportsDataService.makeRequest(`/event/${eventId}`);
        const event = response?.event;

        if (event) {
            const home = event.homeTeam?.name || 'Home';
            const away = event.awayTeam?.name || 'Away';
            const tournament = event.tournament?.name || 'Sports';

            return {
                title: `${home} vs ${away} - Predicción y Estadísticas | PickGenius`,
                description: `Análisis en vivo, probabilidades de IA y estadísticas detalladas para el partido ${home} vs ${away} en ${tournament}.`,
                openGraph: {
                    title: `${home} vs ${away} - Análisis PickGenius`,
                    description: `Mira la predicción de la IA y stats en vivo.`,
                    images: ['/og-image.jpg'] // We could eventually generate dynamic OGs too
                }
            };
        }
    } catch (e) {
        console.error('Error generating metadata for match:', e);
    }

    return {
        title: 'Análisis de Partido | PickGenius',
        description: 'Detalles del evento deportivo y predicciones de IA.'
    };
}

// 2. Server Component Entry Point
export default async function UniversalMatchPage({ params }: PageProps) {
    const { sport, eventId } = await params;

    // Map sport names if necessary (normalize to internal IDs)
    const s = sport.toLowerCase();
    const mappedSport =
        s === 'nba' ? 'basketball' :
            s === 'mlb' ? 'baseball' :
                s === 'nhl' ? 'ice-hockey' :
                    s === 'nfl' ? 'american-football' :
                        s === 'hockey' ? 'ice-hockey' : sport;

    return <MatchLiveView sport={mappedSport} eventId={eventId} />;
}
