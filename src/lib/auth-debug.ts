/**
 * Formula PM V3 - Authentication Debugging Utilities
 * Tools to diagnose session, token, and RLS issues
 */

import { getClient } from '@/lib/supabase/client'
import type { AuthHeaderTestResult, TaskProjectLookup } from '@/types/auth-debug'

export interface AuthDebugInfo {
  session: {
    exists: boolean
    userId?: string
    email?: string
    expiresAt?: string
    tokenAge?: string
    refreshToken?: boolean
  }
  jwt: {
    valid: boolean
    role?: string
    userUuid?: string
    exp?: number
    iat?: number
    rawPayload?: any
  }
  permissions: string[]
  rls: {
    canAccessUserProfiles: boolean
    canAccessProjects: boolean
    error?: string
  }
  connectionHealth: {
    latency?: number
    connected: boolean
    error?: string
  }
}

/**
 * Client-side authentication debugging
 */
export async function debugClientAuth(): Promise<AuthDebugInfo> {
  const supabase = getClient()
  
  const debugInfo: AuthDebugInfo = {
    session: { exists: false },
    jwt: { valid: false },
    permissions: [],
    rls: { canAccessUserProfiles: false, canAccessProjects: false },
    connectionHealth: { connected: false }
  }

  try {
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (session) {
      debugInfo.session = {
        exists: true,
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
        tokenAge: session.expires_at ? 
          `${Math.floor((session.expires_at * 1000 - Date.now()) / 1000 / 60)} minutes remaining` : 
          undefined,
        refreshToken: !!session.refresh_token
      }
      
      // JWT validation simplified (test RPC function not available in current schema)
      debugInfo.jwt = {
        valid: !!session.user,
        role: session.user.role || 'authenticated',
        userUuid: session.user.id,
        exp: session.expires_at || 0,
        iat: Math.floor(Date.now() / 1000)
      }
      
      // Test RLS policies
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1)
          
        debugInfo.rls.canAccessUserProfiles = !profileError
        
        if (profileError) {
          debugInfo.rls.error = profileError.message
        }
      } catch (rlsError) {
        debugInfo.rls.error = rlsError instanceof Error ? rlsError.message : 'RLS test failed'
      }
      
      // Test projects access
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .limit(1)
          
        debugInfo.rls.canAccessProjects = !projectsError
      } catch (projectsError) {
        // Projects access depends on permissions, failure is expected for some users
      }
      
      // Get user permissions
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('permissions')
          .eq('id', session.user.id)
          .single()
          
        if (profileData?.permissions) {
          debugInfo.permissions = Array.isArray(profileData.permissions) 
            ? profileData.permissions 
            : []
        }
      } catch (permError) {
        console.warn('Could not fetch permissions:', permError)
      }
    }
    
    // Test connection health
    const startTime = Date.now()
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
        
      const latency = Date.now() - startTime
      debugInfo.connectionHealth = {
        connected: !error,
        latency,
        error: error?.message
      }
    } catch (connError) {
      debugInfo.connectionHealth = {
        connected: false,
        latency: Date.now() - startTime,
        error: connError instanceof Error ? connError.message : 'Connection test failed'
      }
    }
    
  } catch (error) {
    console.error('Auth debug error:', error)
  }

  return debugInfo
}

/**
 * Server-side authentication debugging (commented out for build fix)
 * Will be moved to a separate API route
 */
// export async function debugServerAuth(): Promise<Partial<AuthDebugInfo>> {
//   // Moved to API route to avoid build issues
// }

/**
 * Create the JWT testing function in Supabase (run once)
 */
export const JWT_TEST_FUNCTION_SQL = `
CREATE OR REPLACE FUNCTION test_authorization_header()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.jwt();
$$;
`

/**
 * Pretty print debug info for console
 */
export function printAuthDebug(debugInfo: AuthDebugInfo) {
  console.log('🔍 === AUTHENTICATION DEBUG INFO ===')
  console.log('📱 Session:', debugInfo.session)
  console.log('🎫 JWT:', debugInfo.jwt) 
  console.log('🔐 Permissions:', debugInfo.permissions)
  console.log('🛡️ RLS Access:', debugInfo.rls)
  console.log('🌐 Connection:', debugInfo.connectionHealth)
  console.log('🔍 === END DEBUG INFO ===')
}