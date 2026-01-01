import type { NextConfig } from "next";
// Sentry temporarily disabled - import commented out
// import { withSentryConfig } from "@sentry/nextjs";

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
    return [];
  },
};

// Sentry temporarily disabled due to missing dependencies
// import { withSentryConfig } from "@sentry/nextjs";

export default nextConfig;

// Sentry config commented out - restore when dependencies are fixed
/*
export default withSentryConfig(nextConfig, {
  silent: true,
  org: "pickgenius",
  project: "javascript-nextjs",
}, {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
*/
