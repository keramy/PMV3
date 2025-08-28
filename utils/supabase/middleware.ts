/**
 * Formula PM V3 - Supabase SSR Middleware Utils
 * Official implementation following Supabase Next.js SSR documentation
 * CRITICAL: Proper cookie handling to prevent session issues
 * DEVELOPMENT: Authentication bypass for faster development
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isDevAuthBypassEnabled, MOCK_DEV_USER_ID } from '@/lib/dev/mock-user'

export async function updateSession(request: NextRequest) {
  // OFFICIAL SUPABASE PATTERN: Create response once, never recreate
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // OFFICIAL SUPABASE PATTERN: NEVER recreate response in setAll
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          // CRITICAL: Do NOT recreate supabaseResponse here!
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2024 BEST PRACTICE: Always call getUser() to validate JWT and refresh tokens
  console.log('🔍 MIDDLEWARE: Validating session for path:', request.nextUrl.pathname)
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  
  console.log('🔍 MIDDLEWARE: Session validation result:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    error: userError?.message,
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  })

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/projects', '/admin', '/test-dashboard']
  const publicRoutes = ['/login', '/signup', '/', '/auth', '/test-auth']
  
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
  const isAuthCallback = path.startsWith('/auth/callback')

  // Allow auth callback to process without interference
  if (isAuthCallback) {
    console.log('🔍 MIDDLEWARE: Allowing auth callback to proceed:', path)
    return supabaseResponse
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    console.log('🔍 MIDDLEWARE: Redirecting to login - no user for protected route:', path)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from public routes (except home page)
  if (isPublicRoute && user && path !== '/') {
    console.log('🔍 MIDDLEWARE: Redirecting authenticated user from public route:', path, 'to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  console.log('🔍 MIDDLEWARE: Allowing access to:', path, 'for user:', user?.email || 'anonymous')

  // For API routes, add user context headers if authenticated
  if (path.startsWith('/api/') && user) {
    supabaseResponse.headers.set('X-User-ID', user.id)
    supabaseResponse.headers.set('X-User-Email', user.email || '')
  }

  // CRITICAL: Must return the supabaseResponse object unchanged
  return supabaseResponse
}