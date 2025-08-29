/**
 * Formula PM V3 Database Query Helpers - CLEAN VERSION
 * Simplified for construction site performance and offline scenarios
 * Only essential functions with direct Supabase calls
 */

import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import { PermissionManager, PERMISSIONS } from '@/lib/permissions/bitwise'
import type { 
  AppUserProfile,
  Project,
  Task,
  ScopeItem,
  ShopDrawing,
  MaterialSpec
} from '@/types/database'
import type { Permission } from '@/types/auth'

// ============================================================================
// USER & AUTHENTICATION QUERIES
// ============================================================================

/**
 * Get current user's profile with permissions
 */
export async function getCurrentUserProfile(): Promise<AppUserProfile | null> {
  try {
    const client = getSupabaseSingleton()
    const { data: { user }, error: userError } = await client.auth.getUser()
    
    if (!user || userError) {
      return null
    }

    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    const appProfile: AppUserProfile = {
      ...profile,
      permissions: Array.isArray(profile.permissions) ? profile.permissions as Permission[] : [],
      permissions_bitwise: profile.permissions_bitwise || 0,
      full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'No Name',
      role: profile.role || null,
      assigned_projects: profile.assigned_projects || null
    }

    return appProfile
  } catch (error) {
    console.error('Error getting current user profile:', error)
    return null
  }
}

/**
 * Check if current user has a specific permission using bitwise check
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile()
    if (!profile || !profile.permissions_bitwise) return false

    // Map old Permission strings to bitwise constants using proper PERMISSIONS constants
    const PERMISSION_MAPPING: Partial<Record<Permission, number>> = {
      // Project permissions
      'view_projects': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
      'create_projects': PERMISSIONS.CREATE_PROJECTS,
      'edit_projects': PERMISSIONS.MANAGE_ALL_PROJECTS,
      'delete_projects': PERMISSIONS.DELETE_DATA,
      'edit_project_settings': PERMISSIONS.MANAGE_ALL_PROJECTS,
      'view_project_costs': PERMISSIONS.VIEW_FINANCIAL_DATA,
      'assign_project_team': PERMISSIONS.MANAGE_TEAM_MEMBERS,
      
      // Scope management
      'view_scope': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
      'manage_scope_items': PERMISSIONS.MANAGE_SCOPE,
      'assign_subcontractors': PERMISSIONS.MANAGE_SCOPE,
      'approve_scope_changes': PERMISSIONS.APPROVE_SCOPE_CHANGES,
      'export_scope_excel': PERMISSIONS.EXPORT_DATA,
      
      // Shop drawings workflow
      'view_drawings': PERMISSIONS.VIEW_SHOP_DRAWINGS,
      'upload_drawings': PERMISSIONS.CREATE_SHOP_DRAWINGS,
      'internal_review_drawings': PERMISSIONS.EDIT_SHOP_DRAWINGS,
      'client_review_drawings': PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT,
      'approve_shop_drawings': PERMISSIONS.APPROVE_SHOP_DRAWINGS,
      
      // Material specifications  
      'view_materials': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
      'create_material_specs': PERMISSIONS.MANAGE_MATERIALS,
      'approve_material_specs': PERMISSIONS.MANAGE_MATERIALS,
      
      // Task management
      'view_tasks': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
      'create_tasks': PERMISSIONS.CREATE_TASKS,
      'assign_tasks': PERMISSIONS.ASSIGN_TASKS,
      'edit_tasks': PERMISSIONS.EDIT_TASKS,
      
      // Financial permissions
      'view_all_costs': PERMISSIONS.VIEW_FINANCIAL_DATA,
      'approve_expenses': PERMISSIONS.APPROVE_EXPENSES,
      'generate_financial_reports': PERMISSIONS.EXPORT_FINANCIAL_REPORTS,
      'export_data': PERMISSIONS.EXPORT_DATA,
      
      // Admin permissions
      'manage_users': PERMISSIONS.MANAGE_ALL_USERS,
      'manage_company_settings': PERMISSIONS.MANAGE_COMPANY_SETTINGS,
      'view_audit_logs': PERMISSIONS.VIEW_AUDIT_LOGS,
      'backup_restore': PERMISSIONS.BACKUP_RESTORE_DATA,
      
      // Client permissions  
      'client_portal_access': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
      'submit_feedback': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
      'approve_drawings_client': PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT
    }

    const bitwiseConstant = PERMISSION_MAPPING[permission]
    if (bitwiseConstant === undefined) {
      console.warn(`Unknown permission: ${permission}`)
      return false
    }

    return PermissionManager.hasPermission(profile.permissions_bitwise, bitwiseConstant)
  } catch (error) {
    console.error('🔍 hasPermission - Error checking permission:', error)
    return false
  }
}

/**
 * Get user profile by ID (admin function)
 */
export async function getUserProfile(userId: string): Promise<AppUserProfile | null> {
  try {
    console.log('🔍 getUserProfile - Fetching profile for user:', userId)
    
    const client = getSupabaseSingleton()
    const { data: profile, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('🔍 getUserProfile - Error fetching user profile:', error)
      return null
    }

    if (!profile) {
      console.warn('🔍 getUserProfile - No profile found for user:', userId)
      return null
    }

    // Simple transformation
    const appProfile: AppUserProfile = {
      ...profile,
      permissions: Array.isArray(profile.permissions) ? profile.permissions as Permission[] : [],
      permissions_bitwise: profile.permissions_bitwise || 0,
      full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'No Name',
      role: profile.role || null,
      assigned_projects: profile.assigned_projects || null
    }

    console.log('🔍 getUserProfile - Profile found:', { id: appProfile.id, email: appProfile.email })
    return appProfile
  } catch (error) {
    console.error('🔍 getUserProfile - Error:', error)
    return null
  }
}

// ============================================================================
// PROJECT QUERIES - SIMPLIFIED
// ============================================================================

/**
 * Get projects for current user's company - SIMPLIFIED
 */
export async function getCompanyProjects(
  page = 1, 
  limit = 10, 
  filters: { status?: string; search?: string } = {}
) {
  try {
    console.log('🔍 getCompanyProjects - Fetching projects with filters:', filters)
    
    const client = getSupabaseSingleton()
    let query = client
      .from('projects')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('🔍 getCompanyProjects - Error fetching projects:', error)
      return {
        data: [] as any[],
        error: { message: error.message },
        totalCount: 0,
        hasMore: false
      }
    }

    console.log('🔍 getCompanyProjects - Found projects:', data?.length || 0)
    return {
      data: data || [],
      error: null,
      totalCount: count || 0,
      hasMore: (count || 0) > page * limit
    }
  } catch (error) {
    console.error('🔍 getCompanyProjects - Error:', error)
    return {
      data: [],
      error: { message: 'Failed to fetch projects' },
      totalCount: 0,
      hasMore: false
    }
  }
}

// ============================================================================
// PLACEHOLDER FUNCTIONS FOR DASHBOARD
// ============================================================================

/**
 * Basic dashboard data - simplified implementation
 */
export async function getDashboardData() {
  try {
    const client = getSupabaseSingleton()
    
    // Get basic counts for dashboard
    const [projectsResult, tasksResult] = await Promise.all([
      client.from('projects').select('*', { count: 'exact', head: true }),
      client.from('tasks').select('*', { count: 'exact', head: true })
    ])

    return {
      projects: projectsResult.count || 0,
      tasks: tasksResult.count || 0,
      error: null
    }
  } catch (error) {
    console.error('🔍 getDashboardData - Error:', error)
    return {
      projects: 0,
      tasks: 0,
      error: error
    }
  }
}