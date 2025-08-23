/**
 * Supabase Authentication Callback Route
 * CRITICAL: Handles PKCE code exchange and sets session cookies
 * Without this route, authentication will fail with AuthSessionMissingError
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

  console.log('🔍 AUTH CALLBACK: Starting code exchange', {
    hasCode: !!code,
    origin,
    redirectTo,
    searchParams: Object.fromEntries(requestUrl.searchParams)
  })

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            const response = NextResponse.redirect(`${origin}${redirectTo}`)
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
            return response
          },
        },
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('🔍 AUTH CALLBACK: Code exchange result', {
        hasUser: !!data.user,
        userId: data.user?.id,
        hasSession: !!data.session,
        error: error?.message
      })

      if (error) {
        console.error('❌ AUTH CALLBACK: Code exchange failed', error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        console.log('✅ AUTH CALLBACK: Authentication successful, redirecting to', redirectTo)
        const response = NextResponse.redirect(`${origin}${redirectTo}`)
        
        // Ensure cookies are set properly
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          // The cookies should already be set by the supabase client,
          // but we can add additional security headers if needed
          response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
        }
        
        return response
      }
    } catch (err) {
      console.error('❌ AUTH CALLBACK: Exception during code exchange', err)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  console.log('⚠️ AUTH CALLBACK: No code provided, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}