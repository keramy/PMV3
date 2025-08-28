/**
 * Authentication Validation Utilities - 2024 Best Practices
 * Provides consistent user validation following Supabase SSR recommendations
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Validates user authentication and redirects to login if not authenticated
 * 2024 BEST PRACTICE: Always use getUser() for server-side auth validation
 * 
 * @param redirectTo - Path to redirect to after login (optional)
 * @returns Authenticated user or throws redirect
 */
export async function requireAuth(redirectTo?: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user || error) {
      if (error) {
        console.warn('🔐 [AuthValidation] Authentication failed:', error.message)
      }
      
      const loginUrl = redirectTo 
        ? `/login?from=${encodeURIComponent(redirectTo)}`
        : '/login'
      redirect(loginUrl)
    }
    
    return user
  } catch (error) {
    console.error('🔐 [AuthValidation] Exception during auth validation:', error)
    redirect('/login')
  }
}

/**
 * Gets authenticated user without redirect (returns null if not authenticated)
 * Use this when authentication is optional
 */
export async function getOptionalAuth() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.warn('🔐 [AuthValidation] Optional auth error:', error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.warn('🔐 [AuthValidation] Exception during optional auth:', error)
    return null
  }
}

/**
 * Validates user has specific role/permission
 * @param user - User object from requireAuth()
 * @param requiredRole - Role required for access
 */
export function requireRole(user: any, requiredRole: string) {
  // This would integrate with your existing permission system
  // For now, just check if user has the role
  if (!user.role || user.role !== requiredRole) {
    redirect('/unauthorized')
  }
  
  return user
}

/**
 * Server-side session info for debugging
 */
export async function getSessionInfo() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  return {
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email,
    error: error?.message,
    timestamp: new Date().toISOString()
  }
}