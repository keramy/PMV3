'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useAuth } from '@/hooks/useAuth-fixed'
import { 
  DashboardSyncManager, 
  preCacheDashboardData, 
  warmDashboardCache,
  DashboardLocalStorage
} from '@/lib/dashboard-cache-strategies'

// Note: We can't use export const metadata in client components
// Move metadata to layout.tsx if needed

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const queryClient = useQueryClient()
  
  // Debug logging for dashboard
  useEffect(() => {
    console.log('🔍 DEADLOCK-FIXED DASHBOARD - Auth State:', {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, email: profile.email } : null,
      loading,
      isAuthenticated: !!user
    })
  }, [user, profile, loading])

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

  // Redirect to login if not authenticated
  if (!user) {
    window.location.href = '/login'
    return null
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