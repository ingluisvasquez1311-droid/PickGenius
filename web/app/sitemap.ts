import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://pickgenius.com';

    // Rutas estáticas principales
    const routes = [
        '',
        '/football',
        '/basketball',
        '/tennis',
        '/baseball',
        '/nfl',
        '/value',
        '/props',
        '/streaks',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
