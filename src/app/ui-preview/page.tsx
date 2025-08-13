'use client'

import { useState } from 'react'
import { Sidebar } from './components/sidebar'
import { Dashboard } from './components/dashboard'
import { ProjectsTable } from './components/projects-table'
import { ShopDrawingsTable } from './components/shop-drawings-table'
import { MaterialSpecsTable } from './components/material-specs-table'
import { TasksList } from './components/tasks-list'
import { ScopeTable } from './components/scope-table'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export default function UIPreviewPage() {
  const [activeView, setActiveView] = useState('dashboard')
  
  // Debug active view changes
  console.log('Current active view:', activeView)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Formula PM</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">
                {activeView === 'dashboard' && 'Dashboard'}
                {activeView === 'projects' && 'Projects'}
                {activeView === 'shop-drawings' && 'Shop Drawings'}
                {activeView === 'material-specs' && 'Material Specifications'}
                {activeView === 'tasks' && 'Tasks'}
                {activeView === 'scope' && 'Scope Management'}
              </span>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Admin View
            </Button>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="w-full">
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'projects' && <ProjectsTable />}
            {activeView === 'shop-drawings' && <ShopDrawingsTable />}
            {activeView === 'material-specs' && <MaterialSpecsTable />}
            {activeView === 'tasks' && <TasksList />}
            {activeView === 'scope' && <ScopeTable />}
          </div>
        </main>
      </div>
    </div>
  )
}