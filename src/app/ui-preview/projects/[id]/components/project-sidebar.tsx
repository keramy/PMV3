'use client'

import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard,
  Building2, 
  FileText, 
  Package, 
  CheckSquare, 
  ClipboardList,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onBackToMain: () => void
  projectName: string
}

export function ProjectSidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onBackToMain, 
  projectName 
}: ProjectSidebarProps) {
  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="border-b p-4">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">PM</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Formula PM</h2>
                  <p className="text-xs text-muted-foreground">v3.0</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Back to Main Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToMain}
              className="w-full justify-start gap-2 text-xs"
            >
              <ChevronLeft className="h-3 w-3" />
              Back to Main
            </Button>
            
            {/* Current Project */}
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 truncate">
                    Current Project
                  </p>
                  <p className="text-xs text-blue-700 truncate">
                    {projectName}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xs font-bold">PM</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation - Project Context */}
      <nav className="flex-1 space-y-1 p-2">
        <div className={cn(
          "text-xs font-medium text-muted-foreground mb-2",
          isCollapsed && "text-center"
        )}>
          {!isCollapsed ? "Project Navigation" : "•"}
        </div>
        
        {/* Quick Actions */}
        <Button
          variant="ghost"
          className={cn(
            "justify-start gap-3",
            isCollapsed ? "w-full px-2" : "w-full px-3"
          )}
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col items-start">
              <span className="text-sm">Overview</span>
              <span className="text-xs text-muted-foreground">
                Project dashboard
              </span>
            </div>
          )}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "justify-start gap-3",
            isCollapsed ? "w-full px-2" : "w-full px-3"
          )}
        >
          <ClipboardList className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col items-start">
              <span className="text-sm">Scope Items</span>
              <span className="text-xs text-muted-foreground">
                Project scope
              </span>
            </div>
          )}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "justify-start gap-3",
            isCollapsed ? "w-full px-2" : "w-full px-3"
          )}
        >
          <FileText className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col items-start">
              <span className="text-sm">Drawings</span>
              <span className="text-xs text-muted-foreground">
                Shop drawings
              </span>
            </div>
          )}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "justify-start gap-3",
            isCollapsed ? "w-full px-2" : "w-full px-3"
          )}
        >
          <Package className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col items-start">
              <span className="text-sm">Materials</span>
              <span className="text-xs text-muted-foreground">
                Material specs
              </span>
            </div>
          )}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "justify-start gap-3",
            isCollapsed ? "w-full px-2" : "w-full px-3"
          )}
        >
          <CheckSquare className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col items-start">
              <span className="text-sm">Tasks</span>
              <span className="text-xs text-muted-foreground">
                Task management
              </span>
            </div>
          )}
        </Button>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
              KT
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Kerem Test</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
              KT
            </div>
          </div>
        )}
      </div>
    </div>
  )
}