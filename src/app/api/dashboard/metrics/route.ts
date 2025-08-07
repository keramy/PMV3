/**
 * Dashboard Metrics API Route
 * Returns construction-specific KPIs and metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import type { DashboardMetrics } from '@/hooks/useDashboardData'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // Mock data - In production, fetch from database
    const metrics: DashboardMetrics = {
      activeProjects: 8,
      completedProjects: 12,
      totalBudget: 15500000, // $15.5M
      actualSpend: 11200000, // $11.2M
      onTimeProjects: 6,
      delayedProjects: 2,
      pendingDrawings: 23,
      approvedDrawings: 187,
      openTasks: 42,
      overdueTasks: 7,
      upcomingMilestones: 5,
      safetyIncidents: 1,
      weatherDelayDays: 3,
    }

    // Simulate network delay for development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Dashboard metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}