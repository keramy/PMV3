/**
 * Formula PM V3 Database Helper Usage Examples
 * Demonstrates how to use the new type-safe database utilities
 */

import {
  // Type-safe filter functions
  eqFilter,
  neqFilter,
  inFilter,
  gtFilter,
  likeFilter,
  rangeFilter,
  andFilters,
  
  // High-level operations
  findById,
  findMany,
  insertRecord,
  updateRecord,
  deleteRecord,
  countRecords,
  recordExists,
  
  // Data transformers
  transformUserProfile,
  dateTransformer,
  jsonTransformer,
  arrayTransformer,
  
  // Error handling
  withErrorHandling,
  withArrayErrorHandling,
  withTransformErrorHandling,
  withRetry,
  
  // Query builder
  createTypedQuery,
  TypedQueryBuilder
} from './database-helpers'

// ============================================================================
// EXAMPLE 1: Type-safe filtering with filter functions
// ============================================================================

export async function getActiveProjectsExample() {
  // Using filter functions for type-safe queries
  const result = await findMany('projects', {
    filters: [
      eqFilter<'projects', 'status'>('status', 'active'),
      neqFilter<'projects', 'company_id'>('company_id', null),
      gtFilter<'projects', 'created_at'>('created_at', '2024-01-01')
    ],
    orderBy: { column: 'created_at', ascending: false },
    limit: 10
  })
  
  if (result.success) {
    console.log(`Found ${result.data.length} active projects`)
    return result.data
  } else {
    console.error('Failed to fetch projects:', result.error?.message)
    return []
  }
}

// ============================================================================
// EXAMPLE 2: Complex filtering with AND/OR logic
// ============================================================================

export async function getTasksByStatusAndPriorityExample() {
  const result = await findMany('tasks', {
    filters: [
      andFilters(
        inFilter<'tasks', 'status'>('status', ['todo', 'in_progress']),
        inFilter<'tasks', 'priority'>('priority', ['high', 'critical']),
        neqFilter<'tasks', 'assigned_to'>('assigned_to', null)
      )
    ],
    orderBy: { column: 'due_date', ascending: true }
  })
  
  return result.success ? result.data : []
}

// ============================================================================
// EXAMPLE 3: Using the TypedQueryBuilder directly
// ============================================================================

export async function getProjectTasksWithCustomQueryExample(projectId: string) {
  const query = createTypedQuery('tasks')
  
  const result = await withArrayErrorHandling(
    () => query
      .select('*, user_profiles!assigned_to(id, first_name, last_name)')
      .eq('project_id', projectId)
      .in('status', ['todo', 'in_progress'])
      .order('priority', { ascending: false })
      .limit(20),
    'getProjectTasksWithCustomQuery'
  )
  
  return result
}

// ============================================================================
// EXAMPLE 4: Data transformation with user profiles
// ============================================================================

export async function getUserProfileWithTransformationExample(userId: string) {
  const result = await findById('user_profiles', userId)
  
  if (result.success && result.data) {
    // Transform the raw profile to application format
    const appProfile = transformUserProfile(result.data)
    console.log(`User: ${appProfile.full_name}`)
    console.log(`Permissions: ${appProfile.permissions.join(', ')}`)
    return appProfile
  }
  
  return null
}

// ============================================================================
// EXAMPLE 5: Insert with error handling and retry
// ============================================================================

export async function createTaskWithRetryExample(taskData: {
  title: string
  description?: string
  project_id: string
  assigned_to?: string
  priority?: string
  status?: string
}) {
  const insertOperation = () => insertRecord('tasks', {
    ...taskData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  
  // Use retry wrapper for resilient operation
  const result = await withRetry(insertOperation, 3, 1000)
  
  if (result.success) {
    console.log(`Task created successfully: ${result.data?.id}`)
    return result.data
  } else {
    console.error(`Failed to create task: ${result.error?.message}`)
    return null
  }
}

// ============================================================================
// EXAMPLE 6: Update with validation
// ============================================================================

export async function updateTaskStatusExample(taskId: string, newStatus: string) {
  // First check if task exists
  const existsResult = await recordExists('tasks', [
    eqFilter<'tasks', 'id'>('id', taskId)
  ])
  
  if (!existsResult.success || !existsResult.data) {
    return { success: false, error: 'Task not found' }
  }
  
  // Update the task
  const result = await updateRecord('tasks', taskId, {
    status: newStatus,
    updated_at: new Date().toISOString()
  })
  
  return {
    success: result.success,
    data: result.data,
    error: result.error?.message
  }
}

// ============================================================================
// EXAMPLE 7: Complex search with date ranges
// ============================================================================

export async function getTasksDueSoonExample() {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const result = await findMany('tasks', {
    filters: [
      rangeFilter<'tasks', 'due_date'>('due_date', today.toISOString(), nextWeek.toISOString()),
      neqFilter<'tasks', 'status'>('status', 'completed'),
      neqFilter<'tasks', 'assigned_to'>('assigned_to', null)
    ],
    orderBy: { column: 'due_date', ascending: true }
  })
  
  if (result.success) {
    console.log(`Found ${result.data.length} tasks due in the next week`)
    return result.data
  }
  
  return []
}

// ============================================================================
// EXAMPLE 8: Counting and pagination
// ============================================================================

export async function getPaginatedProjectsExample(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize
  
  // Get total count
  const countResult = await countRecords('projects', [
    eqFilter<'projects', 'status'>('status', 'active')
  ])
  
  // Get paginated data
  const dataResult = await findMany('projects', {
    filters: [eqFilter<'projects', 'status'>('status', 'active')],
    orderBy: { column: 'created_at', ascending: false },
    limit: pageSize,
    offset
  })
  
  if (dataResult.success && countResult.success) {
    return {
      data: dataResult.data,
      pagination: {
        page,
        pageSize,
        total: countResult.data || 0,
        totalPages: Math.ceil((countResult.data || 0) / pageSize)
      }
    }
  }
  
  return {
    data: [],
    pagination: { page, pageSize, total: 0, totalPages: 0 }
  }
}

// ============================================================================
// EXAMPLE 9: Data transformation with custom transformers
// ============================================================================

export async function getShopDrawingsWithTransformationExample(projectId: string) {
  const result = await findMany('shop_drawings', {
    filters: [eqFilter<'shop_drawings', 'project_id'>('project_id', projectId)],
    orderBy: { column: 'submitted_at', ascending: false }
  })
  
  if (result.success) {
    // Transform dates and other fields
    const transformedData = result.data.map(drawing => ({
      ...drawing,
      submitted_at: dateTransformer.toApp(drawing.submitted_at),
      reviewed_at: dateTransformer.toApp(drawing.reviewed_at),
      // Transform any JSON fields if they exist
      metadata: jsonTransformer.toApp(drawing.review_comments)
    }))
    
    return transformedData
  }
  
  return []
}

// ============================================================================
// EXAMPLE 10: Error handling with custom context
// ============================================================================

export async function safeDeleteTaskExample(taskId: string) {
  const context = `deleteTask(${taskId})`
  
  const result = await withErrorHandling(async () => {
    // First check if task has dependencies
    const dependenciesCount = await countRecords('tasks', [
      eqFilter<'tasks', 'parent_task_id'>('parent_task_id', taskId)
    ])
    
    if (dependenciesCount.success && (dependenciesCount.data || 0) > 0) {
      throw new Error('Cannot delete task with dependencies')
    }
    
    // Proceed with deletion
    return deleteRecord('tasks', taskId)
  }, context)
  
  return result
}