/**
 * Performance optimization utilities for Formula PM V3
 * Optimized for construction site conditions with poor connectivity
 */

// Preload critical resources for construction workflows
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return

  // Preload common route chunks
  const criticalRoutes = [
    '/dashboard',
    '/projects', 
    '/scope',
    '/shop-drawings'
  ]

  criticalRoutes.forEach(route => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = route
    document.head.appendChild(link)
  })

  // Preload critical icons and images
  const criticalAssets = [
    '/logos/logo-f.png',
    '/logos/logo-formula.png'
  ]

  criticalAssets.forEach(asset => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = asset
    document.head.appendChild(link)
  })
}

// Optimize for construction site connectivity
export const optimizeForLowConnectivity = () => {
  if (typeof window === 'undefined') return

  // Enable service worker for offline capability
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail for development
    })
  }

  // Optimize network requests
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection && connection.effectiveType && 
        ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) {
      // Reduce image quality for slow connections
      document.documentElement.style.setProperty('--image-quality', '60')
    }
  }
}

// Defer non-critical resources
export const deferNonCritical = () => {
  if (typeof window === 'undefined') return

  // Defer analytics, chat widgets, etc.
  setTimeout(() => {
    // Load non-critical third-party scripts after 3 seconds
    console.log('🚀 Loading non-critical resources...')
  }, 3000)
}

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  if (typeof window === 'undefined') return

  preloadCriticalResources()
  optimizeForLowConnectivity()
  deferNonCritical()
}