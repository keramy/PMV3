/**
 * Formula PM V3 - Properly Fixed Supabase Client
 * Following official Next.js documentation exactly
 * https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Test the client immediately
export async function testClient() {
  console.log('🧪 Testing Supabase client immediately...')
  
  const client = createClient()
  
  try {
    // Test 1: Simple select without authentication
    console.log('🧪 Test 1: Simple SELECT without auth requirements')
    const { data, error } = await client
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.log('🧪 Test 1 Error:', error)
    } else {
      console.log('🧪 Test 1 Success:', data)
    }
    
    // Test 2: Get session
    console.log('🧪 Test 2: Get current session')
    const { data: sessionData, error: sessionError } = await client.auth.getSession()
    
    if (sessionError) {
      console.log('🧪 Test 2 Error:', sessionError)
    } else {
      console.log('🧪 Test 2 Success:', { hasSession: !!sessionData.session })
    }
    
    return { success: true, client }
  } catch (error) {
    console.error('🧪 Client test failed:', error)
    return { success: false, error }
  }
}

// Auto-test when this module loads (only in development)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Test after a short delay to let the app initialize
  setTimeout(() => {
    testClient()
  }, 1000)
}