'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProjectSidebar } from './components/project-sidebar'
import { ProjectTabs } from './components/project-tabs'
import { ProjectOverview } from './components/project-overview'
import { ProjectScope } from './components/project-scope'
import { ProjectDrawings } from './components/project-drawings'
import { ProjectMaterials } from './components/project-materials'
import { ProjectTasks } from './components/project-tasks'
import { ProjectBreadcrumb } from '@/components/ui/breadcrumb'

interface ProjectWorkspacePageProps {
  params: Promise<{ id: string }>
}

export default function ProjectWorkspacePage({ params }: ProjectWorkspacePageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Unwrap params and set project ID
  React.useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id)
    })
  }, [params])

  // Mock project data based on project ID
  const getProjectData = (id: string) => {
    const allProjects = {
      'proj-001': {
        id: 'proj-001',
        name: 'Akbank Head Office Renovation',
        client: 'Akbank',
        status: 'in_progress',
        budget: 2800000,
        spent: 1820000,
        start_date: '2025-01-15',
        end_date: '2025-06-30',
        progress_percentage: 65,
        description: 'Complete renovation of headquarters including MEP systems and interior fit-out'
      },
      'proj-002': {
        id: 'proj-002',
        name: 'Garanti BBVA Tech Center MEP',
        client: 'Garanti BBVA',
        status: 'in_progress',
        budget: 4200000,
        spent: 1890000,
        start_date: '2024-11-01',
        end_date: '2025-08-15',
        progress_percentage: 45,
        description: 'MEP installation for new technology center including data center cooling'
      },
      'proj-003': {
        id: 'proj-003',
        name: 'Marina Bay Tower Construction',
        client: 'Marina Development',
        status: 'planning',
        budget: 8500000,
        spent: 0,
        start_date: '2025-03-01',
        end_date: '2026-01-15',
        progress_percentage: 15,
        description: 'High-rise residential tower with luxury amenities and underground parking'
      }
    }

    return allProjects[id as keyof typeof allProjects] || allProjects['proj-001']
  }

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ProjectSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Breadcrumb */}
        <header className="border-b bg-background px-6 py-4">
          <ProjectBreadcrumb projectName={projectData.name} />
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="space-y-6 bg-gray-100 min-h-full p-6">
            {/* Project Tabs */}
            <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {activeTab === 'overview' && <ProjectOverview project={projectData} />}
              {activeTab === 'scope' && <ProjectScope projectId={projectId} />}
              {activeTab === 'drawings' && <ProjectDrawings projectId={projectId} />}
              {activeTab === 'materials' && <ProjectMaterials projectId={projectId} />}
              {activeTab === 'tasks' && <ProjectTasks projectId={projectId} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}