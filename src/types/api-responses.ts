/**
 * API Response Types for Formula PM V3
 * Type-safe definitions for all API endpoint responses
 */

import type { Database } from './database'

// =============================================================================
// PROJECT MEMBER QUERY RESPONSES
// =============================================================================

export interface ProjectMemberWithUser {
  id: string
  project_id: string | null
  user_id: string | null
  role: string | null
  permissions: string[] | null
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
  } | null
}

// =============================================================================
// TASK QUERY RESPONSES
// =============================================================================

export interface TaskWithProject {
  id: string
  title: string
  project_id: string | null
  projects: {
    name: string
  } | null
}

// =============================================================================
// USER PROFILE QUERY RESPONSES
// =============================================================================

export interface UserProfileBasic {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  job_title: string | null
}

// =============================================================================
// COMMENT QUERY RESPONSES
// =============================================================================

export interface TaskCommentWithUser {
  id: string
  task_id: string
  user_id: string
  comment: string
  comment_type: string | null
  mentions: string[] | null
  attachments: any | null
  created_at: string | null
  updated_at: string | null
  user: UserProfileBasic
}

// =============================================================================
// NOTIFICATION DATA TYPES
// =============================================================================

export interface TaskMentionData {
  task_id: string
  task_title: string
  project_id: string | null
  project_name: string
  comment_id: string
  mentioned_by: string
  mentioned_by_name: string
}

// =============================================================================
// API ERROR TYPES
// =============================================================================

export interface ApiErrorResponse {
  error: string
  details?: string
  code?: string
}

export interface ApiSuccessResponse<T = any> {
  data: T
  message?: string
}

// =============================================================================
// PAGINATION TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_previous: boolean
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationErrorResponse {
  error: 'Validation failed'
  details: ValidationError[]
}