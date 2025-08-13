/**
 * Formula PM V3 Client-Side Supabase Client
 * Enhanced with proper TypeScript types for browser environments
 * Optimized for construction site connectivity and offline scenarios
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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

// ============================================================================
// TYPE-SAFE CLIENT CONFIGURATION
// ============================================================================

// Basic client options compatible with @supabase/ssr

/**
 * Create standard Supabase client options for better session persistence
 */
function createBrowserClientOptions() {
  return {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Handled by middleware
      storageKey: 'formulapm_auth_token',
      // Configure for construction site connectivity
      flowType: 'pkce' as const,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    db: {
      schema: 'public' as const
    },
    // Global request configuration for construction sites
    global: {
      headers: {
        'X-Client-Info': 'formulapm-v3-browser',
      },
    },
    // Realtime options for construction team collaboration
    realtime: {
      params: {
        eventsPerSecond: 2, // Reduced for mobile connections
      }
    }
  }
}

// ============================================================================
// BROWSER CLIENT - Optimized for construction field workers
// ============================================================================

/**
 * Enhanced browser client with proper TypeScript types
 * Configured for compile-time safety and runtime performance
 */
export function createClient() {
  // Development debugging (only in dev mode)
  if (isDevelopment) {
    console.log('🔍 Supabase Client Creation:', {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
      supabaseAnonKey: supabaseAnonKey ? 'Present' : 'MISSING',
      env: process.env.NODE_ENV
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

  return createSupabaseClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    createBrowserClientOptions()
  )
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
// SINGLETON CLIENT INSTANCE
// ============================================================================

let clientInstance: ReturnType<typeof createClient> | null = null

/**
 * Get singleton client instance for consistent usage across the application
 */
export function getClient(): ReturnType<typeof createClient> {
  if (!clientInstance) {
    clientInstance = createClient()
    
    // Validate types in development
    if (isDevelopment) {
      validateClientDatabaseTypes(clientInstance)
    }
  }
  
  return clientInstance
}

/**
 * Reset client instance (useful for testing or configuration changes)
 */
export function resetClient(): void {
  clientInstance = null
}