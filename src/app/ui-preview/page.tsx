'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from './components/sidebar'
import { Dashboard } from './components/dashboard'
import { ProjectsTable } from './components/projects-table'
import { ShopDrawingsTable } from '@/components/shop-drawings/ShopDrawingsTable'
import { MaterialSpecsTable } from './components/material-specs-table'
import { TasksList } from './components/tasks-list'
import { ScopeTable } from './components/scope-table'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { MainBreadcrumb } from '@/components/ui/breadcrumb'

// Helper function to get initial view from URL parameters
function getInitialView(searchParams: URLSearchParams): string {
  const viewParam = searchParams.get('view')
  if (viewParam) {
    const validViews = ['dashboard', 'projects', 'scope', 'shop-drawings', 'material-specs', 'tasks']
    if (validViews.includes(viewParam)) {
      return viewParam
    }
  }
  return 'dashboard'
}

export default function UIPreviewPage() {
  const searchParams = useSearchParams()
  const [activeView, setActiveView] = useState(() => getInitialView(searchParams))
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Update activeView when URL parameters change
  useEffect(() => {
    const newView = getInitialView(searchParams)
    if (newView !== activeView) {
      setActiveView(newView)
    }
  }, [searchParams, activeView])
  
  // Debug active view changes (remove in production)
  // console.log('Current active view:', activeView)

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Breadcrumb */}
        <header className="border-b bg-background px-6 py-4">
          <MainBreadcrumb currentView={activeView} />
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="w-full">
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'projects' && <ProjectsTable />}
            {activeView === 'shop-drawings' && <ShopDrawingsTable projectId="ui-preview" />}
            {activeView === 'material-specs' && <MaterialSpecsTable />}
            {activeView === 'tasks' && <TasksList />}
            {activeView === 'scope' && <ScopeTable />}
          </div>
        </main>
      </div>
    </div>
  )
}