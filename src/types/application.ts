/**
 * Formula PM V3 Application Types
 * Enhanced types that extend database types with application-specific fields and transformations
 */

import type { 
  Project as DatabaseProject, 
  Task as DatabaseTask,
  TableRow 
} from './database'

// ============================================================================
// PROJECT TYPES - Enhanced with application-specific fields
// ============================================================================

export interface ProjectStatus {
  planning: 'Planning'
  in_progress: 'In Progress' 
  on_hold: 'On Hold'
  completed: 'Completed'
  cancelled: 'Cancelled'
}

export type ProjectStatusKey = keyof ProjectStatus

// Enhanced Project type that maps database fields to frontend expectations
export interface AppProject extends Omit<DatabaseProject, 'client_name'> {
  // Map client_name to client for frontend compatibility
  client: string
  client_name?: string
  
  // Ensure required fields are properly typed
  status: ProjectStatusKey
  budget: number
  progress_percentage: number
  start_date: string
  end_date: string
  name: string
  id: string
  
  // Additional computed/frontend fields
  spent: number
}

// For array operations - ensures we handle the client/client_name mapping
export type ProjectListItem = AppProject

// For filtering operations
export interface ProjectFilters {
  status?: ProjectStatusKey | 'all'
  search?: string
  sortField?: keyof AppProject
  sortDirection?: 'asc' | 'desc'
}

// ============================================================================
// TASK TYPES - Enhanced with application-specific fields  
// ============================================================================

export interface TaskStatus {
  todo: 'To Do'
  in_progress: 'In Progress'
  completed: 'Completed'
  cancelled: 'Cancelled'
}

export type TaskStatusKey = keyof TaskStatus

export interface TaskPriority {
  low: 'Low'
  medium: 'Medium'
  high: 'High'
  critical: 'Critical'
}

export type TaskPriorityKey = keyof TaskPriority

// Enhanced Task type with proper typing
export interface AppTask extends DatabaseTask {
  // Ensure required fields are properly typed
  status: TaskStatusKey
  priority: TaskPriorityKey
  progress_percentage: number
  title: string
  id: string
  project_id: string
  
  // Optional enhanced fields that might come from joins
  assignee?: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
  project?: {
    id: string
    name: string
    code?: string
  }
  
  // Comment count from aggregation
  comment_count?: number
  
  // Additional computed fields for frontend
  assigned_to_name?: string
  days_overdue?: number
}

// For array operations and mapping
export type TaskListItem = AppTask

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
}

export interface ProjectMember {
  user: UserProfile
}

// ============================================================================
// SORT AND FILTER UTILITIES
// ============================================================================

// Generic sort configuration
export interface SortConfig<T = any> {
  field: keyof T | null
  direction: 'asc' | 'desc'
}

// Array callback types for proper TypeScript support
export type FilterCallback<T> = (item: T) => boolean
export type SortCallback<T> = (a: T, b: T) => number
export type MapCallback<T, U> = (item: T, index: number, array: T[]) => U
export type ReduceCallback<T, U> = (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number
  page?: number
  limit?: number
}

export interface ProjectsApiResponse extends PaginatedResponse<DatabaseProject> {
  projects: DatabaseProject[]
}

// ============================================================================
// FORM TYPES
// ============================================================================

// Project creation form data (matches the form schema)
export interface ProjectCreateFormData {
  name: string
  client_name: string
  description?: string
  start_date?: string
  end_date?: string
  budget?: string // String in form, converted to number later
  status: ProjectStatusKey
}

export interface ProjectFormData {
  name: string
  description?: string
  client_name?: string
  start_date?: string
  end_date?: string
  budget?: number
  status?: ProjectStatusKey
}

export interface TaskFormData {
  title: string
  description?: string
  assigned_to?: string
  due_date?: string
  priority?: TaskPriorityKey
  status?: TaskStatusKey
  project_id: string
}

// ============================================================================
// UTILITY FUNCTIONS FOR TYPE TRANSFORMATION
// ============================================================================

// Transform database project to app project
export function transformDatabaseProjectToApp(dbProject: DatabaseProject): AppProject {
  const { client_name, ...restProject } = dbProject
  return {
    ...restProject,
    client: client_name || '',
    status: (dbProject.status as ProjectStatusKey) || 'planning',
    budget: dbProject.budget || 0,
    progress_percentage: dbProject.progress_percentage || 0,
    start_date: dbProject.start_date || new Date().toISOString(),
    end_date: dbProject.end_date || new Date().toISOString(),
    // Calculate spent as a percentage of budget for now
    spent: dbProject.actual_cost || Math.floor((dbProject.budget || 0) * (dbProject.progress_percentage || 0) / 100),
  }
}

// Transform database task to app task  
export function transformDatabaseTaskToApp(dbTask: DatabaseTask): AppTask {
  return {
    ...dbTask,
    status: (dbTask.status as TaskStatusKey) || 'todo',
    priority: (dbTask.priority as TaskPriorityKey) || 'medium',
    progress_percentage: dbTask.progress_percentage || 0,
    project_id: dbTask.project_id || '',
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isValidProjectStatus(status: string): status is ProjectStatusKey {
  return ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'].includes(status)
}

export function isValidTaskStatus(status: string): status is TaskStatusKey {
  return ['todo', 'in_progress', 'completed', 'cancelled'].includes(status)
}

export function isValidTaskPriority(priority: string): priority is TaskPriorityKey {
  return ['low', 'medium', 'high', 'critical'].includes(priority)
}