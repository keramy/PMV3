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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  // Error state
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access your construction dashboard
            </p>
            <a 
              href="/auth/signin" 
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoleSpecificDashboard userProfile={profile} />
      </div>
    </div>
  )
}