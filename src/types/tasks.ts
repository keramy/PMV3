/**
 * Task Management Types for Formula PM V3
 * Simple, construction-focused task tracking
 */

import { Database } from './database'
import { UserProfile } from './auth'

// Database types
type TaskRow = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Core task types matching database schema
export type TaskStatus = 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

// Comment types
export type CommentType = 'comment' | 'status_change' | 'assignment' | 'attachment'

// File attachment interface
export interface Attachment {
  id: string
  name: string
  url: string
  type: string // MIME type: "image/jpeg", "application/pdf", etc.
  size: number
  uploaded_by?: string
  uploaded_at?: string
}

// Task interface extending database row with proper field alignment
export interface Task extends Omit<TaskRow, 'status' | 'priority'> {
  // Override database fields with proper types
  status: TaskStatus
  priority: TaskPriority
  
  // Relations (populated by API)
  assignee?: UserProfile
  project?: {
    id: string
    name: string
    code?: string
  }
  comment_count?: number
  latest_comment?: TaskComment
  
  // Note: tags and attachments are Json fields in database, handled as arrays in interface
}

// Task comment interface
export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  comment: string
  comment_type: CommentType
  mentions: string[] // Array of user IDs mentioned
  attachments: Attachment[]
  created_at: string
  updated_at: string
  
  // Relations (populated by API)
  user?: UserProfile
}

// Form data for creating/updating tasks
export interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: string
  due_date?: string
  progress_percentage?: number
  tags?: string[]
  attachments?: Attachment[]
}

// Form data for comments
export interface TaskCommentFormData {
  comment: string
  comment_type?: CommentType
  mentions?: string[]
  attachments?: Attachment[]
}

// Task filters for listing
export interface TaskFilters {
  project_id?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assigned_to?: string
  search?: string
  tags?: string[]
  due_date_from?: string
  due_date_to?: string
  overdue_only?: boolean
  assigned_to_me?: boolean
  mentioning_me?: boolean
  page?: number
  limit?: number
}

// API response for task list
export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_previous: boolean
}

// Task statistics for dashboard
export interface TaskStatistics {
  total: number
  by_status: {
    not_started: number
    in_progress: number
    on_hold: number
    completed: number
    cancelled: number
  }
  by_priority: {
    low: number
    medium: number
    high: number
    critical: number
  }
  overdue: number
  due_today: number
  due_this_week: number
  assigned_to_me: number
  mentioning_me: number
  completion_rate: number // Percentage
}

// Utility functions for task status
export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Utility functions for priority
export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'low':
      return 'text-gray-600'
    case 'medium':
      return 'text-blue-600'
    case 'high':
      return 'text-orange-600'
    case 'critical':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const getPriorityIcon = (priority: TaskPriority): string => {
  switch (priority) {
    case 'low':
      return '○'
    case 'medium':
      return '◐'
    case 'high':
      return '●'
    case 'critical':
      return '●●'
    default:
      return '○'
  }
}

// Helper to extract mentions from comment text
export const extractMentions = (text: string): string[] => {
  const mentionPattern = /@(\w+(?:\.\w+)?)/g
  const matches = text.matchAll(mentionPattern)
  return Array.from(matches, m => m[1])
}

// Helper to format comment with highlighted mentions
export const formatCommentWithMentions = (text: string, mentions: string[]): string => {
  let formatted = text
  mentions.forEach(username => {
    const pattern = new RegExp(`@${username}\\b`, 'g')
    formatted = formatted.replace(pattern, `<span class="text-blue-600 font-medium">@${username}</span>`)
  })
  return formatted
}