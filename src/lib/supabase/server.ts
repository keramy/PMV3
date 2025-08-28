/**
 * Formula PM V3 Server-Side Supabase Client
 * Enhanced for construction project workflows with robust error handling
 * Based on proven V2 patterns with Next.js 15 optimizations
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// ============================================================================
// SERVER CLIENT - For API routes and server components
// ============================================================================

export async function createClient() {
  const cookieStore = await cookies()
  
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            // OFFICIAL SUPABASE PATTERN: Pass options unchanged
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      },
      auth: {
        persistSession: false, // Server-side doesn't persist sessions (SSR best practice)
        autoRefreshToken: false, // Prevent token conflicts in SSR
        detectSessionInUrl: false, // Handled by middleware
      }
    }
  )

  // 2024 BEST PRACTICE: Let Supabase handle errors naturally
  // No custom error handling - trust @supabase/ssr error management

  return client
}

// ============================================================================
// SERVICE ROLE CLIENT - For admin operations and bypassing RLS
// ============================================================================

export function createServiceClient() {
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: (): any[] => [],
        setAll: () => {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'formulapm-v3-service',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    }
  )

  return client
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * 2024 BEST PRACTICE: Get authenticated user using getUser()
 * Always validates JWT tokens - recommended for server-side auth checks
 * Returns null safely on authentication errors (for graceful handling)
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.warn('🔐 [ServerAuth] Authentication error:', error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.warn('🔐 [ServerAuth] Exception during authentication:', error)
    return null
  }
}

/**
 * Get session (use sparingly - getUser() is preferred for auth validation)
 * Only use this when you need session metadata, not for authentication
 * Returns null safely on errors
 */
export async function getSession() {
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.warn('🔐 [ServerAuth] Session error:', error.message)
      return null
    }
    
    return session
  } catch (error) {
    console.warn('🔐 [ServerAuth] Exception getting session:', error)
    return null
  }
}