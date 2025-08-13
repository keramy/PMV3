/**
 * Formula PM V3 Authentication Hook
 * Simple, focused hook under 50 lines - NO MORE 448-line monsters!
 */

'use client'

import { useEffect, useState } from 'react'
import { getClient } from '@/lib/supabase/client'
import { getCurrentUserProfile } from '@/lib/database/queries'
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

  // Add debug logging to track state changes
  useEffect(() => {
    console.log('🔍 Auth State Debug:', { 
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { id: profile.id, email: profile.email } : null,
      loading,
      isAuthenticated: !!user 
    })
  }, [user, profile, loading])

  useEffect(() => {
    const supabase = getClient()
    
    console.log('🔍 useAuth initialization started')
    
    // Get initial session and refresh if needed
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('🔍 Initial session check:', { 
          session: session ? { user: session.user.id, expires: session.expires_at } : null,
          error 
        })
        
        // Check if token is expired or about to expire (within 1 hour)
        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000)
          const now = new Date()
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
          
          if (expiresAt <= oneHourFromNow) {
            console.log('🔍 Token expiring soon, refreshing...')
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
            
            if (refreshError) {
              console.error('🔍 Token refresh failed:', refreshError)
              setUser(null)
              setProfile(null)
              setLoading(false)
              return
            }
            
            if (refreshData.session) {
              console.log('🔍 Token refreshed successfully')
              setUser(refreshData.session.user)
              await fetchProfile()
              return
            }
          }
        }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile()
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('🔍 Error initializing session:', error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }
    
    initializeSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Auth state changed:', { event, session: session ? { user: session.user.id } : null })
      
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      console.log('🔍 useAuth cleanup')
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async () => {
    console.log('🔍 Fetching user profile...')
    try {
      // Use the type-safe getCurrentUserProfile function
      const userProfile = await getCurrentUserProfile()
      console.log('🔍 Profile fetched:', userProfile ? { id: userProfile.id, email: userProfile.email } : null)
      setProfile(userProfile)
    } catch (error) {
      console.error('🔍 Error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user
  }
}