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
  }, [queryClient])\n  \n  // Refresh current project data\n  const refreshProject = useCallback(async () => {\n    await refetchProject()\n    if (currentProjectId) {\n      queryClient.invalidateQueries({ queryKey: ['projectStats', currentProjectId] })\n      queryClient.invalidateQueries({ queryKey: ['projectNotifications', currentProjectId] })\n    }\n  }, [refetchProject, queryClient, currentProjectId])\n  \n  // Update project\n  const updateProject = useCallback(async (updates: Partial<Project>) => {\n    await updateProjectMutation.mutateAsync(updates)\n  }, [updateProjectMutation])\n  \n  // Prefetch project data for performance\n  const prefetchProjectData = useCallback((projectId: string) => {\n    // Only prefetch if not already cached\n    const cachedProject = queryClient.getQueryData(['project', projectId])\n    if (!cachedProject) {\n      queryClient.prefetchQuery({\n        queryKey: ['project', projectId],\n        queryFn: () => fetchProject(projectId),\n        staleTime: 5 * 60 * 1000,\n      })\n    }\n    \n    const cachedStats = queryClient.getQueryData(['projectStats', projectId])\n    if (!cachedStats) {\n      queryClient.prefetchQuery({\n        queryKey: ['projectStats', projectId],\n        queryFn: () => fetchProjectStats(projectId),\n        staleTime: 2 * 60 * 1000,\n      })\n    }\n  }, [queryClient])\n  \n  // Notification management\n  const markNotificationRead = useCallback((notificationId: string) => {\n    // Optimistic update\n    queryClient.setQueryData(\n      ['projectNotifications', currentProjectId],\n      (old: ProjectNotification[] | undefined) => {\n        if (!old) return []\n        return old.map(notification =>\n          notification.id === notificationId\n            ? { ...notification, isRead: true }\n            : notification\n        )\n      }\n    )\n    \n    // API call to persist the change\n    fetch(`/api/notifications/${notificationId}/read`, {\n      method: 'POST',\n    }).catch(console.error)\n  }, [queryClient, currentProjectId])\n  \n  const clearAllNotifications = useCallback(() => {\n    // Optimistic update\n    queryClient.setQueryData(\n      ['projectNotifications', currentProjectId],\n      (old: ProjectNotification[] | undefined) => {\n        if (!old) return []\n        return old.map(notification => ({ ...notification, isRead: true }))\n      }\n    )\n    \n    // API call to persist the change\n    fetch(`/api/projects/${currentProjectId}/notifications/read-all`, {\n      method: 'POST',\n    }).catch(console.error)\n  }, [queryClient, currentProjectId])\n  \n  // Computed values\n  const unreadCount = notifications.filter(n => !n.isRead).length\n  const isLoading = isProjectLoading || isStatsLoading || isNotificationsLoading\n  const isError = isProjectError\n  const error = projectError\n  \n  // Construction-specific computed values\n  const isProjectActive = project?.status === 'active'\n  const canEditProject = hasPermission('edit_projects')\n  const hasActiveWorkflows = projectStats ? (\n    projectStats.pendingRFIs > 0 ||\n    projectStats.pendingDrawings > 0 ||\n    projectStats.pendingChangeOrders > 0\n  ) : false\n  \n  // Tab-specific notification counts\n  const getTabNotificationCount = useCallback((tabId: string): number => {\n    const typeMappings: Record<string, ProjectNotification['type'][]> = {\n      'tasks': ['task'],\n      'drawings': ['drawing', 'approval'],\n      'rfis': ['rfi'],\n      'change-orders': ['change_order'],\n      'milestones': ['milestone'],\n      'materials': ['approval'],\n    }\n    \n    const relevantTypes = typeMappings[tabId] || []\n    return notifications.filter(n => \n      !n.isRead && relevantTypes.includes(n.type)\n    ).length\n  }, [notifications])\n  \n  // Load saved project ID from localStorage on mount\n  useEffect(() => {\n    if (!currentProjectId && user && typeof window !== 'undefined') {\n      const saved = localStorage.getItem(`formula-pm-current-project-${user.id}`)\n      if (saved) {\n        setCurrentProjectId(saved)\n      }\n    }\n  }, [user, currentProjectId])\n  \n  // Save current project ID to localStorage\n  useEffect(() => {\n    if (currentProjectId && user && typeof window !== 'undefined') {\n      localStorage.setItem(`formula-pm-current-project-${user.id}`, currentProjectId)\n    }\n  }, [currentProjectId, user])\n  \n  const contextValue: ProjectContextType = {\n    // State\n    project: project || null,\n    projectStats: projectStats || null,\n    notifications,\n    \n    // Loading states\n    isLoading,\n    isError,\n    error,\n    \n    // Operations\n    switchProject,\n    refreshProject,\n    updateProject,\n    \n    // Notifications\n    markNotificationRead,\n    clearAllNotifications,\n    unreadCount,\n    \n    // Performance\n    prefetchProjectData,\n    \n    // Construction-specific\n    isProjectActive,\n    canEditProject,\n    hasActiveWorkflows,\n    getTabNotificationCount,\n  }\n  \n  return (\n    <ProjectContext.Provider value={contextValue}>\n      {children}\n    </ProjectContext.Provider>\n  )\n}"