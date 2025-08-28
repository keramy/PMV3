/**
 * Mock User Data for Development Authentication Bypass
 * Provides consistent user data across the application during development
 */

import type { AuthenticatedUser } from '@/lib/api/middleware'
import type { UserProfile } from '@/types/auth'

export const MOCK_DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID || 'dev-user-123'

/**
 * Mock authenticated user for API middleware
 */
export const mockAuthenticatedUser: AuthenticatedUser = {
  id: MOCK_DEV_USER_ID,
  email: 'developer@formulapm.com',
  permissions: [
    // Project permissions
    'view_projects',
    'create_projects', 
    'edit_projects',
    'delete_projects',
    
    // Scope permissions
    'view_scope',
    'manage_scope_items',
    'assign_subcontractors',
    'approve_scope_changes',
    'export_scope_excel',
    
    // Shop drawings permissions
    'view_drawings',
    'upload_drawings',
    'internal_review_drawings',
    'client_review_drawings',
    'approve_shop_drawings',
    
    // Material specs permissions
    'view_materials',
    'create_material_specs',
    'approve_material_specs',
    'view_material_costs',
    
    // Task permissions
    'view_tasks',
    'create_tasks',
    'assign_tasks',
    'complete_tasks',
    'view_all_tasks',
    
    // Admin permissions
    'manage_users',
    'manage_permissions',
    'manage_company_settings',
    'view_audit_logs',
    
    // Financial permissions
    'view_project_costs',
    'view_project_budgets',
    'approve_invoices',
    
    // Reporting permissions
    'view_reports',
    'view_project_reports',
    'export_reports'
  ]
}

/**
 * Mock user profile for database queries
 */
export const mockUserProfile: UserProfile = {
  id: MOCK_DEV_USER_ID,
  first_name: 'Developer',
  last_name: 'User',
  email: 'developer@formulapm.com',
  job_title: 'Full Stack Developer',
  phone: '+1 (555) 123-4567',
  avatar_url: null,
  permissions: mockAuthenticatedUser.permissions || [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  is_active: true,
  // Add missing required fields from database schema
  assigned_projects: null,
  can_view_costs: true,
  role: 'admin'
}

/**
 * Check if development authentication bypass is enabled
 */
export function isDevAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development'
}

/**
 * Get mock user headers for API requests
 */
export function getMockUserHeaders(): Record<string, string> {
  if (!isDevAuthBypassEnabled()) {
    return {}
  }
  
  return {
    'X-User-ID': MOCK_DEV_USER_ID,
    'X-User-Email': 'developer@formulapm.com'
  }
}