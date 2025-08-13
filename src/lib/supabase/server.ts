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
            cookiesToSet.forEach(({ name, value, options }) => {
              // Optimized cookie settings for construction team sessions
              const cookieOptions = {
                ...options,
                httpOnly: true, // CRITICAL: Must be true for security
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 days for field workers
              }
              cookieStore.set(name, value, cookieOptions)
            })
          } catch (error) {
            // Server component error handling - cookies will be handled by middleware
            if (process.env.NODE_ENV === 'development') {
              console.warn('🔍 Cookie setting failed in server component:', error)
            }
          }
        }
      },
      auth: {
        persistSession: false, // Server-side doesn't persist sessions
        autoRefreshToken: false, // Prevent token conflicts
        detectSessionInUrl: false, // Handled by middleware
      }
    }
  )

  // Enhanced error handling for server-side auth operations
  // Based on V2 patterns but improved for construction workflows
  const originalGetSession = client.auth.getSession.bind(client.auth)
  const originalGetUser = client.auth.getUser.bind(client.auth)
  
  client.auth.getSession = async () => {
    try {
      const result = await originalGetSession()
      
      // Handle refresh token errors gracefully for construction site connectivity
      if (result.error && (
        result.error.message.includes('Invalid Refresh Token') || 
        result.error.message.includes('Refresh Token Not Found')
      )) {
        if (process.env.NODE_ENV === 'development') {
          // Silent handling in development
        } else {
          console.log('🔐 [ServerAuth] Handling refresh token error - construction site connectivity')
        }
        return { data: { session: null }, error: null }
      }
      
      return result
    } catch (error: any) {
      // Enhanced error handling for construction site scenarios
      if (error?.message?.includes('Refresh Token') || error?.message?.includes('JWT')) {
        if (process.env.NODE_ENV !== 'development') {
          console.log('🔐 [ServerAuth] Auth error handled - returning null session')
        }
        return { data: { session: null }, error: null }
      }
      throw error
    }
  }
  
  client.auth.getUser = async (jwt?: string) => {
    try {
      const result = await originalGetUser(jwt)
      
      // Handle refresh token errors for getUser
      if (result.error && (
        result.error.message.includes('Invalid Refresh Token') || 
        result.error.message.includes('Refresh Token Not Found') ||
        result.error.message.includes('JWT expired')
      )) {
        if (process.env.NODE_ENV !== 'development') {
          console.log('🔐 [ServerAuth] User auth error handled')
        }
        return { data: { user: null }, error: null }
      }
      
      return result
    } catch (error: any) {
      if (error?.message?.includes('Refresh Token') || error?.message?.includes('JWT')) {
        if (process.env.NODE_ENV !== 'development') {
          console.log('🔐 [ServerAuth] User lookup error handled')
        }
        return { data: { user: null }, error: null }
      }
      throw error
    }
  }

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

// Get authenticated user with enhanced error handling
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.warn('🔐 [ServerAuth] Failed to get authenticated user:', error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.warn('🔐 [ServerAuth] Exception getting authenticated user:', error)
    return null
  }
}

// Get user session with enhanced error handling
export async function getSession() {
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.warn('🔐 [ServerAuth] Failed to get session:', error.message)
      return null
    }
    
    return session
  } catch (error) {
    console.warn('🔐 [ServerAuth] Exception getting session:', error)
    return null
  }
}