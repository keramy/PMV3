'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ProjectTabs } from './components/project-tabs'
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
  // Unwrap params and set project ID
  React.useEffect(() => {
    const unwrapParams = async () => {
      try {
        const { id } = await params
        setProjectId(id)
      } catch (error) {
        console.error('Error unwrapping params:', error)
        setProjectId('proj-001') // Fallback to default project
      }
    }
    unwrapParams()
  }, [params])

  // Get project data - will be replaced with API call
  const getProjectData = (id: string): null => {
    // TODO: Replace with real API call to fetch project by ID
    return null
  }

  // Loading state while waiting for project ID
  if (!projectId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  const projectData = getProjectData(projectId)

  // If no project data, show error/empty state
  if (!projectData && projectId) {
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
      <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && <ProjectOverview project={projectData} />}
        {activeTab === 'scope' && <ProjectScope projectId={projectId || 'all'} />}
        {activeTab === 'drawings' && <ProjectDrawings projectId={projectId || 'all'} />}
        {activeTab === 'materials' && <ProjectMaterials projectId={projectId || 'all'} />}
        {activeTab === 'tasks' && <ProjectTasks projectId={projectId || 'all'} />}
      </div>
    </div>
  )
}