/**
 * Activity Feed API Route
 * Returns recent construction activity for dashboard feed
 */

import { NextRequest, NextResponse } from 'next/server'
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

    // Mock activity feed data
    const activities: ActivityFeedItem[] = [
      {
        id: '1',
        type: 'task_completed',
        project_id: '1',
        project_name: 'Downtown Office Complex',
        title: 'Electrical rough-in completed - Floor 15',
        description: 'All electrical rough-in work for the 15th floor has been completed and inspected.',
        user_name: 'Mike Rodriguez',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        priority: 'medium'
      },
      {
        id: '2',
        type: 'drawing_approved',
        project_id: '2',
        project_name: 'Residential Tower Phase 2',
        title: 'Shop drawing approved - HVAC System Layout',
        description: 'HVAC system layout drawings for floors 10-15 have been reviewed and approved.',
        user_name: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        priority: 'high'
      },
      {
        id: '3',
        type: 'milestone_reached',
        project_id: '3',
        project_name: 'Industrial Warehouse',
        title: 'Structural completion milestone reached',
        description: 'All structural work has been completed ahead of schedule.',
        user_name: 'David Chen',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        priority: 'high'
      },
      {
        id: '4',
        type: 'change_order',
        project_id: '4',
        project_name: 'Shopping Center Renovation',
        title: 'Change order approved - Additional HVAC work',
        description: 'Change order #CO-2024-08 for additional HVAC upgrades approved by client.',
        user_name: 'Lisa Martinez',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        priority: 'critical'
      },
      {
        id: '5',
        type: 'rfi_submitted',
        project_id: '5',
        project_name: 'Hospital Expansion',
        title: 'RFI submitted - Foundation specifications',
        description: 'RFI #RFI-2024-045 regarding foundation waterproofing specifications submitted.',
        user_name: 'Tom Wilson',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        priority: 'medium'
      },
      {
        id: '6',
        type: 'task_completed',
        project_id: '6',
        project_name: 'School Construction',
        title: 'Plumbing inspection passed',
        description: 'Final plumbing inspection for the gymnasium wing has passed.',
        user_name: 'Amanda Davis',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        priority: 'medium'
      },
      {
        id: '7',
        type: 'drawing_approved',
        project_id: '1',
        project_name: 'Downtown Office Complex',
        title: 'Curtain wall shop drawings approved',
        description: 'Shop drawings for the north facade curtain wall system have been approved.',
        user_name: 'Robert Kim',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        priority: 'high'
      },
      {
        id: '8',
        type: 'task_completed',
        project_id: '2',
        project_name: 'Residential Tower Phase 2',
        title: 'Concrete pour completed - Level 8',
        description: 'Concrete pour for Level 8 slab completed successfully.',
        user_name: 'Carlos Mendoza',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        priority: 'medium'
      },
      {
        id: '9',
        type: 'milestone_reached',
        project_id: '4',
        project_name: 'Shopping Center Renovation',
        title: 'Demolition phase completed',
        description: 'All demolition work for Phase 1 renovation has been completed.',
        user_name: 'Jennifer Lee',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        priority: 'medium'
      },
      {
        id: '10',
        type: 'rfi_submitted',
        project_id: '3',
        project_name: 'Industrial Warehouse',
        title: 'RFI submitted - Fire suppression layout',
        description: 'RFI regarding fire suppression system layout for high-bay storage areas.',
        user_name: 'Kevin Brown',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 day ago
        priority: 'high'
      }
    ]

    // Apply limit
    const limitedActivities = activities.slice(0, limit)

    // Simulate network delay for development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return NextResponse.json(limitedActivities)
  } catch (error) {
    console.error('Activity feed API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    )
  }
}