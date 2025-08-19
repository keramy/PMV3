/**
 * Formula PM V3 Authentication Hook - DEADLOCK BUG FIXED
 * Fixes the hanging query issue caused by async calls in onAuthStateChange
 * Based on official Supabase deadlock bug workaround
 */

'use client'

import { useEffect, useState } from 'react'
import { getClient } from '@/lib/supabase/client'
import type { AppUserProfile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: AppUserProfile | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 DEADLOCK-FIXED AUTH: Starting authentication')
    const supabase = getClient()
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 DEADLOCK-FIXED AUTH: Getting initial session')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('🔍 DEADLOCK-FIXED AUTH: Session error:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('🔍 DEADLOCK-FIXED AUTH: Initial session found')
          setUser(session.user)
          
          // Fetch profile for initial session
          await fetchUserProfile(session.user.id)
        } else {
          console.log('🔍 DEADLOCK-FIXED AUTH: No initial session')
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('🔍 DEADLOCK-FIXED AUTH: Error getting initial session:', error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    // Fetch user profile function (outside the callback to avoid deadlock)
    const fetchUserProfile = async (userId: string) => {
      try {
        console.log('🔍 DEADLOCK-FIXED AUTH: Fetching profile for:', userId)
        
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (profileError) {
          // Handle different error types properly
          if (profileError.code === 'PGRST116') {
            // No rows found - user profile doesn't exist yet
            console.log('🔍 DEADLOCK-FIXED AUTH: No profile found for user - this is normal for new users')
          } else if (Object.keys(profileError).length === 0) {
            // Empty object usually means RLS policy blocked the query
            console.warn('🔍 DEADLOCK-FIXED AUTH: Profile query blocked - likely RLS policy issue')
          } else {
            // Actual error with details
            console.error('🔍 DEADLOCK-FIXED AUTH: Profile query failed:', profileError)
          }
          setProfile(null)
        } else if (profileData) {
          const appProfile: AppUserProfile = {
            ...profileData,
            permissions: Array.isArray(profileData.permissions) ? profileData.permissions as any[] : [],
            full_name: [profileData.first_name, profileData.last_name].filter(Boolean).join(' ').trim() || 'No Name'
          }
          console.log('🔍 DEADLOCK-FIXED AUTH: Profile loaded successfully')
          setProfile(appProfile)
        } else {
          console.log('🔍 DEADLOCK-FIXED AUTH: No profile found')
          setProfile(null)
        }
      } catch (error) {
        console.error('🔍 DEADLOCK-FIXED AUTH: Profile fetch error:', error)
        setProfile(null)
      }
    }

    // Set up auth state listener with DEADLOCK PREVENTION
    console.log('🔍 DEADLOCK-FIXED AUTH: Setting up auth state listener')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // CRITICAL: No async operations here to prevent deadlock!
        console.log('🔍 DEADLOCK-FIXED AUTH: Auth state change:', event, {
          hasSession: !!session,
          hasUser: !!session?.user
        })
        
        // Update user state immediately (synchronous)
        setUser(session?.user ?? null)
        
        // DEADLOCK FIX: Use setTimeout to defer async operations
        // This prevents the deadlock bug by running after the callback completes
        setTimeout(async () => {
          if (session?.user) {
            console.log('🔍 DEADLOCK-FIXED AUTH: Deferred profile fetch for:', session.user.id)
            await fetchUserProfile(session.user.id)
          } else {
            console.log('🔍 DEADLOCK-FIXED AUTH: Deferred profile clear')
            setProfile(null)
          }
          setLoading(false)
        }, 0)
      }
    )
    
    // Get initial session
    getInitialSession()
    
    return () => {
      console.log('🔍 DEADLOCK-FIXED AUTH: Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user
  }
}