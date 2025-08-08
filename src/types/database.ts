/**
 * Formula PM V3 Database Types
 * Enhanced type definitions with simplified aliases for common database operations
 * Combines auto-generated Supabase types with custom application types
 */

// Export all generated types from Supabase
export * from './database.generated'
export type { Database } from './database.generated'

// Import the generated Database type for extending
import type { Database as GeneratedDatabase } from './database.generated'
import type { Permission } from './auth'

// ============================================================================
// ENHANCED TYPE INFRASTRUCTURE
// ============================================================================

// Type helpers for easier access to table types
export type Tables = GeneratedDatabase['public']['Tables']
export type TableName = keyof Tables

// Generic type for extracting column keys from any table
export type ColumnKeys<T extends TableName> = keyof Tables[T]['Row']

// Generic type for table row data
export type TableRow<T extends TableName> = Tables[T]['Row']

// Generic type for table insert data
export type TableInsert<T extends TableName> = Tables[T]['Insert']

// Generic type for table update data
export type TableUpdate<T extends TableName> = Tables[T]['Update']

// ============================================================================
// SIMPLIFIED TYPE ALIASES FOR COMMON OPERATIONS
// ============================================================================

// Export convenient type aliases with enhanced application-specific types
export type Company = Tables['companies']['Row']
export type Subcontractor = Tables['subcontractors']['Row']
export type Project = Tables['projects']['Row']
export type ProjectMember = Tables['project_members']['Row']
export type ScopeItem = Tables['scope_items']['Row']
export type ShopDrawing = Tables['shop_drawings']['Row']
export type MaterialSpec = Tables['material_specs']['Row']
export type Task = Tables['tasks']['Row']
export type RFI = Tables['rfis']['Row']
export type ChangeOrder = Tables['change_orders']['Row']
export type PunchItem = Tables['punch_items']['Row']
export type ActivityLog = Tables['activity_logs']['Row']

// Note: Some tables from manual types don't exist in generated schema
// These would need to be created in the database first:
// - clients table
// - task_comments table  
// - milestones table

// Enhanced UserProfile type with application-specific transformations
export type UserProfileRaw = Tables['user_profiles']['Row']
export interface AppUserProfile extends Omit<UserProfileRaw, 'first_name' | 'last_name' | 'permissions'> {
  full_name: string
  permissions: Permission[]
}

// Type alias for the raw user profile (for database operations)
export type UserProfile = UserProfileRaw

// Custom application types (not in database)
export type ProjectStatus = 
  | 'planning'
  | 'bidding' 
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export type ScopeCategory = 
  | 'construction'
  | 'millwork'
  | 'electrical'
  | 'mechanical'
  | 'plumbing'
  | 'hvac'

export type ScopeStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type DrawingStatus = 
  | 'draft'
  | 'internal_review'
  | 'client_review'
  | 'approved'
  | 'rejected'
  | 'revised'

export type TaskStatus = 
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type RFIStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'responded'
  | 'closed'

export type ChangeOrderStatus = 
  | 'draft'
  | 'pending_internal'
  | 'pending_client'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export type PunchStatus = 
  | 'open'
  | 'in_progress'
  | 'ready_for_inspection'
  | 'approved'
  | 'rejected'

export type ActivityAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'approved'
  | 'rejected'
  | 'commented'
  | 'assigned'
  | 'completed'

export type ResourceType = 
  | 'project'
  | 'scope_item'
  | 'shop_drawing'
  | 'material_spec'
  | 'task'
  | 'rfi'
  | 'change_order'
  | 'punch_item'
  | 'milestone'