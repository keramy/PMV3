/**
 * Material Specs API Route
 * Simple PM approval workflow for material specifications
 * Refactored to use centralized middleware and database patterns
 */

import { NextRequest } from 'next/server'
import { apiMiddleware } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
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
import { z } from 'zod'

// Query validation schema
const materialSpecQuerySchema = z.object({
  project_id: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  category: z.string().optional(),
  status: z.string().transform(s => s.split(',')).optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  sort_field: z.string().default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc')
})

// ============================================================================
// GET - List Material Specs with Filtering & Statistics
// ============================================================================

export const GET = apiMiddleware.permissions(
  MATERIAL_SPEC_PERMISSIONS.VIEW,
  async (user, request) => {
    const searchParams = new URL(request.url).searchParams
    
    // Convert searchParams to object for validation
    const queryObject: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      queryObject[key] = value
    })
    
    const params = materialSpecQuerySchema.parse(queryObject)
    const supabase = await createClient()
    
    // Require project_id
    if (!params.project_id) {
      return Response.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    // Build direct Supabase query with relationships
    const offset = (params.page - 1) * params.limit
    
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
      `, { count: 'exact' })
      
    // Apply project filter
    if (params.project_id && params.project_id !== 'all') {
      query = query.eq('project_id', params.project_id)
    }

    // Apply filters
    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status)
    }

    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category)
    }

    if (params.priority && params.priority !== 'all') {
      query = query.eq('priority', params.priority as 'low' | 'medium' | 'high' | 'critical')
    }

    if (params.search) {
      query = query.or(`
        name.ilike.%${params.search}%,
        manufacturer.ilike.%${params.search}%,
        model.ilike.%${params.search}%,
        spec_number.ilike.%${params.search}%,
        specification.ilike.%${params.search}%
      `)
    }

    // Apply ordering and pagination
    query = query
      .order(params.sort_field, { ascending: params.sort_direction === 'asc' })
      .range(offset, offset + params.limit - 1)

    const { data: specs, error, count } = await query

    if (error) {
      console.error('Material specs query error:', error)
      return Response.json({ error: 'Failed to fetch material specs' }, { status: 500 })
    }

    // Get statistics for the project
    let statsQuery = supabase
      .from('material_specs')
      .select('status, category, priority, total_cost, created_at, reviewed_by, image_url')

    if (params.project_id && params.project_id !== 'all') {
      statsQuery = statsQuery.eq('project_id', params.project_id)
    }
    
    const { data: statsData, error: statsError } = await statsQuery

    if (statsError) {
      console.error('Statistics query error:', statsError)
      // Continue without statistics rather than failing the whole request
    }

    const statistics = calculateStatistics(statsData || [])

    return Response.json({
      success: true,
      data: {
        specs: (specs || []) as MaterialSpec[],
        statistics,
        total_count: count,
        filters_applied: {
          status: params.status as any,
          category: params.category as any,
          priority: params.priority as any,
          search_term: params.search,
        }
      },
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / params.limit)
      }
    })
  }
)

// Form validation schema
const materialSpecFormSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  priority: z.string().default('medium'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  spec_number: z.string().optional(),
  specification: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().optional(),
  unit_cost: z.number().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
  image_url: z.string().optional(),
}).transform(data => {
  // Calculate total cost if not provided
  if (data.quantity && data.unit_cost) {
    (data as any).total_cost = data.quantity * data.unit_cost
  }
  return data
})

// ============================================================================
// POST - Create New Material Spec
// ============================================================================

export const POST = apiMiddleware.validate(
  materialSpecFormSchema,
  async (validatedData, user, request) => {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.permissions.includes('create_materials')) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Create material spec
    const { data: newSpec, error } = await supabase
      .from('material_specs')
      .insert({
        project_id: validatedData.project_id,
        name: validatedData.name,
        category: validatedData.category,
        priority: validatedData.priority,
        manufacturer: validatedData.manufacturer,
        model: validatedData.model,
        spec_number: validatedData.spec_number,
        specification: validatedData.specification,
        unit: validatedData.unit,
        quantity: validatedData.quantity,
        unit_cost: validatedData.unit_cost,
        total_cost: (validatedData as any).total_cost,
        supplier: validatedData.supplier,
        notes: validatedData.notes,
        image_url: validatedData.image_url,
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
      return Response.json(
        { error: 'Failed to create material spec' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      data: newSpec
    }, { status: 201 })
  }
)

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