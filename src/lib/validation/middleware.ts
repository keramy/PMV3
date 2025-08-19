import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'
import { validateSchema, apiErrorSchema } from './schemas'

const logger = createLogger('validation-middleware')

// ============================================================================
// VALIDATION MIDDLEWARE TYPES
// ============================================================================

export interface ValidationContext {
  body?: unknown
  params?: Record<string, string>
  searchParams?: URLSearchParams
}

export interface ValidatedRequest<TBody = unknown, TParams = unknown, TQuery = unknown> {
  body?: TBody
  params?: TParams
  query?: TQuery
  originalRequest: NextRequest
}

// ============================================================================
// VALIDATION ERROR RESPONSES
// ============================================================================

export function createValidationErrorResponse(errors: string[], status: number = 400): NextResponse {
  const errorResponse = {
    success: false,
    error: 'Validation failed',
    message: errors.join(', '),
    details: errors
  }
  
  logger.warn('Validation failed', { error: new Error('Validation failed'), metadata: { errors, status } })
  
  return NextResponse.json(errorResponse, { status })
}

export function createServerErrorResponse(message: string = 'Internal server error'): NextResponse {
  const errorResponse = {
    success: false,
    error: 'Internal server error',
    message
  }
  
  logger.error('Server error in validation', { error: new Error(message) })
  
  return NextResponse.json(errorResponse, { status: 500 })
}

// ============================================================================
// VALIDATION MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validation = validateSchema(schema, body)
    
    if (!validation.success) {
      return {
        success: false,
        response: createValidationErrorResponse(validation.errors || ['Invalid body'])
      }
    }
    
    return {
      success: true,
      data: validation.data!
    }
  } catch (error) {
    logger.error('Error parsing request body', { error: error instanceof Error ? error : new Error(String(error)) })
    return {
      success: false,
      response: createValidationErrorResponse(['Invalid JSON body'], 400)
    }
  }
}

/**
 * Validate URL parameters with Zod schema
 */
export function validateParams<T>(
  params: Record<string, string>,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  const validation = validateSchema(schema, params)
  
  if (!validation.success) {
    return {
      success: false,
      response: createValidationErrorResponse(validation.errors || ['Invalid parameters'])
    }
  }
  
  return {
    success: true,
    data: validation.data!
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  // Convert URLSearchParams to plain object
  const queryObject: Record<string, string | string[]> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (queryObject[key]) {
      // Handle multiple values for same key
      if (Array.isArray(queryObject[key])) {
        (queryObject[key] as string[]).push(value)
      } else {
        queryObject[key] = [queryObject[key] as string, value]
      }
    } else {
      queryObject[key] = value
    }
  }
  
  const validation = validateSchema(schema, queryObject)
  
  if (!validation.success) {
    return {
      success: false,
      response: createValidationErrorResponse(validation.errors || ['Invalid query parameters'])
    }
  }
  
  return {
    success: true,
    data: validation.data!
  }
}

// ============================================================================
// HIGH-LEVEL VALIDATION WRAPPERS
// ============================================================================

export interface ValidationSchemas<TBody = unknown, TParams = unknown, TQuery = unknown> {
  body?: z.ZodSchema<TBody>
  params?: z.ZodSchema<TParams>  
  query?: z.ZodSchema<TQuery>
}

export interface ValidationOptions {
  requireAuth?: boolean
  allowedMethods?: string[]
}

/**
 * Comprehensive request validation wrapper
 */
export async function validateRequest<TBody = unknown, TParams = unknown, TQuery = unknown>(
  request: NextRequest,
  params: Record<string, string>,
  schemas: ValidationSchemas<TBody, TParams, TQuery>,
  options: ValidationOptions = {}
): Promise<{
  success: true
  data: ValidatedRequest<TBody, TParams, TQuery>
} | {
  success: false
  response: NextResponse
}> {
  const startTime = Date.now()
  const method = request.method
  const url = request.url
  
  try {
    // Method validation
    if (options.allowedMethods && !options.allowedMethods.includes(method)) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405 }
        )
      }
    }
    
    const validatedData: ValidatedRequest<TBody, TParams, TQuery> = {
      originalRequest: request
    }
    
    // Validate body if schema provided and method supports body
    if (schemas.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyValidation = await validateBody(request, schemas.body)
      if (!bodyValidation.success) {
        return { success: false, response: (bodyValidation as { success: false; response: NextResponse }).response }
      }
      validatedData.body = bodyValidation.data
    }
    
    // Validate params if schema provided
    if (schemas.params) {
      const paramsValidation = validateParams(params, schemas.params)
      if (!paramsValidation.success) {
        return { success: false, response: (paramsValidation as { success: false; response: NextResponse }).response }
      }
      validatedData.params = paramsValidation.data
    }
    
    // Validate query if schema provided
    if (schemas.query) {
      const searchParams = new URL(request.url).searchParams
      const queryValidation = validateQuery(searchParams, schemas.query)
      if (!queryValidation.success) {
        return { success: false, response: (queryValidation as { success: false; response: NextResponse }).response }
      }
      validatedData.query = queryValidation.data
    }
    
    const duration = Date.now() - startTime
    logger.info('Request validation successful', {
      duration,
      metadata: { 
        method, 
        url,
        hasBody: !!validatedData.body,
        hasParams: !!validatedData.params,
        hasQuery: !!validatedData.query
      }
    })
    
    return {
      success: true,
      data: validatedData
    }
    
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Request validation failed', {
      error: error instanceof Error ? error : new Error(String(error)),
      duration,
      metadata: { method, url }
    })
    
    return {
      success: false,
      response: createServerErrorResponse('Validation error')
    }
  }
}

// ============================================================================
// ROUTE HANDLER WRAPPER
// ============================================================================

export type RouteHandler<TBody = unknown, TParams = unknown, TQuery = unknown> = (
  validatedRequest: ValidatedRequest<TBody, TParams, TQuery>
) => Promise<NextResponse> | NextResponse

export function withValidation<TBody = unknown, TParams = unknown, TQuery = unknown>(
  schemas: ValidationSchemas<TBody, TParams, TQuery>,
  handler: RouteHandler<TBody, TParams, TQuery>,
  options: ValidationOptions = {}
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const validation = await validateRequest(
      request,
      context.params,
      schemas,
      options
    )
    
    if (!validation.success) {
      return (validation as { success: false; response: NextResponse }).response
    }
    
    try {
      return await handler(validation.data)
    } catch (error) {
      logger.error('Route handler error', { 
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: { url: request.url }
      })
      return createServerErrorResponse('Internal server error')
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a success response with proper typing
 */
export function createSuccessResponse<T>(data: T, message?: string, status: number = 200): NextResponse {
  const response = {
    success: true,
    data,
    ...(message && { message })
  }
  
  return NextResponse.json(response, { status })
}

/**
 * Parse and validate JSON body with better error handling
 */
export async function safeParseJson(request: NextRequest): Promise<{
  success: true
  data: unknown
} | {
  success: false
  error: string
}> {
  try {
    const body = await request.json()
    return { success: true, data: body }
  } catch (error) {
    logger.warn('Failed to parse JSON body', { error: error instanceof Error ? error : new Error(String(error)) })
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    }
  }
}

/**
 * Convert string parameters to appropriate types
 */
export function convertQueryParams(params: Record<string, string | string[]>): Record<string, unknown> {
  const converted: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      converted[key] = value
      continue
    }
    
    // Try to convert to number if it looks like a number
    if (/^\d+$/.test(value)) {
      converted[key] = parseInt(value, 10)
      continue
    }
    
    if (/^\d*\.\d+$/.test(value)) {
      converted[key] = parseFloat(value)
      continue
    }
    
    // Try to convert to boolean
    if (value === 'true' || value === 'false') {
      converted[key] = value === 'true'
      continue
    }
    
    // Keep as string
    converted[key] = value
  }
  
  return converted
}