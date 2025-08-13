/**
 * Formula PM V3 Authentication Actions Hook
 * Clean separation of concerns - actions only, under 25 lines
 */

'use client'

import { getClient } from '@/lib/supabase/client'

export function useAuthActions() {
  const signIn = async (email: string, password: string) => {
    const supabase = getClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const supabase = getClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const supabase = getClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    return { data, error }
  }

  return {
    signIn,
    signOut,
    signUp
  }
}