/**
 * Formula PM V3 - API Middleware Utilities
 * Centralized authentication, error handling, and validation for API routes
 * Eliminates ~400 lines of duplicate code across API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Permission } from '@/types/auth'
import { isDevAuthBypassEnabled, mockAuthenticatedUser } from '@/lib/dev/mock-user'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedUser {
  id: string
  email?: string
  permissions?: Permission[]
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
      // DEVELOPMENT: Check if authentication bypass is enabled
      if (isDevAuthBypassEnabled()) {
        console.log('🚀 [DEV MODE] API Auth bypass - using mock user')
        return await handler(mockAuthenticatedUser, request)
      }
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
            .select('permissions')
            .eq('id', middlewareUserId)
            .single()
          
          if (!dbError && profile?.permissions) {
            user.permissions = profile.permissions as Permission[]
            console.log('✅ [API Auth] Permissions loaded successfully:', user.permissions)
          } else if (dbError) {
            console.warn('⚠️ [API Auth] Could not load permissions:', dbError.message)
            // Continue without permissions - don't fail the request
            user.permissions = []
          }
        } catch (error) {
          console.warn('⚠️ [API Auth] Permission loading failed:', error)
          // Continue without permissions - don't fail the request
          user.permissions = []
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
        .select('permissions')
        .eq('id', session.user.id)
        .single()

      const user: AuthenticatedUser = {
        id: session.user.id,
        email: session.user.email,
        permissions: (profile?.permissions as Permission[]) || []
      }

      return await handler(user, request)
      
    } catch (error) {
      console.error('🔐 [API Auth] Authentication error:', error)
      return ApiResponses.internalError('Authentication failed')
    }
  }
}

/**
 * Permission-based authentication middleware
 * Requires user to have at least one of the specified permissions
 */
export function withPermissions(
  requiredPermissions: Permission | Permission[],
  handler: AuthenticatedHandler
) {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions]

  return withAuth(async (user, request) => {
    if (!user.permissions || user.permissions.length === 0) {
      console.log('🔐 [API Permissions] User has no permissions')
      return ApiResponses.forbidden('No permissions assigned')
    }

    const hasRequiredPermission = permissions.some(permission =>
      user.permissions!.includes(permission)
    )

    if (!hasRequiredPermission) {
      console.log('🔐 [API Permissions] Insufficient permissions:', {
        required: permissions,
        user: user.permissions
      })
      return ApiResponses.forbidden(`Requires one of: ${permissions.join(', ')}`)
    }

    console.log('🔐 [API Permissions] Permission check passed')
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