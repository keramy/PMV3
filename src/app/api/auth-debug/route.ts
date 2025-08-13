import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase/client'

export async function GET() {
  const results: any = {}
  
  try {
    // Test Supabase client creation
    const supabase = getClient()
    results.clientCreated = true
    
    // Try to get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    results.sessionCheck = {
      session: sessionData.session ? {
        user: {
          id: sessionData.session.user.id,
          email: sessionData.session.user.email
        },
        expires_at: sessionData.session.expires_at
      } : null,
      error: sessionError?.message
    }
    
    // Try to get user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    results.userCheck = {
      user: userData.user ? {
        id: userData.user.id,
        email: userData.user.email
      } : null,
      error: userError?.message
    }
    
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error'
  }
  
  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString()
  })
}