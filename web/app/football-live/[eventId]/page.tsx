'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Redirige de la ruta antigua (/football-live/[eventId]) 
 * a la nueva ruta universal (/match/football/[eventId])
 */
export default function FootballRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    useEffect(() => {
        if (eventId) {
            console.log(`🔄 Redirecting legacy Football Detail ${eventId} to Universal View...`);
            router.replace(`/match/football/${eventId}`);
        } else {
            router.replace('/football');
        }
    }, [eventId, router]);

    return (
        <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Optimizando visualización...</p>
            </div>
        </div>
    );
}
