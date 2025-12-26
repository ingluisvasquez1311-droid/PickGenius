import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No necesitamos configurar turbopack.root ya que estamos en /web
  // y Next.js ya detectó correctamente esta carpeta
  experimental: {
    clientTraceMetadata: ['metadata'], // Debe ser array, no boolean
    optimizeCss: true,
    optimizePackageImports: [
      '@heroicons/react',
      'lucide-react'
    ],
  },
  // Configurar rewrites para el proxy al backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  // Configurar headers CORS para desarrollo
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig;
