/**
 * Formula PM V3 - Admin User Management API
 * Handles fetching and updating user permissions
 */

import { NextRequest } from 'next/server'
import { withAuth, ApiResponses } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { hasPermissionFlag } from '@/lib/permissions/roles'
import { PERMISSION_FLAGS } from '@/types/roles'

// GET /api/admin/users - Fetch all users with permission data
export const GET = withAuth(async (user, request) => {
  const supabase = createClient()
  
  // Check admin permissions
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, permission_level, permission_flags')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return ApiResponses.forbidden('Admin access required')
  }
  
  try {
    // Fetch all users with enhanced permission data
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        job_title,
        avatar_url,
        phone,
        is_active,
        last_login,
        created_at,
        updated_at,
        permissions,
        role,
        can_view_costs,
        assigned_projects
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      return ApiResponses.internalError('Failed to fetch users', error.message)
    }
    
    // Enhance user data with computed fields
    const enhancedUsers = await Promise.all(users?.map(async (user) => {
      // Get project count for non-client users
      let project_count = 0
      if (user.role !== 'client') {
        const { count } = await supabase
          .from('project_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        project_count = count || 0
      }
      
      return {
        ...user,
        full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'No Name',
        project_count,
        last_activity: user.last_login,
      }
    }) ?? [])
    
    return ApiResponses.success(enhancedUsers)
  } catch (error) {
    console.error('Error in admin users API:', error)
    return ApiResponses.internalError('Internal server error')
  }
})

// POST /api/admin/users - Create new user (if needed)
export const POST = withAuth(async (user, request) => {
  // Implementation for creating new users if needed
  return ApiResponses.forbidden('User creation not implemented')
})