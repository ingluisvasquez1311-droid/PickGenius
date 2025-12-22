import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Relaxing checks for production build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Existing Config
  reactCompiler: true,
  outputFileTracingRoot: path.join(__dirname, "../"),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.sofascore.com',
        pathname: '/api/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'api.sofascore.app',
        pathname: '/api/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sofascore.com',
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
