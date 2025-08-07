/**
 * Formula PM V3 Supabase Client Configuration
 * Optimized for construction sites with poor connectivity
 * Based on proven V2 architecture with enhanced performance features
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

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

// ============================================================================
// BROWSER CLIENT - Optimized for construction field workers
// ============================================================================

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Enhanced security for construction teams
    debug: process.env.NODE_ENV === 'development',
    
    // Extended session for construction sites (4 hours default)
    sessionRefreshInterval: jwtExpiry,
    
    // Optimized storage for shared devices
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
    },
    
    // Construction site network optimizations
    fetch: (url, options = {}) => {
      const controller = new AbortController()
      
      // Extended timeout for poor connectivity
      const timeoutId = setTimeout(() => controller.abort(), connectionTimeout)
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId))
    }
  },
  
  realtime: {
    params: {
      eventsPerSecond: 2, // Throttled for construction sites
    },
  }
})

// ============================================================================
// ADMIN CLIENT - For service role operations
// ============================================================================

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'formulapm-v3-admin',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Check if Supabase is properly configured
export const isSupabaseReady = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Connection health check for construction sites
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('user_profiles').select('id').limit(1)
    return !error
  } catch (error) {
    console.warn('🚧 Supabase connection check failed:', error)
    return false
  }
}

// Get connection info for troubleshooting
export const getConnectionInfo = () => ({
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
  timeout: connectionTimeout,
  offlineMode: enableOfflineMode,
  jwtExpiry: jwtExpiry
})