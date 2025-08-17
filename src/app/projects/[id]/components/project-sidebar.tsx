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
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoIcon, LogoText } from '@/components/ui/logo'
import { useRouter } from 'next/navigation'

interface ProjectSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function ProjectSidebar({ 
  isCollapsed, 
  onToggleCollapse
}: ProjectSidebarProps) {
  const router = useRouter()

  // Main navigation items
  const mainMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
      path: '/dashboard'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Building2,
      description: 'All projects overview',
      path: '/projects'
    },
    {
      id: 'scope',
      label: 'Scope Management',
      icon: ClipboardList,
      description: 'Project scope items',
      path: '/scope'
    },
    {
      id: 'shop-drawings',
      label: 'Shop Drawings',
      icon: FileText,
      description: 'Whose Turn system',
      path: '/shop-drawings'
    },
    {
      id: 'material-specs',
      label: 'Material Specs',
      icon: Package,
      description: 'PM approval workflow',
      path: '/material-specs'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Task management',
      path: '/tasks'
    }
  ]


  const handleMainNavigation = (item: typeof mainMenuItems[0]) => {
    // Navigate with URL parameter to ensure correct view is displayed
    window.location.href = `${item.path}?view=${item.id}`
  }
  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="relative border-b px-4 py-4">
        {/* Toggle Button - Always in top-right corner */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onToggleCollapse}
          className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>

        {/* Logo Content - Centered vertically */}
        <div className={cn(
          "flex items-center justify-center min-h-[32px]",
          !isCollapsed && "pr-10"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <LogoText size="sm" />
              <span className="text-xs text-gray-700">v3.0</span>
            </div>
          ) : (
            <LogoIcon size="sm" />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
        {mainMenuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "justify-start gap-3",
                isCollapsed ? "w-full px-2" : "w-full px-3"
              )}
              onClick={() => handleMainNavigation(item)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Button>
          )
        })}

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
              <p className="text-xs text-gray-800">Admin</p>
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