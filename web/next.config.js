/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Optimización de imágenes
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'api.sofascore.com' },
            { protocol: 'https', hostname: 'api.sofascore.app' },
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60 * 60 * 24,
    },

    // Optimización de compilación
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Headers de seguridad y performance
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=60, stale-while-revalidate=300'
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
        ];
    },

    // Turbopack config (Next.js 16 default)
    turbopack: {},

    // Performance budgets
    experimental: {
        optimizeCss: false, // Disabled to fix 'critters' error
        optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
    },
};

module.exports = nextConfig;
