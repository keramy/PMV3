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
import { useRouter } from 'next/navigation'
import { LogoIcon, LogoText } from '@/components/ui/logo'

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ activeView, setActiveView, isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter()
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
      href: '/dashboard'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Building2,
      description: 'All projects overview',
      href: '/projects'
    },
    {
      id: 'scope',
      label: 'Scope Management',
      icon: ClipboardList,
      description: 'Project scope items',
      href: '/scope'
    },
    {
      id: 'shop-drawings',
      label: 'Shop Drawings',
      icon: FileText,
      description: 'Whose Turn system',
      href: '/shop-drawings'
    },
    {
      id: 'material-specs',
      label: 'Material Specs',
      icon: Package,
      description: 'PM approval workflow',
      href: '/material-specs'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Task management',
      href: '/tasks'
    }
  ]

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
      <nav className="flex-1 space-y-0.5 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                "justify-start gap-3",
                isCollapsed ? "w-full px-2" : "w-full px-3",
                isActive && 'bg-secondary'
              )}
              onClick={() => {
                setActiveView(item.id)
                router.push(item.href)
              }}
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