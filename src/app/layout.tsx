import type { Metadata, Viewport } from 'next'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Formula PM V3',
  description: 'Construction Project Management Platform - Built for speed and efficiency',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logos/logo-f.png', sizes: '64x64', type: 'image/png' }
    ],
    apple: [
      { url: '/logos/logo-f.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.png'
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Formula PM V3',
    startupImage: [
      {
        url: '/logos/logo-f.png',
        media: '(device-width: 768px) and (device-height: 1024px)'
      }
    ]
  },
  openGraph: {
    type: 'website',
    siteName: 'Formula PM V3',
    title: 'Formula PM V3 - Construction Project Management',
    description: 'Professional construction project management platform built for speed and efficiency',
    images: [
      {
        url: '/logos/logo-formula.png',
        width: 1200,
        height: 630,
        alt: 'Formula PM V3 Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formula PM V3',
    description: 'Construction Project Management Platform',
    images: ['/logos/logo-formula.png']
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical assets for construction workflows */}
        <link rel="preload" as="image" href="/logos/logo-f.png" />
        <link rel="preload" as="image" href="/logos/logo-formula.png" />
        <link rel="dns-prefetch" href="https://xrrrtwrfadcilwkgwacs.supabase.co" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Toaster />
        
        {/* Performance optimization script for construction sites */}
        <Script 
          id="performance-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Optimize for construction site connectivity
              if (typeof window !== 'undefined') {
                // Enable resource prefetching for critical routes
                const criticalRoutes = ['/dashboard', '/projects', '/scope'];
                criticalRoutes.forEach(route => {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = route;
                  document.head.appendChild(link);
                });
                
                // Detect slow connections and optimize accordingly
                if ('connection' in navigator) {
                  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                  if (conn && ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) {
                    document.documentElement.classList.add('slow-connection');
                  }
                }
              }
            `
          }}
        />
      </body>
    </html>
  )
}