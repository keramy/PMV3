/**
 * Role-Specific Data API Route
 * Returns data based on user permissions and role
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    
    const includeFinance = searchParams.get('include_finance') === 'true'
    const includeAdmin = searchParams.get('include_admin') === 'true'
    const includePM = searchParams.get('include_pm') === 'true'
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    const responseData: any = {}

    // Financial data for users with budget permissions
    if (includeFinance) {
      responseData.financialData = {
        monthlyBudgetTrend: [
          { month: 'Jan', planned: 800000, actual: 750000, projected: 800000 },
          { month: 'Feb', planned: 900000, actual: 920000, projected: 950000 },
          { month: 'Mar', planned: 1000000, actual: 980000, projected: 1020000 },
          { month: 'Apr', planned: 1100000, actual: 1150000, projected: 1200000 },
          { month: 'May', planned: 1200000, actual: 1180000, projected: 1250000 },
          { month: 'Jun', planned: 1300000, actual: 0, projected: 1350000 },
        ],
        costBreakdown: [
          { category: 'Labor', amount: 4200000, percentage: 38 },
          { category: 'Materials', amount: 3800000, percentage: 34 },
          { category: 'Equipment', amount: 1900000, percentage: 17 },
          { category: 'Overhead', amount: 1200000, percentage: 11 },
        ]
      }
    }

    // Admin data for management users
    if (includeAdmin) {
      responseData.adminData = {
        userActivity: [
          { week: 'Week 1', activeUsers: 45, tasksCreated: 128, projectsStarted: 3 },
          { week: 'Week 2', activeUsers: 52, tasksCreated: 145, projectsStarted: 2 },
          { week: 'Week 3', activeUsers: 48, tasksCreated: 132, projectsStarted: 4 },
          { week: 'Week 4', activeUsers: 56, tasksCreated: 167, projectsStarted: 1 },
        ],
        systemHealth: {
          uptime: 99.8,
          responseTime: 145,
          errorRate: 0.02,
          activeConnections: 234
        }
      }
    }

    // Project management data
    if (includePM) {
      responseData.projectManagementData = {
        resourceUtilization: [
          { resource: 'Project Managers', utilization: 85, capacity: 12, assigned: 10 },
          { resource: 'Superintendents', utilization: 92, capacity: 8, assigned: 7 },
          { resource: 'Foremen', utilization: 78, capacity: 15, assigned: 12 },
          { resource: 'Safety Officers', utilization: 65, capacity: 4, assigned: 3 },
        ],
        projectPipeline: [
          { month: 'Current', bidding: 8, planning: 4, active: 12, closing: 3 },
          { month: 'Next', bidding: 12, planning: 6, active: 14, closing: 2 },
          { month: 'Future', bidding: 15, planning: 8, active: 16, closing: 4 },
        ]
      }
    }

    // Simulate network delay for development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 600))
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Role data API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role-specific data' },
      { status: 500 }
    )
  }
}