'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/providers/AuthProvider'
import { ProjectTabs, type TabCounts } from './components/project-tabs'
import { ProjectOverview } from './components/project-overview'
import { ProjectScope } from './components/project-scope'
import { ProjectDrawings } from './components/project-drawings'
import { ProjectMaterials } from './components/project-materials'
import { ProjectTasks } from './components/project-tasks'

interface ProjectWorkspacePageProps {
  params: Promise<{ id: string }>
}

export default function ProjectWorkspacePage({ params }: ProjectWorkspacePageProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [projectId, setProjectId] = useState<string | null>(null)
  const { profile } = useAuthContext()
  
  // Unwrap params and set project ID
  React.useEffect(() => {
    const unwrapParams = async () => {
      try {
        const { id } = await params
        setProjectId(id)
      } catch (error) {
        console.error('Error unwrapping params:', error)
        setProjectId(null)
      }
    }
    unwrapParams()
  }, [params])

  // Fetch project data from API
  const { data: projectResponse, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetch(`/api/projects/${projectId}`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()),
    enabled: !!projectId && !!profile?.id,
    retry: 1
  })

  const projectData = projectResponse?.project

  // Fetch counts for tab badges
  const { data: scopeCount } = useQuery({
    queryKey: ['scope-count', projectId],
    queryFn: () => fetch(`/api/scope?project_id=${projectId}&limit=1`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()).then(data => data?.statistics?.total_items || 0),
    enabled: !!projectId && !!profile?.id
  })

  const { data: drawingsCount } = useQuery({
    queryKey: ['drawings-count', projectId],
    queryFn: () => fetch(`/api/shop-drawings?project_id=${projectId}&limit=1`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()).then(data => {
      const stats = data?.data?.statistics
      return (stats?.by_responsibility?.internal_action || 0) + (stats?.by_responsibility?.client_review || 0)
    }),
    enabled: !!projectId && !!profile?.id
  })

  const { data: materialsCount } = useQuery({
    queryKey: ['materials-count', projectId],
    queryFn: () => fetch(`/api/material-specs?project_id=${projectId}&limit=1`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()).then(data => data?.statistics?.by_status?.pending || 0),
    enabled: !!projectId && !!profile?.id
  })

  const { data: tasksCount } = useQuery({
    queryKey: ['tasks-count', projectId],
    queryFn: () => fetch(`/api/tasks?project_id=${projectId}&limit=1`, {
      headers: { 'x-user-id': profile?.id || '' }
    }).then(res => res.json()).then(data => data?.statistics?.overdue || 0),
    enabled: !!projectId && !!profile?.id
  })

  // Calculate tab counts
  const tabCounts: TabCounts = {
    overview: 0, // Overview doesn't need a badge count
    scope: scopeCount || 0,
    drawings: drawingsCount || 0,
    materials: materialsCount || 0,
    tasks: tasksCount || 0
  }

  // Loading state while waiting for project ID or data
  if (!projectId || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  // If API error or no project data, show error state
  if (error || !projectData) {
    return (
      <div className="space-y-6 bg-gray-100 min-h-full -m-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project "{projectId}" does not exist or you don't have access to it.
            </p>
            <Link 
              href="/projects" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gray-100 min-h-full -m-6 p-6">
      {/* Project Tabs */}
      <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

      {/* Tab Content */}
      <div className="min-h-[500px]">
        <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
          <ProjectOverview project={projectData} />
        </div>
        <div style={{ display: activeTab === 'scope' ? 'block' : 'none' }}>
          <ProjectScope projectId={projectId || 'all'} />
        </div>
        <div style={{ display: activeTab === 'drawings' ? 'block' : 'none' }}>
          <ProjectDrawings projectId={projectId || 'all'} />
        </div>
        <div style={{ display: activeTab === 'materials' ? 'block' : 'none' }}>
          <ProjectMaterials projectId={projectId || 'all'} />
        </div>
        <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
          <ProjectTasks projectId={projectId || 'all'} />
        </div>
      </div>
    </div>
  )
}