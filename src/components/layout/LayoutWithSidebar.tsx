'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainBreadcrumb } from '@/components/ui/breadcrumb'

interface LayoutWithSidebarProps {
  children: React.ReactNode
}

export function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Determine active view based on current pathname
  const getActiveView = (path: string): string => {
    if (path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/projects')) return 'projects'
    if (path.startsWith('/scope')) return 'scope'
    if (path.startsWith('/shop-drawings')) return 'shop-drawings'
    if (path.startsWith('/material-specs')) return 'material-specs'
    if (path.startsWith('/tasks')) return 'tasks'
    return 'dashboard'
  }

  const activeView = getActiveView(pathname)

  const setActiveView = (view: string) => {
    // This function exists for interface compatibility but navigation is handled by the Sidebar component
  }

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
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}