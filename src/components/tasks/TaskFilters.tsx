'use client'

/**
 * Task Filters Component
 * Filter controls for task list
 */

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useQuery } from '@tanstack/react-query'
import type { TaskFilters as TaskFiltersType, TaskStatus, TaskPriority } from '@/types/tasks'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onChange: (filters: Partial<TaskFiltersType>) => void
  projectId: string
}

export function TaskFilters({ filters, onChange, projectId }: TaskFiltersProps) {
  // Fetch project members for assignee filter
  const { data: projectMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/members`)
      if (!response.ok) throw new Error('Failed to fetch members')
      return response.json()
    }
  })

  const handleStatusToggle = (status: TaskStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    onChange({ status: newStatuses })
  }

  const handlePriorityToggle = (priority: TaskPriority) => {
    const currentPriorities = filters.priority || []
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority]
    onChange({ priority: newPriorities })
  }

  const clearFilters = () => {
    onChange({
      status: [],
      priority: [],
      assigned_to: undefined,
      overdue_only: false,
      assigned_to_me: false,
      mentioning_me: false
    })
  }

  const hasActiveFilters = 
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    filters.assigned_to ||
    filters.overdue_only ||
    filters.assigned_to_me ||
    filters.mentioning_me

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      {/* Status Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Status</Label>
        <div className="flex flex-wrap gap-2">
          {(['todo', 'in_progress', 'review', 'completed'] as TaskStatus[]).map((status) => (
            <Badge
              key={status}
              variant={filters.status?.includes(status) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleStatusToggle(status)}
            >
              {status.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Priority</Label>
        <div className="flex flex-wrap gap-2">
          {(['normal', 'high', 'urgent'] as TaskPriority[]).map((priority) => (
            <Badge
              key={priority}
              variant={filters.priority?.includes(priority) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handlePriorityToggle(priority)}
            >
              {priority}
            </Badge>
          ))}
        </div>
      </div>

      {/* Assignee Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Assigned To</Label>
        <Select
          value={filters.assigned_to || ''}
          onValueChange={(value) => onChange({ assigned_to: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All team members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All team members</SelectItem>
            {projectMembers?.map((member: any) => (
              <SelectItem key={member.user.id} value={member.user.id}>
                {member.user.first_name} {member.user.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filters */}
      <div className="space-y-2">
        <Label className="text-sm font-medium mb-2 block">Quick Filters</Label>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="overdue"
            checked={filters.overdue_only || false}
            onCheckedChange={(checked) => onChange({ overdue_only: !!checked })}
          />
          <label
            htmlFor="overdue"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Overdue tasks only
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="assigned_to_me"
            checked={filters.assigned_to_me || false}
            onCheckedChange={(checked) => onChange({ assigned_to_me: !!checked })}
          />
          <label
            htmlFor="assigned_to_me"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Assigned to me
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="mentioning_me"
            checked={filters.mentioning_me || false}
            onCheckedChange={(checked) => onChange({ mentioning_me: !!checked })}
          />
          <label
            htmlFor="mentioning_me"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mentioning me
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  )
}