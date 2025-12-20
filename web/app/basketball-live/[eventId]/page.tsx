'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Redirige de la ruta antigua (/basketball-live/[eventId]) 
 * a la nueva ruta universal (/match/basketball/[eventId])
 */
export default function BasketballRedirectPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    useEffect(() => {
        if (eventId) {
            console.log(`🔄 Redirecting legacy Basketball Detail ${eventId} to Universal View...`);
            router.replace(`/match/basketball/${eventId}`);
        } else {
            router.replace('/nba');
        }
    }, [eventId, router]);

    return (
        <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Optimizando visualización...</p>
            </div>
        </div>
    );
}
