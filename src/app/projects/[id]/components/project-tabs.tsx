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

export interface TabCounts {
  overview: number
  scope: number
  drawings: number
  materials: number
  tasks: number
}

interface ProjectTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  counts?: TabCounts
}

export function ProjectTabs({ activeTab, onTabChange, counts }: ProjectTabsProps) {
  // Default to 0 for all counts if not provided
  const tabCounts = {
    overview: counts?.overview || 0,
    scope: counts?.scope || 0,
    drawings: counts?.drawings || 0,
    materials: counts?.materials || 0,
    tasks: counts?.tasks || 0
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: tabCounts.overview
    },
    {
      id: 'scope',
      label: 'Scope',
      icon: ClipboardList,
      badge: tabCounts.scope
    },
    {
      id: 'drawings',
      label: 'Drawings',
      icon: FileText,
      badge: tabCounts.drawings
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: Package,
      badge: tabCounts.materials
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: tabCounts.tasks
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