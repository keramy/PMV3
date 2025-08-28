'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useAuthContext } from '@/providers/AuthProvider'
import { 
  DashboardSyncManager, 
  preCacheDashboardData, 
  warmDashboardCache,
  DashboardLocalStorage
} from '@/lib/dashboard-cache-strategies'

// Note: We can't use export const metadata in client components
// Move metadata to layout.tsx if needed

export default function DashboardPage() {
  const { user, profile, loading } = useAuthContext()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  // Debug logging for dashboard
  useEffect(() => {
    console.log('🔍 DEADLOCK-FIXED DASHBOARD - Auth State:', {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, email: profile.email } : null,
      loading,
      isAuthenticated: !!user
    })
  }, [user, profile, loading])

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (!loading) return // Only set timeout when actually loading
    
    const timeoutId = setTimeout(() => {
      if (loading && !user) {
        console.error('🚨 Dashboard: Auth loading timeout (5s) - forcing redirect to login')
        // Force clear any stuck authentication state
        router.push('/login')
      }
    }, 5000) // 5 second timeout
    
    return () => clearTimeout(timeoutId)
  }, [loading, user, router])

  // Loading state - checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication (deadlock-fixed)...</p>
        </div>
      </div>
    )
  }

  // Show auth error if not authenticated (middleware should handle redirects)
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Authentication required. Redirecting...</p>
        </div>
      </div>
    )
  }

  // Pass auth state down to Dashboard to avoid double auth hooks
  return (
    <Dashboard 
      user={user} 
      profile={profile} 
      loading={loading} 
    />
  )
}