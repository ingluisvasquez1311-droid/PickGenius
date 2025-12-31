import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.sofascore.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.sofascore.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sofascore.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy-image/team/:id',
        destination: 'https://api.sofascore.app/api/v1/team/:id/image',
      },
      {
        source: '/api/proxy-image/tournament/:id',
        destination: 'https://api.sofascore.app/api/v1/unique-tournament/:id/image',
      },
      {
        source: '/api/proxy-image/category/:id',
        destination: 'https://api.sofascore.app/api/v1/category/:id/image',
      },
      {
        source: '/api/proxy-image/player/:id',
        destination: 'https://api.sofascore.app/api/v1/player/:id/image',
      },
    ];
  },
};

export default nextConfig;
