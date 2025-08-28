/**
 * Formula PM V3 - Supabase Singleton Client
 * 
 * TRUE SINGLETON PATTERN: Returns the SAME Supabase client instance every time.
 * This fixes the authentication race condition caused by 36+ client instances
 * across 19 files, each with their own auth listeners.
 * 
 * Phase 1 of Authentication Fix Plan
 * 
 * @see CLAUDE.md - Authentication Patterns
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null
let instanceCount = 0

/**
 * Get the singleton Supabase client instance
 * @returns The same Supabase client instance every time
 */
export function getSupabaseSingleton() {
  if (!clientInstance) {
    instanceCount++
    console.log('🔍 Creating Supabase Singleton - Instance Count:', instanceCount)
    clientInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return clientInstance
}

/**
 * For debugging - should always return 1 in a properly working singleton
 * @returns The number of times a new instance was created
 */
export function getInstanceCount() {
  return instanceCount
}

/**
 * Reset the singleton (for testing purposes only)
 * WARNING: Only use in tests, never in production
 */
export function resetSingletonForTesting() {
  if (process.env.NODE_ENV === 'test') {
    clientInstance = null
    instanceCount = 0
  }
}