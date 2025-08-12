'use client'

import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard,
  Building2, 
  FileText, 
  Package, 
  CheckSquare, 
  ClipboardList 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Building2,
      description: 'All projects overview'
    },
    {
      id: 'scope',
      label: 'Scope Management',
      icon: ClipboardList,
      description: 'Project scope items'
    },
    {
      id: 'shop-drawings',
      label: 'Shop Drawings',
      icon: FileText,
      description: 'Whose Turn system'
    },
    {
      id: 'material-specs',
      label: 'Material Specs',
      icon: Package,
      description: 'PM approval workflow'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Task management'
    }
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">PM</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Formula PM</h2>
            <p className="text-xs text-muted-foreground">v3.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 px-3',
                isActive && 'bg-secondary'
              )}
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
            KT
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Kerem Test</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}