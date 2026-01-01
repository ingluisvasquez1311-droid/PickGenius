
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PickGenius Pro | AI Sports Terminal',
        short_name: 'PickGenius',
        description: 'Plataforma de predicción deportiva con IA Avanzada. Análisis de élite, H2H y lesiones en tiempo real.',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#00FF41',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/favicon.ico',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/favicon.ico',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
            }
        ],
        orientation: 'portrait-primary',
        categories: ['sports', 'finance'],
        lang: 'es'
    }
}
