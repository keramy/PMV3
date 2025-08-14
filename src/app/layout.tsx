import type { Metadata, Viewport } from 'next'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'

export const metadata: Metadata = {
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
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}