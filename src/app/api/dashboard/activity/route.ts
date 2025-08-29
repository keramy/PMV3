/**
 * Activity Feed API Route - Real Database Connection
 * Returns recent construction activity for dashboard feed from actual database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ActivityFeedItem } from '@/hooks/useDashboardData'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    console.log('🔍 Activity API - Fetching real data for user:', userId)

    const supabase = await createClient()

    // Get user profile for permission checking
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions_bitwise, role, assigned_projects')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 403 }
      )
    }

    // Check VIEW_AUDIT_LOGS permission (bit 25: value 33554432) or admin (bit 0: value 1)
    const hasAuditPermission = profile.permissions_bitwise && 
      ((profile.permissions_bitwise & 33554432) > 0 || (profile.permissions_bitwise & 1) > 0)

    // Build query with permission-based filtering
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        user_profiles!activity_logs_user_id_fkey(first_name, last_name),
        projects!activity_logs_project_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter to assigned projects only if user doesn't have company-wide audit permission
    if (!hasAuditPermission && profile.assigned_projects) {
      console.log('🔍 Activity API - Filtering to assigned projects for user:', userId)
      query = query.in('project_id', profile.assigned_projects)
    } else if (!hasAuditPermission) {
      // If no audit permission and no assigned projects, return empty
      console.log('🔍 Activity API - No audit permission and no assigned projects for user:', userId)
      return NextResponse.json([])
    } else {
      console.log('🔍 Activity API - User has audit permission, showing all activities for user:', userId)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error('🔍 Activity API - Database error:', error)
      // If no activity_logs data, return empty array instead of mock data
      return NextResponse.json([])
    }

    console.log('🔍 Activity API - Found activities:', activities?.length || 0)

    // Transform database records to ActivityFeedItem format
    const activityFeed: ActivityFeedItem[] = (activities || []).map(activity => ({
      id: activity.id,
      type: activity.action as any, // Maps to activity type
      project_id: activity.project_id || '',
      project_name: activity.projects?.name || 'Unknown Project',
      title: activity.entity_type + ' ' + activity.action,
      description: activity.details?.toString() || 'No description available',
      user_name: activity.user_profiles 
        ? [activity.user_profiles.first_name, activity.user_profiles.last_name].filter(Boolean).join(' ') || 'Unknown User'
        : 'System',
      timestamp: activity.created_at || new Date().toISOString(),
      priority: 'medium' // Default priority, could be enhanced based on activity type
    }))

    return NextResponse.json(activityFeed)

  } catch (error) {
    console.error('🔍 Activity API - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}