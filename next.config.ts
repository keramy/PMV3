import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // typedRoutes: true, // Disabled for now due to build issues
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // External packages for server components
  serverExternalPackages: ['xlsx', '@react-pdf/renderer'],
  
  // Optimize images for construction site documents and photos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co'
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Enable compression and performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Optimize for mobile-first construction workflows
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Performance headers for construction site connections
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ]
  },

  // Optimize bundle for construction workflows
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting for construction app patterns
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }

    // Optimize for Excel processing
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]

    // Exclude test files from build
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    })

    return config
  },

  // Exclude test files from pages
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'].filter(ext => !ext.includes('test'))
}

export default nextConfig