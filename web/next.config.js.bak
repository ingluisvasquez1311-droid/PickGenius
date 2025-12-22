/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
    },
};

module.exports = nextConfig;
