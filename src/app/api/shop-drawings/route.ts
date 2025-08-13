/**
 * Formula PM V3 Shop Drawings API
 * GET /api/shop-drawings - List shop drawings with filtering
 * POST /api/shop-drawings - Create new shop drawing
 * Enhanced with new validation system and structured logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiMiddleware } from '@/lib/api/middleware'
import { createApiDatabase, ApiFilters } from '@/lib/api/database'
import { createClient } from '@/lib/supabase/server'
import { withValidation, createSuccessResponse } from '@/lib/validation/middleware'
import { createShopDrawingSchema, updateShopDrawingSchema, paginationSchema, filterSchema } from '@/lib/validation/schemas'
import { createLogger } from '@/lib/logger'
import type { ShopDrawingStatistics } from '@/types/shop-drawings'
import { SHOP_DRAWING_PERMISSIONS } from '@/types/shop-drawings'
import { z } from 'zod'

const logger = createLogger('shop-drawings-api')

// Query validation schema
const shopDrawingQuerySchema = z.object({
  project_id: z.string(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.string().optional(),
  status: z.string().transform(s => s.split(',')).optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  submitted_by: z.string().optional(),
  current_turn: z.string().optional(),
  client_contact: z.string().optional(),
  sort_field: z.string().default('created_at'),
  sort_direction: z.enum(['asc', 'desc']).default('desc')
})

export const GET = apiMiddleware.permissions(
  SHOP_DRAWING_PERMISSIONS.VIEW,
  async (user, request) => {
    const searchParams = new URL(request.url).searchParams
    
    // Convert searchParams to object for validation
    const queryObject: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      queryObject[key] = value
    })
    
    const params = shopDrawingQuerySchema.parse(queryObject)
    const db = createApiDatabase(user)

    // Build filters
    const filters = [
      ApiFilters.inProject(params.project_id),
      ApiFilters.activeItems()
    ]

    if (params.category && params.category !== 'all') {
      filters.push((query: any) => query.eq('category', params.category))
    }

    if (params.status && params.status.length > 0) {
      filters.push(ApiFilters.byStatuses(params.status))
    }

    if (params.priority && params.priority !== 'all') {
      filters.push((query: any) => query.eq('priority', params.priority))
    }

    if (params.submitted_by) {
      filters.push((query: any) => query.eq('submitted_by', params.submitted_by))
    }

    if (params.client_contact) {
      filters.push((query: any) => query.eq('client_contact', params.client_contact))
    }

    if (params.search) {
      filters.push((query: any) => 
        query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,drawing_number.ilike.%${params.search}%`)
      )
    }

    const offset = (params.page - 1) * params.limit

    // Query shop drawings with relationships
    const result = await db.findMany('shop_drawings', {
      select: `
        *,
        project:projects(id, name),
        submitted_by_user:user_profiles!submitted_by(id, first_name, last_name, job_title),
        scope_item:scope_items(id, title, category),
        submitted_to_client_by_user:user_profiles!submitted_to_client_by(id, first_name, last_name),
        client_contact_user:user_profiles!client_contact(id, first_name, last_name, company)
      `,
      filters,
      orderBy: { column: params.sort_field as any, ascending: params.sort_direction === 'asc' },
      limit: params.limit,
      offset
    })

    // Get statistics for the project
    const statsResult = await db.findMany('shop_drawings', {
      select: 'status, category, priority, created_at, due_date, submitted_to_client_date, client_response_date',
      filters: [ApiFilters.inProject(params.project_id)]
    })

    const statistics = calculateShopDrawingStatistics(statsResult.data || [])

    return Response.json({
      success: true,
      data: {
        drawings: result.data,
        statistics,
        total_count: result.count,
        filters_applied: {
          category: params.category === 'all' ? undefined : params.category,
          status: params.status,
          priority: params.priority === 'all' ? undefined : params.priority,
          current_turn: params.current_turn as any,
          search_term: params.search,
          submitted_by: params.submitted_by,
          client_contact: params.client_contact
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

// Shop drawing form validation schema
const shopDrawingFormSchema = z.object({
  project_id: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  trade: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  due_date: z.string().optional(),
  scope_item_id: z.string().optional(),
  drawing_number: z.string().optional(),
  specification_section: z.string().optional(),
  notes: z.string().optional()
})

export const POST = apiMiddleware.validate(
  shopDrawingFormSchema,
  async (validatedData, user, request) => {
    // Check permissions
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile?.permissions?.some((p: string) => p === SHOP_DRAWING_PERMISSIONS.CREATE)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
      const db = createApiDatabase(user)

      // Create shop drawing
      const result = await db.insert('shop_drawings', {
        project_id: validatedData.project_id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        trade: validatedData.trade,
        priority: validatedData.priority,
        due_date: validatedData.due_date,
        scope_item_id: validatedData.scope_item_id,
        drawing_number: validatedData.drawing_number,
        specification_section: validatedData.specification_section,
        notes: validatedData.notes,
        submitted_by: user.id,
        status: 'pending_submittal'
      }, {
        select: `
          *,
          project:projects(id, name),
          submitted_by_user:user_profiles!submitted_by(id, first_name, last_name, job_title),
          scope_item:scope_items(id, title, category)
        `
      })

      // Log the creation activity
      if (result.data) {
        await db.insert('activity_logs', {
          user_id: user.id,
          project_id: validatedData.project_id,
          entity_type: 'shop_drawing',
          entity_id: result.data.id,
          action: 'created',
          details: {
            title: result.data.title,
            category: result.data.category,
            drawing_number: result.data.drawing_number
          }
        })
      }

      return Response.json({
        success: true,
        data: result.data
      }, { status: 201 })
  }
)

// Helper function to calculate shop drawing statistics
function calculateShopDrawingStatistics(drawings: any[]): ShopDrawingStatistics {
  const statistics: ShopDrawingStatistics = {
    total_drawings: drawings.length,
    by_status: {
      pending_submittal: 0,
      submitted_to_client: 0,
      revision_requested: 0,
      approved: 0,
      rejected: 0
    },
    by_category: {
      construction: 0,
      millwork: 0,
      electrical: 0,
      mechanical: 0
    },
    by_priority: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    by_turn: {
      ours: 0,
      client: 0,
      complete: 0
    },
    metrics: {
      avg_days_with_client: 0,
      avg_days_to_approval: 0,
      overdue: 0,
      submitted_this_week: 0
    }
  }

  let totalDaysWithClient = 0
  let totalDaysToApproval = 0
  let clientSubmissionsCount = 0
  let approvedCount = 0
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  drawings.forEach(drawing => {
    // Status statistics
    if (drawing.status && statistics.by_status[drawing.status as keyof typeof statistics.by_status] !== undefined) {
      (statistics.by_status[drawing.status as keyof typeof statistics.by_status] as number)++
    }

    // Category statistics
    if (drawing.category && statistics.by_category[drawing.category as keyof typeof statistics.by_category] !== undefined) {
      (statistics.by_category[drawing.category as keyof typeof statistics.by_category] as number)++
    }

    // Priority statistics
    if (drawing.priority && statistics.by_priority[drawing.priority as keyof typeof statistics.by_priority] !== undefined) {
      (statistics.by_priority[drawing.priority as keyof typeof statistics.by_priority] as number)++
    }

    // Turn-based statistics (whose court is the ball in)
    const status = drawing.status
    if (status === 'pending_submittal' || status === 'revision_requested' || status === 'rejected') {
      statistics.by_turn.ours++
    } else if (status === 'submitted_to_client') {
      statistics.by_turn.client++
    } else if (status === 'approved') {
      statistics.by_turn.complete++
    }

    // Check if overdue
    if (drawing.due_date && new Date(drawing.due_date) < now && drawing.status !== 'approved') {
      statistics.metrics.overdue++
    }

    // Count submissions this week
    if (drawing.submitted_to_client_date && new Date(drawing.submitted_to_client_date) >= oneWeekAgo) {
      statistics.metrics.submitted_this_week++
    }

    // Calculate days with client (for submitted drawings)
    if (drawing.submitted_to_client_date) {
      const submittedDate = new Date(drawing.submitted_to_client_date)
      const endDate = drawing.client_response_date ? new Date(drawing.client_response_date) : now
      const daysWithClient = Math.ceil((endDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysWithClient > 0) {
        totalDaysWithClient += daysWithClient
        clientSubmissionsCount++
      }
    }

    // Calculate total approval time (from creation to approval)
    if (drawing.status === 'approved' && drawing.client_response_date) {
      const createdDate = new Date(drawing.created_at)
      const approvedDate = new Date(drawing.client_response_date)
      const approvalDays = Math.ceil((approvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      if (approvalDays > 0) {
        totalDaysToApproval += approvalDays
        approvedCount++
      }
    }
  })

  // Calculate averages
  if (clientSubmissionsCount > 0) {
    statistics.metrics.avg_days_with_client = Math.round(totalDaysWithClient / clientSubmissionsCount)
  }
  
  if (approvedCount > 0) {
    statistics.metrics.avg_days_to_approval = Math.round(totalDaysToApproval / approvedCount)
  }

  return statistics
}

