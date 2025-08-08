/**
 * Project Context Provider for Formula PM V3
 * Provides project-specific data and operations for fast navigation
 * Optimized for construction workflows with caching and prefetching
 */

'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'

// Project types for construction workflows
export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'delayed'
  progress: number
  startDate: Date
  endDate?: Date
  budget?: number
  spent?: number
  clientId: string
  clientName: string
  address?: string
  teamSize?: number
  projectManager?: string
  createdAt: Date
  updatedAt: Date
}

// Project statistics for dashboard
export interface ProjectStats {
  totalScopeItems: number
  completedScopeItems: number
  pendingTasks: number
  overdueTasks: number
  pendingRFIs: number
  pendingDrawings: number
  pendingChangeOrders: number
  budgetUtilization: number
  scheduleVariance: number
}

// Project notifications for construction workflows
export interface ProjectNotification {
  id: string
  type: 'task' | 'rfi' | 'drawing' | 'change_order' | 'milestone' | 'approval'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}

// Context type
interface ProjectContextType {
  // Current project state
  project: Project | null
  projectStats: ProjectStats | null
  notifications: ProjectNotification[]
  
  // Loading states
  isLoading: boolean
  isError: boolean
  error: Error | null
  
  // Project operations
  switchProject: (projectId: string) => Promise<void>
  refreshProject: () => Promise<void>
  updateProject: (updates: Partial<Project>) => Promise<void>
  
  // Notification management
  markNotificationRead: (notificationId: string) => void
  clearAllNotifications: () => void
  unreadCount: number
  
  // Performance optimization
  prefetchProjectData: (projectId: string) => void
  
  // Construction-specific features
  isProjectActive: boolean
  canEditProject: boolean
  hasActiveWorkflows: boolean
  
  // Tab-specific data counts for badges
  getTabNotificationCount: (tabId: string) => number
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// Custom hook to use project context
export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

// Project data fetching functions
const fetchProject = async (projectId: string): Promise<Project> => {
  const response = await fetch(`/api/projects/${projectId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }
  const data = await response.json()
  
  // Convert date strings to Date objects
  return {
    ...data,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  }
}

const fetchProjectStats = async (projectId: string): Promise<ProjectStats> => {
  const response = await fetch(`/api/projects/${projectId}/stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch project stats')
  }
  return response.json()
}

const fetchProjectNotifications = async (projectId: string): Promise<ProjectNotification[]> => {
  const response = await fetch(`/api/projects/${projectId}/notifications`)
  if (!response.ok) {
    throw new Error('Failed to fetch project notifications')
  }
  const data = await response.json()
  
  // Convert date strings to Date objects
  return data.map((notification: any) => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
  }))
}

// Provider component
interface ProjectProviderProps {
  children: ReactNode
  initialProjectId?: string
}

export function ProjectProvider({ children, initialProjectId }: ProjectProviderProps) {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const queryClient = useQueryClient()
  
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    initialProjectId || null
  )
  
  // Query for current project
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
    refetch: refetchProject
  } = useQuery({
    queryKey: ['project', currentProjectId],
    queryFn: () => fetchProject(currentProjectId!),
    enabled: !!currentProjectId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
  
  // Query for project statistics
  const {
    data: projectStats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ['projectStats', currentProjectId],
    queryFn: () => fetchProjectStats(currentProjectId!),
    enabled: !!currentProjectId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
  
  // Query for project notifications
  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
  } = useQuery({
    queryKey: ['projectNotifications', currentProjectId],
    queryFn: () => fetchProjectNotifications(currentProjectId!),
    enabled: !!currentProjectId && !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
  })
  
  // Mutation for updating project
  const updateProjectMutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      const response = await fetch(`/api/projects/${currentProjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update project')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: ['project', currentProjectId] })
      queryClient.invalidateQueries({ queryKey: ['projectStats', currentProjectId] })
    },
  })
  
  // Switch to a different project
  const switchProject = useCallback(async (projectId: string) => {
    setCurrentProjectId(projectId)
    
    // Prefetch related data
    queryClient.prefetchQuery({
      queryKey: ['projectStats', projectId],
      queryFn: () => fetchProjectStats(projectId),
      staleTime: 2 * 60 * 1000,
    })
    
    queryClient.prefetchQuery({
      queryKey: ['projectNotifications', projectId],
      queryFn: () => fetchProjectNotifications(projectId),
      staleTime: 30 * 1000,
    })
  }, [queryClient])
  
  // Refresh current project data
  const refreshProject = useCallback(async () => {
    await refetchProject()
    if (currentProjectId) {
      queryClient.invalidateQueries({ queryKey: ['projectStats', currentProjectId] })
      queryClient.invalidateQueries({ queryKey: ['projectNotifications', currentProjectId] })
    }
  }, [refetchProject, queryClient, currentProjectId])
  
  // Update project
  const updateProject = useCallback(async (updates: Partial<Project>) => {
    await updateProjectMutation.mutateAsync(updates)
  }, [updateProjectMutation])
  
  // Prefetch project data for performance
  const prefetchProjectData = useCallback((projectId: string) => {
    // Only prefetch if not already cached
    const cachedProject = queryClient.getQueryData(['project', projectId])
    if (!cachedProject) {
      queryClient.prefetchQuery({
        queryKey: ['project', projectId],
        queryFn: () => fetchProject(projectId),
        staleTime: 5 * 60 * 1000,
      })
    }
    
    const cachedStats = queryClient.getQueryData(['projectStats', projectId])
    if (!cachedStats) {
      queryClient.prefetchQuery({
        queryKey: ['projectStats', projectId],
        queryFn: () => fetchProjectStats(projectId),
        staleTime: 2 * 60 * 1000,
      })
    }
  }, [queryClient])
  
  // Notification management
  const markNotificationRead = useCallback((notificationId: string) => {
    // Optimistic update
    queryClient.setQueryData(
      ['projectNotifications', currentProjectId],
      (old: ProjectNotification[] | undefined) => {
        if (!old) return []
        return old.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      }
    )
    
    // API call to persist the change
    fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    }).catch(console.error)
  }, [queryClient, currentProjectId])
  
  const clearAllNotifications = useCallback(() => {
    // Optimistic update
    queryClient.setQueryData(
      ['projectNotifications', currentProjectId],
      (old: ProjectNotification[] | undefined) => {
        if (!old) return []
        return old.map(notification => ({ ...notification, isRead: true }))
      }
    )
    
    // API call to persist the change
    fetch(`/api/projects/${currentProjectId}/notifications/read-all`, {
      method: 'POST',
    }).catch(console.error)
  }, [queryClient, currentProjectId])
  
  // Computed values
  const unreadCount = notifications.filter(n => !n.isRead).length
  const isLoading = isProjectLoading || isStatsLoading || isNotificationsLoading
  const isError = isProjectError
  const error = projectError
  
  // Construction-specific computed values
  const isProjectActive = project?.status === 'active'
  const canEditProject = hasPermission('edit_projects')
  const hasActiveWorkflows = projectStats ? (
    projectStats.pendingRFIs > 0 ||
    projectStats.pendingDrawings > 0 ||
    projectStats.pendingChangeOrders > 0
  ) : false
  
  // Tab-specific notification counts
  const getTabNotificationCount = useCallback((tabId: string): number => {
    const typeMappings: Record<string, ProjectNotification['type'][]> = {
      'tasks': ['task'],
      'drawings': ['drawing', 'approval'],
      'rfis': ['rfi'],
      'change-orders': ['change_order'],
      'milestones': ['milestone'],
      'materials': ['approval'],
    }
    
    const relevantTypes = typeMappings[tabId] || []
    return notifications.filter(n => 
      !n.isRead && relevantTypes.includes(n.type)
    ).length
  }, [notifications])
  
  // Load saved project ID from localStorage on mount
  useEffect(() => {
    if (!currentProjectId && user && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`formula-pm-current-project-${user.id}`)
      if (saved) {
        setCurrentProjectId(saved)
      }
    }
  }, [user, currentProjectId])
  
  // Save current project ID to localStorage
  useEffect(() => {
    if (currentProjectId && user && typeof window !== 'undefined') {
      localStorage.setItem(`formula-pm-current-project-${user.id}`, currentProjectId)
    }
  }, [currentProjectId, user])
  
  const contextValue: ProjectContextType = {
    // State
    project: project || null,
    projectStats: projectStats || null,
    notifications,
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Operations
    switchProject,
    refreshProject,
    updateProject,
    
    // Notifications
    markNotificationRead,
    clearAllNotifications,
    unreadCount,
    
    // Performance
    prefetchProjectData,
    
    // Construction-specific
    isProjectActive,
    canEditProject,
    hasActiveWorkflows,
    getTabNotificationCount,
  }
  
  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  )
}