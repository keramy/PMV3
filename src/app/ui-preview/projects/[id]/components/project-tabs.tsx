'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard,
  ClipboardList,
  FileText,
  Package,
  CheckSquare
} from 'lucide-react'

interface ProjectTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Project summary & metrics'
    },
    {
      id: 'scope',
      label: 'Scope',
      icon: ClipboardList,
      description: 'Scope items & assignments'
    },
    {
      id: 'drawings',
      label: 'Drawings',
      icon: FileText,
      description: 'Shop drawings approval'
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: Package,
      description: 'Material specifications'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Project task management'
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                'flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-none border-b-2 transition-all',
                'hover:bg-gray-50 hover:text-gray-900',
                isActive 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-gray-600'
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{tab.label}</span>
                <span className="text-xs text-muted-foreground">
                  {tab.description}
                </span>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}