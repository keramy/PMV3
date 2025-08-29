/**
 * Formula PM V3 - Individual User Management API
 * Handles updating specific user permissions using dual-client architecture
 * Regular client for permission checks, service role client for RLS-bypassing operations
 */

import { NextRequest } from 'next/server'
import { withAuth, ApiResponses } from '@/lib/api/middleware'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/roles'
import { z } from 'zod'

// Validation schema for user updates
const userUpdateSchema = z.object({
  permissions: z.array(z.string()).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  job_title: z.string().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
  can_view_costs: z.boolean().optional(),
  assigned_projects: z.array(z.string()).optional()
})

// PATCH /api/admin/users/[id] - Update user permissions
export const PATCH = withAuth(async (user, request) => {
  // Step 1: Use regular client for permission verification
  const supabase = await createClient()
  const url = new URL(request.url)
  const userId = url.pathname.split('/').pop()
  
  if (!userId) {
    return ApiResponses.badRequest('User ID required')
  }
  
  // Check admin permissions using current user's session
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('permissions_bitwise, role')
    .eq('id', user.id)
    .single()
  
  // Check admin permission (bit 0: value 1) or MANAGE_USERS permission (bit 25: value 33554432)
  const hasAdminAccess = profile?.permissions_bitwise && 
    ((profile.permissions_bitwise & 1) > 0 || (profile.permissions_bitwise & 33554432) > 0)
  
  if (!hasAdminAccess) {
    console.log('🚫 [Admin API] Access denied for user:', user.id, 'permissions_bitwise:', profile?.permissions_bitwise)
    return ApiResponses.forbidden('Admin access required - need admin or manage_users permission')
  }
  
  try {
    const body = await request.json()
    console.log('📝 [Admin API] Update request for user:', userId, 'data:', body)
    
    // Validate the request body
    const validatedData = userUpdateSchema.parse(body)
    
    // Step 2: Use service role client to bypass RLS for the actual update
    const serviceSupabase = createServiceClient()
    
    // Prepare update data with timestamp
    const updates: any = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }
    
    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key]
      }
    })
    
    console.log('🔧 [Admin API] Applying updates:', updates)
    
    // Perform the update using service role (bypasses RLS)
    const { data: updatedUser, error } = await serviceSupabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select(`
        id,
        email,
        first_name,
        last_name,
        job_title,
        phone,
        is_active,
        permissions,
        updated_at
      `)
      .single()
    
    if (error) {
      console.error('🚨 [Admin API] Update failed:', error)
      if (error.code === 'PGRST116') {
        return ApiResponses.notFound('User not found')
      }
      return ApiResponses.internalError('Failed to update user', error.message)
    }
    
    // Log the successful update for audit purposes
    console.log('✅ [Admin API] User updated successfully:', {
      updatedBy: user.id,
      targetUser: userId,
      fields: Object.keys(updates)
    })
    
    return ApiResponses.success({
      message: 'User updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return ApiResponses.badRequest('Validation failed', details)
    }
    
    console.error('🚨 [Admin API] Unexpected error:', error)
    return ApiResponses.internalError('Internal server error')
  }
})

// GET /api/admin/users/[id] - Get specific user details
export const GET = withAuth(async (user, request) => {
  // Step 1: Use regular client for permission verification
  const supabase = await createClient()
  const url = new URL(request.url)
  const userId = url.pathname.split('/').pop()
  
  if (!userId) {
    return ApiResponses.badRequest('User ID required')
  }
  
  // Check admin permissions using current user's session
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('permissions_bitwise, role')
    .eq('id', user.id)
    .single()
  
  // Check admin permission (bit 0: value 1) or MANAGE_USERS permission (bit 25: value 33554432)
  const hasAdminAccess = profile?.permissions_bitwise && 
    ((profile.permissions_bitwise & 1) > 0 || (profile.permissions_bitwise & 33554432) > 0)
  
  if (!hasAdminAccess) {
    console.log('🚫 [Admin API] Access denied for user:', user.id, 'permissions_bitwise:', profile?.permissions_bitwise)
    return ApiResponses.forbidden('Admin access required - need admin or manage_users permission')
  }
  
  try {
    // Step 2: Use service role client to fetch user data (bypass RLS if needed)
    const serviceSupabase = createServiceClient()
    
    // Fetch user details with project count
    const { data: userData, error } = await serviceSupabase
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
        permissions
      `)
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return ApiResponses.notFound('User not found')
      }
      console.error('🚨 [Admin API] Error fetching user:', error)
      return ApiResponses.internalError('Failed to fetch user', error.message)
    }
    
    if (!userData) {
      return ApiResponses.notFound('User not found')
    }
    
    // Get project count using service role
    const { count: projectCount } = await serviceSupabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    // Enhance with computed fields
    const enhancedUser = {
      ...userData,
      full_name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'No Name',
      project_count: projectCount || 0
    }
    
    console.log('✅ [Admin API] User fetched successfully:', userId)
    return ApiResponses.success(enhancedUser)
    
  } catch (error) {
    console.error('🚨 [Admin API] Unexpected error:', error)
    return ApiResponses.internalError('Internal server error')
  }
})

// DELETE /api/admin/users/[id] - Deactivate user (soft delete)
export const DELETE = withAuth(async (user, request) => {
  // Step 1: Use regular client for permission verification
  const supabase = await createClient()
  const url = new URL(request.url)
  const userId = url.pathname.split('/').pop()
  
  if (!userId) {
    return ApiResponses.badRequest('User ID required')
  }
  
  // Prevent self-deactivation
  if (userId === user.id) {
    return ApiResponses.badRequest('Cannot deactivate your own account')
  }
  
  // Check admin permissions using current user's session
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('permissions_bitwise, role')
    .eq('id', user.id)
    .single()
  
  // Enhanced admin permission check - stricter for deactivation
  // Check admin permission (bit 0: value 1) or MANAGE_USERS permission (bit 25: value 33554432)
  const hasAdminAccess = profile?.permissions_bitwise && 
    ((profile.permissions_bitwise & 1) > 0 || (profile.permissions_bitwise & 33554432) > 0)
  
  if (!hasAdminAccess) {
    console.log('🚫 [Admin API] Deactivation denied for user:', user.id, 'permissions_bitwise:', profile?.permissions_bitwise)
    return ApiResponses.forbidden('Admin access required - need admin or manage_users permission for user deactivation')
  }
  
  try {
    // Step 2: Use service role client to deactivate user (soft delete)
    const serviceSupabase = createServiceClient()
    
    console.log('🔒 [Admin API] Deactivating user:', userId, 'by admin:', user.id)
    
    // Soft delete: set is_active to false instead of actual deletion
    const { data: deactivatedUser, error } = await serviceSupabase
      .from('user_profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select(`
        id,
        email,
        first_name,
        last_name,
        is_active,
        updated_at
      `)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return ApiResponses.notFound('User not found')
      }
      console.error('🚨 [Admin API] Deactivation failed:', error)
      return ApiResponses.internalError('Failed to deactivate user', error.message)
    }
    
    // Log the deactivation for audit purposes
    console.log('✅ [Admin API] User deactivated successfully:', {
      deactivatedBy: user.id,
      targetUser: userId,
      userEmail: deactivatedUser?.email
    })
    
    return ApiResponses.success({
      message: 'User deactivated successfully',
      user: deactivatedUser
    })
    
  } catch (error) {
    console.error('🚨 [Admin API] Unexpected error during deactivation:', error)
    return ApiResponses.internalError('Internal server error')
  }
})