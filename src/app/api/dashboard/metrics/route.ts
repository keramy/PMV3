/**
 * Dashboard Metrics API Route - Real Database Connection
 * Returns construction-specific KPIs and metrics from actual database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    console.log('🔍 Dashboard Metrics API - Fetching real data for user:', userId)

    const supabase = createClient()

    // Get all metrics from database in parallel
    const [
      projectsResult,
      tasksResult,
      shopDrawingsResult,
      materialSpecsResult
    ] = await Promise.all([
      // Projects metrics
      supabase
        .from('projects')
        .select('status, budget, start_date, end_date')
        .then(result => result.data || []),
      
      // Tasks metrics  
      supabase
        .from('tasks')
        .select('status, priority, due_date')
        .then(result => result.data || []),
      
      // Shop drawings metrics
      supabase
        .from('shop_drawings')
        .select('status')
        .then(result => result.data || []),
      
      // Material specs metrics
      supabase
        .from('material_specs')
        .select('status')
        .then(result => result.data || [])
    ])

    // Calculate real metrics
    const now = new Date()
    
    const activeProjects = projectsResult.filter(p => 
      p.status === 'active' || p.status === 'in_progress'
    ).length
    
    const completedProjects = projectsResult.filter(p => 
      p.status === 'completed'
    ).length
    
    const totalBudget = projectsResult.reduce((sum, p) => 
      sum + (p.budget || 0), 0
    )
    
    // For now, assume 70% spend rate on active projects
    const actualSpend = Math.round(totalBudget * 0.7)
    
    const onTimeProjects = projectsResult.filter(p => {
      if (!p.end_date || p.status !== 'active') return true
      return new Date(p.end_date) >= now
    }).length
    
    const delayedProjects = projectsResult.filter(p => {
      if (!p.end_date || p.status !== 'active') return false
      return new Date(p.end_date) < now
    }).length
    
    const pendingDrawings = shopDrawingsResult.filter(d => 
      d.status === 'pending_submittal' || d.status === 'submitted_to_client'
    ).length
    
    const approvedDrawings = shopDrawingsResult.filter(d => 
      d.status === 'approved'
    ).length
    
    const openTasks = tasksResult.filter(t => 
      t.status === 'todo' || t.status === 'in_progress'
    ).length
    
    const overdueTasks = tasksResult.filter(t => {
      if (!t.due_date || t.status === 'completed') return false
      return new Date(t.due_date) < now
    }).length

    const metrics: DashboardMetrics = {
      activeProjects,
      completedProjects,
      totalBudget,
      actualSpend,
      onTimeProjects,
      delayedProjects,
      pendingDrawings,
      approvedDrawings,
      openTasks,
      overdueTasks,
      upcomingMilestones: 0, // TODO: Add milestones table
      safetyIncidents: 0, // TODO: Add safety incidents tracking
      weatherDelayDays: 0, // TODO: Add weather tracking
    }

    console.log('🔍 Dashboard Metrics API - Calculated metrics:', {
      activeProjects,
      totalProjects: projectsResult.length,
      totalTasks: tasksResult.length,
      totalDrawings: shopDrawingsResult.length
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Dashboard metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}