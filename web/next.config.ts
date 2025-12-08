import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: path.join(__dirname, "../"),
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/football/live',
        destination: `${backendUrl}/api/sofascore/football/live`,
      },
      {
        source: '/api/basketball/live',
        destination: `${backendUrl}/api/sofascore/basketball/live`,
      }
    ];
  },
};

export default nextConfig;
