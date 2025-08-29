/**
 * Formula PM V3 - Admin User Management API  
 * Handles fetching and updating user permissions using dual-client architecture
 * Regular client for permission checks, service role client for RLS-bypassing operations
 */

import { NextRequest } from 'next/server'
import { withAuth, ApiResponses } from '@/lib/api/middleware'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { hasPermissionFlag } from '@/lib/permissions/roles'
import { PERMISSION_FLAGS } from '@/types/roles'
import { z } from 'zod'

// Validation schema for user creation
const userCreationSchema = z.object({
  email: z.string().email('Valid email required'),
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  job_title: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  password: z.string().min(6, 'Password must be at least 6 characters').optional()
})

// GET /api/admin/users - Fetch all users with permission data
export const GET = withAuth(async (user, request) => {
  // Step 1: Use regular client for permission verification
  const supabase = await createClient()
  
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
    // Step 2: Use service role client to fetch all users (bypass RLS)
    const serviceSupabase = createServiceClient()
    
    console.log('📋 [Admin API] Fetching all users for admin:', user.id)
    
    // Fetch all users with enhanced permission data
    const { data: users, error } = await serviceSupabase
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
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('🚨 [Admin API] Error fetching users:', error)
      return ApiResponses.internalError('Failed to fetch users', error.message)
    }
    
    // Enhance user data with computed fields
    const enhancedUsers = await Promise.all(users?.map(async (userData) => {
      // Get project count using service role
      const { count } = await serviceSupabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)
      
      return {
        ...userData,
        full_name: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || 'No Name',
        project_count: count || 0,
        last_activity: userData.last_login,
      }
    }) ?? [])
    
    console.log(`✅ [Admin API] Fetched ${enhancedUsers.length} users successfully`)
    return ApiResponses.success(enhancedUsers)
  } catch (error) {
    console.error('🚨 [Admin API] Unexpected error:', error)
    return ApiResponses.internalError('Internal server error')
  }
})

// POST /api/admin/users - Create new user
export const POST = withAuth(async (user, request) => {
  // Step 1: Use regular client for permission verification
  const supabase = await createClient()
  
  // Check admin permissions using current user's session
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('permissions_bitwise, role')
    .eq('id', user.id)
    .single()
  
  // Enhanced admin permission check - stricter for user creation
  // Check admin permission (bit 0: value 1) or MANAGE_USERS permission (bit 25: value 33554432)
  const hasAdminAccess = profile?.permissions_bitwise && 
    ((profile.permissions_bitwise & 1) > 0 || (profile.permissions_bitwise & 33554432) > 0)
  
  if (!hasAdminAccess) {
    console.log('🚫 [Admin API] User creation denied for user:', user.id, 'permissions_bitwise:', profile?.permissions_bitwise)
    return ApiResponses.forbidden('Admin access required - need admin or manage_users permission for user creation')
  }
  
  try {
    const body = await request.json()
    console.log('👤 [Admin API] Creating new user for admin:', user.id)
    
    // Validate the request body
    const validatedData = userCreationSchema.parse(body)
    
    // Step 2: Use service role client for user creation
    const serviceSupabase = createServiceClient()
    
    // Create the authentication user first
    const { data: authUser, error: authError } = await serviceSupabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password || Math.random().toString(36).slice(-12), // Generate random password if not provided
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        job_title: validatedData.job_title
      }
    })
    
    if (authError) {
      console.error('🚨 [Admin API] Auth user creation failed:', authError)
      if (authError.message.includes('already registered')) {
        return ApiResponses.conflict('User with this email already exists')
      }
      return ApiResponses.internalError('Failed to create auth user', authError.message)
    }
    
    if (!authUser.user) {
      return ApiResponses.internalError('Failed to create auth user - no user returned')
    }
    
    // Create the user profile
    const { data: profileUser, error: profileError } = await serviceSupabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email: validatedData.email,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        job_title: validatedData.job_title || null,
        phone: validatedData.phone || null,
        permissions: [], // Legacy field - keep empty for now
        permissions_bitwise: 0, // Default permissions - will be set by admin later
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        id,
        email,
        first_name,
        last_name,
        job_title,
        phone,
        permissions,
        is_active,
        created_at
      `)
      .single()
    
    if (profileError) {
      console.error('🚨 [Admin API] Profile creation failed:', profileError)
      // Try to clean up the auth user if profile creation failed
      try {
        await serviceSupabase.auth.admin.deleteUser(authUser.user.id)
      } catch (cleanupError) {
        console.error('🚨 [Admin API] Failed to cleanup auth user:', cleanupError)
      }
      return ApiResponses.internalError('Failed to create user profile', profileError.message)
    }
    
    // Log the successful creation for audit purposes
    console.log('✅ [Admin API] User created successfully:', {
      createdBy: user.id,
      newUserId: authUser.user.id,
      email: validatedData.email
    })
    
    return ApiResponses.created({
      message: 'User created successfully',
      user: {
        ...profileUser,
        full_name: [profileUser.first_name, profileUser.last_name].filter(Boolean).join(' ') || 'No Name',
        project_count: 0
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return ApiResponses.badRequest('Validation failed', details)
    }
    
    console.error('🚨 [Admin API] Unexpected error during user creation:', error)
    return ApiResponses.internalError('Internal server error')
  }
})