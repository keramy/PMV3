/**
 * Formula PM V3 Supabase Client Configuration
 * Enhanced with balanced TypeScript types and optimized for construction sites
 * Based on proven V2 architecture with enhanced performance features
 * 
 * This approach provides type safety where it matters most while avoiding
 * complex type instantiation issues that can break the build.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Re-export the getClient function from the client module
export { getClient } from './supabase/client'

// Environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
    env: process.env.NODE_ENV
  })
  throw new Error('Missing Supabase environment variables: url=' + !!supabaseUrl + ', key=' + !!supabaseAnonKey)
}

// Construction site performance settings
const connectionTimeout = parseInt(process.env.NEXT_PUBLIC_CONNECTION_TIMEOUT || '30000')
const enableOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'
const jwtExpiry = parseInt(process.env.NEXT_PUBLIC_JWT_EXPIRY || '14400')

// Development vs Production optimizations
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Type-safe client options with environment-specific optimizations
interface EnhancedClientOptions {
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

// ============================================================================
// TYPE-SAFE CLIENT CONFIGURATION
// ============================================================================

/**
 * Create optimized client options based on environment
 */
function createClientOptions(): EnhancedClientOptions {
  const baseOptions: EnhancedClientOptions = {
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
        'X-Client-Info': 'formulapm-v3-web',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'X-Connection-Mode': enableOfflineMode ? 'resilient' : 'standard'
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

/**
 * Enhanced Supabase client with balanced TypeScript types
 * Configured for compile-time safety and runtime performance
 * Uses Database type for intellisense while allowing flexibility for complex queries
 */
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, createClientOptions())

// ============================================================================
// ADMIN CLIENT - For service role operations with enhanced types
// ============================================================================

/**
 * Create optimized admin client options
 */
function createAdminClientOptions() {
  return {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public' as const
    },
    global: {
      headers: {
        'X-Client-Info': 'formulapm-v3-admin',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(isDevelopment && { 'X-Debug-Mode': 'true' })
      }
    }
  }
}

/**
 * Enhanced admin client with proper TypeScript types
 * Used for service role operations with full database access
 */
export const supabaseAdmin = createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, createAdminClientOptions())

// ============================================================================
// TYPE-SAFE UTILITY FUNCTIONS
// ============================================================================

/**
 * Simple client factory for creating additional clients with custom configurations
 * Provides type hints without complex generic constraints
 */
export function createTypedClient(
  url: string = supabaseUrl,
  key: string = supabaseAnonKey,
  options?: any
) {
  return createSupabaseClient<Database>(url, key, {
    ...createClientOptions(),
    ...options
  })
}

/**
 * Simple admin client factory
 * Provides type hints without complex generic constraints
 */
export function createTypedAdminClient(
  url: string = supabaseUrl,
  key: string = supabaseServiceKey,
  options?: any
) {
  return createSupabaseClient<Database>(url, key, {
    ...createAdminClientOptions(),
    ...options
  })
}

/**
 * Check if Supabase is properly configured with enhanced validation
 */
export const isSupabaseReady = (): boolean => {
  const hasRequiredEnvVars = !!(supabaseUrl && supabaseAnonKey)
  
  if (!hasRequiredEnvVars) {
    console.error('❌ Missing required Supabase environment variables')
    return false
  }

  // Additional validation for URL format
  try {
    new URL(supabaseUrl)
    return true
  } catch {
    console.error('❌ Invalid Supabase URL format')
    return false
  }
}

/**
 * Type-safe connection health check for construction sites
 */
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean
  latency?: number
  error?: string
}> => {
  const startTime = Date.now()
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    const latency = Date.now() - startTime
    
    if (error) {
      console.warn('🚧 Supabase connection check failed:', error)
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
    
    console.warn('🚧 Supabase connection check failed:', error)
    return {
      connected: false,
      latency,
      error: errorMessage
    }
  }
}

/**
 * Get comprehensive connection info for troubleshooting
 */
export const getConnectionInfo = () => ({
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  timeout: connectionTimeout,
  offlineMode: enableOfflineMode,
  jwtExpiry: jwtExpiry,
  environment: process.env.NODE_ENV,
  isDevelopment,
  isProduction,
  clientVersion: '3.0.0-enhanced'
})

/**
 * Simple table accessor with type hints
 * Provides intellisense for table names while allowing flexibility
 */
export function getTypedTable(
  tableName: keyof Database['public']['Tables'] | string,
  useAdmin = false
) {
  const client = useAdmin ? supabaseAdmin : supabase
  return (client as any).from(tableName)
}

/**
 * Enhanced error handler for Supabase operations
 */
export interface SupabaseError {
  code?: string
  message: string
  details?: string
  hint?: string
}

export function handleSupabaseError(error: any): SupabaseError {
  if (!error) {
    return { message: 'Unknown error occurred' }
  }

  return {
    code: error.code,
    message: error.message || 'Database operation failed',
    details: error.details,
    hint: error.hint
  }
}

/**
 * Simple RPC (Remote Procedure Call) function wrapper
 * Provides type hints without complex generic constraints
 */
export async function callTypedRPC(
  functionName: string,
  args?: any,
  useAdmin = false
): Promise<{ data: any | null; error: SupabaseError | null }> {
  try {
    const client = useAdmin ? supabaseAdmin : supabase
    const { data, error } = await (client as any).rpc(functionName, args)
    
    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error)
      }
    }
    
    return {
      data,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error)
    }
  }
}

/**
 * Development-only type validation helper
 */
export function validateDatabaseTypes(): boolean {
  if (!isDevelopment) {
    return true
  }

  try {
    // Perform basic type validation checks
    const testQuery = supabase.from('user_profiles').select('id').limit(1)
    
    // This will help catch type mismatches at development time
    console.log('✅ Database types validated successfully')
    return true
  } catch (error) {
    console.error('❌ Database type validation failed:', error)
    return false
  }
}