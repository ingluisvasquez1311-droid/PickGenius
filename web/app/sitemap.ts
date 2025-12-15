import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://pickgenius.ai',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://pickgenius.ai/football-live',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: 'https://pickgenius.ai/basketball-live',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
    ];
}
