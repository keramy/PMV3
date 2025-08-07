/**
 * Formula PM V3 Database Query Helpers
 * Optimized for construction site performance and offline scenarios
 */

import { supabase, supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type { Permission } from '@/types/auth'

// Type helpers for better TypeScript support
type Tables = Database['public']['Tables']
type UserProfile = Tables['user_profiles']['Row']
type Project = Tables['projects']['Row']
type Task = Tables['tasks']['Row']
type ScopeItem = Tables['scope_items']['Row']

// ============================================================================
// USER & AUTHENTICATION QUERIES
// ============================================================================

/**
 * Get current user's profile with permissions
 * Optimized for frequent calls on construction sites
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.warn('🔍 Failed to fetch user profile:', error.message)
      return null
    }

    return data
  } catch (error) {
    console.error('🔍 Error fetching user profile:', error)
    return null
  }
}

/**
 * Check if current user has a specific permission
 * Cached for performance on construction sites
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile()
    if (!profile) return false

    return profile.permissions.includes(permission)
  } catch (error) {
    console.error('🔒 Error checking permission:', error)
    return false
  }
}

/**
 * Get user profile by ID (admin function)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('🔍 Error fetching user profile:', error)
    return null
  }
}

// ============================================================================
// PROJECT QUERIES
// ============================================================================

/**
 * Get projects for current user's company
 * Optimized with pagination for mobile devices
 */
export async function getCompanyProjects(
  page = 1, 
  limit = 10, 
  filters: { status?: string; search?: string } = {}
) {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        clients (
          id,
          name,
          company_name
        ),
        user_profiles!project_manager_id (
          id,
          full_name,
          job_title
        )
      `)
      .order('updated_at', { ascending: false })

    // Apply filters for construction workflows
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Pagination for mobile performance
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  } catch (error) {
    console.error('🏗️ Error fetching projects:', error)
    return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }
}

/**
 * Get project details with related data
 * Optimized for project dashboard views
 */
export async function getProjectDetails(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (
          id,
          name,
          company_name,
          email,
          phone
        ),
        user_profiles!project_manager_id (
          id,
          full_name,
          job_title,
          email
        ),
        scope_items (
          id,
          name,
          category,
          status,
          completion_percentage,
          estimated_cost,
          actual_cost
        ),
        tasks (
          id,
          title,
          status,
          priority,
          due_date,
          assigned_to
        ),
        milestones (
          id,
          name,
          due_date,
          completed_at,
          is_critical,
          status
        )
      `)
      .eq('id', projectId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('🏗️ Error fetching project details:', error)
    return null
  }
}

// ============================================================================
// TASK QUERIES
// ============================================================================

/**
 * Get tasks for a project or user
 * Optimized for construction workflow views
 */
export async function getTasks(options: {
  projectId?: string
  assignedTo?: string
  status?: string
  priority?: string
  limit?: number
} = {}) {
  try {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects!inner (
          id,
          name
        ),
        scope_items (
          id,
          name,
          category
        ),
        user_profiles!assigned_to (
          id,
          full_name,
          job_title
        ),
        user_profiles!created_by (
          id,
          full_name
        )
      `)
      .order('due_date', { ascending: true, nullsLast: true })

    if (options.projectId) {
      query = query.eq('project_id', options.projectId)
    }

    if (options.assignedTo) {
      query = query.eq('assigned_to', options.assignedTo)
    }

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.priority) {
      query = query.eq('priority', options.priority)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('📋 Error fetching tasks:', error)
    return []
  }
}

/**
 * Get overdue tasks for dashboard alerts
 * Critical for construction site management
 */
export async function getOverdueTasks(projectId?: string) {
  try {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects (name),
        user_profiles!assigned_to (full_name)
      `)
      .lt('due_date', new Date().toISOString().split('T')[0])
      .neq('status', 'completed')
      .neq('status', 'cancelled')

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('⚠️ Error fetching overdue tasks:', error)
    return []
  }
}

// ============================================================================
// SCOPE ITEM QUERIES
// ============================================================================

/**
 * Get scope items for a project
 * Essential for construction progress tracking
 */
export async function getScopeItems(projectId: string, category?: string) {
  try {
    let query = supabase
      .from('scope_items')
      .select(`
        *,
        subcontractors (
          id,
          name,
          company_name
        ),
        tasks (
          id,
          title,
          status,
          due_date
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('🏗️ Error fetching scope items:', error)
    return []
  }
}

// ============================================================================
// WORKFLOW QUERIES (Shop Drawings, Material Specs)
// ============================================================================

/**
 * Get shop drawings for a project
 * Critical for construction approval workflows
 */
export async function getShopDrawings(projectId: string, status?: string) {
  try {
    let query = supabase
      .from('shop_drawings')
      .select(`
        *,
        scope_items (
          id,
          name,
          category
        ),
        user_profiles!submitted_by (
          full_name,
          job_title
        )
      `)
      .eq('project_id', projectId)
      .order('submitted_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('📐 Error fetching shop drawings:', error)
    return []
  }
}

/**
 * Get material specifications for a project
 */
export async function getMaterialSpecs(projectId: string, status?: string) {
  try {
    let query = supabase
      .from('material_specs')
      .select(`
        *,
        scope_items (
          id,
          name,
          category
        ),
        subcontractors!supplier_id (
          name,
          company_name
        ),
        user_profiles!submitted_by (
          full_name,
          job_title
        )
      `)
      .eq('project_id', projectId)
      .order('submitted_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('🔧 Error fetching material specs:', error)
    return []
  }
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

/**
 * Get project statistics for dashboard
 * Optimized for construction KPIs
 */
export async function getProjectStats(projectId: string) {
  try {
    // Use Promise.all for parallel queries (better for poor connectivity)
    const [
      tasksResult,
      scopeResult,
      drawingsResult,
      milestonesResult
    ] = await Promise.all([
      supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId),
      
      supabase
        .from('scope_items')
        .select('status, completion_percentage, estimated_cost, actual_cost')
        .eq('project_id', projectId),
        
      supabase
        .from('shop_drawings')
        .select('status')
        .eq('project_id', projectId),
        
      supabase
        .from('milestones')
        .select('status, due_date, completed_at')
        .eq('project_id', projectId)
    ])

    const tasks = tasksResult.data || []
    const scopeItems = scopeResult.data || []
    const drawings = drawingsResult.data || []
    const milestones = milestonesResult.data || []

    return {
      tasks: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        overdue: tasks.filter(t => t.status !== 'completed' && new Date(t.due_date) < new Date()).length
      },
      scope: {
        total: scopeItems.length,
        completed: scopeItems.filter(s => s.status === 'completed').length,
        avgCompletion: scopeItems.length > 0 
          ? Math.round(scopeItems.reduce((sum, s) => sum + s.completion_percentage, 0) / scopeItems.length)
          : 0,
        budgetVariance: scopeItems.reduce((sum, s) => sum + ((s.actual_cost || 0) - (s.estimated_cost || 0)), 0)
      },
      drawings: {
        total: drawings.length,
        approved: drawings.filter(d => d.status === 'approved').length,
        pending: drawings.filter(d => ['draft', 'internal_review', 'client_review'].includes(d.status)).length
      },
      milestones: {
        total: milestones.length,
        completed: milestones.filter(m => m.status === 'completed').length,
        overdue: milestones.filter(m => m.status !== 'completed' && new Date(m.due_date) < new Date()).length
      }
    }
  } catch (error) {
    console.error('📊 Error fetching project stats:', error)
    return null
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Health check for database connection
 * Useful for construction sites with poor connectivity
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1)
    return !error
  } catch (error) {
    console.warn('🔌 Database connection check failed:', error)
    return false
  }
}

/**
 * Get connection latency (useful for construction site diagnostics)
 */
export async function measureConnectionLatency(): Promise<number> {
  const start = Date.now()
  try {
    await supabase.from('user_profiles').select('id').limit(1)
    return Date.now() - start
  } catch (error) {
    return -1 // Connection failed
  }
}