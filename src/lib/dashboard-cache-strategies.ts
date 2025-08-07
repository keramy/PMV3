/**
 * Dashboard Cache Strategies for Construction Sites
 * Offline-first caching with intelligent sync for poor connectivity environments
 */

import { QueryClient } from '@tanstack/react-query'
import { dashboardKeys } from '@/hooks/useDashboardData'
import type { DashboardMetrics, ProjectProgress, ActivityFeedItem } from '@/hooks/useDashboardData'

// Construction site cache configuration
export const CONSTRUCTION_CACHE_CONFIG = {
  // Critical data - cache longer for offline access
  METRICS_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  METRICS_CACHE_TIME: 24 * 60 * 60 * 1000, // 24 hours offline access
  
  // Project data - moderate caching
  PROJECTS_STALE_TIME: 10 * 60 * 1000, // 10 minutes
  PROJECTS_CACHE_TIME: 4 * 60 * 60 * 1000, // 4 hours
  
  // Activity feed - fresh data preferred
  ACTIVITY_STALE_TIME: 2 * 60 * 1000, // 2 minutes
  ACTIVITY_CACHE_TIME: 30 * 60 * 1000, // 30 minutes
  
  // Background refetch intervals
  METRICS_REFETCH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  ACTIVITY_REFETCH_INTERVAL: 2 * 60 * 1000, // 2 minutes
  
  // Network retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const

/**
 * Pre-cache critical dashboard data for offline access
 */
export async function preCacheDashboardData(queryClient: QueryClient, userId: string) {
  try {
    // Pre-fetch critical metrics
    await queryClient.prefetchQuery({
      queryKey: dashboardKeys.metrics(userId),
      queryFn: async (): Promise<DashboardMetrics> => {
        const response = await fetch('/api/dashboard/metrics', {
          headers: { 'x-user-id': userId }
        })
        if (!response.ok) throw new Error('Failed to fetch metrics')
        return response.json()
      },
      staleTime: CONSTRUCTION_CACHE_CONFIG.METRICS_STALE_TIME,
    })

    // Pre-fetch project progress
    await queryClient.prefetchQuery({
      queryKey: dashboardKeys.projects(userId),
      queryFn: async (): Promise<ProjectProgress[]> => {
        const response = await fetch('/api/dashboard/project-progress', {
          headers: { 'x-user-id': userId }
        })
        if (!response.ok) throw new Error('Failed to fetch project progress')
        return response.json()
      },
      staleTime: CONSTRUCTION_CACHE_CONFIG.PROJECTS_STALE_TIME,
    })

    console.log('Dashboard data pre-cached successfully')
  } catch (error) {
    console.error('Failed to pre-cache dashboard data:', error)
  }
}

/**
 * Warm cache with placeholder data for immediate UI response
 */
export function warmDashboardCache(queryClient: QueryClient, userId: string) {
  // Set initial placeholder data
  const placeholderMetrics: DashboardMetrics = {
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    actualSpend: 0,
    onTimeProjects: 0,
    delayedProjects: 0,
    pendingDrawings: 0,
    approvedDrawings: 0,
    openTasks: 0,
    overdueTasks: 0,
    upcomingMilestones: 0,
    safetyIncidents: 0,
    weatherDelayDays: 0,
  }

  queryClient.setQueryData(dashboardKeys.metrics(userId), placeholderMetrics)
  queryClient.setQueryData(dashboardKeys.projects(userId), [])
  queryClient.setQueryData(dashboardKeys.activity(userId), [])
}

/**
 * Intelligent background sync for construction data
 */
export class DashboardSyncManager {
  private queryClient: QueryClient
  private userId: string
  private syncInterval?: NodeJS.Timeout
  private isOnline: boolean = navigator.onLine

  constructor(queryClient: QueryClient, userId: string) {
    this.queryClient = queryClient
    this.userId = userId
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
  }

  startBackgroundSync() {
    // Sync every 5 minutes when online
    if (this.isOnline) {
      this.syncInterval = setInterval(() => {
        this.performBackgroundSync()
      }, CONSTRUCTION_CACHE_CONFIG.METRICS_REFETCH_INTERVAL)
    }
  }

  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  private async performBackgroundSync() {
    if (!this.isOnline) return

    try {
      // Background refetch critical data
      await Promise.allSettled([
        this.queryClient.refetchQueries({
          queryKey: dashboardKeys.metrics(this.userId)
        }),
        this.queryClient.refetchQueries({
          queryKey: dashboardKeys.activity(this.userId)
        })
      ])

      console.log('Background sync completed')
    } catch (error) {
      console.error('Background sync failed:', error)
    }
  }

  private handleOnline() {
    this.isOnline = true
    console.log('Connection restored - resuming background sync')
    this.startBackgroundSync()
    
    // Trigger immediate sync when coming back online
    this.performBackgroundSync()
  }

  private handleOffline() {
    this.isOnline = false
    console.log('Connection lost - stopping background sync')
    this.stopBackgroundSync()
  }

  destroy() {
    this.stopBackgroundSync()
    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
  }
}

/**
 * Cache invalidation strategies for data consistency
 */
export function invalidateRelatedDashboardData(queryClient: QueryClient, userId: string, event: {
  type: 'project_updated' | 'task_completed' | 'drawing_approved' | 'milestone_reached'
  projectId?: string
}) {
  switch (event.type) {
    case 'project_updated':
      // Invalidate project-related data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.projects(userId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics(userId) })
      break
      
    case 'task_completed':
      // Invalidate task and activity data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(userId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics(userId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.tasks(userId) })
      break
      
    case 'drawing_approved':
      // Invalidate drawing metrics and activity
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics(userId) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.activity(userId) })
      break
      
    case 'milestone_reached':
      // Invalidate all project-related data
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      break
  }
}

/**
 * Optimistic updates for construction workflows
 */
export function performOptimisticUpdate(queryClient: QueryClient, userId: string, update: {
  type: 'task_completion' | 'metric_increment'
  data: any
}) {
  switch (update.type) {
    case 'task_completion':
      // Optimistically update task counts
      queryClient.setQueryData(
        dashboardKeys.metrics(userId),
        (old: DashboardMetrics | undefined) => {
          if (!old) return old
          return {
            ...old,
            openTasks: Math.max(0, old.openTasks - 1),
          }
        }
      )
      
      // Add optimistic activity item
      queryClient.setQueryData(
        dashboardKeys.activity(userId),
        (old: ActivityFeedItem[] | undefined) => {
          if (!old) return old
          const newActivity: ActivityFeedItem = {
            id: `temp-${Date.now()}`,
            type: 'task_completed',
            project_id: update.data.projectId,
            project_name: update.data.projectName,
            title: `Task completed: ${update.data.taskName}`,
            description: `${update.data.taskName} has been marked as completed`,
            user_name: update.data.userName,
            timestamp: new Date().toISOString(),
            priority: 'medium',
          }
          return [newActivity, ...old.slice(0, 19)] // Keep only latest 20
        }
      )
      break
  }
}

/**
 * Network-aware query options for construction sites
 */
export function getNetworkAwareQueryOptions() {
  const isOnline = navigator.onLine
  
  return {
    // More aggressive retries when offline
    retry: isOnline ? 2 : 5,
    retryDelay: isOnline ? CONSTRUCTION_CACHE_CONFIG.RETRY_DELAY : CONSTRUCTION_CACHE_CONFIG.RETRY_DELAY * 2,
    
    // Longer stale times when offline
    staleTime: isOnline ? 
      CONSTRUCTION_CACHE_CONFIG.METRICS_STALE_TIME : 
      CONSTRUCTION_CACHE_CONFIG.METRICS_STALE_TIME * 4,
    
    // Network mode based on connectivity
    networkMode: isOnline ? 'online' : 'offlineFirst',
    
    // Background refetch only when online
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  } as const
}

/**
 * Local storage backup for critical data
 */
export class DashboardLocalStorage {
  private static readonly STORAGE_KEY = 'formulapm_dashboard_backup'
  private static readonly STORAGE_VERSION = 1
  
  static saveDashboardBackup(userId: string, data: {
    metrics?: DashboardMetrics
    projects?: ProjectProgress[]
    timestamp: number
  }) {
    try {
      const backup = {
        version: this.STORAGE_VERSION,
        userId,
        data,
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backup))
    } catch (error) {
      console.error('Failed to save dashboard backup:', error)
    }
  }
  
  static loadDashboardBackup(userId: string): {
    metrics?: DashboardMetrics
    projects?: ProjectProgress[]
    timestamp: number
  } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      
      const backup = JSON.parse(stored)
      if (backup.version !== this.STORAGE_VERSION || backup.userId !== userId) {
        return null
      }
      
      // Check if backup is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000
      if (Date.now() - backup.data.timestamp > maxAge) {
        return null
      }
      
      return backup.data
    } catch (error) {
      console.error('Failed to load dashboard backup:', error)
      return null
    }
  }
  
  static clearDashboardBackup() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear dashboard backup:', error)
    }
  }
}

/**
 * Service worker integration for offline caching
 */
export function registerDashboardServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw-dashboard.js').then(
      (registration) => {
        console.log('Dashboard service worker registered:', registration.scope)
      },
      (error) => {
        console.log('Dashboard service worker registration failed:', error)
      }
    )
  }
}