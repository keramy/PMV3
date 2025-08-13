/**
 * Notifications API Route
 * Handles listing user notifications and marking as read
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiMiddleware } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import type { 
  NotificationListResponse, 
  NotificationFilters,
  MarkAsReadRequest,
  MarkAsReadResponse,
  Notification as AppNotification
} from '@/types/notifications'

// Validation schemas
const notificationFiltersSchema = z.object({
  type: z.string().optional().transform(val => val ? val.split(',') : []),
  unread_only: z.string().optional().transform(val => val === 'true'),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1).pipe(z.number().positive()),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20).pipe(z.number().positive().max(100))
})

const markAsReadSchema = z.object({
  notification_ids: z.array(z.string().uuid()).optional()
})

export const GET = apiMiddleware.auth(async (user, request) => {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')?.split(',') || []
    const unread_only = searchParams.get('unread_only') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // Create supabase client
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (type.length > 0) {
      query = query.in('type', type)
    }

    if (unread_only) {
      query = query.is('read_at', null)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: notifications, error, count } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return apiMiddleware.response.internalError('Failed to fetch notifications')
    }

    // Get unread count separately
    const { data: unreadCountData } = await supabase
      .rpc('get_unread_notification_count', {
        target_user_id: user.id
      })

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    const response: NotificationListResponse = {
      notifications: (notifications || []) as AppNotification[],
      unread_count: unreadCountData || 0,
      total,
      page,
      limit,
      has_next: page < totalPages,
      has_previous: page > 1
    }

    return apiMiddleware.response.success(response)
  }
)

export const PATCH = apiMiddleware.validate(
  markAsReadSchema,
  async (validatedData, user, request) => {
    const supabase = await createClient()
    const { notification_ids } = validatedData
    let markedCount = 0

    if (notification_ids && notification_ids.length > 0) {
      // Mark specific notifications as read
      const { data } = await supabase
        .rpc('mark_notifications_as_read', {
          target_user_id: user.id,
          notification_ids
        })
      markedCount = data || 0
    } else {
      // Mark all notifications as read
      const { data } = await supabase
        .rpc('mark_all_notifications_as_read', {
          target_user_id: user.id
        })
      markedCount = data || 0
    }

    const response: MarkAsReadResponse = {
      marked_count: markedCount,
      success: true
    }

    return apiMiddleware.response.success(response)
  }
)