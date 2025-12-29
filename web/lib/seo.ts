import { Metadata } from 'next';

export const BASE_URL = 'https://pickgeniuspro.com';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
}

export function constructMetadata({
    title = 'PickGenius Pro - Pronósticos Deportivos con IA',
    description = 'Análisis avanzado y predicciones de fútbol, baloncesto y más usando Inteligencia Artificial de vanguardia.',
    image = '/og-image.png',
    url = BASE_URL,
    type = 'website'
}: SEOProps = {}): Metadata {
    return {
        title: {
            default: title,
            template: `%s | PickGenius Pro`
        },
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: 'PickGenius Pro',
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: 'PickGenius Pro Preview'
                }
            ],
            type
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
            creator: '@PickGeniusPro'
        },
        metadataBase: new URL(BASE_URL),
        alternates: {
            canonical: url
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        manifest: '/manifest.json',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: 'PickGenius',
        },
        icons: {
            apple: [
                { url: '/icon-192.png', sizes: '192x192' },
            ],
        },
    };
}
