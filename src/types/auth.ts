import { User as SupabaseUser } from '@supabase/supabase-js'

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
  | 'create_projects'
  | 'edit_projects' 
  | 'delete_projects'
  | 'view_project_costs'
  | 'assign_project_team'
  
  // Scope management
  | 'manage_scope_items'
  | 'assign_subcontractors'
  | 'approve_scope_changes'
  | 'export_scope_excel'
  
  // Shop drawings workflow
  | 'upload_drawings'
  | 'internal_review_drawings'
  | 'client_review_drawings'
  | 'approve_drawings'
  
  // Material specifications
  | 'create_material_specs'
  | 'approve_material_specs'
  | 'view_material_costs'
  
  // Task management
  | 'create_tasks'
  | 'assign_tasks'
  | 'complete_tasks'
  | 'view_all_tasks'
  
  // Reports and analytics
  | 'view_project_reports'
  | 'export_reports'
  | 'view_timeline_gantt'
  
  // Admin functions
  | 'manage_users'
  | 'manage_permissions'
  | 'manage_company_settings'
  | 'view_audit_logs'
  
  // Client portal
  | 'access_client_portal'
  | 'view_client_projects'
  
  // Finance and billing
  | 'view_project_budgets'
  | 'manage_change_orders'
  | 'approve_invoices'

// User profile with dynamic permissions
export interface UserProfile {
  id: string
  email: string
  full_name: string
  job_title: string           // Descriptive only - not used for access control
  company_id: string
  permissions: Permission[]   // THE REAL ACCESS CONTROL
  is_active: boolean
  created_at: string
  updated_at: string
  avatar_url?: string
  phone?: string
  department?: string
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