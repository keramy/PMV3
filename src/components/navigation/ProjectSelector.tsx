'use client'

/**
 * Project Selector Component for Formula PM V3
 * Provides dropdown interface for switching between projects
 * Integrates with existing ProjectProvider for state management
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/providers/AuthProvider'
import { useProject } from '@/providers/ProjectProvider'
import { useApiClient, handleApiResponse } from '@/lib/api-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Building2,
  ChevronDown,
  Search,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectOption {
  id: string
  name: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled' | 'delayed'
  clientName?: string
}

// Fetch user's projects for the selector - moved inside component to use hooks
const useUserProjects = () => {
  const apiClient = useApiClient()
  const { user, loading } = useAuthContext() // Get auth state to prevent race conditions
  
  return useQuery({
    queryKey: ['user-projects'],
    queryFn: async (): Promise<ProjectOption[]> => {
      const response = await apiClient.get('/api/projects?limit=50&sort=updated_at&direction=desc')
      const data = await handleApiResponse(response)
      
      // Handle multiple possible response formats and ensure we return an array
      if (Array.isArray(data)) {
        return data
      }
      if (data?.projects && Array.isArray(data.projects)) {
        return data.projects
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data
      }
      
      console.warn('ProjectSelector: API response is not in expected format:', data)
      return [] // Fallback to empty array to prevent map error
    },
    enabled: !loading && !!user, // Only run when authentication is confirmed
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
}

interface ProjectSelectorProps {
  className?: string
  placeholder?: string
  showSearch?: boolean
}

export function ProjectSelector({ 
  className, 
  placeholder = "Select a project", 
  showSearch = true 
}: ProjectSelectorProps) {
  const { user, loading: authLoading } = useAuthContext()
  const { project, switchProject } = useProject()
  
  // Fetch available projects using authenticated API client
  const { 
    data: projects = [], 
    isLoading, 
    error 
  } = useUserProjects()

  const handleProjectChange = async (projectId: string) => {
    if (projectId === 'all') {
      // Clear project selection - this will need to be handled in ProjectProvider
      // For now, we'll just switch to empty string
      await switchProject('')
    } else {
      await switchProject(projectId)
    }
  }

  const getStatusColor = (status: ProjectOption['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'planning':
        return 'bg-blue-500'
      case 'on-hold':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-gray-500'
      case 'cancelled':
        return 'bg-red-500'
      case 'delayed':
        return 'bg-orange-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: ProjectOption['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
  }

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-red-600", className)}>
        <Building2 className="h-4 w-4" />
        <span>Error loading projects</span>
      </div>
    )
  }

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <Select 
        value={project?.id || 'all'} 
        onValueChange={handleProjectChange}
        disabled={isLoading || authLoading}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <SelectValue placeholder={placeholder}>
              {(isLoading || authLoading) ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>{authLoading ? 'Authenticating...' : 'Loading...'}</span>
                </div>
              ) : project ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      getStatusColor(project.status)
                    )}
                  />
                  <span className="truncate font-medium">{project.name}</span>
                  {project.clientName && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      • {project.clientName}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">All Projects</span>
              )}
            </SelectValue>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </SelectTrigger>
        
        <SelectContent className="w-[300px]">
          {/* All Projects Option */}
          <SelectItem value="all" className="font-medium">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>All Projects</span>
            </div>
          </SelectItem>
          
          {/* Search Input - Future Enhancement */}
          {showSearch && projects.length > 5 && (
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="h-3 w-3" />
                <span>Search feature coming soon...</span>
              </div>
            </div>
          )}
          
          {/* Project List */}
          {projects.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No projects available
            </div>
          ) : (
            projects.map((proj) => (
              <SelectItem key={proj.id} value={proj.id} className="p-3">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        getStatusColor(proj.status)
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{proj.name}</div>
                      {proj.clientName && (
                        <div className="text-xs text-muted-foreground truncate">
                          {proj.clientName}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs flex-shrink-0"
                  >
                    {getStatusLabel(proj.status)}
                  </Badge>
                </div>
              </SelectItem>
            ))
          )}
          
          {/* Recent Projects Section - Future Enhancement */}
          {projects.length > 10 && (
            <div className="border-t pt-2 mt-2">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                Showing {Math.min(projects.length, 50)} projects
              </div>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}