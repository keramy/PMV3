/**
 * Real-time Task Updates Hook
 * Listens for task and comment changes via Supabase Realtime
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

export function useTaskRealtime(projectId?: string) {
  const queryClient = useQueryClient()
  const supabase = getClient()

  useEffect(() => {
    if (!projectId) return

    // Listen for task changes
    const taskChannel = supabase
      .channel(`tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Task change detected:', payload)
          
          // Invalidate task queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
          queryClient.invalidateQueries({ queryKey: ['task-statistics'] })
          
          // If it's a specific task update, invalidate that task's data
          if ((payload.new as any)?.id || (payload.old as any)?.id) {
            const taskId = (payload.new as any)?.id || (payload.old as any)?.id
            queryClient.invalidateQueries({ queryKey: ['task', taskId] })
          }
        }
      )
      .subscribe()

    // Listen for comment changes
    const commentChannel = supabase
      .channel(`task-comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_comments'
        },
        async (payload) => {
          console.log('Comment change detected:', payload)
          
          // Get task_id to invalidate specific task comments
          let taskId: string | null = null
          
          if ((payload.new as any)?.task_id) {
            taskId = (payload.new as any).task_id
          } else if ((payload.old as any)?.task_id) {
            taskId = (payload.old as any).task_id
          }
          
          if (taskId) {
            // Check if this comment belongs to our project
            const { data: task } = await supabase
              .from('tasks')
              .select('project_id')
              .eq('id', taskId)
              .single()
            
            if (task && 'project_id' in task && task.project_id === projectId) {
              // Invalidate specific task comments and task data
              queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
              queryClient.invalidateQueries({ queryKey: ['task', taskId] })
              
              // Also invalidate task list to update comment counts
              queryClient.invalidateQueries({ queryKey: ['tasks'] })
            }
          }
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(commentChannel)
    }
  }, [projectId, queryClient, supabase])
}

// Hook for real-time updates on a specific task
export function useTaskDetailRealtime(taskId?: string) {
  const queryClient = useQueryClient()
  const supabase = getClient()

  useEffect(() => {
    if (!taskId) return

    // Listen for changes to this specific task
    const taskChannel = supabase
      .channel(`task-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `id=eq.${taskId}`
        },
        (payload) => {
          console.log('Task detail change:', payload)
          
          // Invalidate this specific task's data
          queryClient.invalidateQueries({ queryKey: ['task', taskId] })
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
      )
      .subscribe()

    // Listen for new comments on this task
    const commentChannel = supabase
      .channel(`task-${taskId}-comments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_comments',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          console.log('Task comment change:', payload)
          
          // Invalidate task comments and task data
          queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
          queryClient.invalidateQueries({ queryKey: ['task', taskId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(commentChannel)
    }
  }, [taskId, queryClient, supabase])
}