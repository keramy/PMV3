/**
 * Formula PM V3 Authentication Actions Hook
 * Clean separation of concerns - actions only, under 25 lines
 */

'use client'

import { getSupabaseSingleton } from '@/lib/supabase/singleton'

export function useAuthActions() {
  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseSingleton()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const supabase = getSupabaseSingleton()
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const supabase = getSupabaseSingleton()
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