/**
 * Formula PM V3 - Browser Client Utility (Official Supabase SSR Pattern)
 * For Client Components only - follows @supabase/ssr best practices
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}