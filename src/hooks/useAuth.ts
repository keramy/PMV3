/**
 * Formula PM V3 Authentication Hook
 * Simple, focused hook under 50 lines - NO MORE 448-line monsters!
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile()
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile()
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async () => {
    try {
      // Use the type-safe getCurrentUserProfile function
      const userProfile = await getCurrentUserProfile()
      setProfile(userProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
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