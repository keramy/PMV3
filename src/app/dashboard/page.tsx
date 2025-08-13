'use client'

import { Metadata } from 'next'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RoleSpecificDashboard } from '@/components/dashboard/RoleSpecificDashboard'
import { useAuth } from '@/hooks/useAuth'
import { 
  DashboardSyncManager, 
  preCacheDashboardData, 
  warmDashboardCache,
  DashboardLocalStorage
} from '@/lib/dashboard-cache-strategies'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle } from 'lucide-react'

// Note: We can't use export const metadata in client components
// Move metadata to layout.tsx if needed

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const queryClient = useQueryClient()
  
  // Debug logging for dashboard
  useEffect(() => {
    console.log('🔍 Dashboard Page - Auth State:', {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, email: profile.email } : null,
      loading,
      isAuthenticated: !!user
    })
  }, [user, profile, loading])

  // Initialize dashboard caching and sync when user is authenticated
  useEffect(() => {
    if (!profile?.id) return

    let syncManager: DashboardSyncManager | null = null

    const initializeDashboard = async () => {
      try {
        // Warm cache with placeholder data for immediate UI response
        warmDashboardCache(queryClient, profile.id)

        // Try to load from local storage backup first
        const backup = DashboardLocalStorage.loadDashboardBackup(profile.id)
        if (backup) {
          console.log('Loaded dashboard data from local storage backup')
          // Could populate cache with backup data here
        }

        // Pre-cache critical data for offline access
        await preCacheDashboardData(queryClient, profile.id)

        // Start background sync manager for real-time updates
        syncManager = new DashboardSyncManager(queryClient, profile.id)
        syncManager.startBackgroundSync()

      } catch (error) {
        console.error('Failed to initialize dashboard:', error)
      }
    }

    initializeDashboard()

    // Cleanup on unmount or user change
    return () => {
      syncManager?.destroy()
    }
  }, [profile?.id, queryClient])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Loading animation background */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full filter blur-3xl animate-pulse" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Header skeleton */}
          <div className="mb-8 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Metrics cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state with debug info
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        {/* Error state background */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access your construction dashboard
            </p>
            
            {/* Debug info */}
            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded mb-4">
              <p>Debug Info:</p>
              <p>User: {user ? `${user.email} (${user.id})` : 'null'}</p>
              <p>Profile: {profile ? `${profile.email} (${profile.id})` : 'null'}</p>
              <p>Loading: {loading.toString()}</p>
            </div>
            
            <a 
              href="/login" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Sign In
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full filter blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <RoleSpecificDashboard userProfile={profile} />
      </div>
    </div>
  )
}