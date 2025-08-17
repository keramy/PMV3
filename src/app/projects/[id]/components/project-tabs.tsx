'use client'

import { useState } from 'react'
import type { Key } from 'react-aria-components'
import { Tabs } from '@/components/application/tabs/tabs'
import { NativeSelect } from '@/components/base/select/select-native'
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
  // Mock data for badges - in real app, these would come from API/props
  const mockCounts = {
    overview: 0,
    scope: 0,
    drawings: 2, // 2 items need attention
    materials: 1, // 1 pending PM approval
    tasks: 3 // 3 overdue tasks
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: mockCounts.overview
    },
    {
      id: 'scope',
      label: 'Scope',
      icon: ClipboardList,
      badge: mockCounts.scope
    },
    {
      id: 'drawings',
      label: 'Drawings',
      icon: FileText,
      badge: mockCounts.drawings
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: Package,
      badge: mockCounts.materials
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: mockCounts.tasks
    }
  ]

  return (
    <>
      {/* Mobile Select - Hidden on desktop */}
      <NativeSelect
        aria-label="Project Tabs"
        value={activeTab}
        onChange={(event) => onTabChange(event.target.value)}
        options={tabs.map((tab) => ({ 
          label: tab.label, 
          value: tab.id,
          badge: tab.badge 
        }))}
        className="w-full md:hidden mb-4"
      />

      {/* Desktop Tabs - Hidden on mobile */}
      <div className="hidden md:block">
        <Tabs
          tabs={tabs}
          selectedKey={activeTab}
          onSelectionChange={onTabChange}
        />
      </div>
    </>
  )
}