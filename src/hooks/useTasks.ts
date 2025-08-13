/**
 * Task Management Hooks
 * React Query hooks for task operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  Task, 
  TaskFormData, 
  TaskFilters, 
  TaskListResponse,
  TaskComment,
  TaskCommentFormData,
  TaskStatistics
} from '@/types/tasks'

// Fetch tasks with filters
export function useTasks(filters: TaskFilters) {
  return useQuery<TaskListResponse>({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)))
          } else {
            params.append(key, String(value))
          }
        }
      })
      
      const response = await fetch(`/api/tasks?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      return response.json()
    },
    staleTime: 30000, // 30 seconds
  })
}

// Fetch single task
export function useTask(taskId: string | undefined) {
  return useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) throw new Error('Task ID is required')
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) throw new Error('Failed to fetch task')
      return response.json()
    },
    enabled: !!taskId,
    staleTime: 30000,
  })
}

// Create task mutation
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: TaskFormData & { project_id: string }) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create task')
      return response.json()
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] })
      toast.success('Task created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create task')
      console.error('Create task error:', error)
    },
  })
}

// Update task mutation
export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TaskFormData> & { id: string }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update task')
      return response.json()
    },
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] })
      toast.success('Task updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update task')
      console.error('Update task error:', error)
    },
  })
}

// Delete task mutation
export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete task')
      return response.json()
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.removeQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task-statistics'] })
      toast.success('Task deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete task')
      console.error('Delete task error:', error)
    },
  })
}

// Fetch task comments
export function useTaskComments(taskId: string | undefined) {
  return useQuery<TaskComment[]>({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      if (!taskId) throw new Error('Task ID is required')
      const response = await fetch(`/api/tasks/${taskId}/comments`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    },
    enabled: !!taskId,
    staleTime: 10000, // 10 seconds - more frequent updates for comments
  })
}

// Create comment mutation
export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: TaskCommentFormData) => {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create comment')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      toast.success('Comment added')
    },
    onError: (error) => {
      toast.error('Failed to add comment')
      console.error('Create comment error:', error)
    },
  })
}

// Task statistics for dashboard
export function useTaskStatistics(projectId?: string) {
  return useQuery<TaskStatistics>({
    queryKey: ['task-statistics', projectId],
    queryFn: async () => {
      const params = projectId ? `?project_id=${projectId}` : ''
      const response = await fetch(`/api/tasks/statistics${params}`)
      if (!response.ok) throw new Error('Failed to fetch task statistics')
      return response.json()
    },
    staleTime: 60000, // 1 minute
  })
}

// Quick status update
export function useQuickStatusUpdate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update status')
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] })
      toast.success('Status updated')
    },
    onError: (error) => {
      toast.error('Failed to update status')
      console.error('Status update error:', error)
    },
  })
}