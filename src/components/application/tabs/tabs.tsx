'use client'

import React from 'react'
import { Tabs as AriaTabsComponent, TabList, Tab, TabPanel } from 'react-aria-components'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface TabItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  badge?: number
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  selectedKey: string
  onSelectionChange: (key: string) => void
  className?: string
  children?: React.ReactNode
}

export function Tabs({ tabs, selectedKey, onSelectionChange, className, children }: TabsProps) {
  return (
    <AriaTabsComponent 
      selectedKey={selectedKey}
      onSelectionChange={(key) => onSelectionChange(key as string)}
      className={cn("bg-white rounded-lg border border-gray-400 shadow-sm", className)}
    >
      <TabList className="flex items-center overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          
          return (
            <Tab
              key={tab.id}
              id={tab.id}
              isDisabled={tab.disabled}
              className={({ isSelected, isHovered, isPressed }) =>
                cn(
                  'flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-none border-b-2 transition-all cursor-pointer outline-none',
                  'focus:bg-gray-200 focus:text-gray-900',
                  isHovered && 'bg-gray-200 text-gray-900',
                  isPressed && 'bg-gray-200',
                  isSelected 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-gray-800',
                  tab.disabled && 'opacity-50 cursor-not-allowed'
                )
              }
            >
              {Icon && <Icon className="h-5 w-5" />}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
            </Tab>
          )
        })}
      </TabList>
      
      {children}
    </AriaTabsComponent>
  )
}