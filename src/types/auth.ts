// Temporary workaround for import issue
const supabaseLib = require('@supabase/supabase-js')
type SupabaseUser = any // Will be properly typed later

/**
 * Formula PM V3 Authentication Types
 * Revolutionary Dynamic Permission System - NO MORE FIXED ROLES!
 */

// Core permission categories for construction workflows
export type PermissionCategory =
  | 'projects'
  | 'scope' 
  | 'drawings'
  | 'materials'
  | 'tasks'
  | 'reports'
  | 'admin'
  | 'clients'
  | 'finance'

// Granular permissions - Admin configurable
export type Permission =
  // Project permissions
  | 'view_projects'
  | 'create_projects'
  | 'edit_projects' 
  | 'delete_projects'
  | 'edit_project_settings'
  | 'view_project_costs'
  | 'assign_project_team'
  
  // Scope management
  | 'view_scope'
  | 'manage_scope_items'
  | 'assign_subcontractors'
  | 'approve_scope_changes'
  | 'export_scope_excel'
  
  // Shop drawings workflow
  | 'view_drawings'
  | 'upload_drawings'
  | 'internal_review_drawings'
  | 'client_review_drawings'
  | 'approve_shop_drawings'
  
  // Material specifications
  | 'view_materials'
  | 'create_material_specs'
  | 'approve_material_specs'
  | 'view_material_costs'
  
  // Task management
  | 'view_tasks'
  | 'create_tasks'
  | 'assign_tasks'
  | 'edit_tasks'
  | 'complete_tasks'
  | 'view_all_tasks'
  
  // Timeline and milestones
  | 'view_timeline'
  | 'view_milestones'
  | 'view_timeline_gantt'
  
  // RFIs and Change Orders
  | 'view_rfis'
  | 'view_change_orders'
  | 'manage_change_orders'
  
  // Quality Control
  | 'view_qc_lists'
  
  // Subcontractors
  | 'view_subcontractors'
  
  // Documents
  | 'view_documents'
  
  // Reports and analytics
  | 'view_reports'
  | 'view_project_reports'
  | 'export_reports'
  
  // Admin functions
  | 'manage_users'
  | 'manage_permissions'
  | 'manage_company_settings'
  | 'view_audit_logs' // Maps to bitwise VIEW_AUDIT_LOGS (bit 25)
  | 'backup_restore' // Maps to bitwise BACKUP_RESTORE_DATA (bit 27)
  
  // Client portal
  | 'client_portal_access' // Maps to VIEW_ASSIGNED_PROJECTS
  | 'submit_feedback' // Maps to VIEW_ASSIGNED_PROJECTS  
  | 'approve_drawings_client' // Maps to APPROVE_SHOP_DRAWINGS_CLIENT
  
  // Finance and billing
  | 'view_project_budgets'
  | 'view_all_costs'
  | 'approve_expenses'
  | 'generate_financial_reports'
  | 'export_data'
  | 'approve_invoices'

// User profile with dynamic permissions
// This extends the database UserProfile with computed fields
import type { UserProfile as DBUserProfile } from './database'

export interface UserProfile extends DBUserProfile {
  // Add computed full_name for convenience
  full_name?: string
  // Override permissions to be typed array
  permissions: Permission[]
}

// Enhanced user with Supabase auth
export interface AuthUser extends SupabaseUser {
  profile?: UserProfile
}

// Permission checking utilities
export interface PermissionCheck {
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
}

// Authentication context
export interface AuthContext {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
}

// Permission template for easy admin setup
export interface PermissionTemplate {
  id: string
  name: string
  description: string
  permissions: Permission[]
  created_at: string
}

// Common permission sets (predefined templates)
export const PERMISSION_TEMPLATES = {
  PROJECT_MANAGER: [
    'create_projects',
    'edit_projects',
    'view_project_costs',
    'assign_project_team',
    'manage_scope_items',
    'assign_subcontractors',
    'upload_drawings',
    'internal_review_drawings',
    'create_tasks',
    'assign_tasks',
    'view_project_reports',
    'view_timeline_gantt'
  ] as Permission[],
  
  TECHNICAL_LEAD: [
    'manage_scope_items',
    'approve_scope_changes',
    'upload_drawings',
    'internal_review_drawings',
    'approve_drawings',
    'create_material_specs',
    'approve_material_specs',
    'view_material_costs',
    'view_project_reports',
    'export_scope_excel'
  ] as Permission[],
  
  CLIENT: [
    'access_client_portal',
    'view_client_projects',
    'client_review_drawings',
    'view_project_reports'
  ] as Permission[],
  
  ADMIN: [
    'manage_users',
    'manage_permissions', 
    'manage_company_settings',
    'view_audit_logs'
  ] as Permission[]
} as const