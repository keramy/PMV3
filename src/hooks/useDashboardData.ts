/**
 * Construction Dashboard Data Hooks
 * Optimized React Query hooks for construction project dashboards
 */

'use client'

import { useQuery, useQueries, keepPreviousData } from '@tanstack/react-query'
import { usePermissions } from '@/hooks/usePermissions'
import type { 
  Project, 
  Task, 
  ScopeItem, 
  ShopDrawing, 
  RFI, 
  ChangeOrder,
  AppUserProfile
} from '@/types/database'
import type { Permission } from '@/types/auth'

// Temporary type for missing Milestone table
type Milestone = {
  id: string
  name: string
  due_date: string
  completed_at?: string
  status: string
}

// Construction-specific dashboard metrics
export interface DashboardMetrics {
  activeProjects: number
  completedProjects: number
  totalBudget: number
  actualSpend: number
  onTimeProjects: number
  delayedProjects: number
  pendingDrawings: number
  approvedDrawings: number
  openTasks: number
  overdueTasks: number
  upcomingMilestones: number
  safetyIncidents: number
  weatherDelayDays: number
}

export interface ProjectProgress {
  id: string
  name: string
  completion_percentage: number
  budget_utilization: number
  days_behind_schedule: number
  critical_path_status: 'on_track' | 'at_risk' | 'delayed'
}

export interface ActivityFeedItem {
  id: string
  type: 'task_completed' | 'drawing_approved' | 'milestone_reached' | 'change_order' | 'rfi_submitted'
  project_id: string
  project_name: string
  title: string
  description: string
  user_name: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Query key factories for consistent caching
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: (userId: string) => [...dashboardKeys.all, 'metrics', userId] as const,
  projects: (userId: string) => [...dashboardKeys.all, 'projects', userId] as const,
  tasks: (userId: string, projectId?: string) => [...dashboardKeys.all, 'tasks', userId, projectId] as const,
  activity: (userId: string) => [...dashboardKeys.all, 'activity', userId] as const,
  weather: () => [...dashboardKeys.all, 'weather'] as const,
}

// Main dashboard metrics hook with role-based data
export function useDashboardMetrics(userProfile: AppUserProfile | null) {
  return useQuery({
    queryKey: dashboardKeys.metrics(userProfile?.id || ''),
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!userProfile) throw new Error('User profile required')
      
      const response = await fetch('/api/dashboard/metrics', {
        headers: { 'x-user-id': userProfile.id }
      })
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    },
    enabled: !!userProfile,
    staleTime: 2 * 60 * 1000, // 2 minutes for real-time construction data
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    placeholderData: keepPreviousData,
  })
}

// Project progress tracking for dashboard overview
export function useProjectProgress(userProfile: AppUserProfile | null) {
  return useQuery({
    queryKey: dashboardKeys.projects(userProfile?.id || ''),
    queryFn: async (): Promise<ProjectProgress[]> => {
      if (!userProfile) throw new Error('User profile required')
      
      const response = await fetch('/api/dashboard/project-progress', {
        headers: { 'x-user-id': userProfile.id }
      })
      if (!response.ok) throw new Error('Failed to fetch project progress')
      return response.json()
    },
    enabled: !!userProfile,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    placeholderData: keepPreviousData,
  })
}

// Activity feed with real-time updates
export function useActivityFeed(userProfile: AppUserProfile | null, limit: number = 20) {
  return useQuery({
    queryKey: [...dashboardKeys.activity(userProfile?.id || ''), limit],
    queryFn: async (): Promise<ActivityFeedItem[]> => {
      if (!userProfile) throw new Error('User profile required')
      
      const response = await fetch(`/api/dashboard/activity?limit=${limit}`, {
        headers: { 'x-user-id': userProfile.id }
      })
      if (!response.ok) throw new Error('Failed to fetch activity')
      return response.json()
    },
    enabled: !!userProfile,
    staleTime: 1 * 60 * 1000, // 1 minute for fresh activity
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    placeholderData: keepPreviousData,
  })
}

// Critical tasks requiring attention
export function useCriticalTasks(userProfile: AppUserProfile | null) {
  return useQuery({
    queryKey: [...dashboardKeys.tasks(userProfile?.id || ''), 'critical'],
    queryFn: async (): Promise<Task[]> => {
      if (!userProfile) throw new Error('User profile required')
      
      const response = await fetch('/api/dashboard/critical-tasks', {
        headers: { 'x-user-id': userProfile.id }
      })
      if (!response.ok) throw new Error('Failed to fetch critical tasks')
      return response.json()
    },
    enabled: !!userProfile,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

// Weather data for construction planning
export function useWeatherData(location?: { lat: number; lng: number }) {
  return useQuery({
    queryKey: [...dashboardKeys.weather(), location],
    queryFn: async () => {
      if (!location) throw new Error('Location required for weather data')
      
      // Using a weather API service
      const response = await fetch(`/api/weather?lat=${location.lat}&lng=${location.lng}`)
      if (!response.ok) throw new Error('Failed to fetch weather data')
      return response.json()
    },
    enabled: !!location,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    retry: 2, // Weather data is nice-to-have
  })
}

// Multi-query hook for complete dashboard data
export function useDashboardData(userProfile: AppUserProfile | null) {
  const queries = useQueries({
    queries: [
      {
        queryKey: dashboardKeys.metrics(userProfile?.id || ''),
        queryFn: async (): Promise<DashboardMetrics> => {
          if (!userProfile) throw new Error('User profile required')
          
          const response = await fetch('/api/dashboard/metrics', {
            headers: { 'x-user-id': userProfile.id }
          })
          if (!response.ok) throw new Error('Failed to fetch metrics')
          return response.json()
        },
        enabled: !!userProfile,
        staleTime: 2 * 60 * 1000,
      },
      {
        queryKey: dashboardKeys.projects(userProfile?.id || ''),
        queryFn: async (): Promise<ProjectProgress[]> => {
          if (!userProfile) throw new Error('User profile required')
          
          const response = await fetch('/api/dashboard/project-progress', {
            headers: { 'x-user-id': userProfile.id }
          })
          if (!response.ok) throw new Error('Failed to fetch project progress')
          return response.json()
        },
        enabled: !!userProfile,
        staleTime: 3 * 60 * 1000,
      },
      {
        queryKey: dashboardKeys.activity(userProfile?.id || ''),
        queryFn: async (): Promise<ActivityFeedItem[]> => {
          if (!userProfile) throw new Error('User profile required')
          
          const response = await fetch('/api/dashboard/activity?limit=10', {
            headers: { 'x-user-id': userProfile.id }
          })
          if (!response.ok) throw new Error('Failed to fetch activity')
          return response.json()
        },
        enabled: !!userProfile,
        staleTime: 1 * 60 * 1000,
      },
    ],
  })

  return {
    metrics: queries[0],
    projects: queries[1], 
    activity: queries[2],
    isLoading: queries.some(q => q.isLoading),
    error: queries.find(q => q.error)?.error || null,
  }
}

// Permission-based data filtering
export function useRoleSpecificData(userProfile: AppUserProfile | null) {
  const { hasPermission } = usePermissions()
  
  const hasFinanceAccess = hasPermission('view_all_costs')
  const hasAdminAccess = hasPermission('manage_users')  
  const hasProjectManagement = hasPermission('create_projects')

  return useQuery({
    queryKey: ['role-data', userProfile?.id, userProfile?.permissions],
    queryFn: async () => {
      if (!userProfile) throw new Error('User profile required')
      
      const params = new URLSearchParams()
      if (hasFinanceAccess) params.append('include_finance', 'true')
      if (hasAdminAccess) params.append('include_admin', 'true')
      if (hasProjectManagement) params.append('include_pm', 'true')
      
      const response = await fetch(`/api/dashboard/role-data?${params}`, {
        headers: { 'x-user-id': userProfile.id }
      })
      if (!response.ok) throw new Error('Failed to fetch role data')
      return response.json()
    },
    enabled: !!userProfile,
    staleTime: 5 * 60 * 1000,
  })
}

// Construction site safety metrics
export function useSafetyMetrics(userProfile: AppUserProfile | null) {
  return useQuery({
    queryKey: ['safety-metrics', userProfile?.id],
    queryFn: async () => {
      if (!userProfile) throw new Error('User profile required')
      
      const response = await fetch('/api/dashboard/safety-metrics', {
        headers: { 'x-user-id': userProfile.id }
      })
      if (!response.ok) throw new Error('Failed to fetch safety metrics')
      return response.json()
    },
    enabled: !!userProfile && !!(
      (userProfile.permissions_bitwise && (userProfile.permissions_bitwise & 2) > 0) || // VIEW_ASSIGNED_PROJECTS
      (userProfile.permissions_bitwise && (userProfile.permissions_bitwise & 1) > 0)    // Admin access
    ),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  })
}