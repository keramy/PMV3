/**
 * Material Specs API Route
 * Simple PM approval workflow for material specifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/database/queries'
import type { 
  MaterialSpec,
  MaterialSpecFormData,
  MaterialSpecListParams,
  MaterialSpecListResponse,
  MaterialSpecStatistics,
  MaterialSpecFilters,
  MaterialCategory,
  MaterialPriority,
  MaterialSpecStatus
} from '@/types/material-specs'
import { 
  calculateTotalCost, 
  getDaysSinceSubmission,
  getReviewDays,
  isOverdueForReview,
  MATERIAL_SPEC_PERMISSIONS 
} from '@/types/material-specs'

// ============================================================================
// GET - List Material Specs with Filtering & Statistics
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserProfile()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions
    if (!user.permissions.includes('view_materials')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Parse query parameters
    const params: MaterialSpecListParams = {
      project_id: projectId,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      sort_field: (searchParams.get('sort_field') || 'created_at') as keyof MaterialSpec,
      sort_direction: (searchParams.get('sort_direction') || 'desc') as 'asc' | 'desc',
      status: searchParams.get('status')?.split(',') as MaterialSpecStatus[] | undefined,
      category: searchParams.get('category') as MaterialCategory | 'all' | undefined,
      priority: searchParams.get('priority') as MaterialPriority | 'all' | undefined,
      search_term: searchParams.get('search') || undefined,
    }

    // Build query
    let query = supabase
      .from('material_specs')
      .select(`
        *,
        project:projects(id, name),
        created_by_user:user_profiles!material_specs_created_by_fkey(
          id, first_name, last_name, job_title
        ),
        reviewed_by_user:user_profiles!material_specs_approved_by_fkey(
          id, first_name, last_name
        )
      `)
      .eq('project_id', projectId)

    // Apply filters
    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status)
    }

    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category)
    }

    if (params.priority && params.priority !== 'all') {
      query = query.eq('priority', params.priority)
    }

    if (params.search_term) {
      query = query.or(`
        name.ilike.%${params.search_term}%,
        manufacturer.ilike.%${params.search_term}%,
        model.ilike.%${params.search_term}%,
        spec_number.ilike.%${params.search_term}%,
        specification.ilike.%${params.search_term}%
      `)
    }

    // Add sorting
    query = query.order(params.sort_field, { ascending: params.sort_direction === 'asc' })

    // Add pagination
    const from = (params.page - 1) * params.limit
    const to = from + params.limit - 1
    query = query.range(from, to)

    const { data: specs, error, count } = await query

    if (error) {
      console.error('Material specs query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch material specs' },
        { status: 500 }
      )
    }

    // Get statistics (separate query for better performance)
    const { data: statsData } = await supabase
      .from('material_specs')
      .select('status, category, priority, total_cost, created_at, reviewed_by, image_url')
      .eq('project_id', projectId)

    // Calculate statistics
    const statistics = calculateStatistics(statsData || [])

    const response: MaterialSpecListResponse = {
      specs: (specs || []) as MaterialSpec[],
      statistics,
      total_count: count || 0,
      filters_applied: {
        status: params.status,
        category: params.category,
        priority: params.priority,
        search_term: params.search_term,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Material specs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create New Material Spec
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUserProfile()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions
    if (!user.permissions.includes('create_material_specs')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create material specs' },
        { status: 403 }
      )
    }

    const formData: MaterialSpecFormData = await request.json()

    // Validate required fields
    if (!formData.name || !formData.category || !formData.priority) {
      return NextResponse.json(
        { error: 'Name, category, and priority are required' },
        { status: 400 }
      )
    }

    // Calculate total cost if quantity and unit_cost provided
    const total_cost = formData.quantity && formData.unit_cost 
      ? formData.quantity * formData.unit_cost 
      : null

    // Create material spec
    const { data: newSpec, error } = await supabase
      .from('material_specs')
      .insert({
        name: formData.name,
        category: formData.category,
        priority: formData.priority,
        manufacturer: formData.manufacturer,
        model: formData.model,
        spec_number: formData.spec_number,
        specification: formData.specification,
        unit: formData.unit,
        quantity: formData.quantity,
        unit_cost: formData.unit_cost,
        total_cost,
        supplier: formData.supplier,
        notes: formData.notes,
        image_url: formData.image_url,  // NEW: Handle image URL
        project_id: new URL(request.url).searchParams.get('project_id'),
        created_by: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        project:projects(id, name),
        created_by_user:user_profiles!material_specs_created_by_fkey(
          id, first_name, last_name, job_title
        )
      `)
      .single()

    if (error) {
      console.error('Create material spec error:', error)
      return NextResponse.json(
        { error: 'Failed to create material spec' },
        { status: 500 }
      )
    }

    return NextResponse.json(newSpec, { status: 201 })

  } catch (error) {
    console.error('Material specs creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateStatistics(data: any[]): MaterialSpecStatistics {
  const total_specs = data.length

  // Count by status
  const by_status: Record<MaterialSpecStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    revision_required: 0,
  }

  // Count by category
  const by_category: Record<MaterialCategory, number> = {
    wood: 0,
    metal: 0,
    glass: 0,
    stone: 0,
    paint: 0,
    floor: 0,
    fabric: 0,
    hardware: 0,
    miscellaneous: 0,
  }

  // Count by priority
  const by_priority: Record<MaterialPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  }

  let total_approved_cost = 0
  let total_pending_cost = 0
  let totalCost = 0
  let costCount = 0
  const categoryTotals: Record<string, number> = {}
  let pending_pm_review = 0
  let reviewDaysSum = 0
  let reviewCount = 0
  let approved_this_week = 0
  let rejected_this_month = 0

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  data.forEach(spec => {
    // Count by status
    if (spec.status in by_status) {
      by_status[spec.status as MaterialSpecStatus]++
    }

    // Count by category
    if (spec.category in by_category) {
      by_category[spec.category as MaterialCategory]++
    }

    // Count by priority
    if (spec.priority in by_priority) {
      by_priority[spec.priority as MaterialPriority]++
    }

    // Cost calculations
    if (spec.total_cost) {
      totalCost += spec.total_cost
      costCount++

      // Category costs
      if (!categoryTotals[spec.category]) {
        categoryTotals[spec.category] = 0
      }
      categoryTotals[spec.category] += spec.total_cost

      // Status-based costs
      if (spec.status === 'approved') {
        total_approved_cost += spec.total_cost
      } else if (spec.status === 'pending' || spec.status === 'revision_required') {
        total_pending_cost += spec.total_cost
      }
    }

    // PM metrics
    if (spec.status === 'pending') {
      pending_pm_review++
    }

    if (spec.reviewed_by && spec.created_at) {
      const reviewDays = getReviewDays({ created_at: spec.created_at, review_date: spec.updated_at })
      if (reviewDays > 0) {
        reviewDaysSum += reviewDays
        reviewCount++
      }
    }

    // Time-based counts
    const createdAt = new Date(spec.created_at)
    if (spec.status === 'approved' && createdAt >= weekAgo) {
      approved_this_week++
    }
    if (spec.status === 'rejected' && createdAt >= monthAgo) {
      rejected_this_month++
    }
  })

  // Find most expensive category
  const most_expensive_category = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'construction'

  return {
    total_specs,
    by_status,
    by_category,
    by_priority,
    cost_summary: {
      total_approved_cost,
      total_pending_cost,
      avg_spec_cost: costCount > 0 ? totalCost / costCount : 0,
      most_expensive_category,
    },
    pm_metrics: {
      pending_pm_review,
      avg_review_days: reviewCount > 0 ? Math.round(reviewDaysSum / reviewCount) : 0,
      approved_this_week,
      rejected_this_month,
    },
  }
}