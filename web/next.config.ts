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
        hostname: 'api.sofascore.com',
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
};

export default nextConfig;
