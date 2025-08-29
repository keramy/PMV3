/**
 * Formula PM V3 - API Middleware Utilities
 * Centralized authentication, error handling, and validation for API routes
 * Eliminates ~400 lines of duplicate code across API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Permission } from '@/types/auth'
import { PermissionManager, PERMISSIONS } from '@/lib/permissions/bitwise'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedUser {
  id: string
  email?: string
  permissions?: Permission[]
  permissions_bitwise?: number
  role?: string | null
}

export type AuthenticatedHandler = (
  user: AuthenticatedUser,
  request: NextRequest
) => Promise<Response>

export type ValidationSchema = z.ZodSchema<any>

export interface ApiError {
  error: string
  details?: string
  code?: string
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export const ApiResponses = {
  unauthorized: (message = 'Unauthorized'): Response =>
    NextResponse.json({ error: message }, { status: 401 }),

  forbidden: (message = 'Insufficient permissions'): Response =>
    NextResponse.json({ error: message }, { status: 403 }),

  badRequest: (message = 'Invalid request data', details?: string): Response =>
    NextResponse.json({ error: message, details }, { status: 400 }),

  notFound: (message = 'Resource not found'): Response =>
    NextResponse.json({ error: message }, { status: 404 }),

  conflict: (message = 'Resource conflict'): Response =>
    NextResponse.json({ error: message }, { status: 409 }),

  tooManyRequests: (message = 'Rate limit exceeded'): Response =>
    NextResponse.json({ error: message }, { status: 429 }),

  internalError: (message = 'Internal server error', details?: string): Response => {
    // Log error details in development
    if (process.env.NODE_ENV === 'development' && details) {
      console.error('API Internal Error:', details)
    }
    return NextResponse.json({ error: message }, { status: 500 })
  },

  success: <T>(data: T): Response =>
    NextResponse.json(data),

  created: <T>(data: T): Response =>
    NextResponse.json(data, { status: 201 }),

  noContent: (): Response =>
    new Response(null, { status: 204 })
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Enhanced authentication middleware with multiple fallback strategies
 * Handles both middleware headers and direct session validation
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      // Strategy 1: Use middleware-provided user headers (preferred)
      const middlewareUserId = request.headers.get('X-User-ID')
      const middlewareUserEmail = request.headers.get('X-User-Email')
      
      if (middlewareUserId) {
        console.log('🔐 [API Auth] Using middleware user headers')
        const user: AuthenticatedUser = {
          id: middlewareUserId,
          email: middlewareUserEmail || undefined
        }
        
        // Get user permissions from database using regular auth (now allowed by new RLS policy)
        try {
          console.log('🔍 [DEBUG] Loading permissions for user:', middlewareUserId)
          
          // Use regular authenticated client - new RLS policy allows project members to see each other
          const supabase = await createClient()
          
          const { data: profile, error: dbError } = await supabase
            .from('user_profiles')
            .select('permissions_bitwise, role')
            .eq('id', middlewareUserId)
            .single()
          
          if (!dbError && profile) {
            user.permissions_bitwise = profile.permissions_bitwise || 0
            user.role = profile.role || null
            // Generate permissions array from bitwise for backward compatibility
            user.permissions = PermissionManager.getPermissionNames(user.permissions_bitwise) as Permission[]
            console.log('✅ [API Auth] Permissions loaded successfully:', {
              bitwise: user.permissions_bitwise,
              permissions: user.permissions,
              role: user.role
            })
          } else if (dbError) {
            console.warn('⚠️ [API Auth] Could not load permissions:', dbError.message)
            // Continue without permissions - don't fail the request
            user.permissions = []
            user.permissions_bitwise = 0
          }
        } catch (error) {
          console.warn('⚠️ [API Auth] Permission loading failed:', error)
          // Continue without permissions - don't fail the request
          user.permissions = []
          user.permissions_bitwise = 0
        }
        
        return await handler(user, request)
      }

      // Strategy 2: Direct session validation (fallback)
      console.log('🔐 [API Auth] Fallback to direct session validation')
      const supabase = await createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        console.log('🔐 [API Auth] No valid session found')
        return ApiResponses.unauthorized()
      }

      // Get user profile with permissions using regular client (allowed by new RLS policy)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('permissions_bitwise, role')
        .eq('id', session.user.id)
        .single()

      const userBitwise = profile?.permissions_bitwise || 0
      const user: AuthenticatedUser = {
        id: session.user.id,
        email: session.user.email,
        permissions: PermissionManager.getPermissionNames(userBitwise) as Permission[],
        permissions_bitwise: userBitwise,
        role: profile?.role || null
      }

      return await handler(user, request)
      
    } catch (error) {
      console.error('🔐 [API Auth] Authentication error:', error)
      return ApiResponses.internalError('Authentication failed')
    }
  }
}

/**
 * Permission-based authentication middleware with bitwise support
 * Requires user to have at least one of the specified permissions
 * Uses both legacy array permissions and new bitwise permissions for compatibility
 */
export function withPermissions(
  requiredPermissions: Permission | Permission[],
  handler: AuthenticatedHandler
) {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions]

  return withAuth(async (user, request) => {
    // Check bitwise permissions first (preferred method)
    if (user.permissions_bitwise !== undefined && user.permissions_bitwise !== null) {
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

      const hasRequiredPermission = permissions.some(permission => {
        const bitwiseConstant = PERMISSION_MAPPING[permission]
        if (bitwiseConstant === undefined) {
          console.warn(`Unknown permission: ${permission}`)
          return false
        }
        return PermissionManager.hasPermission(user.permissions_bitwise!, bitwiseConstant)
      })

      if (!hasRequiredPermission) {
        console.log('🔐 [API Permissions] Insufficient bitwise permissions:', {
          required: permissions,
          userBitwise: user.permissions_bitwise,
          role: user.role
        })
        return ApiResponses.forbidden(`Requires one of: ${permissions.join(', ')}`)
      }

      console.log('🔐 [API Permissions] Bitwise permission check passed')
      return await handler(user, request)
    }

    // Fallback to legacy array permissions
    if (!user.permissions || user.permissions.length === 0) {
      console.log('🔐 [API Permissions] User has no permissions')
      return ApiResponses.forbidden('No permissions assigned')
    }

    const hasRequiredPermission = permissions.some(permission =>
      user.permissions!.includes(permission)
    )

    if (!hasRequiredPermission) {
      console.log('🔐 [API Permissions] Insufficient legacy permissions:', {
        required: permissions,
        user: user.permissions
      })
      return ApiResponses.forbidden(`Requires one of: ${permissions.join(', ')}`)
    }

    console.log('🔐 [API Permissions] Legacy permission check passed')
    return await handler(user, request)
  })
}

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Request body validation middleware using Zod schemas
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, user: AuthenticatedUser, request: NextRequest) => Promise<Response>
) {
  return withAuth(async (user, request) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return await handler(validatedData, user, request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        return ApiResponses.badRequest('Validation failed', details)
      }
      return ApiResponses.badRequest('Invalid request data')
    }
  })
}

/**
 * Query parameter validation middleware
 */
export function withQueryValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (query: T, user: AuthenticatedUser, request: NextRequest) => Promise<Response>
) {
  return withAuth(async (user, request) => {
    try {
      const { searchParams } = new URL(request.url)
      const queryObject: Record<string, any> = {}
      
      // Convert URLSearchParams to object with type coercion
      searchParams.forEach((value, key) => {
        // Handle arrays (multiple values for same key)
        if (queryObject[key]) {
          queryObject[key] = Array.isArray(queryObject[key]) 
            ? [...queryObject[key], value]
            : [queryObject[key], value]
        } else {
          // Type coercion for common parameter types
          if (key === 'page' || key === 'limit') {
            // Convert to number
            const num = parseInt(value, 10)
            queryObject[key] = isNaN(num) ? value : num
          } else if (value === 'true' || value === 'false') {
            // Convert boolean strings to actual booleans
            queryObject[key] = value === 'true'
          } else {
            queryObject[key] = value
          }
        }
      })
      
      const validatedQuery = schema.parse(queryObject)
      return await handler(validatedQuery, user, request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        return ApiResponses.badRequest('Query validation failed', details)
      }
      return ApiResponses.badRequest('Invalid query parameters')
    }
  })
}

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global error handling wrapper for API routes
 */
export function withErrorHandling(handler: AuthenticatedHandler) {
  return withAuth(async (user, request) => {
    try {
      return await handler(user, request)
    } catch (error) {
      console.error('🚨 [API Error]:', error)
      
      // Handle specific error types
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        return ApiResponses.badRequest('Validation failed', details)
      }
      
      // Handle Supabase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any
        if (supabaseError.code === '23505') {
          return ApiResponses.conflict('Resource already exists')
        }
        if (supabaseError.code === '42501') {
          return ApiResponses.forbidden('Database permission denied')
        }
      }
      
      // Generic error fallback
      const message = error instanceof Error ? error.message : 'Unknown error occurred'
      return ApiResponses.internalError('Internal server error', message)
    }
  })
}

// ============================================================================
// RATE LIMITING MIDDLEWARE (Optional)
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000, // 1 minute
  handler: AuthenticatedHandler
) {
  return withAuth(async (user, request) => {
    const key = user.id
    const now = Date.now()
    const userLimit = rateLimitMap.get(key)
    
    if (!userLimit || now > userLimit.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return await handler(user, request)
    }
    
    if (userLimit.count >= maxRequests) {
      return ApiResponses.tooManyRequests()
    }
    
    userLimit.count++
    return await handler(user, request)
  })
}

// ============================================================================
// COMBINED MIDDLEWARE UTILITIES
// ============================================================================

/**
 * Combines multiple middleware patterns for common API route needs
 */
export const apiMiddleware = {
  // Basic auth only
  auth: withAuth,
  
  // Auth + permissions
  permissions: withPermissions,
  
  // Auth + error handling
  safe: withErrorHandling,
  
  // Auth + validation
  validate: withValidation,
  queryValidate: withQueryValidation,
  
  // Auth + rate limiting  
  rateLimited: withRateLimit,
  
  // Full stack (auth + permissions + error handling)
  protected: (permissions: Permission | Permission[]) => 
    (handler: AuthenticatedHandler) =>
      async (request: NextRequest): Promise<Response> => {
        try {
          return await withPermissions(permissions, handler)(request)
        } catch (error) {
          console.error('🚨 [API Error]:', error)
          return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
          )
        }
      },
  
  // Responses helper
  response: ApiResponses
}

export default apiMiddleware