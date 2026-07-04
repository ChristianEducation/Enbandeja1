import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Transpila los packages del monorepo para que Next.js los procese
  transpilePackages: [
    '@enbandeja/database',
    '@enbandeja/shared',
    '@enbandeja/ui',
  ],

  // Optimización de imágenes para Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

export default nextConfig
