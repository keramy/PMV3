/**
 * Formula PM V3 - API Database Integration
 * Enhanced database operations specifically designed for API routes
 * Integrates with API middleware for consistent error handling
 */

import { createClient } from '@/lib/supabase/server'
import { 
  withErrorHandling, 
  withArrayErrorHandling,
  DatabaseResult,
  DatabaseArrayResult,
  eqFilter,
  neqFilter,
  inFilter,
  gtFilter,
  ltFilter,
  isNullFilter,
  andFilters
} from '@/lib/database-helpers'
import type { 
  Database,
  TableName,
  TableRow,
  TableInsert,
  TableUpdate,
  ColumnKeys
} from '@/types/database'
import type { AuthenticatedUser } from './middleware'

// ============================================================================
// API-SPECIFIC DATABASE OPERATIONS
// ============================================================================

/**
 * Enhanced database operations for API routes
 * Pre-configured with authenticated user context
 */
export class ApiDatabase {
  private user: AuthenticatedUser
  private supabase: ReturnType<typeof createClient>

  constructor(user: AuthenticatedUser, supabaseClient?: ReturnType<typeof createClient>) {
    this.user = user
    this.supabase = supabaseClient || createClient()
  }

  /**
   * Get authenticated user context
   */
  getUser(): AuthenticatedUser {
    return this.user
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    return this.user.permissions?.includes(permission as any) || false
  }

  /**
   * Type-safe insert with user context
   */
  async insert<T extends TableName>(
    tableName: T,
    data: TableInsert<T>
  ): Promise<DatabaseResult<TableRow<T>>> {
    const context = `ApiDatabase.insert(${tableName})`
    
    return withErrorHandling(async () => {
      // Automatically add user context for relevant tables
      const enhancedData = this.addUserContext(tableName, data)
      
      return this.supabase
        .from(tableName as string)
        .insert(enhancedData)
        .select('*')
        .single()
    }, context)
  }

  /**
   * Type-safe update with user context
   */
  async update<T extends TableName>(
    tableName: T,
    id: string,
    data: TableUpdate<T>
  ): Promise<DatabaseResult<TableRow<T>>> {
    const context = `ApiDatabase.update(${tableName})`
    
    return withErrorHandling(async () => {
      // Automatically add updated_at and updated_by
      const enhancedData = {
        ...data,
        updated_at: new Date().toISOString(),
        // Add updated_by if the table has this column
        ...(this.hasColumn(tableName, 'updated_by') && { updated_by: this.user.id })
      }
      
      return this.supabase
        .from(tableName as string)
        .update(enhancedData)
        .eq('id', id)
        .select('*')
        .single()
    }, context)
  }

  /**
   * Type-safe delete with user context and soft delete support
   */
  async delete<T extends TableName>(
    tableName: T,
    id: string,
    options: { soft?: boolean } = {}
  ): Promise<DatabaseResult<null>> {
    const context = `ApiDatabase.delete(${tableName})`
    
    return withErrorHandling(async () => {
      if (options.soft && this.hasColumn(tableName, 'deleted_at')) {
        // Soft delete
        return this.supabase
          .from(tableName as string)
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: this.user.id
          })
          .eq('id', id)
      } else {
        // Hard delete
        return this.supabase
          .from(tableName as string)
          .delete()
          .eq('id', id)
      }
    }, context)
  }

  /**
   * Type-safe find by ID with user context
   */
  async findById<T extends TableName>(
    tableName: T,
    id: string,
    options: {
      select?: string
      includeDeleted?: boolean
    } = {}
  ): Promise<DatabaseResult<TableRow<T>>> {
    const context = `ApiDatabase.findById(${tableName})`
    
    return withErrorHandling(async () => {
      let query = this.supabase
        .from(tableName as string)
        .select(options.select || '*')
        .eq('id', id)

      // Apply user-level filtering
      query = this.applyUserFilters(tableName, query)

      // Handle soft deletes
      if (!options.includeDeleted && this.hasColumn(tableName, 'deleted_at')) {
        query = query.is('deleted_at', null)
      }

      return query.single()
    }, context)
  }

  /**
   * Type-safe find many with user context and filtering
   */
  async findMany<T extends TableName>(
    tableName: T,
    options: {
      select?: string
      filters?: Array<(query: any) => any>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
      includeDeleted?: boolean
    } = {}
  ): Promise<DatabaseArrayResult<TableRow<T>>> {
    const context = `ApiDatabase.findMany(${tableName})`
    
    return withArrayErrorHandling(async () => {
      let query = this.supabase
        .from(tableName as string)
        .select(options.select || '*', { count: 'exact' })

      // Apply user-level filtering
      query = this.applyUserFilters(tableName, query)

      // Handle soft deletes
      if (!options.includeDeleted && this.hasColumn(tableName, 'deleted_at')) {
        query = query.is('deleted_at', null)
      }

      // Apply custom filters
      if (options.filters) {
        for (const filter of options.filters) {
          query = filter(query)
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        })
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset && options.limit) {
        query = query.range(options.offset, options.offset + options.limit - 1)
      }

      return query
    }, context)
  }

  /**
   * Type-safe count with user context
   */
  async count<T extends TableName>(
    tableName: T,
    options: {
      filters?: Array<(query: any) => any>
      includeDeleted?: boolean
    } = {}
  ): Promise<DatabaseResult<number>> {
    const context = `ApiDatabase.count(${tableName})`
    
    return withErrorHandling(async () => {
      let query = this.supabase
        .from(tableName as string)
        .select('*', { count: 'exact', head: true })

      // Apply user-level filtering
      query = this.applyUserFilters(tableName, query)

      // Handle soft deletes
      if (!options.includeDeleted && this.hasColumn(tableName, 'deleted_at')) {
        query = query.is('deleted_at', null)
      }

      // Apply custom filters
      if (options.filters) {
        for (const filter of options.filters) {
          query = filter(query)
        }
      }

      const result = await query
      return { data: result.count || 0, error: result.error }
    }, context)
  }

  /**
   * Execute RPC function with user context
   */
  async rpc<T = any>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<DatabaseResult<T>> {
    const context = `ApiDatabase.rpc(${functionName})`
    
    return withErrorHandling(async () => {
      // Add user context to RPC params where relevant
      const enhancedParams = {
        ...params,
        current_user_id: this.user.id
      }
      
      return this.supabase.rpc(functionName, enhancedParams)
    }, context)
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Add user context to insert data
   */
  private addUserContext<T extends TableName>(
    tableName: T,
    data: TableInsert<T>
  ): TableInsert<T> {
    const now = new Date().toISOString()
    const enhancedData = { ...data }

    // Add created_by and updated_by if columns exist
    if (this.hasColumn(tableName, 'created_by')) {
      (enhancedData as any).created_by = this.user.id
    }

    if (this.hasColumn(tableName, 'updated_by')) {
      (enhancedData as any).updated_by = this.user.id
    }

    // Add timestamps if columns exist
    if (this.hasColumn(tableName, 'created_at') && !enhancedData.created_at) {
      (enhancedData as any).created_at = now
    }

    if (this.hasColumn(tableName, 'updated_at')) {
      (enhancedData as any).updated_at = now
    }

    // Add company context if user has company and table has company_id
    if (this.hasColumn(tableName, 'company_id') && this.user.company_id) {
      (enhancedData as any).company_id = this.user.company_id
    }

    return enhancedData
  }

  /**
   * Apply user-level filtering based on permissions and table context
   */
  private applyUserFilters(tableName: string, query: any): any {
    // Apply company-level filtering for multi-tenant tables
    if (this.hasColumn(tableName, 'company_id') && this.user.company_id) {
      query = query.eq('company_id', this.user.company_id)
    }

    // Apply user-level filtering for personal data
    if (tableName === 'user_profiles' && !this.hasPermission('admin_access')) {
      query = query.eq('id', this.user.id)
    }

    // Apply project-level security for project-related tables
    if (this.isProjectTable(tableName) && !this.hasPermission('view_all_projects')) {
      // Users can only see projects they're assigned to or created
      query = query.or(`project_manager_id.eq.${this.user.id},assigned_to.eq.${this.user.id}`)
    }

    return query
  }

  /**
   * Check if table has a specific column
   */
  private hasColumn(tableName: string, columnName: string): boolean {
    // This would typically be determined from schema metadata
    // For now, we'll use a mapping of common patterns
    const commonColumns: Record<string, string[]> = {
      created_by: ['tasks', 'projects', 'scope_items', 'shop_drawings', 'material_specs', 'rfis', 'change_orders', 'punch_items'],
      updated_by: ['tasks', 'projects', 'scope_items', 'shop_drawings', 'material_specs', 'rfis', 'change_orders', 'punch_items'],
      created_at: ['tasks', 'projects', 'scope_items', 'shop_drawings', 'material_specs', 'rfis', 'change_orders', 'punch_items', 'user_profiles'],
      updated_at: ['tasks', 'projects', 'scope_items', 'shop_drawings', 'material_specs', 'rfis', 'change_orders', 'punch_items', 'user_profiles'],
      deleted_at: ['tasks', 'projects', 'scope_items', 'shop_drawings', 'material_specs', 'rfis', 'change_orders', 'punch_items'],
      deleted_by: ['tasks', 'projects', 'scope_items', 'shop_drawings', 'material_specs', 'rfis', 'change_orders', 'punch_items'],
      company_id: ['projects', 'user_profiles', 'companies']
    }

    return commonColumns[columnName]?.includes(tableName) || false
  }

  /**
   * Check if table is project-related
   */
  private isProjectTable(tableName: string): boolean {
    const projectTables = [
      'tasks', 'scope_items', 'shop_drawings', 'material_specs', 
      'rfis', 'change_orders', 'punch_items', 'milestones'
    ]
    return projectTables.includes(tableName)
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR COMMON PATTERNS
// ============================================================================

/**
 * Create database instance with user context
 */
export function createApiDatabase(user: AuthenticatedUser): ApiDatabase {
  return new ApiDatabase(user)
}

/**
 * Enhanced filter builders with common construction patterns
 */
export const ApiFilters = {
  // Status filters
  byStatus: (status: string) => eqFilter('status', status),
  notStatus: (status: string) => neqFilter('status', status),
  byStatuses: (statuses: string[]) => inFilter('status', statuses),

  // Priority filters  
  byPriority: (priority: string) => eqFilter('priority', priority),
  highPriority: () => inFilter('priority', ['critical', 'high']),

  // Date filters
  dueSoon: () => ltFilter('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
  overdue: () => ltFilter('due_date', new Date().toISOString()),
  createdToday: () => gtFilter('created_at', new Date().toISOString().split('T')[0]),

  // Assignment filters
  assignedTo: (userId: string) => eqFilter('assigned_to', userId),
  unassigned: () => isNullFilter('assigned_to'),
  createdBy: (userId: string) => eqFilter('created_by', userId),

  // Project filters
  inProject: (projectId: string) => eqFilter('project_id', projectId),
  inProjects: (projectIds: string[]) => inFilter('project_id', projectIds),

  // Company filters
  inCompany: (companyId: string) => eqFilter('company_id', companyId),

  // Approval filters
  needsApproval: () => eqFilter('status', 'pending_approval'),
  approved: () => eqFilter('status', 'approved'),
  rejected: () => eqFilter('status', 'rejected'),

  // Common combinations
  activeItems: () => andFilters(
    neqFilter('status', 'completed'),
    neqFilter('status', 'cancelled'),
    isNullFilter('deleted_at')
  ),

  urgentTasks: () => andFilters(
    inFilter('priority', ['critical', 'high']),
    neqFilter('status', 'completed'),
    ltFilter('due_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
  )
}

/**
 * Enhanced query builders for common construction patterns
 */
export const ApiQueries = {
  // Dashboard queries
  getDashboardMetrics: async (db: ApiDatabase, projectId?: string) => {
    const filters = projectId ? [ApiFilters.inProject(projectId)] : []
    
    const [tasks, scopeItems, shopDrawings] = await Promise.all([
      db.findMany('tasks', { 
        filters: [...filters, ApiFilters.activeItems()],
        select: 'id, status, priority, due_date'
      }),
      db.findMany('scope_items', { 
        filters: [...filters, ApiFilters.activeItems()],
        select: 'id, status'
      }),
      db.findMany('shop_drawings', { 
        filters: [...filters, ApiFilters.activeItems()],
        select: 'id, status, submitted_at'
      })
    ])

    return {
      tasks: tasks.data || [],
      scopeItems: scopeItems.data || [],
      shopDrawings: shopDrawings.data || []
    }
  },

  // Critical items needing attention
  getCriticalItems: async (db: ApiDatabase, userId: string) => {
    const [overdueTasks, pendingApprovals, urgentItems] = await Promise.all([
      db.findMany('tasks', {
        filters: [
          ApiFilters.assignedTo(userId),
          ApiFilters.overdue(),
          ApiFilters.activeItems()
        ],
        orderBy: { column: 'due_date', ascending: true },
        limit: 10
      }),
      db.findMany('shop_drawings', {
        filters: [
          ApiFilters.needsApproval(),
          ApiFilters.createdBy(userId)
        ],
        orderBy: { column: 'submitted_at', ascending: true },
        limit: 10
      }),
      db.findMany('tasks', {
        filters: [
          ApiFilters.urgentTasks(),
          ApiFilters.assignedTo(userId)
        ],
        orderBy: { column: 'due_date', ascending: true },
        limit: 5
      })
    ])

    return {
      overdueTasks: overdueTasks.data || [],
      pendingApprovals: pendingApprovals.data || [],
      urgentItems: urgentItems.data || []
    }
  }
}

// ============================================================================
// TYPE-SAFE API RESPONSE BUILDERS
// ============================================================================

/**
 * Build paginated response with consistent format
 */
export function buildPaginatedResponse<T>(
  result: DatabaseArrayResult<T>,
  page: number = 1,
  limit: number = 20
) {
  const total = result.count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    data: result.data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    },
    success: result.success,
    error: result.error
  }
}

/**
 * Build simple success response
 */
export function buildSuccessResponse<T>(
  data: T,
  message?: string
) {
  return {
    data,
    success: true,
    message,
    error: null
  }
}

/**
 * Build error response
 */
export function buildErrorResponse(
  error: string,
  details?: string,
  code?: string
) {
  return {
    data: null,
    success: false,
    error: {
      message: error,
      details,
      code
    }
  }
}

export default ApiDatabase