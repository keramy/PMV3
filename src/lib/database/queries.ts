/**
 * Formula PM V3 Database Query Helpers
 * Optimized for construction site performance and offline scenarios
 */

import { getClient } from '@/lib/supabase/client'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { 
  createTypedQuery, 
  withTransformErrorHandling,
  withErrorHandling,
  withArrayErrorHandling,
  transformUserProfile,
  transformToRawUserProfile
} from '@/lib/database-helpers'

const logger = createLogger('database-queries')
import type { 
  Database,
  UserProfile,
  AppUserProfile,
  Project,
  Task,
  ScopeItem,
  ShopDrawing,
  MaterialSpec,
  RFI,
  ChangeOrder,
  PunchItem,
  ActivityLog
} from '@/types/database'

// Temporary type for missing Milestone table
type Milestone = {
  id: string
  name: string
  due_date: string
  completed_at?: string
  status: string
}
import type { Permission } from '@/types/auth'

// ============================================================================
// USER & AUTHENTICATION QUERIES
// ============================================================================

/**
 * Get current user's profile with permissions
 * Optimized for frequent calls on construction sites
 */
export async function getCurrentUserProfile(): Promise<AppUserProfile | null> {
  try {
    const client = getClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return null

    // Use type-safe query builder
    const userQuery = createTypedQuery('user_profiles')
    const result = await withTransformErrorHandling(
      () => userQuery
        .select('*')
        .eq('id', user.id)
        .single(),
      { toApp: transformUserProfile, toRaw: transformToRawUserProfile },
      'getCurrentUserProfile'
    )

    if (!result.success) {
      logger.warn('Failed to fetch user profile', { error: result.error })
      return null
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching user profile', { error })
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
    logger.error('Error checking permission', { error })
    return false
  }
}

/**
 * Get user profile by ID (admin function)
 */
export async function getUserProfile(userId: string): Promise<AppUserProfile | null> {
  try {
    // Use type-safe query builder with admin client
    const userQuery = createTypedQuery('user_profiles', true)
    const result = await withTransformErrorHandling(
      () => userQuery
        .select('*')
        .eq('id', userId)
        .single(),
      { toApp: transformUserProfile, toRaw: transformToRawUserProfile },
      'getUserProfile'
    )

    if (!result.success) {
      logger.error('Error fetching user profile', { error: result.error })
      return null
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching user profile', { error })
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
    // Use type-safe query builder with enhanced error handling
    const result = await withArrayErrorHandling(
      async () => {
        const projectQuery = createTypedQuery('projects')
        let query = projectQuery
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

        // Apply type-safe filters for construction workflows
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

        return query
      },
      'getCompanyProjects'
    )

    if (!result.success) {
      logger.error('Error fetching projects', { error: result.error })
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }
    }

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.count || 0,
        totalPages: Math.ceil((result.count || 0) / limit)
      }
    }
  } catch (error) {
    logger.error('Error fetching projects', { error })
    return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } }
  }
}

/**
 * Get project details with related data
 * Optimized for project dashboard views
 */
export async function getProjectDetails(projectId: string) {
  try {
    // Use type-safe query builder with enhanced error handling
    const result = await withErrorHandling(
      async () => {
        const projectQuery = createTypedQuery('projects')
        return projectQuery
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
      },
      'getProjectDetails'
    )

    if (!result.success) {
      logger.error('Error fetching project details', { error: result.error })
      return null
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching project details', { error })
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
    // Use type-safe query builder with enhanced error handling
    const result = await withArrayErrorHandling(
      async () => {
        const taskQuery = createTypedQuery('tasks')
        let query = taskQuery
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
          .order('due_date', { ascending: true })

        // Apply type-safe filters
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

        return query
      },
      'getTasks'
    )

    if (!result.success) {
      logger.error('Error fetching tasks', { error: result.error })
      return []
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching tasks', { error })
    return []
  }
}

/**
 * Get overdue tasks for dashboard alerts
 * Critical for construction site management
 */
export async function getOverdueTasks(projectId?: string) {
  try {
    // Use type-safe query builder with enhanced error handling
    const result = await withArrayErrorHandling(
      async () => {
        const taskQuery = createTypedQuery('tasks')
        let query = taskQuery
          .select(`
            *,
            projects (name),
            user_profiles!assigned_to (full_name)
          `)
          .lt('due_date', new Date().toISOString().split('T')[0])
          .neq('status', 'completed')
          .neq('status', 'cancelled')

        // Apply type-safe project filter if provided
        if (projectId) {
          query = query.eq('project_id', projectId)
        }

        return query
      },
      'getOverdueTasks'
    )

    if (!result.success) {
      logger.error('Error fetching overdue tasks', { error: result.error })
      return []
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching overdue tasks', { error })
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
    // Use type-safe query builder with enhanced error handling
    const result = await withArrayErrorHandling(
      async () => {
        const scopeQuery = createTypedQuery('scope_items')
        let query = scopeQuery
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

        // Apply type-safe category filter if provided
        if (category) {
          query = query.eq('category', category)
        }

        return query
      },
      'getScopeItems'
    )

    if (!result.success) {
      logger.error('Error fetching scope items', { error: result.error })
      return []
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching scope items', { error })
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
    // Use type-safe query builder with enhanced error handling
    const result = await withArrayErrorHandling(
      async () => {
        const drawingQuery = createTypedQuery('shop_drawings')
        let query = drawingQuery
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

        // Apply type-safe status filter if provided
        if (status) {
          query = query.eq('status', status)
        }

        return query
      },
      'getShopDrawings'
    )

    if (!result.success) {
      logger.error('Error fetching shop drawings', { error: result.error })
      return []
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching shop drawings', { error })
    return []
  }
}

/**
 * Get RFIs (Request for Information) for a project
 * Critical for construction communication and issue resolution
 */
export async function getRFIs(projectId: string, status?: string) {
  try {
    // Use type-safe query builder with enhanced error handling
    const result = await withArrayErrorHandling(
      async () => {
        const rfiQuery = createTypedQuery('rfis')
        let query = rfiQuery
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
            ),
            user_profiles!assigned_to (
              full_name,
              job_title
            )
          `)
          .eq('project_id', projectId)
          .order('submitted_at', { ascending: false })

        // Apply type-safe status filter if provided
        if (status) {
          query = query.eq('status', status)
        }

        return query
      },
      'getRFIs'
    )

    if (!result.success) {
      logger.error('Error fetching RFIs', { error: result.error })
      return []
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching RFIs', { error })
    return []
  }
}

/**
 * Get material specifications for a project
 */
export async function getMaterialSpecs(projectId: string, status?: string) {
  try {
    // Use type-safe query builder with enhanced error handling
    const result = await withArrayErrorHandling(
      async () => {
        const materialQuery = createTypedQuery('material_specs')
        let query = materialQuery
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

        // Apply type-safe status filter if provided
        if (status) {
          query = query.eq('status', status)
        }

        return query
      },
      'getMaterialSpecs'
    )

    if (!result.success) {
      logger.error('Error fetching material specs', { error: result.error })
      return []
    }

    return result.data
  } catch (error) {
    logger.error('Error fetching material specs', { error })
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
    // Use Promise.all for parallel queries with enhanced error handling
    const [
      tasksResult,
      scopeResult,
      drawingsResult,
      milestonesResult
    ] = await Promise.all([
      withArrayErrorHandling(
        async () => {
          const taskQuery = createTypedQuery('tasks')
          return taskQuery
            .select('status, due_date')
            .eq('project_id', projectId)
        },
        'getProjectStats:tasks'
      ),
      
      withArrayErrorHandling(
        async () => {
          const scopeQuery = createTypedQuery('scope_items')
          return scopeQuery
            .select('status, completion_percentage, estimated_cost, actual_cost')
            .eq('project_id', projectId)
        },
        'getProjectStats:scope'
      ),
        
      withArrayErrorHandling(
        async () => {
          const drawingQuery = createTypedQuery('shop_drawings')
          return drawingQuery
            .select('status')
            .eq('project_id', projectId)
        },
        'getProjectStats:drawings'
      ),
        
      // Note: milestones table might not exist in current schema, using fallback
      withArrayErrorHandling(
        async () => {
          const milestonesQuery = createTypedQuery('milestones')
          return milestonesQuery
            .select('status, due_date, completed_at')
            .eq('project_id', projectId)
        },
        'getProjectStats:milestones'
      ).catch(() => ({ data: [] as any[], success: true, error: null as any }))
    ])

    // Handle potential errors in individual queries
    const tasks = tasksResult.success ? tasksResult.data : []
    const scopeItems = scopeResult.success ? scopeResult.data : []
    const drawings = drawingsResult.success ? drawingsResult.data : []
    const milestones = milestonesResult.success ? milestonesResult.data : []

    return {
      tasks: {
        total: tasks.length,
        completed: tasks.filter((t: any) => t.status === 'completed').length,
        inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
        overdue: tasks.filter((t: any) => t.status !== 'completed' && new Date(t.due_date) < new Date()).length
      },
      scope: {
        total: scopeItems.length,
        completed: scopeItems.filter((s: any) => s.status === 'completed').length,
        avgCompletion: scopeItems.length > 0 
          ? Math.round(scopeItems.reduce((sum: number, s: any) => sum + (Number(s.completion_percentage) || 0), 0) / scopeItems.length)
          : 0,
        budgetVariance: scopeItems.reduce((sum: number, s: any) => sum + ((Number(s.actual_cost) || 0) - (Number(s.estimated_cost) || 0)), 0)
      },
      drawings: {
        total: drawings.length,
        approved: drawings.filter((d: any) => d.status === 'approved').length,
        pending: drawings.filter((d: any) => ['draft', 'internal_review', 'client_review'].includes(d.status)).length
      },
      milestones: {
        total: milestones.length,
        completed: milestones.filter((m: any) => m.status === 'completed').length,
        overdue: milestones.filter((m: any) => m.status !== 'completed' && new Date(m.due_date) < new Date()).length
      }
    }
  } catch (error) {
    logger.error('Error fetching project stats', { error })
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
    const client = getClient()
    const { error } = await client.from('user_profiles').select('id').limit(1)
    return !error
  } catch (error) {
    logger.warn('Database connection check failed', { error })
    return false
  }
}

/**
 * Get connection latency (useful for construction site diagnostics)
 */
export async function measureConnectionLatency(): Promise<number> {
  const start = Date.now()
  try {
    const client = getClient()
    await client.from('user_profiles').select('id').limit(1)
    return Date.now() - start
  } catch (error) {
    return -1 // Connection failed
  }
}