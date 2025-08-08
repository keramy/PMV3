/**
 * Enhanced Project Navigation Component
 * Smart navigation system optimized for construction workflows
 * Features: Customizable tabs, pin/unpin, construction status indicators,
 * mobile-first design for tablets and rugged devices
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/types/auth'
import {
  FileImage,
  ListTodo,
  Layers,
  Calendar,
  FileText,
  AlertTriangle,
  Settings,
  ClipboardList,
  BarChart3,
  ChevronDown,
  Pin,
  PinOff,
  Package,
  Milestone,
  FolderOpen,
  Users,
  Wrench,
} from 'lucide-react'

interface ProjectNavProps {
  projectId: string
  className?: string
  projectStatus?: 'active' | 'planning' | 'on-hold' | 'completed'
  notificationCounts?: Record<string, number>
}

// Navigation tabs with permission requirements and construction context
interface TabConfig {
  id: string
  name: string
  href: string
  icon: React.ElementType
  permission?: Permission
  isPinnable?: boolean
  description?: string
  mobileLabel?: string
  category: 'core' | 'workflow' | 'management' | 'reporting'
}

// Core navigation tabs - always visible if user has permission
const defaultTabs: TabConfig[] = [
  {
    id: 'overview',
    name: 'Overview',
    href: '',
    icon: BarChart3,
    description: 'Project dashboard and key metrics',
    mobileLabel: 'Home',
    category: 'core'
  },
  {
    id: 'scope',
    name: 'Scope',
    href: '/scope',
    icon: Layers,
    permission: 'view_scope',
    description: 'Scope items and subcontractor assignments',
    mobileLabel: 'Scope',
    category: 'core'
  },
  {
    id: 'drawings',
    name: 'Drawings',
    href: '/drawings',
    icon: FileImage,
    permission: 'view_drawings',
    description: 'Shop drawings and approval workflow',
    mobileLabel: 'Draw',
    category: 'workflow'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    href: '/tasks',
    icon: ListTodo,
    permission: 'view_tasks',
    description: 'Task management and tracking',
    mobileLabel: 'Tasks',
    category: 'core'
  },
]

// Additional tabs available in "More" dropdown
const additionalTabs: TabConfig[] = [
  {
    id: 'materials',
    name: 'Materials',
    href: '/materials',
    icon: Package,
    permission: 'view_materials',
    isPinnable: true,
    description: 'Material specifications and approvals',
    mobileLabel: 'Mat',
    category: 'workflow'
  },
  {
    id: 'timeline',
    name: 'Timeline',
    href: '/timeline',
    icon: Calendar,
    permission: 'view_timeline',
    isPinnable: true,
    description: 'Project timeline and Gantt chart',
    mobileLabel: 'Time',
    category: 'management'
  },
  {
    id: 'milestones',
    name: 'Milestones',
    href: '/milestones',
    icon: Milestone,
    permission: 'view_milestones',
    isPinnable: true,
    description: 'Project milestones and deliverables',
    mobileLabel: 'Mile',
    category: 'management'
  },
  {
    id: 'rfis',
    name: 'RFIs',
    href: '/rfis',
    icon: AlertTriangle,
    permission: 'view_rfis',
    isPinnable: true,
    description: 'Request for Information tracking',
    mobileLabel: 'RFI',
    category: 'workflow'
  },
  {
    id: 'change-orders',
    name: 'Change Orders',
    href: '/change-orders',
    icon: FileText,
    permission: 'view_change_orders',
    isPinnable: true,
    description: 'Change order management',
    mobileLabel: 'CO',
    category: 'workflow'
  },
  {
    id: 'qc-punch-lists',
    name: 'QC/Punch Lists',
    href: '/qc-punch-lists',
    icon: ClipboardList,
    permission: 'view_qc_lists',
    isPinnable: true,
    description: 'Quality control and punch lists',
    mobileLabel: 'QC',
    category: 'workflow'
  },
  {
    id: 'subcontractors',
    name: 'Subcontractors',
    href: '/subcontractors',
    icon: Users,
    permission: 'view_subcontractors',
    isPinnable: true,
    description: 'Subcontractor management',
    mobileLabel: 'Subs',
    category: 'management'
  },
  {
    id: 'documents',
    name: 'Documents',
    href: '/documents',
    icon: FolderOpen,
    permission: 'view_documents',
    isPinnable: true,
    description: 'Project document management',
    mobileLabel: 'Docs',
    category: 'management'
  },
  {
    id: 'reports',
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    permission: 'view_reports',
    isPinnable: true,
    description: 'Project reports and analytics',
    mobileLabel: 'Rpt',
    category: 'reporting'
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'edit_project_settings',
    isPinnable: false,
    description: 'Project configuration and settings',
    mobileLabel: 'Set',
    category: 'management'
  },
]

// User preference management for pinned tabs
const getUserPinnedTabs = (projectId: string): string[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(`formula-pm-pinned-tabs-${projectId}`)
  return stored ? JSON.parse(stored) : []
}

const setPinnedTabs = (projectId: string, tabIds: string[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(`formula-pm-pinned-tabs-${projectId}`, JSON.stringify(tabIds))
}

export function ProjectNav({ 
  projectId, 
  className, 
  projectStatus = 'active',
  notificationCounts = {} 
}: ProjectNavProps) {
  const pathname = usePathname()
  const baseUrl = `/projects/${projectId}`
  const { hasPermission } = usePermissions()
  
  // State for pinned tabs
  const [pinnedTabIds, setPinnedTabIds] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  
  // Load pinned tabs on mount
  useEffect(() => {
    setPinnedTabIds(getUserPinnedTabs(projectId))
    
    // Detect mobile viewport
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [projectId])
  
  // Filter tabs based on permissions
  const filterTabsByPermissions = (tabs: TabConfig[]) => {
    return tabs.filter(tab => !tab.permission || hasPermission(tab.permission))
  }
  
  const availableDefaultTabs = filterTabsByPermissions(defaultTabs)
  const availableAdditionalTabs = filterTabsByPermissions(additionalTabs)
  
  // Get pinned tabs from additional tabs
  const pinnedTabs = availableAdditionalTabs.filter(tab => 
    tab.isPinnable && pinnedTabIds.includes(tab.id)
  )
  
  // Get unpinned tabs for "More" dropdown
  const unpinnedTabs = availableAdditionalTabs.filter(tab => 
    !pinnedTabIds.includes(tab.id)
  )
  
  // Combine visible tabs (default + pinned)
  const visibleTabs = [...availableDefaultTabs, ...pinnedTabs]
  
  const isActiveTab = (href: string) => {
    const fullPath = `${baseUrl}${href}`
    return pathname === fullPath
  }
  
  const togglePinTab = (tabId: string) => {
    const newPinnedTabs = pinnedTabIds.includes(tabId)
      ? pinnedTabIds.filter(id => id !== tabId)
      : [...pinnedTabIds, tabId]
    
    setPinnedTabIds(newPinnedTabs)
    setPinnedTabs(projectId, newPinnedTabs)
  }
  
  const renderTabButton = (tab: TabConfig, showLabel: boolean = true) => {
    const Icon = tab.icon
    const isActive = isActiveTab(tab.href)
    const href = `${baseUrl}${tab.href}`
    const count = notificationCounts[tab.id]
    const label = isMobile && tab.mobileLabel ? tab.mobileLabel : tab.name
    
    return (
      <Link key={`${tab.id}-${href}`} href={href} title={tab.description}>
        <Button 
          variant={isActive ? "default" : "ghost"}
          size="sm"
          className={cn(
            "flex items-center space-x-2 whitespace-nowrap mobile-touch-target relative",
            "hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
            isActive && "bg-primary text-primary-foreground shadow-sm"
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {showLabel && (
            <span className={cn(
              "truncate",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {label}
            </span>
          )}
          
          {/* Notification badge */}
          {count && count > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </Button>
      </Link>
    )
  }
  
  const renderDropdownItem = (tab: TabConfig) => {
    const Icon = tab.icon
    const href = `${baseUrl}${tab.href}`
    const count = notificationCounts[tab.id]
    const isPinned = pinnedTabIds.includes(tab.id)
    const isActive = isActiveTab(tab.href)
    
    return (
      <div key={tab.id}>
        <DropdownMenuItem 
          asChild
          className={cn(
            "flex items-center justify-between group",
            isActive && "bg-accent text-accent-foreground"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <Link href={href} className="flex items-center space-x-2 flex-1">
              <Icon className="h-4 w-4" />
              <span className="flex-1">{tab.name}</span>
              {count && count > 0 && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {count}
                </Badge>
              )}
            </Link>
            
            {/* Pin/Unpin button */}
            {tab.isPinnable && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  togglePinTab(tab.id)
                }}
                title={isPinned ? 'Unpin from tab bar' : 'Pin to tab bar'}
              >
                {isPinned ? (
                  <PinOff className="h-3 w-3" />
                ) : (
                  <Pin className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </DropdownMenuItem>
      </div>
    )
  }
  
  return (
    <>
      {/* Desktop Navigation */}
      <div className={cn("hidden md:block border-b", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto pb-2">
            {/* Project Status Indicator */}
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium mr-4",
              {
                'project-active': projectStatus === 'active',
                'project-planning': projectStatus === 'planning', 
                'project-on-hold': projectStatus === 'on-hold',
                'project-completed': projectStatus === 'completed'
              }
            )}>
              <div className={cn(
                "status-dot",
                {
                  'status-completed': projectStatus === 'active',
                  'status-in-progress': projectStatus === 'planning',
                  'status-pending': projectStatus === 'on-hold',
                  'status-blocked': projectStatus === 'completed'
                }
              )} />
              <span className="capitalize">{projectStatus}</span>
            </div>
            
            {/* Visible Tabs */}
            {visibleTabs.map(tab => renderTabButton(tab))}
            
            {/* More Dropdown */}
            {unpinnedTabs.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-1 mobile-touch-target"
                  >
                    <span>More</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Additional Features
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Group by category */}
                  {(['workflow', 'management', 'reporting'] as const).map(category => {
                    const categoryTabs = unpinnedTabs.filter(tab => tab.category === category)
                    if (categoryTabs.length === 0) return null
                    
                    return (
                      <div key={category}>
                        {categoryTabs.map(renderDropdownItem)}
                        {category !== 'reporting' && <DropdownMenuSeparator />}
                      </div>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden mobile-nav safe-bottom">
        <div className="flex items-center justify-around px-4 py-2">
          {/* Show first 4 tabs + More */}
          {visibleTabs.slice(0, 4).map(tab => renderTabButton(tab, false))}
          
          {/* More menu for mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mobile-touch-target flex flex-col items-center space-y-1"
              >
                <Wrench className="h-4 w-4" />
                <span className="text-xs">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mb-2">
              {/* Hidden tabs on mobile */}
              {visibleTabs.slice(4).map(renderDropdownItem)}
              {visibleTabs.length > 4 && unpinnedTabs.length > 0 && <DropdownMenuSeparator />}
              
              {/* Unpinned tabs */}
              {unpinnedTabs.map(renderDropdownItem)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}