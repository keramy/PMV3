/**
 * Formula PM V3 - Supabase SSR Middleware Utils
 * Official implementation following Supabase Next.js SSR documentation
 * CRITICAL: Proper cookie handling to prevent session issues
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          // CRITICAL: Must use both request and response cookie setting
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Always call getUser() to trigger session refresh
  // This automatically refreshes expired tokens
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/projects', '/admin']
  const publicRoutes = ['/login', '/signup', '/', '/auth']
  
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from public routes (except home page)
  if (isPublicRoute && user && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For API routes, add user context headers if authenticated
  if (path.startsWith('/api/') && user) {
    response.headers.set('X-User-ID', user.id)
    response.headers.set('X-User-Email', user.email || '')
  }

  return response
}