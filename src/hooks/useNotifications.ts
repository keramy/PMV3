/**
 * Notification Hooks for Formula PM V3
 * React Query hooks for notification management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@/providers/AuthProvider'
import { useApiClient, handleApiResponse } from '@/lib/api-client'
import type {
  NotificationListResponse,
  NotificationFilters,
  NotificationPreferences,
  MarkAsReadRequest,
  MarkAsReadResponse
} from '@/types/notifications'

// Fetch notifications
export function useNotifications(filters?: NotificationFilters) {
  const { user } = useAuthContext()
  const apiClient = useApiClient()
  
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

      const response = await apiClient.get(`/api/notifications?${params.toString()}`)
      return handleApiResponse(response)
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000 // Consider data stale after 10 seconds
  })
}

// Get unread count only (for bell icon badge)
export function useUnreadNotificationCount() {
  const { user } = useAuthContext()
  const apiClient = useApiClient()
  
  return useQuery({
    queryKey: ['notifications', { unread_only: true, limit: 1 }],
    queryFn: async (): Promise<number> => {
      const response = await apiClient.get('/api/notifications?unread_only=true&limit=1')
      const data: NotificationListResponse = await handleApiResponse(response)
      return data.unread_count
    },
    enabled: !!user,
    refetchInterval: 15000, // Check for new notifications every 15 seconds
    staleTime: 5000
  })
}

// Get recent notifications (for dropdown)
export function useRecentNotifications() {
  const { user } = useAuthContext()
  const apiClient = useApiClient()
  
  return useQuery({
    queryKey: ['notifications', { limit: 10 }],
    queryFn: async (): Promise<NotificationListResponse> => {
      const response = await apiClient.get('/api/notifications?limit=10')
      return handleApiResponse(response)
    },
    enabled: !!user,
    refetchInterval: 20000,
    staleTime: 10000
  })
}

// Mark notifications as read
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient()
  const apiClient = useApiClient()
  
  return useMutation({
    mutationFn: async (data: MarkAsReadRequest): Promise<MarkAsReadResponse> => {
      const response = await apiClient.patch('/api/notifications', data)
      return handleApiResponse(response)
    },
    onSuccess: () => {
      // Invalidate all notification queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

// Fetch notification preferences
export function useNotificationPreferences() {
  const { user } = useAuthContext()
  const apiClient = useApiClient()
  
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async (): Promise<NotificationPreferences> => {
      const response = await apiClient.get('/api/notifications/preferences')
      return handleApiResponse(response)
    },
    enabled: !!user
  })
}

// Update notification preferences
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()
  const apiClient = useApiClient()
  
  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
      const response = await apiClient.put('/api/notifications/preferences', preferences)
      return handleApiResponse(response)
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