/**
 * Formula PM V3 Shop Drawing Comments API
 * GET /api/shop-drawings/[id]/comments - Get comments for shop drawing
 * POST /api/shop-drawings/[id]/comments - Add comment to shop drawing
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CommentFormData, CommentType } from '@/types/shop-drawings'
import { SHOP_DRAWING_PERMISSIONS } from '@/types/shop-drawings'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions_bitwise, role')
      .eq('id', user.id)
      .single()

    // Check VIEW_SHOP_DRAWINGS permission (bit 11: value 2048) or admin (bit 0: value 1)
    const canViewShopDrawings = profile?.permissions_bitwise && 
      ((profile.permissions_bitwise & 2048) > 0 || (profile.permissions_bitwise & 1) > 0)
    if (!canViewShopDrawings) {
      return Response.json({ error: 'Insufficient permissions to view shop drawing comments' }, { status: 403 })
    }

    // Verify shop drawing exists
    const { data: drawing, error: drawingError } = await supabase
      .from('shop_drawings')
      .select('id, project_id')
      .eq('id', id)
      .single()

    if (drawingError) {
      if (drawingError.code === 'PGRST116') {
        return Response.json({ error: 'Shop drawing not found' }, { status: 404 })
      }
      return Response.json({ error: 'Failed to verify shop drawing' }, { status: 500 })
    }

    // Get comments with user information
    const { data: comments, error: commentsError } = await supabase
      .from('shop_drawing_comments' as any)
      .select(`
        id,
        shop_drawing_id,
        user_id,
        comment_type,
        comment,
        attachments,
        is_resolved,
        created_at,
        updated_at,
        user:user_profiles(id, first_name, last_name, job_title)
      `)
      .eq('shop_drawing_id', id)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Comments query error:', commentsError)
      return Response.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }

    return Response.json({
      success: true,
      data: comments || []
    })

  } catch (error) {
    console.error('Shop drawing comments GET API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for permissions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('permissions_bitwise, role')
      .eq('id', user.id)
      .single()

    // Check EDIT_SHOP_DRAWINGS permission (bit 13: value 8192) for commenting or admin (bit 0: value 1)
    const canComment = profile?.permissions_bitwise && 
      ((profile.permissions_bitwise & 8192) > 0 || (profile.permissions_bitwise & 1) > 0)
    if (!canComment) {
      return Response.json({ error: 'Insufficient permissions to comment on shop drawings' }, { status: 403 })
    }

    // Parse request body
    const body: CommentFormData = await request.json()

    // Validate required fields
    if (!body.comment || !body.comment_type) {
      return Response.json({ 
        error: 'Missing required fields',
        validation_errors: {
          comment: !body.comment ? ['Comment is required'] : undefined,
          comment_type: !body.comment_type ? ['Comment type is required'] : undefined
        }
      }, { status: 400 })
    }

    // Verify shop drawing exists
    const { data: drawing, error: drawingError } = await supabase
      .from('shop_drawings')
      .select('id, project_id')
      .eq('id', id)
      .single()

    if (drawingError) {
      if (drawingError.code === 'PGRST116') {
        return Response.json({ error: 'Shop drawing not found' }, { status: 404 })
      }
      return Response.json({ error: 'Failed to verify shop drawing' }, { status: 500 })
    }

    // Validate comment type permissions
    const canCommentForType = validateCommentPermissions(body.comment_type, profile?.permissions_bitwise || 0)
    if (!canCommentForType) {
      return Response.json({ 
        error: 'Insufficient permissions for this comment type',
        required_permission: getRequiredPermissionForCommentType(body.comment_type)
      }, { status: 403 })
    }

    // Create comment
    const { data: newComment, error: createError } = await supabase
      .from('shop_drawing_comments' as any)
      .insert({
        shop_drawing_id: id,
        user_id: user.id,
        comment_type: body.comment_type,
        comment: body.comment,
        attachments: [], // TODO: Handle file attachments in future enhancement
        is_resolved: false
      })
      .select(`
        id,
        shop_drawing_id,
        user_id,
        comment_type,
        comment,
        attachments,
        is_resolved,
        created_at,
        updated_at,
        user:user_profiles(id, first_name, last_name, job_title)
      `)
      .single()

    if (createError) {
      console.error('Comment creation error:', createError)
      return Response.json({ error: 'Failed to create comment' }, { status: 500 })
    }

    // Update shop drawing status if this is an approval/rejection comment
    if (body.comment_type === 'approval' || body.comment_type === 'rejection') {
      const statusUpdate = body.comment_type === 'approval' ? 'approved' : 'rejected'
      const stageUpdate = body.comment_type === 'approval' ? 'approved' : 'rejected'
      
      await supabase
        .from('shop_drawings')
        .update({
          status: statusUpdate,
          approval_stage: stageUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    }

    // Log the comment activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id: (drawing as any).project_id,
        entity_type: 'shop_drawing_comment',
        entity_id: (newComment as any).id,
        action: 'commented',
        details: {
          shop_drawing_id: id,
          comment_type: body.comment_type,
          comment_preview: body.comment.substring(0, 100) + (body.comment.length > 100 ? '...' : '')
        }
      })

    return Response.json({
      success: true,
      data: newComment as any
    }, { status: 201 })

  } catch (error) {
    console.error('Shop drawing comments POST API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to validate comment permissions using bitwise system
function validateCommentPermissions(commentType: CommentType, userPermissionsBitwise: number): boolean {
  // Admin always has permission
  if ((userPermissionsBitwise & 1) > 0) return true

  switch (commentType) {
    case 'submittal':
      // Need APPROVE_SHOP_DRAWINGS permission (bit 14: value 16384)
      return (userPermissionsBitwise & 16384) > 0
    case 'client_feedback':
    case 'approval':
    case 'rejection':
    case 'revision_request':
      // Need APPROVE_SHOP_DRAWINGS_CLIENT permission (bit 15: value 32768)
      return (userPermissionsBitwise & 32768) > 0
    case 'general':
      // Need EDIT_SHOP_DRAWINGS permission (bit 13: value 8192)
      return (userPermissionsBitwise & 8192) > 0
    default:
      return false
  }
}

// Helper function to get required permission for comment type
function getRequiredPermissionForCommentType(commentType: CommentType): string {
  switch (commentType) {
    case 'submittal':
      return 'upload_drawings'
    case 'client_feedback':
    case 'approval':
    case 'rejection':
    case 'revision_request':
      return 'client_review_drawings'
    case 'general':
      return 'view_drawings'
    default:
      return 'view_drawings'
  }
}