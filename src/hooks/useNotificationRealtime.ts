/**
 * Real-time Notification Updates Hook
 * Listens for notification changes via Supabase Realtime
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import { useAuthContext } from '@/providers/AuthProvider'

export function useNotificationRealtime() {
  const queryClient = useQueryClient()
  const supabase = getSupabaseSingleton()
  const { user } = useAuthContext()

  useEffect(() => {
    if (!user) return

    // Listen for notification changes for the current user
    const notificationChannel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload)
          
          // Invalidate notification queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          
          // Show a subtle toast notification (optional - you can add this later)
          // toast.info('New notification received')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification updated:', payload)
          
          // Invalidate notification queries
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(notificationChannel)
    }
  }, [user, queryClient, supabase])
}

// Hook to enable real-time updates in specific components
export function useEnableNotificationRealtime() {
  useNotificationRealtime()
}