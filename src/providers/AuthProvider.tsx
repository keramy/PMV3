/**
 * Formula PM V3 - Centralized Authentication Provider
 * Single source of truth for auth state, replacing all useAuth() hooks
 * Based on official Supabase SSR patterns and React 18 best practices
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import type { User } from '@supabase/supabase-js'
import type { AppUserProfile } from '@/types/database'
import type { Permission } from '@/types/auth'

interface AuthContextType {
  user: User | null
  profile: AppUserProfile | null
  loading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(getSupabaseSingleton())
  const profileCacheRef = useRef<{ userId: string; profile: AppUserProfile | null; timestamp: number } | null>(null)

  const fetchUserProfile = async (userId: string, useCache: boolean = true): Promise<AppUserProfile | null> => {
    // Use cache if available and recent (within 5 seconds)
    const now = Date.now()
    if (useCache && profileCacheRef.current && 
        profileCacheRef.current.userId === userId && 
        (now - profileCacheRef.current.timestamp) < 5000) {
      console.log('🔐 AuthProvider: Using cached profile for user:', userId)
      return profileCacheRef.current.profile
    }
    
    try {
      console.log('🔐 AuthProvider: Fetching profile for user:', userId)
      
      const { data, error } = await supabaseRef.current
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('🔐 AuthProvider: Profile fetch error:', error)
        return null
      }

      if (data) {
        const profile: AppUserProfile = {
          ...data,
          permissions: Array.isArray(data.permissions) ? data.permissions as Permission[] : [],
          full_name: [data.first_name, data.last_name].filter(Boolean).join(' ').trim() || 
                     (data.email ? data.email.split('@')[0] : 'User'),
          assigned_projects: data.assigned_projects || []
        }
        console.log('🔐 AuthProvider: Profile fetched successfully')
        
        // Cache the result
        profileCacheRef.current = {
          userId,
          profile,
          timestamp: Date.now()
        }
        
        return profile
      }

      // Cache null result too
      profileCacheRef.current = {
        userId,
        profile: null,
        timestamp: Date.now()
      }
      
      return null
    } catch (error) {
      console.error('🔐 AuthProvider: Profile fetch exception:', error)
      
      // Cache null result on error
      profileCacheRef.current = {
        userId,
        profile: null,
        timestamp: Date.now()
      }
      
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const freshProfile = await fetchUserProfile(user.id, false) // Don't use cache for refresh
      setProfile(freshProfile)
    }
  }

  useEffect(() => {
    const supabase = supabaseRef.current

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('🔐 AuthProvider: Initial session error:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          const userProfile = await fetchUserProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Initial session exception:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Set up auth state listener - SINGLE LISTENER FOR ENTIRE APP
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AuthProvider: Auth state change:', event)
        
        try {
          if (session?.user) {
            console.log('🔐 AuthProvider: User authenticated:', session.user.email)
            setUser(session.user)
            const userProfile = await fetchUserProfile(session.user.id)
            setProfile(userProfile)
          } else {
            console.log('🔐 AuthProvider: User signed out or session expired')
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('🔐 AuthProvider: Auth state change error:', error)
          setUser(null)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }
    )

    // Set up session refresh interval to prevent session expiry
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.refreshSession()
        if (error) {
          console.warn('🔐 AuthProvider: Session refresh failed:', error.message)
          // Don't throw error - let auth state listener handle session expiry
        } else if (session?.user) {
          console.log('🔐 AuthProvider: Session refreshed successfully')
        }
      } catch (error) {
        console.warn('🔐 AuthProvider: Session refresh exception:', error)
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}