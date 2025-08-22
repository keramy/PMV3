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
    console.log('🔍 2024 ENHANCED AUTH: Starting authentication with session synchronization')
    const supabase = getClient()
    
    // Get initial session with 2024 enhanced validation
    const getInitialSession = async () => {
      try {
        console.log('🔍 2024 ENHANCED AUTH: Getting initial session with validation')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('🔍 2024 ENHANCED AUTH: Session error:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('🔍 2024 ENHANCED AUTH: Initial session found - validating integrity')
          
          // 2024 ENHANCEMENT: Validate session integrity before proceeding
          const now = Math.floor(Date.now() / 1000)
          const expiresAt = session.expires_at || 0
          
          if (expiresAt > 0 && now >= expiresAt) {
            console.warn('🔍 2024 ENHANCED AUTH: Session expired, clearing state')
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
          }
          
          console.log('🔍 2024 ENHANCED AUTH: Session valid, setting user and fetching profile')
          setUser(session.user)
          
          // Fetch profile for initial session with enhanced validation
          await fetchUserProfile(session.user.id)
        } else {
          console.log('🔍 2024 ENHANCED AUTH: No initial session')
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('🔍 2024 ENHANCED AUTH: Error getting initial session:', error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    // Enhanced profile fetch with session validation (2024 best practices)
    const fetchUserProfile = async (userId: string) => {
      try {
        console.log('🔍 2024 ENHANCED AUTH: Fetching profile for:', userId)
        
        // CRITICAL: Validate session before profile query to ensure auth.uid() works in RLS
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          console.warn('🔍 2024 ENHANCED AUTH: Invalid session during profile fetch:', sessionError?.message)
          setProfile(null)
          return
        }
        
        // Verify session user matches requested userId
        if (session.user.id !== userId) {
          console.warn('🔍 2024 ENHANCED AUTH: Session/user ID mismatch:', {
            sessionUserId: session.user.id,
            requestedUserId: userId
          })
          setProfile(null)
          return
        }
        
        console.log('🔍 2024 ENHANCED AUTH: Session validated, auth.uid() should work in RLS')
        console.log('🔍 2024 ENHANCED AUTH: Querying user_profiles with userId:', userId)
        console.log('🔍 2024 ENHANCED AUTH: Session details:', {
          userId: session.user.id,
          userEmail: session.user.email,
          expiresAt: session.expires_at
        })
        
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (profileError) {
          // Enhanced debugging for profile errors
          console.error('🔍 2024 ENHANCED AUTH: Profile query failed:', profileError)
          console.error('🔍 2024 ENHANCED AUTH: Error keys:', Object.keys(profileError))
          console.error('🔍 2024 ENHANCED AUTH: Error code:', profileError.code)
          console.error('🔍 2024 ENHANCED AUTH: Error message:', profileError.message)
          
          // Handle different error types properly
          if (profileError.code === 'PGRST116') {
            // No rows found - user profile doesn't exist yet
            console.log('🔍 2024 ENHANCED AUTH: No profile found for user - this is normal for new users')
            setProfile(null)
          } else if (Object.keys(profileError).length === 0) {
            // Empty object usually means RLS policy blocked the query
            console.warn('🔍 2024 ENHANCED AUTH: Profile query blocked by RLS - attempting session refresh')
            
            // 2024 ENHANCEMENT: Try refreshing session and retry once
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
            
            if (!refreshError && refreshData.session) {
              console.log('🔍 2024 ENHANCED AUTH: Session refreshed successfully, retrying profile query')
              
              // Retry profile query after session refresh
              const { data: retryProfileData, error: retryError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()
                
              if (!retryError && retryProfileData) {
                const appProfile: AppUserProfile = {
                  ...retryProfileData,
                  permissions: Array.isArray(retryProfileData.permissions) ? retryProfileData.permissions as any[] : [],
                  full_name: [retryProfileData.first_name, retryProfileData.last_name].filter(Boolean).join(' ').trim() || 'No Name',
                  // Enhanced role system fields
                  role: retryProfileData.role || 'team_member',
                  can_view_costs: retryProfileData.can_view_costs,
                  assigned_projects: retryProfileData.assigned_projects || []
                }
                console.log('🔍 2024 ENHANCED AUTH: Profile loaded successfully after session refresh with role data')
                setProfile(appProfile)
                return
              }
            }
            
            // If refresh/retry failed, create a basic profile for UI consistency
            console.warn('🔍 2024 ENHANCED AUTH: Profile query still blocked after refresh - using basic profile')
            const basicProfile: Partial<AppUserProfile> = {
              id: userId,
              email: session.user.email || null,
              permissions: [] as any[], // Will be filled by server-side middleware
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              first_name: null as any,
              last_name: null as any,
              full_name: 'User'
            }
            setProfile(basicProfile as AppUserProfile)
          } else {
            // Actual error with details
            console.error('🔍 2024 ENHANCED AUTH: Profile query failed:', profileError)
            setProfile(null)
          }
        } else if (profileData) {
          const appProfile: AppUserProfile = {
            ...profileData,
            permissions: Array.isArray(profileData.permissions) ? profileData.permissions as any[] : [],
            full_name: [profileData.first_name, profileData.last_name].filter(Boolean).join(' ').trim() || 'No Name',
            // Enhanced role system fields
            role: profileData.role || 'team_member',
            can_view_costs: profileData.can_view_costs,
            assigned_projects: profileData.assigned_projects || []
          }
          console.log('🔍 2024 ENHANCED AUTH: Profile loaded successfully on first try with role data')
          setProfile(appProfile)
        } else {
          console.log('🔍 2024 ENHANCED AUTH: No profile data returned')
          setProfile(null)
        }
      } catch (error) {
        console.error('🔍 2024 ENHANCED AUTH: Profile fetch error:', error)
        
        // 2024 ENHANCEMENT: Better error handling with session context
        if (error instanceof Error && error.message.includes('JWT')) {
          console.warn('🔍 2024 ENHANCED AUTH: JWT-related error detected, session may be invalid')
          // Could trigger a sign-out here if needed
        }
        
        setProfile(null)
      }
    }

    // Set up auth state listener with DEADLOCK PREVENTION + 2024 session sync
    console.log('🔍 2024 ENHANCED AUTH: Setting up auth state listener with session sync')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // CRITICAL: No async operations here to prevent deadlock!
        console.log('🔍 2024 ENHANCED AUTH: Auth state change:', event, {
          hasSession: !!session,
          hasUser: !!session?.user,
          sessionExpiresAt: session?.expires_at
        })
        
        // Update user state immediately (synchronous)
        setUser(session?.user ?? null)
        
        // DEADLOCK FIX: Use setTimeout to defer async operations
        // This prevents the deadlock bug by running after the callback completes
        setTimeout(async () => {
          if (session?.user) {
            console.log('🔍 2024 ENHANCED AUTH: Deferred enhanced profile fetch for:', session.user.id)
            await fetchUserProfile(session.user.id)
          } else {
            console.log('🔍 2024 ENHANCED AUTH: Deferred profile clear')
            setProfile(null)
          }
          setLoading(false)
        }, 0)
      }
    )
    
    // Get initial session
    getInitialSession()
    
    return () => {
      console.log('🔍 2024 ENHANCED AUTH: Cleaning up subscription and session listeners')
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