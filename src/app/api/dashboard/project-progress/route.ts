/**
 * Project Progress API Route
 * Returns project progress data for dashboard charts
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ProjectProgress } from '@/hooks/useDashboardData'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // Mock project progress data
    const projects: ProjectProgress[] = [
      {
        id: '1',
        name: 'Downtown Office Complex',
        completion_percentage: 78,
        budget_utilization: 82,
        days_behind_schedule: 0,
        critical_path_status: 'on_track'
      },
      {
        id: '2', 
        name: 'Residential Tower Phase 2',
        completion_percentage: 45,
        budget_utilization: 48,
        days_behind_schedule: 5,
        critical_path_status: 'at_risk'
      },
      {
        id: '3',
        name: 'Industrial Warehouse',
        completion_percentage: 92,
        budget_utilization: 89,
        days_behind_schedule: -3,
        critical_path_status: 'on_track'
      },
      {
        id: '4',
        name: 'Shopping Center Renovation', 
        completion_percentage: 65,
        budget_utilization: 71,
        days_behind_schedule: 12,
        critical_path_status: 'delayed'
      },
      {
        id: '5',
        name: 'Hospital Expansion',
        completion_percentage: 23,
        budget_utilization: 25,
        days_behind_schedule: 2,
        critical_path_status: 'at_risk'
      },
      {
        id: '6',
        name: 'School Construction',
        completion_percentage: 88,
        budget_utilization: 85,
        days_behind_schedule: -1,
        critical_path_status: 'on_track'
      }
    ]

    // Simulate network delay for development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Project progress API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project progress' },
      { status: 500 }
    )
  }
}