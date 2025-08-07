/**
 * Enhanced Project Workspace Layout
 * Features: Smart navigation, performance optimization, construction workflows,
 * mobile-first design, permission-based visibility, and real-time updates
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { ProjectNav } from '@/components/project/ProjectNav'
import { ProjectStatusCard } from '@/components/project/ProjectStatus'
import { ProjectProvider } from '@/providers/ProjectProvider'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ProjectOverviewSkeleton,
  ScopeItemsSkeleton,
  TasksSkeleton,
  TimelineSkeleton 
} from '@/components/ui/loading-states'

export const metadata: Metadata = {
  title: 'Project Workspace | Formula PM V3',
}

interface ProjectLayoutProps {
  children: React.ReactNode
  scope: React.ReactNode
  drawings: React.ReactNode
  tasks: React.ReactNode
  timeline: React.ReactNode
  params: Promise<{ id: string }>
}

// Enhanced loading card with construction context
interface LoadingCardProps {
  height?: string
  title?: string
  description?: string
  type?: 'scope' | 'tasks' | 'timeline' | 'overview'
}

function LoadingCard({ 
  height = "h-32", 
  title, 
  description, 
  type 
}: LoadingCardProps) {
  const loadingComponents = {
    scope: <ScopeItemsSkeleton count={3} />,
    tasks: <TasksSkeleton count={5} />,
    timeline: <TimelineSkeleton />,
    overview: <ProjectOverviewSkeleton />
  }
  
  if (type && loadingComponents[type]) {
    return (
      <Card className="construction-card">
        <CardContent className="p-4">
          {title && (
            <div className="mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          )}
          {loadingComponents[type]}
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="construction-card">
      <CardContent className={`${height} animate-pulse bg-muted/20 flex items-center justify-center`}>
        {title && (
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">{title}</div>
            <div className="w-12 h-2 bg-muted rounded mx-auto" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function ProjectLayout({
  children,
  scope,
  drawings,
  tasks,
  timeline,
  params,
}: ProjectLayoutProps) {
  const { id } = await params
  
  // Mock project data - will be replaced with actual API call
  const mockProject = {
    name: "Downtown Office Complex",
    status: 'active' as const,
    progress: 65,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-15'),
    budget: 2500000,
    spent: 1625000,
    teamSize: 12
  }
  
  // Mock notification counts for demonstration
  const mockNotificationCounts = {
    'tasks': 3,
    'drawings': 2,
    'rfis': 1,
    'change-orders': 0,
    'materials': 1
  }
  
  return (
    <ProjectProvider initialProjectId={id}>
      <AppShell fullWidth className="construction-optimized">
        <div className="space-y-6 py-6 px-4 max-w-7xl mx-auto">
          {/* Project Header with Status */}
          <div className="space-y-4">
            {/* Main project header */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">🏗️</span>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {mockProject.name}
                  </h1>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-muted-foreground">
                  <span>Project ID: {id}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Started: {mockProject.startDate.toLocaleDateString()}</span>
                  {mockProject.endDate && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>Target: {mockProject.endDate.toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Project status card - desktop */}
              <div className="hidden lg:block w-80">
                <ProjectStatusCard project={mockProject} compact />
              </div>
            </div>
            
            {/* Project status card - mobile */}
            <div className="lg:hidden">
              <ProjectStatusCard project={mockProject} compact />
            </div>
          </div>

          {/* Enhanced Project Navigation */}
          <ProjectNav 
            projectId={id} 
            projectStatus={mockProject.status}
            notificationCounts={mockNotificationCounts}
            className="construction-nav-enhanced"
          />

          {/* Main Content Area with enhanced loading */}
          <div className="min-h-[500px]">
            <main id="main-content" className="focus:outline-none">
              {children}
            </main>
          </div>

          {/* Quick Access Panels - Only show on overview page */}
          <div className="hidden-on-mobile-nav">
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {/* Scope Overview Panel */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Scope Overview</h3>
                  <span className="text-xs text-muted-foreground">
                    Last updated: 2 min ago
                  </span>
                </div>
                <Suspense fallback={
                  <LoadingCard 
                    height="h-64" 
                    title="Loading scope items..."
                    description="Fetching project scope and assignments"
                    type="scope"
                  />
                }>
                  {scope}
                </Suspense>
              </div>

              {/* Recent Tasks Panel */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Recent Tasks</h3>
                  {mockNotificationCounts.tasks > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {mockNotificationCounts.tasks} active
                    </span>
                  )}
                </div>
                <Suspense fallback={
                  <LoadingCard 
                    height="h-64" 
                    title="Loading tasks..."
                    description="Getting task assignments and updates"
                    type="tasks"
                  />
                }>
                  {tasks}
                </Suspense>
              </div>

              {/* Project Timeline Panel */}
              <div className="lg:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
                  <span className="text-xs text-muted-foreground">
                    {mockProject.progress}% complete
                  </span>
                </div>
                <Suspense fallback={
                  <LoadingCard 
                    height="h-64" 
                    title="Loading timeline..."
                    description="Building project timeline and milestones"
                    type="timeline"
                  />
                }>
                  {timeline}
                </Suspense>
              </div>
            </div>
          </div>
          
          {/* Construction site-specific footer info */}
          <div className="border-t pt-6 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span>Last sync: Just now</span>
                <span>•</span>
                <span>Team: {mockProject.teamSize} active members</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Formula PM V3</span>
                <span>•</span>
                <span>Construction Mode</span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProjectProvider>
  )
}