/**
 * Formula PM V3 Database Query Helpers - CLEAN VERSION
 * Simplified for construction site performance and offline scenarios
 * Only essential functions with direct Supabase calls
 */

import { getClient } from '@/lib/supabase/client'
import { isDevAuthBypassEnabled, mockUserProfile } from '@/lib/dev/mock-user'
import type { 
  AppUserProfile,
  Project,
  Task,
  ScopeItem,
  ShopDrawing,
  MaterialSpec
} from '@/types/database'
import type { Permission } from '@/types/auth'

// ============================================================================
// USER & AUTHENTICATION QUERIES
// ============================================================================

/**
 * Get current user's profile with permissions
 * EXTREME DEBUG VERSION
 */
export async function getCurrentUserProfile(): Promise<AppUserProfile | null> {
  console.log('🚨 EXTREME DEBUG: getCurrentUserProfile FUNCTION CALLED!')
  console.log('🚨 EXTREME DEBUG: Function is executing, this should appear in console')
  
  try {
    console.log('🚨 EXTREME DEBUG: Inside try block')
    
    // DEVELOPMENT: Return mock user profile if auth bypass is enabled
    const devBypass = isDevAuthBypassEnabled()
    console.log('🚨 EXTREME DEBUG: Dev bypass check:', devBypass)
    
    if (devBypass) {
      console.log('🚨 EXTREME DEBUG: Using mock user profile')
      return mockUserProfile as AppUserProfile
    }
    
    console.log('🚨 EXTREME DEBUG: Getting Supabase client')
    const client = getClient()
    console.log('🚨 EXTREME DEBUG: Got client, calling auth.getUser()')
    
    const { data: { user }, error: userError } = await client.auth.getUser()
    
    console.log('🚨 EXTREME DEBUG: Auth result:', { 
      user: user ? { id: user.id, email: user.email } : null, 
      userError 
    })
    
    if (!user) {
      console.log('🚨 EXTREME DEBUG: No user found, returning null')
      return null
    }

    console.log('🚨 EXTREME DEBUG: Querying user_profiles table for user:', user.id)
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('🚨 EXTREME DEBUG: Profile query result:', { 
      profile: profile ? { id: profile.id, email: profile.email } : null, 
      profileError 
    })

    if (profileError) {
      console.error('🚨 EXTREME DEBUG: Profile query error:', profileError)
      return null
    }

    if (!profile) {
      console.warn('🚨 EXTREME DEBUG: No profile found for user:', user.id)
      return null
    }

    console.log('🚨 EXTREME DEBUG: Creating app profile')
    const appProfile: AppUserProfile = {
      ...profile,
      permissions: Array.isArray(profile.permissions) ? profile.permissions as Permission[] : [],
      full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'No Name'
    }

    console.log('🚨 EXTREME DEBUG: Returning profile:', { 
      id: appProfile.id, 
      email: appProfile.email,
      permissions: appProfile.permissions?.length || 0,
      fullName: appProfile.full_name
    })

    return appProfile
  } catch (error) {
    console.error('🚨 EXTREME DEBUG: Caught error:', error)
    return null
  }
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    // DEVELOPMENT: Grant all permissions if auth bypass is enabled
    if (isDevAuthBypassEnabled()) {
      console.log(`🚀 [DEV MODE] Permission "${permission}" granted (bypass mode)`)
      return true
    }
    
    const profile = await getCurrentUserProfile()
    if (!profile) return false

    return profile.permissions.includes(permission)
  } catch (error) {
    console.error('🔍 hasPermission - Error checking permission:', error)
    return false
  }
}

/**
 * Get user profile by ID (admin function)
 */
export async function getUserProfile(userId: string): Promise<AppUserProfile | null> {
  try {
    console.log('🔍 getUserProfile - Fetching profile for user:', userId)
    
    const client = getClient()
    const { data: profile, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('🔍 getUserProfile - Error fetching user profile:', error)
      return null
    }

    if (!profile) {
      console.warn('🔍 getUserProfile - No profile found for user:', userId)
      return null
    }

    // Simple transformation
    const appProfile: AppUserProfile = {
      ...profile,
      permissions: Array.isArray(profile.permissions) ? profile.permissions as Permission[] : [],
      full_name: [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'No Name'
    }

    console.log('🔍 getUserProfile - Profile found:', { id: appProfile.id, email: appProfile.email })
    return appProfile
  } catch (error) {
    console.error('🔍 getUserProfile - Error:', error)
    return null
  }
}

// ============================================================================
// PROJECT QUERIES - SIMPLIFIED
// ============================================================================

/**
 * Get projects for current user's company - SIMPLIFIED
 */
export async function getCompanyProjects(
  page = 1, 
  limit = 10, 
  filters: { status?: string; search?: string } = {}
) {
  try {
    console.log('🔍 getCompanyProjects - Fetching projects with filters:', filters)
    
    const client = getClient()
    let query = client
      .from('projects')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('🔍 getCompanyProjects - Error fetching projects:', error)
      return {
        data: [] as any[],
        error: { message: error.message },
        totalCount: 0,
        hasMore: false
      }
    }

    console.log('🔍 getCompanyProjects - Found projects:', data?.length || 0)
    return {
      data: data || [],
      error: null,
      totalCount: count || 0,
      hasMore: (count || 0) > page * limit
    }
  } catch (error) {
    console.error('🔍 getCompanyProjects - Error:', error)
    return {
      data: [],
      error: { message: 'Failed to fetch projects' },
      totalCount: 0,
      hasMore: false
    }
  }
}

// ============================================================================
// PLACEHOLDER FUNCTIONS FOR DASHBOARD
// ============================================================================

/**
 * Basic dashboard data - simplified implementation
 */
export async function getDashboardData() {
  try {
    const client = getClient()
    
    // Get basic counts for dashboard
    const [projectsResult, tasksResult] = await Promise.all([
      client.from('projects').select('*', { count: 'exact', head: true }),
      client.from('tasks').select('*', { count: 'exact', head: true })
    ])

    return {
      projects: projectsResult.count || 0,
      tasks: tasksResult.count || 0,
      error: null
    }
  } catch (error) {
    console.error('🔍 getDashboardData - Error:', error)
    return {
      projects: 0,
      tasks: 0,
      error: error
    }
  }
}