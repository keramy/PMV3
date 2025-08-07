/**
 * Formula PM V3 Authentication Actions Hook
 * Clean separation of concerns - actions only, under 25 lines
 */

'use client'

import { supabase } from '@/lib/supabase'

export function useAuthActions() {
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
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