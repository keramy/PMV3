/**
 * Tasks API Route
 * Handles task CRUD operations for Formula PM V3
 * Refactored to use centralized middleware and database patterns
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiMiddleware } from '@/lib/api/middleware'
import { createApiDatabase, ApiFilters } from '@/lib/api/database'
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
      const db = createApiDatabase(user)
      const { page, limit } = validatedFilters
      const offset = (page - 1) * limit

      // Build filters for database query
      const filters = []

      // Only filter by project if not 'all'
      if (validatedFilters.project_id && validatedFilters.project_id !== 'all') {
        filters.push(ApiFilters.inProject(validatedFilters.project_id))
      }

      if (validatedFilters.status.length > 0) {
        filters.push(ApiFilters.byStatuses(validatedFilters.status))
      }

      if (validatedFilters.priority.length > 0) {
        filters.push((query: any) => query.in('priority', validatedFilters.priority))
      }

      if (validatedFilters.assigned_to) {
        filters.push((query: any) => query.eq('assigned_to', validatedFilters.assigned_to))
      }

      if (validatedFilters.assigned_to_me) {
        filters.push((query: any) => query.eq('assigned_to', user.id))
      }

      if (validatedFilters.search) {
        filters.push((query: any) => 
          query.or(`title.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`)
        )
      }

      if (validatedFilters.tags.length > 0) {
        filters.push((query: any) => query.contains('tags', validatedFilters.tags))
      }

      if (validatedFilters.due_date_from) {
        filters.push((query: any) => query.gte('due_date', validatedFilters.due_date_from))
      }

      if (validatedFilters.due_date_to) {
        filters.push((query: any) => query.lte('due_date', validatedFilters.due_date_to))
      }

      if (validatedFilters.overdue_only) {
        const today = new Date().toISOString().split('T')[0]
        filters.push((query: any) => query.lt('due_date', today).neq('status', 'completed'))
      }

      // Query tasks with relationships
      const result = await db.findMany('tasks', {
        select: `
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
        `,
        filters,
        orderBy: { column: 'created_at', ascending: false },
        limit,
        offset
      })

      const tasks = result.data || []

      // Get comment counts for each task
      if (tasks.length > 0) {
        const taskIds = tasks.map((t: any) => t.id)
        const commentResult = await db.findMany('task_comments', {
          select: 'task_id',
          filters: [(query: any) => query.in('task_id', taskIds)]
        })
        
        // Add comment counts to tasks
        const commentCountMap = commentResult.data?.reduce((acc: any, comment: any) => {
          acc[comment.task_id] = (acc[comment.task_id] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        tasks.forEach((task: any) => {
          task.comment_count = commentCountMap[task.id] || 0
        })
      }

      // Handle mentioning_me filter
      if (validatedFilters.mentioning_me && tasks.length > 0) {
        const mentionResult = await db.findMany('task_comments', {
          select: 'task_id',
          filters: [(query: any) => query.contains('mentions', [user.id])]
        })
        
        const mentionedTaskIds = new Set(mentionResult.data?.map((m: any) => m.task_id) || [])
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
        tasks: tasks,
        total: result.count || 0,
        page,
        limit,
        has_next: (result.count || 0) > offset + limit,
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
      const db = createApiDatabase(user)

      // Create task
      const result = await db.insert('tasks', {
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        assigned_to: validatedData.assigned_to,
        due_date: validatedData.due_date,
        progress_percentage: validatedData.progress_percentage || 0,
        tags: validatedData.tags || [],
        attachments: validatedData.attachments || [],
        project_id: validatedData.project_id
      })

      const newTask = result.data

      // Create system comment for task creation
      if (newTask) {
        const userProfile = await db.findById('user_profiles', user.id, {
          select: 'first_name, last_name'
        })
        
        const userName = userProfile.data 
          ? `${userProfile.data.first_name} ${userProfile.data.last_name}`.trim()
          : 'Someone'

        await db.insert('task_comments', {
          task_id: newTask.id,
          user_id: user.id,
          comment: `${userName} created this task`,
          comment_type: 'status_change'
        })

        // If task is assigned, create assignment comment
        if (validatedData.assigned_to && validatedData.assigned_to !== user.id) {
          const assigneeProfile = await db.findById('user_profiles', validatedData.assigned_to, {
            select: 'first_name, last_name'
          })
          
          const assigneeName = assigneeProfile.data
            ? `${assigneeProfile.data.first_name} ${assigneeProfile.data.last_name}`.trim()
            : 'someone'

          await db.insert('task_comments', {
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