'use client'

/**
 * Task List Component
 * Mobile-first task display with filtering
 */

import { useState } from 'react'
import { Plus, Filter, Search, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { useTasks } from '@/hooks/useTasks'
import { useTaskRealtime } from '@/hooks/useTaskRealtime'
import { usePermissions } from '@/hooks/usePermissions'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { TaskFilters } from './TaskFilters'
import { LoadingSpinner } from '@/components/ui/loading-states'
import type { TaskFilters as TaskFiltersType } from '@/types/tasks'

interface TaskListProps {
  projectId?: string
}

export function TaskList({ projectId }: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TaskFiltersType>({
    project_id: projectId || undefined,
    page: 1,
    limit: 20
  })

  const { hasPermission } = usePermissions()

  // Fetch tasks with filters
  const { data, isLoading, error } = useTasks({
    ...filters,
    search: searchQuery || undefined
  })

  // Enable real-time updates
  useTaskRealtime(projectId || 'all')

  const handleFilterChange = (newFilters: Partial<TaskFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage === 'UNAUTHORIZED') {
      return (
        <div className="p-6">
          <EmptyState
            icon={CheckSquare}
            title="Authentication Required"
            description="Please log in to access tasks."
            action={{
              label: "Go to Login",
              onClick: () => window.location.href = '/login'
            }}
          />
        </div>
      )
    }
    
    if (errorMessage === 'FORBIDDEN') {
      return (
        <div className="p-6">
          <EmptyState
            icon={CheckSquare}
            title="Access Denied"
            description="You don't have permission to view tasks. Contact your administrator."
          />
        </div>
      )
    }
    
    return (
      <div className="p-6">
        <EmptyState
          icon={CheckSquare}
          title="Error Loading Tasks"
          description={`Failed to load tasks: ${errorMessage}`}
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {hasPermission('create_tasks') && (
          <Button onClick={() => setShowForm(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <TaskFilters
          filters={filters}
          onChange={handleFilterChange}
          projectId={projectId || 'all'}
        />
      )}

      {/* Task List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.tasks.length ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm mt-1">Create your first task to get started</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {data.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* Pagination */}
          {data.total > data.limit && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={!data.has_previous}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(data.page + 1)}
                disabled={!data.has_next}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Task Form Dialog */}
      {showForm && (
        <TaskForm
          projectId={projectId || 'all'}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}