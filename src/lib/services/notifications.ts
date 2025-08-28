/**
 * Notification Service for Formula PM V3
 * Handles creating and managing notifications for construction workflows
 */

import { createServiceClient } from '@/lib/supabase/server'
import type {
  CreateNotificationData,
  TaskAssignmentData,
  TaskMentionData,
  TaskStatusChangeData,
  TaskDueReminderData,
  TaskCommentData
} from '@/types/notifications'

class NotificationService {
  private supabase = createServiceClient()

  /**
   * Create a single notification
   */
  async createNotification(data: CreateNotificationData): Promise<string | null> {
    try {
      const { data: notificationId } = await this.supabase
        .rpc('create_notification', {
          target_user_id: data.user_id,
          notification_type: data.type,
          notification_title: data.title,
          notification_message: data.message,
          notification_data: data.data || {}
        })

      return notificationId
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  /**
   * Create multiple notifications (for bulk operations)
   */
  async createNotifications(notifications: CreateNotificationData[]): Promise<number> {
    let successCount = 0
    
    for (const notification of notifications) {
      const id = await this.createNotification(notification)
      if (id) successCount++
    }
    
    return successCount
  }

  /**
   * Create task assignment notification
   */
  async notifyTaskAssignment(
    assigneeUserId: string,
    taskData: TaskAssignmentData
  ): Promise<string | null> {
    // Don't notify users if they assigned the task to themselves
    if (assigneeUserId === taskData.assigned_by) {
      return null
    }

    return this.createNotification({
      user_id: assigneeUserId,
      type: 'task_assignment',
      title: 'New Task Assignment',
      message: `You've been assigned to "${taskData.task_title}" in ${taskData.project_name}`,
      data: taskData
    })
  }

  /**
   * Create task mention notifications (for multiple users)
   */
  async notifyTaskMentions(
    mentionedUserIds: string[],
    mentionData: TaskMentionData
  ): Promise<number> {
    // Filter out the user who made the mention
    const targetUserIds = mentionedUserIds.filter(id => id !== mentionData.mentioned_by)
    
    if (targetUserIds.length === 0) return 0

    const notifications: CreateNotificationData[] = targetUserIds.map(userId => ({
      user_id: userId,
      type: 'task_mention',
      title: 'You were mentioned',
      message: `${mentionData.mentioned_by_name} mentioned you in "${mentionData.task_title}"`,
      data: mentionData
    }))

    return this.createNotifications(notifications)
  }

  /**
   * Create task status change notification
   */
  async notifyTaskStatusChange(
    taskData: TaskStatusChangeData,
    notifyUserIds?: string[] // If not provided, will notify assignee and project team
  ): Promise<number> {
    // Don't notify the user who made the change
    let targetUserIds = notifyUserIds || []
    
    if (!notifyUserIds || notifyUserIds.length === 0) {
      // Get task assignee and project team members
      try {
        const { data: task } = await this.supabase
          .from('tasks')
          .select(`
            assigned_to,
            project_id,
            projects!inner(
              project_members(user_id)
            )
          `)
          .eq('id', taskData.task_id)
          .single()

        if (task) {
          targetUserIds = []
          
          // Add assignee if exists
          if (task.assigned_to) {
            targetUserIds.push(task.assigned_to)
          }
          
          // Add project team members (limit to avoid spam)
          const projectMembers = (task.projects as any)?.project_members || []
          targetUserIds.push(...projectMembers.map((pm: any) => pm.user_id).slice(0, 5))
        }
      } catch (error) {
        console.error('Error getting task notification targets:', error)
      }
    }

    // Filter out duplicates and the user who made the change
    const uniqueTargetIds = [...new Set(targetUserIds)].filter(id => id !== taskData.changed_by)
    
    if (uniqueTargetIds.length === 0) return 0

    const notifications: CreateNotificationData[] = uniqueTargetIds.map(userId => ({
      user_id: userId,
      type: 'task_status_change',
      title: 'Task Status Updated',
      message: `"${taskData.task_title}" moved to ${taskData.new_status.replace('_', ' ')} by ${taskData.changed_by_name}`,
      data: taskData
    }))

    return this.createNotifications(notifications)
  }

  /**
   * Create task due reminder notifications
   */
  async notifyTaskDueReminder(
    assigneeUserId: string,
    reminderData: TaskDueReminderData
  ): Promise<string | null> {
    return this.createNotification({
      user_id: assigneeUserId,
      type: 'task_due_reminder',
      title: 'Task Due Soon',
      message: `"${reminderData.task_title}" is due ${reminderData.days_until_due === 0 ? 'today' : `in ${reminderData.days_until_due} day${reminderData.days_until_due === 1 ? '' : 's'}`}`,
      data: reminderData
    })
  }

  /**
   * Create task comment notification
   */
  async notifyTaskComment(
    notifyUserIds: string[], // Task assignee, mentioned users, project team
    commentData: TaskCommentData
  ): Promise<number> {
    // Filter out the user who made the comment
    const targetUserIds = notifyUserIds.filter(id => id !== commentData.commented_by)
    
    if (targetUserIds.length === 0) return 0

    const notifications: CreateNotificationData[] = targetUserIds.map(userId => ({
      user_id: userId,
      type: 'task_comment',
      title: 'New Comment',
      message: `${commentData.commented_by_name} commented on "${commentData.task_title}": "${commentData.comment_preview}..."`,
      data: commentData
    }))

    return this.createNotifications(notifications)
  }

  /**
   * Schedule due date reminder notifications (for background job)
   */
  async scheduleTaskDueReminders(): Promise<number> {
    try {
      // Find tasks due in 1 day or today that haven't been completed
      const { data: upcomingTasks } = await this.supabase
        .from('tasks')
        .select(`
          id,
          title,
          assigned_to,
          due_date,
          project_id,
          projects(name)
        `)
        .not('assigned_to', 'is', null)
        .not('status', 'eq', 'completed')
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString().split('T')[0]) // Today or later
        .lte('due_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Within 24 hours

      if (!upcomingTasks || upcomingTasks.length === 0) {
        return 0
      }

      let notificationCount = 0

      for (const task of upcomingTasks) {
        if (!task.assigned_to || !task.due_date) continue

        const dueDate = new Date(task.due_date)
        const now = new Date()
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Only send reminders for today (0) or tomorrow (1)
        if (daysUntilDue > 1) continue

        const reminderData: TaskDueReminderData = {
          task_id: task.id,
          task_title: task.title,
          project_id: task.project_id || '',
          project_name: (task.projects as any)?.name || 'Unknown Project',
          due_date: task.due_date,
          days_until_due: daysUntilDue
        }

        const notificationId = await this.notifyTaskDueReminder(task.assigned_to, reminderData)
        if (notificationId) notificationCount++
      }

      return notificationCount
    } catch (error) {
      console.error('Error scheduling due date reminders:', error)
      return 0
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Export for testing or custom usage
export { NotificationService }