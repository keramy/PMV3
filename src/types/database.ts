/**
 * Formula PM V3 Database Types
 * Enhanced type definitions with simplified aliases for common database operations
 * Combines auto-generated Supabase types with custom application types
 */

// Export all generated types from Supabase
export * from './database.generated'

// Import the generated Database type for extending
import type { Database as GeneratedDatabase } from './database.generated'

// Re-export the primary Database type
export type Database = GeneratedDatabase
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
export interface AppUserProfile extends Omit<UserProfileRaw, 'permissions' | 'assigned_projects'> {
  full_name: string
  permissions: Permission[]
  // Keep compatible with database schema types
  assigned_projects: string[] | null
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
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'on_hold'
  | 'archived'

// Enhanced shop drawing approval stages
export type ShopDrawingApprovalStage =
  | 'not_submitted'
  | 'internal_review'
  | 'client_review'
  | 'approved'
  | 'approved_with_comments'
  | 'rejected'
  | 'resubmit_required'

// Shop drawing categories
export type ShopDrawingCategory =
  | 'construction'
  | 'millwork'
  | 'electrical'
  | 'mechanical'
  | 'plumbing'
  | 'hvac'

// Construction trades
export type ConstructionTrade =
  | 'general_contractor'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'structural_steel'
  | 'concrete'
  | 'masonry'
  | 'roofing'
  | 'glazing'
  | 'flooring'
  | 'painting'
  | 'fire_protection'
  | 'technology'
  | 'landscaping'
  | 'specialty'

// Priority levels
export type PriorityLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

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

// ============================================================================
// ENHANCED SHOP DRAWING TYPES
// ============================================================================

// Enhanced shop drawing type with new workflow fields
export interface EnhancedShopDrawing extends Omit<ShopDrawing, 'category' | 'priority'> {
  // New fields from migration
  scope_item_id?: string | null
  approval_stage?: ShopDrawingApprovalStage
  category: ShopDrawingCategory | null  // Required in base type, made explicit
  trade: ConstructionTrade | null
  priority: PriorityLevel | null  // Required in base type, made explicit
  internal_reviewer_id?: string | null
  internal_review_date?: string | null
  internal_approved?: boolean
  client_reviewer_name?: string | null
  client_review_date?: string | null
  client_approved?: boolean
  final_approval_date?: string | null
  rejection_reason?: string | null
  requires_resubmission?: boolean
  estimated_review_days?: number
  actual_review_days?: number | null
  drawing_type?: string | null
  sheet_count?: number
  contractor_name?: string | null
  consultant_name?: string | null
}

// Shop drawing comment type
export interface ShopDrawingComment {
  id: string
  shop_drawing_id: string
  user_id: string
  comment_type: 'internal' | 'client' | 'system'
  comment: string
  is_resolved?: boolean
  parent_comment_id?: string | null
  attachment_url?: string | null
  markup_data?: Record<string, any> | null
  created_at?: string
  updated_at?: string
}

// Shop drawing revision type
export interface ShopDrawingRevision {
  id: string
  shop_drawing_id: string
  revision_number: string
  revision_description?: string | null
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  uploaded_by: string
  is_current?: boolean
  superseded_by?: string | null
  approval_stage?: ShopDrawingApprovalStage
  created_at?: string
}

// Dashboard view type for shop drawings
export interface ShopDrawingDashboard {
  id: string
  project_id: string | null
  project_name: string | null
  drawing_number: string | null
  title: string
  approval_stage: ShopDrawingApprovalStage | null
  category: ShopDrawingCategory | null
  trade: ConstructionTrade | null
  priority: PriorityLevel | null
  due_date: string | null
  submitted_at: string | null
  internal_approved: boolean | null
  client_approved: boolean | null
  actual_review_days: number | null
  estimated_review_days: number | null
  submitted_by_name: string | null
  internal_reviewer_name: string | null
  scope_item_title: string | null
  unresolved_comments: number
  current_revision: string | null
  current_file_url: string | null
  created_at: string | null
  updated_at: string | null
}

// Insert types for new tables
export type ShopDrawingCommentInsert = Omit<ShopDrawingComment, 'id' | 'created_at' | 'updated_at'>
export type ShopDrawingRevisionInsert = Omit<ShopDrawingRevision, 'id' | 'created_at'>

// Update types for new tables
export type ShopDrawingCommentUpdate = Partial<Omit<ShopDrawingComment, 'id' | 'created_at'>>
export type ShopDrawingRevisionUpdate = Partial<Omit<ShopDrawingRevision, 'id' | 'created_at'>>

// Enhanced permission types for shop drawings
export type ShopDrawingPermission =
  | 'view_shop_drawings'
  | 'create_shop_drawings'
  | 'review_shop_drawings'
  | 'comment_shop_drawings'
  | 'admin_shop_drawings'
  | 'internal_review_drawings'
  | 'client_review_drawings'