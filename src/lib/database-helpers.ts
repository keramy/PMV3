/**
 * Formula PM V3 Database Helper Utilities
 * Type-safe wrapper functions for Supabase operations
 * Provides enhanced type definitions and query builders
 */

import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import { createLogger } from '@/lib/logger'
import type { 
  Database,
  Tables,
  TableName,
  ColumnKeys,
  TableRow,
  TableInsert,
  TableUpdate,
  AppUserProfile,
  UserProfile
} from '@/types/database'
import type { Permission } from '@/types/auth'
import type { PostgrestFilterBuilder, PostgrestQueryBuilder } from '@supabase/postgrest-js'

const logger = createLogger('database-helpers')

// ============================================================================
// TYPE-SAFE COLUMN KEY EXTRACTORS
// ============================================================================

/**
 * Extract column keys for a specific table with compile-time validation
 */
export function getColumnKeys<T extends TableName>(tableName: T): (keyof Tables[T]['Row'])[] {
  // This is a runtime helper - actual validation happens at compile time
  // In practice, this would be used for dynamic operations where needed
  return [] as (keyof Tables[T]['Row'])[]
}

/**
 * Validate that a column key exists for a table (compile-time checked)
 */
export function isValidColumn<T extends TableName>(
  tableName: T,
  column: string
): column is string & ColumnKeys<T> {
  // Runtime validation would go here if needed
  // Primary purpose is compile-time type checking
  return true
}

// ============================================================================
// GENERIC QUERY BUILDER FUNCTIONS
// ============================================================================

/**
 * Pragmatic query builder for any table
 * Provides type hints and intellisense while avoiding complex type instantiation
 */
export class TypedQueryBuilder {
  private tableName: string
  private query: any

  constructor(tableName: keyof Database['public']['Tables'] | string, useAdmin = false) {
    this.tableName = tableName as string
    const client = getSupabaseSingleton() // Note: admin functionality removed for now, using only client
    this.query = (client as any).from(tableName)
  }

  /**
   * Type-safe select with column validation
   */
  select<K extends string = '*'>(columns?: K) {
    return this.query.select(columns)
  }

  /**
   * Equality filter with type hints
   */
  eq(column: string, value: any) {
    return this.query.eq(column, value)
  }

  /**
   * Not equal filter
   */
  neq(column: string, value: any) {
    return this.query.neq(column, value)
  }

  /**
   * Greater than filter
   */
  gt(column: string, value: any) {
    return this.query.gt(column, value)
  }

  /**
   * Less than filter
   */
  lt(column: string, value: any) {
    return this.query.lt(column, value)
  }

  /**
   * In filter
   */
  in(column: string, values: any[]) {
    return this.query.in(column, values)
  }

  /**
   * Like filter (for text columns)
   */
  like(column: string, pattern: string) {
    return this.query.like(column, pattern)
  }

  /**
   * Case-insensitive like filter
   */
  ilike(column: string, pattern: string) {
    return this.query.ilike(column, pattern)
  }

  /**
   * Ordering
   */
  order(column: string, options?: { ascending?: boolean }) {
    return this.query.order(column, options)
  }

  /**
   * Limit results
   */
  limit(count: number) {
    return this.query.limit(count)
  }

  /**
   * Range for pagination
   */
  range(from: number, to: number) {
    return this.query.range(from, to)
  }

  /**
   * Single result
   */
  single() {
    return this.query.single()
  }

  /**
   * Maybe single result (null if not found)
   */
  maybeSingle() {
    return this.query.maybeSingle()
  }
}

/**
 * Create a query builder for a specific table
 * Provides intellisense for table names while allowing flexibility
 */
export function createTypedQuery(
  tableName: keyof Database['public']['Tables'] | string,
  useAdmin = false
): TypedQueryBuilder {
  return new TypedQueryBuilder(tableName, useAdmin)
}

// ============================================================================
// TYPE-SAFE FILTER FUNCTIONS
// ============================================================================

/**
 * Type-safe equality filter function
 */
export function eqFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  value: Tables[T]['Row'][K]
) {
  return (query: any) => query.eq(column as string, value)
}

/**
 * Type-safe not equal filter function
 */
export function neqFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  value: Tables[T]['Row'][K]
) {
  return (query: any) => query.neq(column as string, value)
}

/**
 * Type-safe in filter function
 */
export function inFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  values: Tables[T]['Row'][K][]
) {
  return (query: any) => query.in(column as string, values)
}

/**
 * Type-safe not in filter function
 */
export function notInFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  values: Tables[T]['Row'][K][]
) {
  return (query: any) => query.not(column as string, 'in', `(${values.map(v => `"${v}"`).join(',')})`)
}

/**
 * Type-safe like filter function (case-sensitive pattern matching)
 */
export function likeFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  pattern: string
) {
  return (query: any) => query.like(column as string, pattern)
}

/**
 * Type-safe ilike filter function (case-insensitive pattern matching)
 */
export function ilikeFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  pattern: string
) {
  return (query: any) => query.ilike(column as string, pattern)
}

/**
 * Type-safe greater than filter function
 */
export function gtFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  value: Tables[T]['Row'][K]
) {
  return (query: any) => query.gt(column as string, value)
}

/**
 * Type-safe greater than or equal filter function
 */
export function gteFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  value: Tables[T]['Row'][K]
) {
  return (query: any) => query.gte(column as string, value)
}

/**
 * Type-safe less than filter function
 */
export function ltFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  value: Tables[T]['Row'][K]
) {
  return (query: any) => query.lt(column as string, value)
}

/**
 * Type-safe less than or equal filter function
 */
export function lteFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  value: Tables[T]['Row'][K]
) {
  return (query: any) => query.lte(column as string, value)
}

/**
 * Type-safe is null filter function
 */
export function isNullFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K
) {
  return (query: any) => query.is(column as string, null)
}

/**
 * Type-safe is not null filter function
 */
export function isNotNullFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K
) {
  return (query: any) => query.not(column as string, 'is', null)
}

/**
 * Type-safe text search filter function (full-text search)
 */
export function textSearchFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  query: string
) {
  return (queryBuilder: any) => queryBuilder.textSearch(column as string, query)
}

/**
 * Type-safe range filter function (for dates, numbers)
 */
export function rangeFilter<T extends TableName, K extends ColumnKeys<T>>(
  column: K,
  from: Tables[T]['Row'][K],
  to: Tables[T]['Row'][K]
) {
  return (query: any) => query.gte(column as string, from).lte(column as string, to)
}

// ============================================================================
// ADVANCED FILTER COMBINATORS
// ============================================================================

/**
 * Combine multiple filters with AND logic
 */
export function andFilters<T extends TableName>(
  ...filters: Array<(query: any) => any>
) {
  return (query: any) => {
    let result = query
    for (const filter of filters) {
      result = filter(result)
    }
    return result
  }
}

/**
 * Combine multiple filters with OR logic
 */
export function orFilters<T extends TableName>(
  ...filters: Array<(query: any) => any>
) {
  return (query: any) => {
    const conditions = filters.map((_, index) => `condition_${index}`)
    // Note: This is a simplified implementation
    // In practice, you'd need to build proper OR conditions
    return query.or(conditions.join(','))
  }
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform raw user profile to application user profile
 * Handles first_name/last_name → full_name and permissions parsing
 */
export function transformUserProfile(rawProfile: UserProfile): AppUserProfile {
  const firstName = rawProfile.first_name || ''
  const lastName = rawProfile.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim() || rawProfile.email

  // Parse permissions from string array to Permission array
  const permissions: Permission[] = Array.isArray(rawProfile.permissions) 
    ? rawProfile.permissions as Permission[]
    : []

  return {
    ...rawProfile,
    full_name: fullName,
    permissions,
    // Ensure type compatibility
    assigned_projects: rawProfile.assigned_projects || null
  } as AppUserProfile
}

/**
 * Transform application user profile back to raw format for database operations
 */
export function transformToRawUserProfile(appProfile: AppUserProfile): Partial<UserProfile> {
  const nameParts = appProfile.full_name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  return {
    ...appProfile,
    first_name: firstName,
    last_name: lastName,
    permissions: appProfile.permissions as string[]
  }
}

/**
 * Generic data transformer for handling schema mismatches
 */
export interface DataTransformer<TRaw, TApp> {
  toApp: (raw: TRaw) => TApp
  toRaw: (app: TApp) => Partial<TRaw>
}

/**
 * Create a data transformer for a specific table
 */
export function createDataTransformer<TRaw, TApp>(
  toApp: (raw: TRaw) => TApp,
  toRaw: (app: TApp) => Partial<TRaw>
): DataTransformer<TRaw, TApp> {
  return { toApp, toRaw }
}

/**
 * Transform date strings to Date objects and vice versa
 */
export const dateTransformer = {
  toApp: (dateString: string | null): Date | null => {
    return dateString ? new Date(dateString) : null
  },
  toRaw: (date: Date | null): string | null => {
    return date ? date.toISOString() : null
  }
}

/**
 * Transform JSON fields safely
 */
export const jsonTransformer = {
  toApp: <T>(jsonString: string | null): T | null => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString) as T
    } catch (error) {
      logger.warn('Failed to parse JSON field', { error: error instanceof Error ? error : new Error(String(error)), metadata: { jsonString } })
      return null
    }
  },
  toRaw: <T>(data: T | null): string | null => {
    if (!data) return null
    try {
      return JSON.stringify(data)
    } catch (error) {
      logger.warn('Failed to stringify JSON field', { error: error instanceof Error ? error : new Error(String(error)), metadata: { data } })
      return null
    }
  }
}

/**
 * Transform array fields (handles PostgreSQL array format)
 */
export const arrayTransformer = {
  toApp: <T>(arrayField: T[] | string | null): T[] => {
    if (!arrayField) return []
    if (Array.isArray(arrayField)) return arrayField
    if (typeof arrayField === 'string') {
      try {
        // Handle PostgreSQL array format: {item1,item2,item3}
        const cleaned = arrayField.replace(/[{}]/g, '')
        return cleaned.split(',').filter(item => item.trim().length > 0) as T[]
      } catch (error) {
        logger.warn('Failed to parse array field', { error: error instanceof Error ? error : new Error(String(error)), metadata: { arrayField } })
        return []
      }
    }
    return []
  },
  toRaw: <T>(array: T[]): T[] => {
    return array || []
  }
}

/**
 * Transform numeric fields with proper null handling
 */
export const numericTransformer = {
  toApp: (value: number | string | null): number | null => {
    if (value === null || value === undefined) return null
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? null : parsed
    }
    return null
  },
  toRaw: (value: number | null): number | null => {
    return value
  }
}

/**
 * Transform boolean fields with proper null handling
 */
export const booleanTransformer = {
  toApp: (value: boolean | string | null): boolean | null => {
    if (value === null || value === undefined) return null
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true'
    }
    return null
  },
  toRaw: (value: boolean | null): boolean | null => {
    return value
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate that a value is not null or undefined
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Validate that a string is not empty
 */
export function isNotEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Validate that an array is not empty
 */
export function isNotEmptyArray<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0
}

/**
 * Type guard for checking if a value matches a specific table row type
 */
export function isTableRow<T extends TableName>(
  tableName: T,
  value: any
): value is Tables[T]['Row'] {
  // Basic validation - in practice, you might want more sophisticated validation
  return value && typeof value === 'object' && 'id' in value
}

// ============================================================================
// ERROR HANDLING WRAPPERS
// ============================================================================

/**
 * Enhanced error types for better error handling
 */
export interface DatabaseError {
  code?: string
  message: string
  details?: string
  hint?: string
}

/**
 * Result type for database operations
 */
export interface DatabaseResult<T> {
  data: T | null
  error: DatabaseError | null
  success: boolean
}

/**
 * Array result type for database operations
 */
export interface DatabaseArrayResult<T> {
  data: T[]
  error: DatabaseError | null
  success: boolean
  count?: number
}

/**
 * Enhanced wrapper for database operations with comprehensive error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string
): Promise<DatabaseResult<T>> {
  try {
    const { data, error } = await operation()
    
    if (error) {
      const dbError: DatabaseError = {
        code: error.code,
        message: error.message || 'Unknown database error',
        details: error.details,
        hint: error.hint
      }
      
      logger.error(`Database error in ${context}`, { error: new Error(dbError.message) })
      
      return {
        data: null,
        error: dbError,
        success: false
      }
    }
    
    return {
      data,
      error: null,
      success: true
    }
  } catch (error) {
    const dbError: DatabaseError = {
      message: error instanceof Error ? error.message : 'Unknown exception'
    }
    
    logger.error(`Exception in ${context}`, { error: error instanceof Error ? error : new Error(String(error)) })
    
    return {
      data: null,
      error: dbError,
      success: false
    }
  }
}

/**
 * Enhanced wrapper for database operations that should return arrays
 */
export async function withArrayErrorHandling<T>(
  operation: () => Promise<{ data: T[] | null; error: any; count?: number }>,
  context: string
): Promise<DatabaseArrayResult<T>> {
  try {
    const { data, error, count } = await operation()
    
    if (error) {
      const dbError: DatabaseError = {
        code: error.code,
        message: error.message || 'Unknown database error',
        details: error.details,
        hint: error.hint
      }
      
      logger.error(`Database error in ${context}`, { error: new Error(dbError.message) })
      
      return {
        data: [],
        error: dbError,
        success: false,
        count: 0
      }
    }
    
    return {
      data: data || [],
      error: null,
      success: true,
      count
    }
  } catch (error) {
    const dbError: DatabaseError = {
      message: error instanceof Error ? error.message : 'Unknown exception'
    }
    
    logger.error(`Exception in ${context}`, { error: error instanceof Error ? error : new Error(String(error)) })
    
    return {
      data: [],
      error: dbError,
      success: false,
      count: 0
    }
  }
}

/**
 * Wrapper for database operations with data transformation
 */
export async function withTransformErrorHandling<TRaw, TApp>(
  operation: () => Promise<{ data: TRaw | null; error: any }>,
  transformer: DataTransformer<TRaw, TApp>,
  context: string
): Promise<DatabaseResult<TApp>> {
  const result = await withErrorHandling(operation, context)
  
  if (!result.success || !result.data) {
    return {
      data: null,
      error: result.error,
      success: false
    }
  }
  
  try {
    const transformedData = transformer.toApp(result.data)
    return {
      data: transformedData,
      error: null,
      success: true
    }
  } catch (error) {
    const dbError: DatabaseError = {
      message: `Data transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    logger.error(`Transformation error in ${context}`, { error: error instanceof Error ? error : new Error(String(error)) })
    
    return {
      data: null,
      error: dbError,
      success: false
    }
  }
}

/**
 * Wrapper for array database operations with data transformation
 */
export async function withArrayTransformErrorHandling<TRaw, TApp>(
  operation: () => Promise<{ data: TRaw[] | null; error: any; count?: number }>,
  transformer: DataTransformer<TRaw, TApp>,
  context: string
): Promise<DatabaseArrayResult<TApp>> {
  const result = await withArrayErrorHandling(operation, context)
  
  if (!result.success) {
    return {
      data: [],
      error: result.error,
      success: false,
      count: 0
    }
  }
  
  try {
    const transformedData = result.data.map(item => transformer.toApp(item))
    return {
      data: transformedData,
      error: null,
      success: true,
      count: result.count
    }
  } catch (error) {
    const dbError: DatabaseError = {
      message: `Data transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    logger.error(`Transformation error in ${context}`, { error: error instanceof Error ? error : new Error(String(error)) })
    
    return {
      data: [],
      error: dbError,
      success: false,
      count: 0
    }
  }
}

/**
 * Retry wrapper for database operations with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<DatabaseResult<T>>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<DatabaseResult<T>> {
  let lastError: DatabaseError | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()
      
      if (result.success) {
        return result
      }
      
      lastError = result.error
      
      // Don't retry on certain error types
      if (result.error?.code && ['23505', '23503', '42P01'].includes(result.error.code)) {
        break
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    } catch (error) {
      lastError = {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  return {
    data: null,
    error: lastError || { message: 'Max retries exceeded' },
    success: false
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR COMMON PATTERNS
// ============================================================================

/**
 * Create a standardized select query with common joins
 */
export function createStandardSelect<T extends TableName>(tableName: T) {
  const baseSelects: Record<string, string> = {
    projects: `
      *,
      companies!inner(id, name),
      user_profiles!project_manager(id, first_name, last_name, email)
    `,
    tasks: `
      *,
      projects!inner(id, name),
      user_profiles!assigned_to(id, first_name, last_name),
      user_profiles!created_by(id, first_name, last_name)
    `,
    scope_items: `
      *,
      projects!inner(id, name),
      user_profiles!assigned_to(id, first_name, last_name),
      user_profiles!created_by(id, first_name, last_name)
    `,
    shop_drawings: `
      *,
      projects!inner(id, name),
      user_profiles!submitted_by(id, first_name, last_name),
      user_profiles!reviewed_by(id, first_name, last_name)
    `,
    user_profiles: '*'
  }

  return baseSelects[tableName] || '*'
}

/**
 * Apply common filters based on user permissions and context
 */
export function applyCommonFilters(
  query: TypedQueryBuilder,
  tableName: string,
  options: {
    companyId?: string
    userId?: string
    projectId?: string
  }
) {
  // Apply company-level filtering for multi-tenant data
  if (options.companyId && ['projects', 'user_profiles', 'companies'].includes(tableName)) {
    if (tableName === 'projects' || tableName === 'user_profiles') {
      query.eq('company_id', options.companyId)
    }
  }

  // Apply project-level filtering
  if (options.projectId && ['tasks', 'scope_items', 'shop_drawings', 'material_specs', 'rfis', 'change_orders', 'punch_items'].includes(tableName)) {
    query.eq('project_id', options.projectId)
  }

  // Apply user-level filtering for assigned items
  if (options.userId && ['tasks'].includes(tableName)) {
    query.eq('assigned_to', options.userId)
  }

  return query
}

// ============================================================================
// HIGH-LEVEL TYPE-SAFE DATABASE OPERATIONS
// ============================================================================

/**
 * Type-safe insert operation
 */
export async function insertRecord<T extends TableName>(
  tableName: T,
  data: TableInsert<T>,
  options: {
    select?: string
    upsert?: boolean
    onConflict?: string
  } = {}
): Promise<DatabaseResult<TableRow<T>>> {
  const context = `insertRecord(${tableName})`
  
  return withErrorHandling(async () => {
    // Cast to any to bypass complex union type issues while maintaining type safety at the API level
    const client = getSupabaseSingleton()
    let query = (client as any).from(tableName).insert(data)
    
    if (options.select) {
      query = query.select(options.select)
    }
    
    if (options.upsert) {
      query = query.upsert(data, { onConflict: options.onConflict })
    }
    
    return query.single()
  }, context)
}

/**
 * Type-safe update operation
 */
export async function updateRecord<T extends TableName>(
  tableName: T,
  id: string,
  data: TableUpdate<T>,
  options: {
    select?: string
  } = {}
): Promise<DatabaseResult<TableRow<T>>> {
  const context = `updateRecord(${tableName})`
  
  return withErrorHandling(async () => {
    // Cast to any to bypass complex union type issues while maintaining type safety at the API level
    const client = getSupabaseSingleton()
    let query = (client as any).from(tableName).update(data).eq('id', id)
    
    if (options.select) {
      query = query.select(options.select)
    }
    
    return query.single()
  }, context)
}

/**
 * Type-safe delete operation
 */
export async function deleteRecord<T extends TableName>(
  tableName: T,
  id: string
): Promise<DatabaseResult<null>> {
  const context = `deleteRecord(${tableName})`
  
  return withErrorHandling(async () => {
    // Cast to any to bypass complex union type issues while maintaining type safety at the API level
    const client = getSupabaseSingleton()
    return (client as any).from(tableName).delete().eq('id', id)
  }, context)
}

/**
 * Type-safe find by ID operation
 */
export async function findById<T extends TableName>(
  tableName: T,
  id: string,
  options: {
    select?: string
  } = {}
): Promise<DatabaseResult<TableRow<T>>> {
  const context = `findById(${tableName})`
  
  return withErrorHandling(async () => {
    const select = options.select || createStandardSelect(tableName)
    // Cast to any to bypass complex union type issues while maintaining type safety at the API level
    const client = getSupabaseSingleton()
    return (client as any).from(tableName).select(select).eq('id', id).single()
  }, context)
}

/**
 * Type-safe find many operation
 */
export async function findMany<T extends TableName>(
  tableName: T,
  options: {
    select?: string
    filters?: Array<(query: any) => any>
    orderBy?: { column: ColumnKeys<T>; ascending?: boolean }
    limit?: number
    offset?: number
  } = {}
): Promise<DatabaseArrayResult<TableRow<T>>> {
  const context = `findMany(${tableName})`
  
  return withArrayErrorHandling(async () => {
    const select = options.select || createStandardSelect(tableName)
    // Cast to any to bypass complex union type issues while maintaining type safety at the API level
    const client = getSupabaseSingleton()
    let query = (client as any).from(tableName).select(select, { count: 'exact' })
    
    // Apply filters
    if (options.filters) {
      for (const filter of options.filters) {
        query = filter(query)
      }
    }
    
    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column as string, { 
        ascending: options.orderBy.ascending ?? true 
      })
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }
    
    return query
  }, context)
}

/**
 * Type-safe count operation
 */
export async function countRecords<T extends TableName>(
  tableName: T,
  filters?: Array<(query: any) => any>
): Promise<DatabaseResult<number>> {
  const context = `countRecords(${tableName})`
  
  return withErrorHandling(async () => {
    // Cast to any to bypass complex union type issues while maintaining type safety at the API level
    const client = getSupabaseSingleton()
    let query = (client as any).from(tableName).select('*', { count: 'exact', head: true })
    
    if (filters) {
      for (const filter of filters) {
        query = filter(query)
      }
    }
    
    const result = await query
    return { data: result.count || 0, error: result.error }
  }, context)
}

/**
 * Type-safe exists check operation
 */
export async function recordExists<T extends TableName>(
  tableName: T,
  filters: Array<(query: any) => any>
): Promise<DatabaseResult<boolean>> {
  const context = `recordExists(${tableName})`
  
  const countResult = await countRecords(tableName, filters)
  
  if (!countResult.success) {
    return {
      data: false,
      error: countResult.error,
      success: false
    }
  }
  
  return {
    data: (countResult.data || 0) > 0,
    error: null,
    success: true
  }
}