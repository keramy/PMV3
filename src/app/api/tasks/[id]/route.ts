/**
 * Individual Task API Route
 * Handles operations for specific tasks
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taskUpdateSchema } from '@/lib/validation/tasks'
import { Database } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch task with relations
    const { data: task, error } = await supabase
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
      `)
      .eq('id', (await params).id)
      .single()

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Get comment count
    const { count: commentCount } = await supabase
      .from('task_comments')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', (await params).id)

    // Get latest comment
    const { data: latestComment } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:user_profiles(
          id, 
          first_name, 
          last_name, 
          avatar_url
        )
      `)
      .eq('task_id', (await params).id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      ...task,
      comment_count: commentCount || 0,
      latest_comment: latestComment
    })

  } catch (error) {
    console.error('Task fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = taskUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    const updates = validation.data

    // Get current task to check for changes
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', (await params).id)
      .single()

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Update task
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', (await params).id)
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
      `)
      .single()

    if (error) {
      console.error('Task update error:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    // Get user name for comments
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', session.user.id)
      .single()
    
    const userName = userProfile 
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
      : 'Someone'

    // Track status changes
    if (updates.status && updates.status !== currentTask.status) {
      await supabase
        .from('task_comments')
        .insert({
          task_id: (await params).id,
          user_id: session.user.id,
          comment: `${userName} changed status from ${currentTask.status} to ${updates.status}`,
          comment_type: 'status_change'
        })
    }

    // Track assignment changes
    if (updates.assigned_to !== undefined && updates.assigned_to !== currentTask.assigned_to) {
      let comment = ''
      
      if (!updates.assigned_to) {
        comment = `${userName} unassigned this task`
      } else {
        const { data: assigneeProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('id', updates.assigned_to)
          .single()
        
        const assigneeName = assigneeProfile
          ? `${assigneeProfile.first_name} ${assigneeProfile.last_name}`.trim()
          : 'someone'
        
        comment = `${userName} assigned this task to ${assigneeName}`
      }

      await supabase
        .from('task_comments')
        .insert({
          task_id: (await params).id,
          user_id: session.user.id,
          comment,
          comment_type: 'assignment'
        })
    }

    return NextResponse.json(updatedTask)

  } catch (error) {
    console.error('Task update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete task (comments will cascade delete)
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', (await params).id)

    if (error) {
      console.error('Task deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Task deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}