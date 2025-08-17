/**
 * Formula PM V3 Scope Items API
 * GET /api/scope - List scope items with filtering
 * POST /api/scope - Create new scope item
 * Refactored to use centralized middleware and database patterns
 */

import { NextRequest } from 'next/server'
import { apiMiddleware } from '@/lib/api/middleware'
import { createApiDatabase, ApiFilters } from '@/lib/api/database'
import { createClient } from '@/lib/supabase/server'
import type { ScopeListResponse } from '@/types/scope'
import { SCOPE_PERMISSIONS } from '@/types/scope'
import { hasPermission } from '@/lib/permissions'
import { z } from 'zod'

// Query validation schema
const scopeQuerySchema = z.object({
  project_id: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.string().optional(),
  status: z.string().transform(s => s.split(',')).optional(),
  search: z.string().optional(),
  assigned_to: z.string().transform(s => s.split(',')).optional(),
  sort_field: z.string().default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc')
})

export const GET = apiMiddleware.permissions(
  SCOPE_PERMISSIONS.VIEW,
  async (user, request) => {
    const searchParams = new URL(request.url).searchParams
    
    // Convert searchParams to object for validation
    const queryObject: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      queryObject[key] = value
    })
    
    const params = scopeQuerySchema.parse(queryObject)
    const db = createApiDatabase(user)

    // Build filters
    const filters = []
    
    // Only filter by project if not 'all'
    if (params.project_id && params.project_id !== 'all') {
      filters.push(ApiFilters.inProject(params.project_id))
    }

    if (params.category && params.category !== 'all') {
      filters.push((query: any) => query.eq('category', params.category))
    }

    if (params.status && params.status.length > 0) {
      filters.push(ApiFilters.byStatuses(params.status))
    }

    if (params.assigned_to && params.assigned_to.length > 0) {
      filters.push((query: any) => query.in('assigned_to', params.assigned_to))
    }

    if (params.search) {
      filters.push((query: any) => 
        query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      )
    }

    const offset = (params.page - 1) * params.limit

    // Query scope items with relationships including subcontractor
    const result = await db.findMany('scope_items', {
      select: `
        *,
        assigned_user:assigned_to(id, first_name, last_name, job_title),
        created_by_user:created_by(first_name, last_name),
        subcontractor:subcontractor_id(
          id,
          name,
          trade,
          contact_person,
          phone,
          email
        )
      `,
      filters,
      orderBy: { column: params.sort_field as any, ascending: params.sort_direction === 'asc' },
      limit: params.limit,
      offset
    })

    // Get statistics for the project
    const statsResult = await db.findMany('scope_items', {
      select: 'category, status, total_cost',
      filters: [ApiFilters.inProject(params.project_id)]
    })

    const statistics = calculateScopeStatistics(statsResult.data || [])

    return Response.json({
      success: true,
      data: {
        items: result.data,
        statistics,
        total_count: result.count,
        filters_applied: {
          category: params.category === 'all' ? undefined : params.category as any,
          status: params.status as any,
          search_term: params.search,
          assigned_to: params.assigned_to
        }
      },
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.count || 0,
        total_pages: Math.ceil((result.count || 0) / params.limit)
      }
    })
  }
)

// Scope item form validation schema
const scopeItemFormSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  specification: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  unit_cost: z.number().optional(),
  total_cost: z.number().optional(),
  initial_cost: z.number().optional(),
  actual_cost: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.string().default('not_started'),
  assigned_to: z.string().optional(),
  subcontractor_id: z.string().optional(),
  notes: z.string().optional()
}).transform(data => {
  // Calculate total cost if not provided
  if (data.quantity && data.unit_cost && !data.total_cost) {
    data.total_cost = data.quantity * data.unit_cost
  }
  return data
})

export const POST = apiMiddleware.validate(
  scopeItemFormSchema,
  async (validatedData, user, request) => {
    // Check permissions
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile || !hasPermission(profile.permissions, SCOPE_PERMISSIONS.CREATE)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
      const db = createApiDatabase(user)

      // Create scope item with cost tracking and subcontractor
      const result = await db.insert('scope_items', {
        project_id: validatedData.project_id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        specification: validatedData.specification,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        unit_cost: validatedData.unit_cost,
        total_cost: validatedData.total_cost,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        priority: validatedData.priority,
        status: validatedData.status,
        assigned_to: validatedData.assigned_to,
        notes: validatedData.notes,
        created_by: user.id,
      })

      return Response.json({
        success: true,
        data: result.data
      }, { status: 201 })
  }
)

// Helper function to calculate scope statistics
function calculateScopeStatistics(items: any[]) {
  const statistics = {
    total_items: items.length,
    by_category: {} as any,
    by_status: {} as any,
    timeline: {
      on_schedule: 0,
      behind_schedule: 0,
      overdue: 0,
      not_scheduled: 0
    },
    financial: {
      total_budget: 0,
      average_item_cost: 0,
      highest_cost_item: 0,
      items_without_cost: 0
    }
  }

  // Initialize category stats
  const categories = ['construction', 'millwork', 'electrical', 'mechanical', 'plumbing', 'hvac']
  categories.forEach(category => {
    statistics.by_category[category] = {
      total: 0,
      completed: 0,
      in_progress: 0,
      not_started: 0,
      blocked: 0,
      total_cost: 0
    }
  })

  // Initialize status stats
  const statuses = ['not_started', 'planning', 'materials_ordered', 'in_progress', 'quality_check', 'client_review', 'completed', 'blocked', 'on_hold', 'cancelled']
  statuses.forEach(status => {
    statistics.by_status[status] = 0
  })

  // Calculate statistics
  items.forEach(item => {
    // Category stats
    if (item.category && statistics.by_category[item.category]) {
      statistics.by_category[item.category].total++
      statistics.by_category[item.category].total_cost += item.total_cost || 0
      
      if (item.status === 'completed') statistics.by_category[item.category].completed++
      else if (item.status === 'in_progress') statistics.by_category[item.category].in_progress++
      else if (item.status === 'not_started') statistics.by_category[item.category].not_started++
      else if (item.status === 'blocked') statistics.by_category[item.category].blocked++
    }

    // Status stats
    if (item.status && statistics.by_status[item.status] !== undefined) {
      statistics.by_status[item.status]++
    }

    // Financial stats
    if (item.total_cost) {
      statistics.financial.total_budget += item.total_cost
      statistics.financial.highest_cost_item = Math.max(statistics.financial.highest_cost_item, item.total_cost)
    } else {
      statistics.financial.items_without_cost++
    }

    // Timeline stats (simplified)
    if (!item.start_date || !item.end_date) {
      statistics.timeline.not_scheduled++
    } else {
      const now = new Date()
      const endDate = new Date(item.end_date)
      if (endDate < now && item.status !== 'completed') {
        statistics.timeline.overdue++
      } else {
        statistics.timeline.on_schedule++
      }
    }
  })

  // Calculate completion percentages for categories
  Object.keys(statistics.by_category).forEach(category => {
    const catStats = statistics.by_category[category]
    if (catStats.total > 0) {
      // Completion percentage calculated on frontend from completed/total
    }
  })

  // Calculate average item cost
  const itemsWithCost = items.filter(item => item.total_cost > 0).length
  if (itemsWithCost > 0) {
    statistics.financial.average_item_cost = statistics.financial.total_budget / itemsWithCost
  }

  return statistics
}