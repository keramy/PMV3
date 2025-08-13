/**
 * Task Comments API Route
 * Handles comments for specific tasks with @mention support
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taskCommentSchema } from '@/lib/validation/tasks'
import { Database } from '@/types/database'
import { notificationService } from '@/lib/services/notifications'
import type { TaskMentionData, TaskCommentData } from '@/types/notifications'
import type { ProjectMemberWithUser, TaskWithProject } from '@/types/api-responses'

// Helper to extract user IDs from @mentions
async function extractMentionedUsers(
  comment: string, 
  projectId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string[]> {
  // Extract @mentions from comment (e.g., @john.smith, @mary)
  const mentionPattern = /@(\w+(?:\.\w+)?)/g
  const matches = comment.matchAll(mentionPattern)
  const usernames = Array.from(matches, m => m[1].toLowerCase())
  
  if (usernames.length === 0) return []

  // Get project members  
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select(`
      user:user_profiles(
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('project_id', projectId)

  if (!projectMembers) return []

  // Match usernames to user IDs
  const mentionedUserIds: string[] = []
  
  for (const username of usernames) {
    const member = (projectMembers as ProjectMemberWithUser[]).find((pm) => {
      if (!pm.user) return false
      
      // Try different username formats
      const firstName = pm.user.first_name?.toLowerCase() || ''
      const lastName = pm.user.last_name?.toLowerCase() || ''
      const email = pm.user.email?.toLowerCase() || ''
      const emailPrefix = email.split('@')[0]
      
      return (
        username === firstName ||
        username === lastName ||
        username === `${firstName}.${lastName}` ||
        username === emailPrefix
      )
    })
    
    if (member?.user?.id && !mentionedUserIds.includes(member.user.id)) {
      mentionedUserIds.push(member.user.id)
    }
  }
  
  return mentionedUserIds
}

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

    // Get task to verify it exists and get project_id
    const { data: task } = await supabase
      .from('tasks')
      .select(`
        id, 
        project_id, 
        title, 
        assigned_to,
        projects!inner(name)
      `)
      .eq('id', (await params).id)
      .single()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has access to this project
    const { data: memberAccess } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', task.project_id)
      .eq('user_id', session.user.id)
      .single()

    if (!memberAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch comments with user details
    const { data: comments, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:user_profiles(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('task_id', (await params).id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Comments fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    // Process mentions to get user details
    if (comments && comments.length > 0) {
      const allMentionedIds = new Set<string>()
      comments.forEach(comment => {
        if (comment.mentions && Array.isArray(comment.mentions)) {
          comment.mentions.forEach(id => allMentionedIds.add(id))
        }
      })

      if (allMentionedIds.size > 0) {
        const { data: mentionedUsers } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .in('id', Array.from(allMentionedIds))

        // Add mentioned user details to comments
        const mentionedUsersMap = new Map(
          mentionedUsers?.map(u => [u.id, u]) || []
        )

        comments.forEach(comment => {
          if (comment.mentions && Array.isArray(comment.mentions)) {
            (comment as any).mentioned_users = comment.mentions
              .map(id => mentionedUsersMap.get(id))
              .filter(Boolean)
          }
        })
      }
    }

    return NextResponse.json(comments || [])

  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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

    // Get task to verify it exists and get project_id
    const { data: task } = await supabase
      .from('tasks')
      .select(`
        id, 
        project_id, 
        title, 
        assigned_to,
        projects!inner(name)
      `)
      .eq('id', (await params).id)
      .single()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has access to this project
    const { data: memberAccess } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', task.project_id)
      .eq('user_id', session.user.id)
      .single()

    if (!memberAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = taskCommentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.error.errors
      }, { status: 400 })
    }

    const commentData = validation.data

    // Extract mentioned users from comment text
    const mentionedUserIds = await extractMentionedUsers(
      commentData.comment,
      task.project_id,
      supabase
    )

    // Create comment
    const { data: newComment, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: (await params).id,
        user_id: session.user.id,
        comment: commentData.comment,
        comment_type: commentData.comment_type || 'comment',
        mentions: mentionedUserIds,
        attachments: commentData.attachments || []
      })
      .select(`
        *,
        user:user_profiles(
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Comment creation error:', error)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    // Get mentioned user details and send notifications
    if (mentionedUserIds.length > 0) {
      const { data: mentionedUsers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', mentionedUserIds)

      if (mentionedUsers) {
        (newComment as any).mentioned_users = mentionedUsers

        // Send mention notifications
        const { data: commenterProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single()

        const commenterName = commenterProfile 
          ? `${commenterProfile.first_name} ${commenterProfile.last_name}`.trim()
          : 'Someone'

        const typedTask = task as TaskWithProject
        const projectName = typedTask.projects?.name || 'Unknown Project'
        const mentionData: TaskMentionData = {
          task_id: task.id,
          task_title: task.title,
          project_id: task.project_id,
          project_name: projectName,
          comment_id: newComment.id,
          mentioned_by: session.user.id,
          mentioned_by_name: commenterName
        }

        await notificationService.notifyTaskMentions(mentionedUserIds, mentionData)
      }
    }

    // Send general comment notification to task assignee (if different from commenter)
    if (task.assigned_to && task.assigned_to !== session.user.id) {
      const { data: commenterProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single()

      const commenterName = commenterProfile 
        ? `${commenterProfile.first_name} ${commenterProfile.last_name}`.trim()
        : 'Someone'

      const projectName = task.projects?.name || 'Unknown Project'
      const taskCommentData: TaskCommentData = {
        task_id: task.id,
        task_title: task.title,
        project_id: task.project_id,
        project_name: projectName,
        comment_id: newComment.id,
        comment_preview: commentData.comment.substring(0, 100),
        commented_by: session.user.id,
        commented_by_name: commenterName
      }

      await notificationService.notifyTaskComment([task.assigned_to], taskCommentData)
    }

    return NextResponse.json(newComment, { status: 201 })

  } catch (error) {
    console.error('Comment creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}