/**
 * Notification Hooks for Formula PM V3
 * React Query hooks for notification management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import type {
  NotificationListResponse,
  NotificationFilters,
  NotificationPreferences,
  MarkAsReadRequest,
  MarkAsReadResponse
} from '@/types/notifications'

// Fetch notifications
export function useNotifications(filters?: NotificationFilters) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async (): Promise<NotificationListResponse> => {
      const params = new URLSearchParams()
      
      if (filters?.type && filters.type.length > 0) {
        params.set('type', filters.type.join(','))
      }
      if (filters?.unread_only) {
        params.set('unread_only', 'true')
      }
      if (filters?.page) {
        params.set('page', filters.page.toString())
      }
      if (filters?.limit) {
        params.set('limit', filters.limit.toString())
      }

      const response = await fetch(`/api/notifications?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      
      return response.json()
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000 // Consider data stale after 10 seconds
  })
}

// Get unread count only (for bell icon badge)
export function useUnreadNotificationCount() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['notifications', { unread_only: true, limit: 1 }],
    queryFn: async (): Promise<number> => {
      const response = await fetch('/api/notifications?unread_only=true&limit=1')
      if (!response.ok) {
        throw new Error('Failed to fetch notification count')
      }
      
      const data: NotificationListResponse = await response.json()
      return data.unread_count
    },
    enabled: !!user,
    refetchInterval: 15000, // Check for new notifications every 15 seconds
    staleTime: 5000
  })
}

// Get recent notifications (for dropdown)
export function useRecentNotifications() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['notifications', { limit: 10 }],
    queryFn: async (): Promise<NotificationListResponse> => {
      const response = await fetch('/api/notifications?limit=10')
      if (!response.ok) {
        throw new Error('Failed to fetch recent notifications')
      }
      
      return response.json()
    },
    enabled: !!user,
    refetchInterval: 20000,
    staleTime: 10000
  })
}

// Mark notifications as read
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: MarkAsReadRequest): Promise<MarkAsReadResponse> => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate all notification queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

// Fetch notification preferences
export function useNotificationPreferences() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async (): Promise<NotificationPreferences> => {
      const response = await fetch('/api/notifications/preferences')
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences')
      }
      
      return response.json()
    },
    enabled: !!user
  })
}

// Update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    }
  })
}

// Custom hooks for specific notification actions
export function useMarkAllAsRead() {
  const markAsRead = useMarkNotificationsAsRead()
  
  return () => markAsRead.mutate({}) // Empty object means mark all as read
}

export function useMarkSpecificAsRead() {
  const markAsRead = useMarkNotificationsAsRead()
  
  return (notificationIds: string[]) => 
    markAsRead.mutate({ notification_ids: notificationIds })
}