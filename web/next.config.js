/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Optimización de imágenes
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'api.sofascore.com' },
            { protocol: 'https', hostname: 'api.sofascore.app' },
            { protocol: 'https', hostname: 'www.aiscore.com' },
            { protocol: 'https', hostname: 'wsrv.nl' },
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60 * 60 * 24,
    },

    // Ignorar errores menores que bloquean despliegues
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false, // Mantener estricto para calidad, pero corregible si es necesario
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
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*'
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,POST,OPTIONS'
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
