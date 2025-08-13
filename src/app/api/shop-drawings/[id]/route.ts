/**
 * Formula PM V3 Individual Shop Drawing API
 * GET /api/shop-drawings/[id] - Get single shop drawing
 * PUT /api/shop-drawings/[id] - Update shop drawing
 * DELETE /api/shop-drawings/[id] - Delete shop drawing
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ShopDrawingUpdateData } from '@/types/shop-drawings'
import { SHOP_DRAWING_PERMISSIONS } from '@/types/shop-drawings'
import { hasPermission, hasAnyPermission } from '@/lib/permissions'

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
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile || !hasAnyPermission(profile.permissions, SHOP_DRAWING_PERMISSIONS.VIEW)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get shop drawing with full relationships
    const { data: drawing, error: queryError } = await supabase
      .from('shop_drawings')
      .select(`
        *,
        project:projects(id, name),
        submitted_by_user:user_profiles!submitted_by(id, first_name, last_name, job_title),
        scope_item:scope_items(id, title, category),
        internal_reviewer:user_profiles!internal_approved_by(id, first_name, last_name),
        client_reviewer:user_profiles!client_approved_by(id, first_name, last_name),
        comments:shop_drawing_comments(
          id,
          comment_type,
          comment,
          is_resolved,
          created_at,
          user:user_profiles(id, first_name, last_name, job_title)
        ),
        revisions:shop_drawing_revisions(
          id,
          revision_number,
          file_name,
          file_size,
          revision_notes,
          is_current,
          created_at,
          uploaded_by_user:user_profiles!uploaded_by(first_name, last_name)
        )
      `)
      .eq('id', id)
      .single()

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return Response.json({ error: 'Shop drawing not found' }, { status: 404 })
      }
      console.error('Shop drawing query error:', queryError)
      return Response.json({ error: 'Failed to fetch shop drawing' }, { status: 500 })
    }

    // Add computed fields
    const enhancedDrawing = {
      ...(drawing as any),
      is_overdue: (drawing as any).due_date && new Date((drawing as any).due_date) < new Date() && (drawing as any).status !== 'approved',
      days_until_due: (drawing as any).due_date 
        ? Math.ceil((new Date((drawing as any).due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
      current_revision: (drawing as any).revisions?.find((r: any) => r.is_current)?.revision_number || 'A',
      total_revisions: (drawing as any).revisions?.length || 1
    }

    return Response.json({
      success: true,
      data: enhancedDrawing
    })

  } catch (error) {
    console.error('Shop drawing GET API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return Response.json({ error: 'User profile not found' }, { status: 403 })
    }

    // Parse request body
    const updates: ShopDrawingUpdateData = await request.json()

    // Check permissions based on update type
    let hasUpdatePermission = false

    if (updates.status) {
      // Status changes need appropriate permissions
      if (updates.status === 'submitted_to_client' || updates.submitted_to_client_date) {
        hasUpdatePermission = hasAnyPermission(profile.permissions, SHOP_DRAWING_PERMISSIONS.SUBMIT_TO_CLIENT)
      } else if (updates.status === 'approved' || updates.status === 'rejected' || updates.status === 'revision_requested') {
        hasUpdatePermission = hasAnyPermission(profile.permissions, SHOP_DRAWING_PERMISSIONS.CLIENT_RESPONSE)
      } else {
        // Basic status updates (pending_submittal)
        hasUpdatePermission = hasAnyPermission(profile.permissions, SHOP_DRAWING_PERMISSIONS.EDIT)
      }
    }

    if (!hasUpdatePermission) {
      // Basic edit permission for other updates
      hasUpdatePermission = hasAnyPermission(profile.permissions, SHOP_DRAWING_PERMISSIONS.EDIT)
    }

    if (!hasUpdatePermission) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get current drawing for validation
    const { data: currentDrawing, error: currentError } = await supabase
      .from('shop_drawings')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError) {
      if (currentError.code === 'PGRST116') {
        return Response.json({ error: 'Shop drawing not found' }, { status: 404 })
      }
      return Response.json({ error: 'Failed to fetch current drawing' }, { status: 500 })
    }

    // Validate allowed fields for update
    const allowedFields = [
      'title', 'description', 'category', 'trade', 'priority', 'due_date',
      'scope_item_id', 'drawing_number', 'specification_section', 'notes',
      'status', 'approval_stage', 'rejection_reason'
    ]

    const updateData: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = (updates as any)[key]
      }
    })

    // Handle approval stage transitions
    if (updateData.approval_stage || updateData.status) {
      const now = new Date().toISOString()
      
      // Set approval timestamps and users
      if (updateData.approval_stage === 'approved' || updateData.status === 'approved') {
        if ((currentDrawing as any).approval_stage === 'internal_review') {
          updateData.internal_approved_by = user.id
          updateData.internal_approved_at = now
        }
        if ((currentDrawing as any).approval_stage === 'client_review' || updateData.approval_stage === 'approved') {
          updateData.client_approved_by = user.id
          updateData.client_approved_at = now
        }
      }
      
      // Reset approval timestamps if moving backwards
      if (updateData.approval_stage && 
          ['submittal', 'internal_review'].includes(updateData.approval_stage) &&
          (currentDrawing as any).approval_stage === 'client_review') {
        updateData.client_approved_by = null
        updateData.client_approved_at = null
      }
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    // Update shop drawing
    const { data: updatedDrawing, error: updateError } = await supabase
      .from('shop_drawings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name),
        submitted_by_user:user_profiles!submitted_by(id, first_name, last_name, job_title),
        scope_item:scope_items(id, title, category),
        internal_reviewer:user_profiles!internal_approved_by(id, first_name, last_name),
        client_reviewer:user_profiles!client_approved_by(id, first_name, last_name)
      `)
      .single()

    if (updateError) {
      console.error('Shop drawing update error:', updateError)
      return Response.json({ error: 'Failed to update shop drawing' }, { status: 500 })
    }

    // Log the update activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id: (updatedDrawing as any).project_id,
        entity_type: 'shop_drawing',
        entity_id: id,
        action: updates.status ? 'status_changed' : 'updated',
        details: {
          title: (updatedDrawing as any).title,
          old_status: (currentDrawing as any).status,
          new_status: (updatedDrawing as any).status,
          updated_fields: Object.keys(updateData)
        }
      })

    return Response.json({
      success: true,
      data: updatedDrawing,
      updated_fields: Object.keys(updateData)
    })

  } catch (error) {
    console.error('Shop drawing PUT API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!profile || !hasAnyPermission(profile.permissions, SHOP_DRAWING_PERMISSIONS.DELETE)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if drawing exists and get info for activity logging
    const { data: existingDrawing, error: checkError } = await supabase
      .from('shop_drawings')
      .select('id, title, project_id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return Response.json({ error: 'Shop drawing not found' }, { status: 404 })
      }
      console.error('Shop drawing check error:', checkError)
      return Response.json({ error: 'Failed to check drawing' }, { status: 500 })
    }

    // Delete shop drawing (cascades to comments and revisions)
    const { error: deleteError } = await supabase
      .from('shop_drawings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Shop drawing deletion error:', deleteError)
      return Response.json({ error: 'Failed to delete shop drawing' }, { status: 500 })
    }

    // Log the deletion activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id: existingDrawing.project_id,
        entity_type: 'shop_drawing',
        entity_id: id,
        action: 'deleted',
        details: {
          title: existingDrawing.title
        }
      })

    return Response.json({
      success: true,
      message: 'Shop drawing deleted successfully'
    })

  } catch (error) {
    console.error('Shop drawing DELETE API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}