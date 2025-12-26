import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
    title: 'NBA y Baloncesto en Vivo | PickGenius Pro AI',
    description: 'Análisis de spreads, total de puntos y props de jugadores para NBA en tiempo real con Inteligencia Artificial.',
});

export default function BasketballLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
