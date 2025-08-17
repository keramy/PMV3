/**
 * Formula PM V3 HTTP-Based Supabase Client
 * Workaround for hanging Supabase JS client
 * Uses direct HTTP requests to Supabase REST API
 */

import type { AppUserProfile } from '@/types/database'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * HTTP-based authentication using Supabase REST API
 * This bypasses the hanging Supabase JS client
 */
export class SupabaseHttpClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = `${supabaseUrl}/rest/v1`
    this.headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }

  /**
   * Authenticate user with email and password
   */
  async signInWithPassword(email: string, password: string): Promise<{
    data: { user: any; session: any } | null
    error: any
  }> {
    try {
      console.log('🔍 HTTP Auth: Signing in with email/password')
      
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ HTTP Auth: Sign in successful')
        
        // Store auth tokens in cookies for session management
        if (typeof document !== 'undefined') {
          document.cookie = `sb-auth-token=${data.access_token}; path=/; max-age=3600`
          document.cookie = `sb-refresh-token=${data.refresh_token}; path=/; max-age=86400`
          document.cookie = `sb-user-id=${data.user.id}; path=/; max-age=3600`
        }

        return {
          data: {
            user: data.user,
            session: data
          },
          error: null
        }
      } else {
        console.error('❌ HTTP Auth: Sign in failed:', data)
        return {
          data: null,
          error: data
        }
      }
    } catch (error) {
      console.error('❌ HTTP Auth: Network error during sign in:', error)
      return {
        data: null,
        error: { message: 'Network error during authentication' }
      }
    }
  }

  /**
   * Get current user from cookies
   */
  getCurrentUser(): { id: string; email: string } | null {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie
    const userIdMatch = cookies.match(/sb-user-id=([^;]+)/)
    const authTokenMatch = cookies.match(/sb-auth-token=([^;]+)/)

    if (userIdMatch && authTokenMatch) {
      // For now, we'll use the user ID from our successful test
      return {
        id: userIdMatch[1],
        email: 'user@example.com' // We'll get the real email from the profile
      }
    }

    return null
  }

  /**
   * Get user profile using direct HTTP request
   */
  async getUserProfile(userId: string): Promise<{
    data: AppUserProfile | null
    error: any
  }> {
    try {
      console.log('🔍 HTTP Client: Fetching profile for user:', userId)
      
      const response = await fetch(`${this.baseUrl}/user_profiles?id=eq.${userId}&select=*`, {
        method: 'GET',
        headers: this.headers
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data && data.length > 0) {
          const profile = data[0]
          const appProfile: AppUserProfile = {
            ...profile,
            permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
            full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'No Name'
          }
          
          console.log('✅ HTTP Client: Profile retrieved successfully')
          return { data: appProfile, error: null }
        } else {
          console.log('⚠️ HTTP Client: No profile found for user')
          return { data: null, error: { message: 'Profile not found' } }
        }
      } else {
        const errorData = await response.text()
        console.error('❌ HTTP Client: Profile fetch failed:', response.status, errorData)
        return { data: null, error: { message: `HTTP ${response.status}: ${errorData}` } }
      }
    } catch (error) {
      console.error('❌ HTTP Client: Network error fetching profile:', error)
      return { data: null, error: { message: 'Network error fetching profile' } }
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      // Clear auth cookies
      if (typeof document !== 'undefined') {
        document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'sb-user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
      
      console.log('✅ HTTP Client: User signed out')
    } catch (error) {
      console.error('❌ HTTP Client: Error during sign out:', error)
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof document === 'undefined') return false
    
    const cookies = document.cookie
    return cookies.includes('sb-auth-token=') && cookies.includes('sb-user-id=')
  }

  /**
   * Generic query method for other tables
   */
  async query<T = any>(table: string, options: {
    select?: string
    filter?: string
    limit?: number
    order?: string
  } = {}): Promise<{ data: T[] | null; error: any }> {
    try {
      const params = new URLSearchParams()
      
      if (options.select) params.append('select', options.select)
      if (options.filter) params.append(options.filter.split('=')[0], options.filter.split('=')[1])
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.order) params.append('order', options.order)

      const url = `${this.baseUrl}/${table}?${params.toString()}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      })

      if (response.ok) {
        const data = await response.json()
        return { data, error: null }
      } else {
        const errorData = await response.text()
        return { data: null, error: { message: `HTTP ${response.status}: ${errorData}` } }
      }
    } catch (error) {
      return { data: null, error: { message: 'Network error during query' } }
    }
  }
}

// Export singleton instance
export const httpClient = new SupabaseHttpClient()