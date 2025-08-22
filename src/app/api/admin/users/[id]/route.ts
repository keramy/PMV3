/**
 * Formula PM V3 - Individual User Management API
 * Handles updating specific user permissions
 */

import { NextRequest } from 'next/server'
import { withAuth, ApiResponses } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/roles'

// PATCH /api/admin/users/[id] - Update user permissions
export const PATCH = withAuth(async (user, request) => {
  const supabase = createClient()
  const url = new URL(request.url)
  const userId = url.pathname.split('/').pop()
  
  if (!userId) {
    return ApiResponses.badRequest('User ID required')
  }
  
  // Check admin permissions
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return ApiResponses.forbidden('Admin access required')
  }
  
  try {
    const body = await request.json()
    const { role, can_view_costs, assigned_projects } = body
    
    // Validate role if provided
    if (role && !['admin', 'technical_manager', 'project_manager', 'team_member', 'client'].includes(role)) {
      return ApiResponses.badRequest('Invalid role specified')
    }
    
    // Validate assigned_projects for clients
    if (role === 'client' && assigned_projects && !Array.isArray(assigned_projects)) {
      return ApiResponses.badRequest('assigned_projects must be an array for clients')
    }
    
    // Prepare update data
    const updates: any = {
      updated_at: new Date().toISOString()
    }
    
    if (role) updates.role = role
    if (can_view_costs !== undefined) updates.can_view_costs = can_view_costs
    if (assigned_projects !== undefined) updates.assigned_projects = assigned_projects
    
    // Update user permissions
    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user permissions:', error)
      return ApiResponses.internalError('Failed to update user permissions', error.message)
    }
    
    // Log the permission change for audit trail
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'user_permission_update',
        details: {
          target_user_id: userId,
          changes: updates,
          admin_user: user.id
        }
      })
    
    return ApiResponses.success({
      message: 'User permissions updated successfully',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('Error in user update API:', error)
    return ApiResponses.internalError('Internal server error')
  }
})

// GET /api/admin/users/[id] - Get specific user details
export const GET = withAuth(async (user, request) => {
  const supabase = createClient()
  const url = new URL(request.url)
  const userId = url.pathname.split('/').pop()
  
  if (!userId) {
    return ApiResponses.badRequest('User ID required')
  }
  
  // Check admin permissions
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return ApiResponses.forbidden('Admin access required')
  }
  
  try {
    // Fetch user details
    const { data: userData, error } = await supabase
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
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return ApiResponses.notFound('User not found')
      }
      console.error('Error fetching user:', error)
      return ApiResponses.internalError('Failed to fetch user', error.message)
    }
    
    // Enhance with computed fields
    const enhancedUser = {
      ...userData,
      full_name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'No Name',
    }
    
    return ApiResponses.success(enhancedUser)
    
  } catch (error) {
    console.error('Error in user fetch API:', error)
    return ApiResponses.internalError('Internal server error')
  }
})

// DELETE /api/admin/users/[id] - Deactivate user (if needed)
export const DELETE = withAuth(async (user, request) => {
  // Implementation for user deactivation if needed
  return ApiResponses.forbidden('User deletion not implemented - use deactivation instead')
})