/**
 * Enhanced App Shell Component - Construction-Optimized Layout
 * Features: Performance optimization, responsive design for construction sites,
 * touch-friendly navigation, accessibility features, and mobile-first approach
 */

'use client'

import { useEffect, useState } from 'react'
import { MainNav } from './MainNav'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  showNav?: boolean
  fullWidth?: boolean
  className?: string
  suppressHydrationWarning?: boolean
}

export function AppShell({ 
  children, 
  showNav = true, 
  fullWidth = false,
  className,
  suppressHydrationWarning = false
}: AppShellProps) {
  const { 
    preferences, 
    isDarkMode, 
    shouldReduceMotion, 
    isMobileOptimized 
  } = useUserPreferences()
  
  const [isClient, setIsClient] = useState(false)
  const [viewportHeight, setViewportHeight] = useState<number>()
  
  // Handle client-side hydration and viewport
  useEffect(() => {
    setIsClient(true)
    
    // Set initial viewport height for mobile devices
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
      setViewportHeight(window.innerHeight)
    }
    
    setVH()
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)
    
    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
    }
  }, [])
  
  // Apply theme and accessibility preferences
  useEffect(() => {
    if (!isClient) return
    
    const root = document.documentElement
    
    // Apply theme
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Apply density preference
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious')
    root.classList.add(`density-${preferences.appearance.density}`)
    
    // Apply accessibility preferences
    if (preferences.accessibility.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    if (shouldReduceMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
    
    if (preferences.accessibility.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }
    
    // Apply construction optimizations
    if (isMobileOptimized) {
      root.classList.add('mobile-optimized')
    } else {
      root.classList.remove('mobile-optimized')
    }
    
  }, [isClient, isDarkMode, preferences, shouldReduceMotion, isMobileOptimized])
  
  // Performance: Prevent layout shift during hydration
  if (!isClient && suppressHydrationWarning) {
    return (
      <div className="min-h-screen bg-background animate-pulse" 
           suppressHydrationWarning>
        <div className="h-14 bg-muted" />
        <div className="container mx-auto p-4">
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={cn(
        'min-h-screen bg-background text-foreground',
        'construction-app-shell',
        {
          // Mobile optimizations for construction sites
          'touch-manipulation': isMobileOptimized,
          'select-none': isMobileOptimized, // Prevent text selection on touch
        },
        className
      )}
      style={{
        // Use CSS custom property for viewport height on mobile
        minHeight: viewportHeight ? `${viewportHeight}px` : '100vh'
      }}
    >
      {/* Top Navigation */}
      {showNav && (
        <header className={cn(
          'sticky top-0 z-50 w-full border-b',
          'bg-background/95 backdrop-blur-sm',
          'supports-[backdrop-filter]:bg-background/80',
          'safe-top', // Handle device safe areas
          // Enhanced touch targets for mobile
          isMobileOptimized && 'min-h-[60px]'
        )}>
          <div className={cn(
            'flex h-14 items-center px-4',
            isMobileOptimized && 'h-[60px]',
            fullWidth ? 'w-full' : 'container mx-auto'
          )}>
            <MainNav />
          </div>
        </header>
      )}
      
      {/* Main Content Area */}
      <main className={cn(
        'flex-1',
        // Container management
        fullWidth ? 'w-full' : 'container mx-auto',
        // Safe area handling for mobile devices
        'safe-left safe-right',
        // Bottom padding to account for mobile navigation
        'pb-safe-mobile',
        // Performance optimizations
        'transform-gpu', // Force hardware acceleration
        shouldReduceMotion ? 'motion-reduce:transition-none' : 'transition-all duration-200'
      )}>
        {/* Performance optimization: Use will-change for smooth scrolling */}
        <div className={cn(
          'construction-content-area',
          isMobileOptimized && 'will-change-scroll'
        )}>
          {children}
        </div>
      </main>
      
      {/* Accessibility: Skip to main content link */}
      <a 
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
          'bg-primary text-primary-foreground px-4 py-2 rounded-md',
          'z-50 mobile-touch-target'
        )}
      >
        Skip to main content
      </a>
      
      {/* Construction site status indicator (for offline/online status) */}
      {isClient && (
        <div className="fixed bottom-4 right-4 z-40">
          <NetworkStatusIndicator />
        </div>
      )}
    </div>
  )
}

// Network status indicator for construction sites with poor connectivity
function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string>()
  
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    const updateConnectionType = () => {
      // @ts-ignore - NetworkInformation API
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
      if (connection) {
        setConnectionType(connection.effectiveType)
      }
    }
    
    updateOnlineStatus()
    updateConnectionType()
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // @ts-ignore - NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      connection.addEventListener('change', updateConnectionType)
    }
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      if (connection) {
        connection.removeEventListener('change', updateConnectionType)
      }
    }
  }, [])
  
  // Only show indicator when offline or slow connection
  if (isOnline && (!connectionType || connectionType === '4g' || connectionType === '3g')) {
    return null
  }
  
  return (
    <div className={cn(
      'flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium',
      'border shadow-sm backdrop-blur-sm transition-all duration-200',
      {
        'bg-red-50 text-red-700 border-red-200': !isOnline,
        'bg-yellow-50 text-yellow-700 border-yellow-200': isOnline && connectionType === 'slow-2g',
        'bg-orange-50 text-orange-700 border-orange-200': isOnline && connectionType === '2g',
      }
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        {
          'bg-red-500 animate-pulse': !isOnline,
          'bg-yellow-500': isOnline && (connectionType === 'slow-2g' || connectionType === '2g'),
        }
      )} />
      <span>
        {!isOnline ? 'Offline' : `${connectionType?.toUpperCase()} Connection`}
      </span>
    </div>
  )
}