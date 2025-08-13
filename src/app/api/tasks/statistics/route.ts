/**
 * Task Statistics API Route
 * Provides task metrics for dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import type { TaskStatistics } from '@/types/tasks'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = searchParams.get('project_id')

    // Build base query
    let baseQuery = supabase.from('tasks').select('*')
    if (projectId) {
      baseQuery = baseQuery.eq('project_id', projectId)
    }

    // Get all tasks
    const { data: allTasks } = await baseQuery

    if (!allTasks) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Calculate statistics
    const total = allTasks.length
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Status counts
    const by_status = {
      not_started: allTasks.filter(t => t.status === 'not_started').length,
      in_progress: allTasks.filter(t => t.status === 'in_progress').length,
      on_hold: allTasks.filter(t => t.status === 'on_hold').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      cancelled: allTasks.filter(t => t.status === 'cancelled').length
    }

    // Priority counts
    const by_priority = {
      low: allTasks.filter(t => t.priority === 'low').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      high: allTasks.filter(t => t.priority === 'high').length,
      critical: allTasks.filter(t => t.priority === 'critical').length
    }

    // Date-based counts
    const overdue = allTasks.filter(t => 
      t.due_date && 
      t.due_date < todayStr && 
      t.status !== 'completed'
    ).length

    const due_today = allTasks.filter(t => 
      t.due_date === todayStr && 
      t.status !== 'completed'
    ).length

    const due_this_week = allTasks.filter(t => 
      t.due_date && 
      t.due_date >= todayStr && 
      t.due_date <= weekFromNow && 
      t.status !== 'completed'
    ).length

    // User-specific counts
    const assigned_to_me = allTasks.filter(t => 
      t.assigned_to === session.user.id
    ).length

    // Get tasks mentioning the current user
    const { data: mentionedTasks } = await supabase
      .from('task_comments')
      .select('task_id')
      .contains('mentions', [session.user.id])

    const uniqueMentionedTaskIds = new Set(mentionedTasks?.map((m: any) => m.task_id) || [])
    const mentioning_me = uniqueMentionedTaskIds.size

    // Completion rate
    const completedTasks = by_status.completed
    const completion_rate = total > 0 ? Math.round((completedTasks / total) * 100) : 0

    const statistics: TaskStatistics = {
      total,
      by_status,
      by_priority,
      overdue,
      due_today,
      due_this_week,
      assigned_to_me,
      mentioning_me,
      completion_rate
    }

    return NextResponse.json(statistics)

  } catch (error) {
    console.error('Task statistics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}