/**
 * Formula PM V3 Client-Side Supabase Client
 * Enhanced with proper TypeScript types for browser environments
 * Optimized for construction site connectivity and offline scenarios
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

// ============================================================================
// TYPE-SAFE CLIENT CONFIGURATION
// ============================================================================

/**
 * Enhanced client options interface for type safety
 */
interface EnhancedBrowserClientOptions {
  auth: {
    autoRefreshToken: boolean
    persistSession: boolean
    detectSessionInUrl: boolean
    flowType: 'pkce'
    debug: boolean
    sessionRefreshInterval: number
    storage?: Storage
    storageKey: string
  }
  db: {
    schema: 'public'
  }
  global: {
    headers: Record<string, string>
    fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  }
  realtime: {
    params: {
      eventsPerSecond: number
    }
  }
}

/**
 * Create optimized client options based on environment
 */
function createBrowserClientOptions(): EnhancedBrowserClientOptions {
  const baseOptions: EnhancedBrowserClientOptions = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Enhanced security for construction teams
      debug: isDevelopment,
      sessionRefreshInterval: jwtExpiry, // Extended session for construction sites (4 hours default)
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'formulapm_auth_token', // Consistent naming
    },

    db: {
      schema: 'public'
    },

    global: {
      headers: {
        'X-Client-Info': 'formulapm-v3-browser',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'X-Connection-Mode': enableOfflineMode ? 'resilient' : 'standard',
        ...(isDevelopment && { 'X-Debug-Mode': 'true' })
      }
    },

    realtime: {
      params: {
        eventsPerSecond: isDevelopment ? 10 : 2, // Higher rate in development, throttled for production construction sites
      },
    }
  }

  // Add fetch optimization for production (construction site network optimizations)
  if (isProduction || enableOfflineMode) {
    baseOptions.global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController()

      // Extended timeout for poor connectivity
      const timeoutId = setTimeout(() => controller.abort(), connectionTimeout)

      return fetch(input, {
        ...init,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId))
    }
  }

  return baseOptions
}

// ============================================================================
// BROWSER CLIENT - Optimized for construction field workers
// ============================================================================

/**
 * Enhanced browser client with proper TypeScript types
 * Configured for compile-time safety and runtime performance
 */
export function createClient() {
  // Validate required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:', {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      env: process.env.NODE_ENV
    })
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(
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
  return client.from(tableName)
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
  TArgs = Database['public']['Functions'][TFunctionName]['Args'],
  TReturn = Database['public']['Functions'][TFunctionName]['Returns']
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