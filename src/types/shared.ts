/**
 * Formula PM V3 - Shared Type Definitions
 * Consolidated common types used across multiple modules
 * Eliminates duplicate type definitions and provides single source of truth
 */

// ============================================================================
// CORE SHARED TYPES
// ============================================================================

/**
 * Unified Priority type used across all workflows
 * Used by: Tasks, Shop Drawings, Material Specs, Scope Items
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Base workflow status - common statuses used across different entities
 */
export type BaseStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'

/**
 * Construction categories unified across different workflows
 */
export type ConstructionCategory = 
  | 'construction' 
  | 'millwork' 
  | 'electrical' 
  | 'mechanical' 
  | 'plumbing' 
  | 'hvac'

// ============================================================================
// PAGINATION & FILTERING TYPES
// ============================================================================

/**
 * Standard pagination parameters used across all APIs
 */
export interface PaginationParams {
  page: number
  limit: number
}

/**
 * Standard pagination response format
 */
export interface PaginationResponse {
  page: number
  limit: number
  total: number
  total_pages: number
}

/**
 * Base filter parameters common across different list APIs
 */
export interface BaseFilters extends PaginationParams {
  project_id?: string
  search?: string
  status?: string | string[]
  priority?: Priority | Priority[]
  category?: ConstructionCategory | ConstructionCategory[]
  assigned_to?: string | string[]
  sort_field?: string
  sort_direction?: 'asc' | 'desc'
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API success response format
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  pagination?: PaginationResponse
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  success: false
  error: string
  details?: any
  validation_errors?: Record<string, string[]>
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

/**
 * Basic user reference used in relationships
 */
export interface UserReference {
  id: string
  first_name: string
  last_name: string
  email?: string
  avatar_url?: string
  job_title?: string
  company?: string
}

/**
 * Full name utility type
 */
export interface FullName {
  first_name: string
  last_name: string
}

// ============================================================================
// FORM FIELD TYPES
// ============================================================================

/**
 * Common form field types used across different forms
 */
export interface BaseFormFields {
  title: string
  description?: string
  priority: Priority
  status: string
  notes?: string
  tags?: string[]
  attachments?: string[]
}

/**
 * Date range fields commonly used in filters and forms
 */
export interface DateRangeFields {
  start_date?: string
  end_date?: string
  due_date?: string
}

/**
 * Assignment fields used across different workflows
 */
export interface AssignmentFields {
  assigned_to?: string
  created_by?: string
  submitted_by?: string
}

// ============================================================================
// AUDIT TRAIL TYPES
// ============================================================================

/**
 * Common audit fields present in most entities
 */
export interface AuditFields {
  created_at: string
  updated_at: string
  created_by?: string
}

// ============================================================================
// STATISTICS & METRICS TYPES
// ============================================================================

/**
 * Base statistics structure used across different entities
 */
export interface BaseStatistics {
  total: number
  by_status: Record<string, number>
  by_priority: Record<Priority, number>
  by_category?: Record<ConstructionCategory, number>
}

/**
 * Timeline metrics commonly used across workflows
 */
export interface TimelineMetrics {
  overdue: number
  due_today: number
  due_this_week: number
  on_schedule: number
  behind_schedule: number
}

// ============================================================================
// COLOR & STYLING CONFIGURATION
// ============================================================================

/**
 * Color configuration used for consistent styling
 */
export interface ColorConfig {
  bg: string
  text: string
  border: string
  badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary'
  icon: string
}

// ============================================================================
// VALIDATION & ERROR TYPES
// ============================================================================

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Validation errors grouped by field
 */
export type ValidationErrors = Record<string, string[]>

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Make specific fields optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific fields required
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] }

/**
 * Extract keys that are of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]