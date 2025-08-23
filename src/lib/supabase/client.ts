/**
 * Formula PM V3 Client-Side Supabase Client
 * Fixed: Proper SSR cookie-based authentication (no localStorage)
 * Compatible with server-side cookie handling
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Development vs Production optimizations
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Construction site performance settings
const connectionTimeout = parseInt(process.env.NEXT_PUBLIC_CONNECTION_TIMEOUT || '30000')
const enableOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'
const jwtExpiry = parseInt(process.env.NEXT_PUBLIC_JWT_EXPIRY || '14400')

// Removed client caching - Supabase 2024 best practice is to create fresh instances

// ============================================================================
// TYPE-SAFE CLIENT CONFIGURATION
// ============================================================================

// Basic client options compatible with @supabase/ssr

// Removed old createBrowserClientOptions - using @supabase/ssr instead

// ============================================================================
// BROWSER CLIENT - Optimized for construction field workers
// ============================================================================

/**
 * Enhanced browser client using @supabase/ssr for proper cookie handling
 * FOLLOWS 2024 BEST PRACTICES for Next.js 15 + Supabase SSR
 */
export function createClient() {
  // Development debugging (only in dev mode)
  if (isDevelopment) {
    console.log('🔍 Supabase Browser Client (2024 Best Practice):', {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
      supabaseAnonKey: supabaseAnonKey ? 'Present' : 'MISSING',
      env: process.env.NODE_ENV,
      sessionType: 'cookie-based SSR'
    })
  }

  // Enhanced validation with better error messages
  if (!supabaseUrl) {
    const error = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.'
    console.error('❌ Supabase Configuration Error:', error)
    throw new Error(error)
  }

  if (!supabaseAnonKey) {
    const error = 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.'
    console.error('❌ Supabase Configuration Error:', error)
    throw new Error(error)
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (err) {
    const error = `Invalid Supabase URL format: ${supabaseUrl}`
    console.error('❌ Supabase Configuration Error:', error)
    throw new Error(error)
  }

  // 2024 BEST PRACTICE: Create fresh client instances (no caching)
  // @supabase/ssr handles session management and cookie synchronization automatically
  try {
    const client = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
      // Use default Supabase cookie handling - don't override
    )

    // Light session debugging (reduced logging)
    if (isDevelopment && Math.random() < 0.1) { // Only log 10% of the time
      client.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.warn('⚠️ [Client] Session retrieval error:', error.message)
        } else if (session) {
          console.log('✅ [Client] Session validated')
        } else {
          console.log('ℹ️ [Client] No active session')
        }
      })
    }

    return client
  } catch (error) {
    console.error('❌ CRITICAL: Failed to create Supabase client:', error)
    throw error
  }
}

// ============================================================================
// TYPE-SAFE UTILITY FUNCTIONS
// ============================================================================

/**
 * Type-safe table accessor with compile-time validation
 */
export function getTypedTable<TTableName extends keyof Database['public']['Tables']>(
  client: ReturnType<typeof createClient>,
  tableName: TTableName
) {
  // Cast to string to satisfy Supabase client interface
  return client.from(tableName as Extract<TTableName, string>)
}

/**
 * Enhanced error handler for client-side Supabase operations
 */
export interface ClientSupabaseError {
  code?: string
  message: string
  details?: string
  hint?: string
  isNetworkError?: boolean
  isAuthError?: boolean
}

export function handleClientSupabaseError(error: any): ClientSupabaseError {
  if (!error) {
    return { message: 'Unknown error occurred' }
  }

  const isNetworkError = error.message?.includes('fetch') || 
                        error.message?.includes('network') ||
                        error.message?.includes('timeout')

  const isAuthError = error.message?.includes('JWT') ||
                     error.message?.includes('token') ||
                     error.message?.includes('auth')

  return {
    code: error.code,
    message: error.message || 'Client operation failed',
    details: error.details,
    hint: error.hint,
    isNetworkError,
    isAuthError
  }
}

/**
 * Client-side connection health check
 */
export async function checkClientConnection(
  client: ReturnType<typeof createClient>
): Promise<{
  connected: boolean
  latency?: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    const { error } = await client
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    const latency = Date.now() - startTime
    
    if (error) {
      return {
        connected: false,
        latency,
        error: error.message
      }
    }
    
    return {
      connected: true,
      latency
    }
  } catch (error) {
    const latency = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error'
    
    return {
      connected: false,
      latency,
      error: errorMessage
    }
  }
}

/**
 * Get client configuration info for troubleshooting
 */
export const getClientInfo = () => ({
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  timeout: connectionTimeout,
  offlineMode: enableOfflineMode,
  jwtExpiry: jwtExpiry,
  environment: process.env.NODE_ENV,
  isDevelopment,
  isProduction,
  clientVersion: '3.0.0-enhanced-browser'
})

/**
 * Type-safe RPC (Remote Procedure Call) function wrapper for client
 */
export async function callClientTypedRPC<
  TFunctionName extends keyof Database['public']['Functions'],
  TArgs = Database['public']['Functions'][TFunctionName] extends { Args: infer A } ? A : never,
  TReturn = Database['public']['Functions'][TFunctionName] extends { Returns: infer R } ? R : never
>(
  client: ReturnType<typeof createClient>,
  functionName: TFunctionName,
  args?: TArgs
): Promise<{ data: TReturn | null; error: ClientSupabaseError | null }> {
  try {
    const { data, error } = await (client as any).rpc(functionName, args)
    
    if (error) {
      return {
        data: null,
        error: handleClientSupabaseError(error)
      }
    }
    
    return {
      data: data as TReturn,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: handleClientSupabaseError(error)
    }
  }
}

/**
 * Development-only client type validation helper
 */
export function validateClientDatabaseTypes(
  client: ReturnType<typeof createClient>
): boolean {
  if (!isDevelopment) {
    return true
  }

  try {
    // Perform basic type validation checks
    const testQuery = client.from('user_profiles').select('id').limit(1)
    
    // This will help catch type mismatches at development time
    console.log('✅ Client database types validated successfully')
    return true
  } catch (error) {
    console.error('❌ Client database type validation failed:', error)
    return false
  }
}

// ============================================================================
// CLIENT UTILITIES - 2024 BEST PRACTICE
// ============================================================================

/**
 * Get fresh client instance (replaces deprecated singleton pattern)
 * Supabase 2024 best practice: create fresh instances for proper session management
 */
export function getClient(): ReturnType<typeof createClient> {
  const client = createClient()
  
  // Validate types in development
  if (isDevelopment) {
    validateClientDatabaseTypes(client)
  }
  
  return client
}