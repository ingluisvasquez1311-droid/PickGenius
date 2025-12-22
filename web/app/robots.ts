import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://pickgenius.ai'; // Replace with actual production domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/profile/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
