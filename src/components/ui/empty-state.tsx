'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { Building2, ClipboardList, FileImage } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon = Building2, 
  title, 
  description, 
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`border-2 border-dashed border-gray-300 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
        {action && (
          <Button onClick={action.onClick} className="bg-blue-600 hover:bg-blue-700">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized empty state components for common use cases
interface EmptyProjectsProps {
  onCreateProject?: () => void
}

export function EmptyProjects({ onCreateProject }: EmptyProjectsProps) {
  return (
    <EmptyState
      icon={Building2}
      title="No projects yet"
      description="Get started by creating your first construction project. You can add scope items, manage tasks, and track progress once you have a project."
      action={onCreateProject ? {
        label: "Create First Project",
        onClick: onCreateProject
      } : undefined}
    />
  )
}

interface EmptyActivityProps {}

export function EmptyActivity({}: EmptyActivityProps) {
  return (
    <EmptyState
      title="No recent activity"
      description="Project activity will appear here as team members complete tasks, upload drawings, and make progress on projects."
    />
  )
}

interface EmptyTasksProps {
  onCreateTask?: () => void
}

export function EmptyTasks({ onCreateTask }: EmptyTasksProps) {
  return (
    <EmptyState
      title="No critical tasks"
      description="Critical and high-priority tasks will appear here when they need immediate attention."
      action={onCreateTask ? {
        label: "Create Task",
        onClick: onCreateTask
      } : undefined}
    />
  )
}

interface EmptyScopeProps {
  onCreateScope?: () => void
}

export function EmptyScope({ onCreateScope }: EmptyScopeProps) {
  return (
    <EmptyState
      icon={ClipboardList}
      title="No scope items found"
      description="Start building your project scope by adding your first scope item. Define work items, quantities, and costs to track project progress."
      action={onCreateScope ? {
        label: "Add First Scope Item",
        onClick: onCreateScope
      } : undefined}
    />
  )
}

interface EmptyShopDrawingsProps {
  onUploadDrawing?: () => void
}

export function EmptyShopDrawings({ onUploadDrawing }: EmptyShopDrawingsProps) {
  return (
    <EmptyState
      icon={FileImage}
      title="No shop drawings uploaded"
      description="Upload your first shop drawing to begin the approval process. Track drawing status and manage client feedback efficiently."
      action={onUploadDrawing ? {
        label: "Upload First Drawing",
        onClick: onUploadDrawing
      } : undefined}
    />
  )
}