import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Relaxing checks for production build
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },

  // Existing Config
  reactCompiler: true,
  // outputFileTracingRoot: path.join(__dirname, "../"), // Comentado temporalmente si causa problemas en Vercel
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
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Backend
      },
    ];
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "Luis-Vasquez", // Nombre de org inferido, ajustar si es diferente
  project: "pickgenius-web", // Nombre de proyecto inferido

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },


});

// Exporta la configuración sin Sentry en desarrollo para mejorar la velocidad
export default process.env.NODE_ENV === 'development' ? nextConfig : sentryConfig;
