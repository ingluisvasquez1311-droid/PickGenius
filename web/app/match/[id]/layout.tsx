
import { Metadata } from 'next';
import { sofafetch } from '@/lib/api-utils';

type Props = {
    params: Promise<{ id: string }>;
    children: React.ReactNode;
};

// Next.js (App Router) generates metadata on the server
export async function generateMetadata({ params }: Props): Promise<Metadata> {

    // Resolve params (it's a promise in the new App Router versions)
    const resolvedParams = await params;
    const { id } = resolvedParams;

    try {
        // Lightweight fetch only for the event headers (SEO)
        const data = await sofafetch(`https://api.sofascore.com/api/v1/event/${id}`);
        const event = data?.event;

        if (event) {
            const home = event.homeTeam.name;
            const away = event.awayTeam.name;
            const tournament = event.tournament?.name || 'Deportes';

            return {
                title: `${home} vs ${away} | Pronóstico & IA - PickGenius`,
                description: `Predicción experta para ${home} vs ${away} (${tournament}). Análisis de IA, estadísticas en vivo y comparativa de cuotas con valor.`,
                openGraph: {
                    title: `${home} vs ${away} | PickGenius AI`,
                    description: `¿Quién ganará? La IA ha detectado una oportunidad de valor en este partido.`,
                    images: ['/api/og'], // We could make a dynamic OG image generator later
                },
            };
        }
    } catch (e) {
        console.error("SEO Generation Error:", e);
    }

    // Fallback Metadata
    return {
        title: 'Análisis de Partido | PickGenius',
        description: 'Detalles del evento, estadísticas y predicciones de IA.',
    };
}

export default function MatchLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
