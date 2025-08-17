/**
 * Formula PM V3 HTTP-Based Authentication Hook
 * Workaround for hanging Supabase JS client using direct HTTP requests
 */

'use client'

import { useEffect, useState } from 'react'
import { httpClient } from '@/lib/supabase/http-client'
import type { AppUserProfile } from '@/types/database'

interface AuthState {
  user: { id: string; email: string } | null
  profile: AppUserProfile | null
  loading: boolean
  isAuthenticated: boolean
}

export function useHttpAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
} {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<AppUserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 HTTP Auth: Starting authentication check')
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Check if user is authenticated via cookies
      const isAuth = httpClient.isAuthenticated()
      console.log('🔍 HTTP Auth: Authentication status:', isAuth)

      if (!isAuth) {
        console.log('🔍 HTTP Auth: No authentication cookies found')
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      // Get user from cookies
      const currentUser = httpClient.getCurrentUser()
      console.log('🔍 HTTP Auth: Current user from cookies:', currentUser)

      if (!currentUser) {
        console.log('🔍 HTTP Auth: Could not extract user from cookies')
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      // Set user
      setUser(currentUser)

      // Fetch user profile using HTTP client
      console.log('🔍 HTTP Auth: Fetching user profile...')
      const { data: profileData, error: profileError } = await httpClient.getUserProfile(currentUser.id)

      if (profileError) {
        console.error('🔍 HTTP Auth: Profile fetch error:', profileError)
        setProfile(null)
      } else if (profileData) {
        console.log('🔍 HTTP Auth: Profile fetch successful:', {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name
        })
        setProfile(profileData)
      } else {
        console.log('🔍 HTTP Auth: No profile data returned')
        setProfile(null)
      }

    } catch (error) {
      console.error('🔍 HTTP Auth: Error during initialization:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔍 HTTP Auth: Starting sign in process')
    setLoading(true)

    try {
      const { data, error } = await httpClient.signInWithPassword(email, password)

      if (error) {
        console.error('🔍 HTTP Auth: Sign in failed:', error)
        setLoading(false)
        return { success: false, error: error.message || 'Authentication failed' }
      }

      if (data?.user) {
        console.log('🔍 HTTP Auth: Sign in successful, fetching profile...')
        
        const user = {
          id: data.user.id,
          email: data.user.email
        }
        setUser(user)

        // Fetch profile
        const { data: profileData, error: profileError } = await httpClient.getUserProfile(data.user.id)
        
        if (profileError) {
          console.error('🔍 HTTP Auth: Profile fetch after sign in failed:', profileError)
          setProfile(null)
        } else {
          setProfile(profileData)
        }

        setLoading(false)
        return { success: true }
      } else {
        console.error('🔍 HTTP Auth: No user data returned')
        setLoading(false)
        return { success: false, error: 'No user data returned' }
      }
    } catch (error: any) {
      console.error('🔍 HTTP Auth: Sign in error:', error)
      setLoading(false)
      return { success: false, error: error.message || 'Network error during sign in' }
    }
  }

  const signOut = async (): Promise<void> => {
    console.log('🔍 HTTP Auth: Signing out')
    await httpClient.signOut()
    setUser(null)
    setProfile(null)
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut
  }
}