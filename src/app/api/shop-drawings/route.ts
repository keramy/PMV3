/**
 * Formula PM V3 Shop Drawings API
 * GET /api/shop-drawings - List shop drawings with filtering
 * POST /api/shop-drawings - Create new shop drawing
 * Enhanced with new validation system and structured logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { apiMiddleware } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { createShopDrawingSchema, updateShopDrawingSchema, paginationSchema, filterSchema } from '@/lib/validation/schemas'
import type { ShopDrawingStatistics } from '@/types/shop-drawings'
import { SHOP_DRAWING_PERMISSIONS } from '@/types/shop-drawings'
import { hasPermission } from '@/lib/permissions'
import { z } from 'zod'

// Query validation schema
const shopDrawingQuerySchema = z.object({
  project_id: z.string().optional(),
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
    const supabase = await createClient()

    const offset = (params.page - 1) * params.limit

    // Build direct Supabase query
    let drawingsQuery = supabase
      .from('shop_drawings')
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name, job_title),
        created_by_user:created_by(first_name, last_name)
      `, { count: 'exact' })
      .is('deleted_at', null) // Only active items
    
    // Apply filters directly
    if (params.project_id && params.project_id !== 'all') {
      drawingsQuery = drawingsQuery.eq('project_id', params.project_id)
    }

    if (params.category && params.category !== 'all') {
      const validCategories = ['construction', 'millwork', 'electrical', 'mechanical', 'plumbing', 'hvac']
      if (validCategories.includes(params.category)) {
        drawingsQuery = drawingsQuery.eq('category', params.category as 'construction' | 'millwork' | 'electrical' | 'mechanical' | 'plumbing' | 'hvac')
      }
    }

    if (params.status && params.status.length > 0) {
      drawingsQuery = drawingsQuery.in('status', params.status)
    }

    if (params.priority && params.priority !== 'all') {
      const validPriorities = ['low', 'medium', 'high', 'critical']
      if (validPriorities.includes(params.priority)) {
        drawingsQuery = drawingsQuery.eq('priority', params.priority as 'low' | 'medium' | 'high' | 'critical')
      }
    }

    if (params.submitted_by) {
      drawingsQuery = drawingsQuery.eq('submitted_by', params.submitted_by)
    }

    if (params.client_contact) {
      drawingsQuery = drawingsQuery.eq('client_contact', params.client_contact)
    }

    if (params.search) {
      drawingsQuery = drawingsQuery.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,drawing_number.ilike.%${params.search}%`)
    }

    // Apply ordering and pagination
    drawingsQuery = drawingsQuery
      .order(params.sort_field || 'created_at', { ascending: params.sort_direction === 'asc' })
      .range(offset, offset + params.limit - 1)

    const { data: shopDrawings, error, count } = await drawingsQuery

    if (error) {
      console.error('Shop drawings query error:', error)
      return NextResponse.json({ error: 'Failed to fetch shop drawings' }, { status: 500 })
    }

    // Get statistics for the project using direct Supabase
    let statsQuery = supabase
      .from('shop_drawings')
      .select('status, category, priority, created_at, due_date, submitted_to_client_date, client_response_date')
      .is('deleted_at', null) // Only active items
    
    if (params.project_id && params.project_id !== 'all') {
      statsQuery = statsQuery.eq('project_id', params.project_id)
    }
    
    const { data: statsData, error: statsError } = await statsQuery
    
    if (statsError) {
      console.error('Statistics query error:', statsError)
      // Continue without statistics rather than failing the whole request
    }

    const statistics = calculateShopDrawingStatistics(statsData || [])

    return Response.json({
      success: true,
      data: {
        drawings: shopDrawings,
        statistics,
        total_count: count,
        filters_applied: {
          category: params.category === 'all' ? undefined : params.category,
          status: params.status,
          priority: params.priority === 'all' ? undefined : params.priority,
          current_turn: params.current_turn,
          search_term: params.search,
          submitted_by: params.submitted_by,
          client_contact: params.client_contact
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
      .select('permissions_bitwise, role')
      .eq('id', user.id)
      .single()

    // Check CREATE_SHOP_DRAWINGS permission (bit 12: value 4096) or admin (bit 0: value 1)
    const canCreateShopDrawings = profile?.permissions_bitwise && 
      ((profile.permissions_bitwise & 4096) > 0 || (profile.permissions_bitwise & 1) > 0)
    if (!canCreateShopDrawings) {
      return Response.json({ error: 'Insufficient permissions to create shop drawings' }, { status: 403 })
    }

    // Create shop drawing using direct Supabase
    const { data: newShopDrawing, error } = await supabase
      .from('shop_drawings')
      .insert({
        project_id: validatedData.project_id,
        drawing_number: validatedData.drawing_number,
        title: validatedData.title,
        description: validatedData.description,
        due_date: validatedData.due_date,
        submitted_by: user.id,
        status: 'pending_submittal'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create shop drawing:', error)
      return Response.json({ error: 'Failed to create shop drawing' }, { status: 500 })
    }

    // Log the creation activity using direct Supabase
    if (newShopDrawing) {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          project_id: validatedData.project_id,
          entity_type: 'shop_drawing',
          entity_id: newShopDrawing.id,
          action: 'created',
          details: {
            title: newShopDrawing.title,
            drawing_number: newShopDrawing.drawing_number
          }
        })
    }

    return Response.json({
      success: true,
      data: newShopDrawing
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

