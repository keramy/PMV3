/**
 * Notification System Types for Formula PM V3
 * In-app notification system for construction project management
 */

// Notification types - matches database CHECK constraint
export type NotificationType = 
  | 'task_assignment'
  | 'task_mention'
  | 'task_status_change'
  | 'task_due_reminder'
  | 'task_comment'
  | 'project_update'

// Core notification interface
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, any> // Additional context data
  read_at: string | null
  created_at: string
  updated_at: string
}

// Notification with populated relations (for API responses)
export interface NotificationWithUser extends Notification {
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

// User notification preferences
export interface NotificationPreferences {
  user_id: string
  in_app_enabled: boolean
  mention_notifications: boolean
  assignment_notifications: boolean
  status_change_notifications: boolean
  due_date_notifications: boolean
  comment_notifications: boolean
  created_at: string
  updated_at: string
}

// Notification creation data
export interface CreateNotificationData {
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

// API request/response types
export interface NotificationListResponse {
  notifications: Notification[]
  unread_count: number
  total: number
  page: number
  limit: number
  has_next: boolean
  has_previous: boolean
}

export interface NotificationFilters {
  type?: NotificationType[]
  unread_only?: boolean
  page?: number
  limit?: number
}

export interface MarkAsReadRequest {
  notification_ids?: string[] // If not provided, marks all as read
}

export interface MarkAsReadResponse {
  marked_count: number
  success: boolean
}

// Notification data payload types for different notification types
export interface TaskAssignmentData {
  task_id: string
  task_title: string
  project_id: string
  project_name: string
  assigned_by: string
  assigned_by_name: string
  due_date?: string
}

export interface TaskMentionData {
  task_id: string
  task_title: string
  project_id: string
  project_name: string
  comment_id: string
  mentioned_by: string
  mentioned_by_name: string
}

export interface TaskStatusChangeData {
  task_id: string
  task_title: string
  project_id: string
  project_name: string
  old_status: string
  new_status: string
  changed_by: string
  changed_by_name: string
}

export interface TaskDueReminderData {
  task_id: string
  task_title: string
  project_id: string
  project_name: string
  due_date: string
  days_until_due: number
}

export interface TaskCommentData {
  task_id: string
  task_title: string
  project_id: string
  project_name: string
  comment_id: string
  comment_preview: string
  commented_by: string
  commented_by_name: string
}

// Helper functions for notification management
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'task_assignment':
      return '👤'
    case 'task_mention':
      return '@'
    case 'task_status_change':
      return '🔄'
    case 'task_due_reminder':
      return '⏰'
    case 'task_comment':
      return '💬'
    case 'project_update':
      return '📋'
    default:
      return '🔔'
  }
}

export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'task_assignment':
      return 'text-blue-600 bg-blue-50'
    case 'task_mention':
      return 'text-purple-600 bg-purple-50'
    case 'task_status_change':
      return 'text-green-600 bg-green-50'
    case 'task_due_reminder':
      return 'text-red-600 bg-red-50'
    case 'task_comment':
      return 'text-gray-600 bg-gray-50'
    case 'project_update':
      return 'text-orange-600 bg-orange-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const formatNotificationTime = (created_at: string): string => {
  const now = new Date()
  const created = new Date(created_at)
  const diff = now.getTime() - created.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Notification builder helpers
export const createTaskAssignmentNotification = (
  data: TaskAssignmentData
): Omit<CreateNotificationData, 'user_id'> => ({
  type: 'task_assignment',
  title: 'New Task Assignment',
  message: `You've been assigned to "${data.task_title}" in ${data.project_name}`,
  data
})

export const createTaskMentionNotification = (
  data: TaskMentionData
): Omit<CreateNotificationData, 'user_id'> => ({
  type: 'task_mention',
  title: 'You were mentioned',
  message: `${data.mentioned_by_name} mentioned you in "${data.task_title}"`,
  data
})

export const createTaskStatusChangeNotification = (
  data: TaskStatusChangeData
): Omit<CreateNotificationData, 'user_id'> => ({
  type: 'task_status_change',
  title: 'Task Status Updated',
  message: `"${data.task_title}" moved to ${data.new_status.replace('_', ' ')} by ${data.changed_by_name}`,
  data
})

export const createTaskDueReminderNotification = (
  data: TaskDueReminderData
): Omit<CreateNotificationData, 'user_id'> => ({
  type: 'task_due_reminder',
  title: 'Task Due Soon',
  message: `"${data.task_title}" is due ${data.days_until_due === 0 ? 'today' : `in ${data.days_until_due} day${data.days_until_due === 1 ? '' : 's'}`}`,
  data
})

export const createTaskCommentNotification = (
  data: TaskCommentData
): Omit<CreateNotificationData, 'user_id'> => ({
  type: 'task_comment',
  title: 'New Comment',
  message: `${data.commented_by_name} commented on "${data.task_title}": "${data.comment_preview}..."`,
  data
})