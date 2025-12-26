import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
    title: 'Fútbol en Vivo | Predicciones AI PickGenius Pro',
    description: 'Sigue los partidos de fútbol en vivo con análisis de IA, estadísticas en tiempo real y probabilidades de victoria.',
});

export default function FootballLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
