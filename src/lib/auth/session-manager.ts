/**
 * Session Management Utility
 * Provides clean session clearing functionality for authentication
 */

import { getSupabaseSingleton } from '@/lib/supabase/singleton'

/**
 * Clear all authentication-related browser storage
 * This removes Supabase session data and other auth-related storage
 */
export const clearAllSessions = () => {
  try {
    // Get all localStorage keys that contain auth-related data
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || 
      key.includes('auth') ||
      key.includes('session') ||
      key.startsWith('sb-')
    )
    
    // Remove auth-related localStorage items
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ Cleared localStorage key: ${key}`)
    })
    
    // Clear sessionStorage completely
    sessionStorage.clear()
    console.log('🗑️ Cleared sessionStorage')
    
    console.log('✅ All authentication sessions cleared')
  } catch (error) {
    console.error('❌ Error clearing sessions:', error)
  }
}

/**
 * Sign out from Supabase and clear all session data
 * This ensures a complete logout with no persisted session
 */
export const forceSignOut = async () => {
  try {
    const supabase = getSupabaseSingleton()
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Supabase signOut error:', error)
    }
    
    // Clear all browser storage
    clearAllSessions()
    
    console.log('✅ Complete sign out successful')
  } catch (error) {
    console.error('❌ Error during force sign out:', error)
    // Even if Supabase signOut fails, clear local storage
    clearAllSessions()
  }
}

/**
 * Check if user has any persisted authentication data
 * Useful for debugging authentication issues
 */
export const hasPersistedSession = (): boolean => {
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || 
    key.includes('auth') ||
    key.startsWith('sb-')
  )
  
  const hasData = authKeys.length > 0
  console.log(`🔍 Has persisted session data: ${hasData}`, authKeys)
  
  return hasData
}

/**
 * Get current session info for debugging
 */
export const getSessionDebugInfo = async () => {
  try {
    const supabase = getSupabaseSingleton()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    return {
      hasSession: !!session,
      user: session?.user ? { id: session.user.id, email: session.user.email } : null,
      error,
      persistedKeys: Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      )
    }
  } catch (error) {
    return { error }
  }
}