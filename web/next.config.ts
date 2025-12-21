import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: path.join(__dirname, "../"),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.sportsdata.com',
        pathname: '/api/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'api.sportsdata.app',
        pathname: '/api/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sportsdata.com',
        pathname: '/api/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
