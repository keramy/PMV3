/**
 * Tasks API Route
 * Handles task CRUD operations for Formula PM V3
 * Refactored to use centralized middleware and database patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiMiddleware } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { taskFormSchema, taskFiltersSchema } from '@/lib/validation/tasks'
import { extractMentions } from '@/types/tasks'
import { notificationService } from '@/lib/services/notifications'
import type { TaskAssignmentData } from '@/types/notifications'
import { z } from 'zod'

export const GET = apiMiddleware.queryValidate(
  taskFiltersSchema,
  async (validatedFilters, user, request) => {
    // Check permissions
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile?.permissions?.some((p: string) => p === 'view_tasks')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
      const { page, limit } = validatedFilters
      const offset = (page - 1) * limit

      // Build direct Supabase query with relationships
      let tasksQuery = supabase
        .from('tasks')
        .select(`
          *,
          assignee:user_profiles!tasks_assigned_to_fkey(
            id, 
            first_name, 
            last_name, 
            email, 
            avatar_url
          ),
          project:projects(
            id, 
            name, 
            code
          )
        `, { count: 'exact' })

      // Apply filters directly
      if (validatedFilters.project_id && validatedFilters.project_id !== 'all') {
        tasksQuery = tasksQuery.eq('project_id', validatedFilters.project_id)
      }

      if (validatedFilters.status.length > 0) {
        tasksQuery = tasksQuery.in('status', validatedFilters.status)
      }

      if (validatedFilters.priority.length > 0) {
        tasksQuery = tasksQuery.in('priority', validatedFilters.priority)
      }

      if (validatedFilters.assigned_to) {
        tasksQuery = tasksQuery.eq('assigned_to', validatedFilters.assigned_to)
      }

      if (validatedFilters.assigned_to_me) {
        tasksQuery = tasksQuery.eq('assigned_to', user.id)
      }

      if (validatedFilters.search) {
        tasksQuery = tasksQuery.or(`title.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`)
      }

      if (validatedFilters.tags.length > 0) {
        tasksQuery = tasksQuery.contains('tags', validatedFilters.tags)
      }

      if (validatedFilters.due_date_from) {
        tasksQuery = tasksQuery.gte('due_date', validatedFilters.due_date_from)
      }

      if (validatedFilters.due_date_to) {
        tasksQuery = tasksQuery.lte('due_date', validatedFilters.due_date_to)
      }

      if (validatedFilters.overdue_only) {
        const today = new Date().toISOString().split('T')[0]
        tasksQuery = tasksQuery.lt('due_date', today).neq('status', 'completed')
      }

      // Apply ordering and pagination
      tasksQuery = tasksQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data: tasks, error: tasksError, count } = await tasksQuery

      if (tasksError) {
        console.error('Tasks query error:', tasksError)
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
      }

      // Get comment counts for each task
      let commentCountMap: Record<string, number> = {}
      if (tasks && tasks.length > 0) {
        const taskIds = tasks.map((t: any) => t.id)
        const { data: comments } = await supabase
          .from('task_comments')
          .select('task_id')
          .in('task_id', taskIds)
        
        // Add comment counts to tasks
        commentCountMap = comments?.reduce((acc: any, comment: any) => {
          acc[comment.task_id] = (acc[comment.task_id] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        tasks.forEach((task: any) => {
          task.comment_count = commentCountMap[task.id] || 0
        })
      }

      // Handle mentioning_me filter
      if (validatedFilters.mentioning_me && tasks && tasks.length > 0) {
        const { data: mentions } = await supabase
          .from('task_comments')
          .select('task_id')
          .contains('mentions', [user.id])
        
        const mentionedTaskIds = new Set(mentions?.map((m: any) => m.task_id) || [])
        const filteredTasks = tasks.filter((t: any) => mentionedTaskIds.has(t.id))
        
        return NextResponse.json({
          tasks: filteredTasks,
          total: filteredTasks.length,
          page,
          limit,
          has_next: false,
          has_previous: page > 1
        })
      }

      return NextResponse.json({
        tasks: tasks || [],
        total: count || 0,
        page,
        limit,
        has_next: (count || 0) > offset + limit,
        has_previous: page > 1
      })
  }
)

// Extended task form schema to include project_id
const taskFormSchemaWithProject = taskFormSchema.extend({
  project_id: z.string().min(1, 'Project ID is required')
})

export const POST = apiMiddleware.validate(
  taskFormSchemaWithProject,
  async (validatedData, user, request) => {
    // Check permissions
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile?.permissions?.some((p: string) => p === 'create_tasks')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
      // Create task using direct Supabase
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          status: validatedData.status,
          priority: validatedData.priority,
          assigned_to: validatedData.assigned_to,
          due_date: validatedData.due_date,
          progress_percentage: validatedData.progress_percentage || 0,
          tags: validatedData.tags || [],
          attachments: validatedData.attachments || [],
          project_id: validatedData.project_id,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create task:', error)
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
      }

      // Create system comment for task creation
      if (newTask) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single()
        
        const userName = userProfile 
          ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
          : 'Someone'

        await supabase
          .from('task_comments')
          .insert({
            task_id: newTask.id,
            user_id: user.id,
            comment: `${userName} created this task`,
            comment_type: 'status_change'
          })

        // If task is assigned, create assignment comment
        if (validatedData.assigned_to && validatedData.assigned_to !== user.id) {
          const { data: assigneeProfile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', validatedData.assigned_to)
            .single()
          
          const assigneeName = assigneeProfile
            ? `${assigneeProfile.first_name} ${assigneeProfile.last_name}`.trim()
            : 'someone'

          await supabase
            .from('task_comments')
            .insert({
              task_id: newTask.id,
              user_id: user.id,
              comment: `${userName} assigned this task to ${assigneeName}`,
              comment_type: 'assignment'
            })

          // Send assignment notification
          const projectName = 'Project' // TODO: fetch project name separately if needed
          const taskAssignmentData: TaskAssignmentData = {
            task_id: newTask.id,
            task_title: newTask.title,
            project_id: newTask.project_id,
            project_name: projectName,
            assigned_by: user.id,
            assigned_by_name: userName,
            due_date: newTask.due_date || undefined
          }

          await notificationService.notifyTaskAssignment(validatedData.assigned_to, taskAssignmentData)
        }
      }

      return NextResponse.json(newTask, { status: 201 })
  }
)