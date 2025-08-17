'use client'

import React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showDashboardIcon?: boolean
}

export function Breadcrumb({ 
  items, 
  className = "",
  showDashboardIcon = true 
}: BreadcrumbProps) {
  return (
    <div className={cn("w-full", className)}>
      <ul className="flex items-center">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {item.href || item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center text-base font-medium hover:text-blue-600 transition-colors text-gray-900 dark:text-white dark:hover:text-blue-400"
                  {...(item.href && { 
                    onClick: () => window.location.href = item.href! 
                  })}
                >
                  {index === 0 && showDashboardIcon && (
                    <span className="pr-2">
                      <Home className="w-4 h-4" />
                    </span>
                  )}
                  {item.label}
                </button>
              ) : (
                <span className="flex items-center text-base font-medium text-blue-600">
                  {index === 0 && showDashboardIcon && (
                    <span className="pr-2">
                      <Home className="w-4 h-4" />
                    </span>
                  )}
                  {item.label}
                </span>
              )}
              
              {index < items.length - 1 && (
                <span className="px-3 text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </li>
          ))}
        </ul>
    </div>
  )
}

// Specialized breadcrumb for project workspace
export function ProjectBreadcrumb({ 
  projectName, 
  className = "" 
}: { 
  projectName: string
  className?: string 
}) {
  const items: BreadcrumbItem[] = [
    {
      label: "Dashboard",
      onClick: () => {
        window.location.href = '/dashboard'
      }
    },
    {
      label: "Projects",
      onClick: () => {
        window.location.href = '/dashboard'
      }
    },
    {
      label: projectName
    }
  ]

  return <Breadcrumb items={items} className={className} />
}

// Specialized breadcrumb for main UI views
export function MainBreadcrumb({ 
  currentView, 
  className = "" 
}: { 
  currentView: string
  className?: string 
}) {
  const viewLabels: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects", 
    scope: "Scope Management",
    "shop-drawings": "Shop Drawings",
    "material-specs": "Material Specifications",
    tasks: "Tasks"
  }

  const items: BreadcrumbItem[] = [
    {
      label: "Dashboard",
      ...(currentView !== 'dashboard' && {
        onClick: () => {
          window.location.href = '/ui-preview?view=dashboard'
        }
      })
    }
  ]

  // Add current view if it's not dashboard
  if (currentView !== 'dashboard') {
    items.push({
      label: viewLabels[currentView] || currentView
    })
  }

  return <Breadcrumb items={items} className={className} />
}