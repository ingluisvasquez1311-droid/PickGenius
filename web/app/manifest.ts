
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PickGenius Pro',
        short_name: 'PickGenius',
        description: 'Plataforma de predicción deportiva con IA Avanzada.',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505', // Matching the app bg
        theme_color: '#8B5CF6',       // Primary distinct purple
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
        orientation: 'portrait-primary'
    }
}
