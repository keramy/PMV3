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

    const supabase = createClient()

    // Get recent activity from activity_logs table
    const { data: activities, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user_profiles!activity_logs_user_id_fkey(first_name, last_name),
        projects!activity_logs_project_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

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