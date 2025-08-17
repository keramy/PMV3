/**
 * Formula PM V3 Individual Scope Item API
 * GET /api/scope/[id] - Get single scope item
 * PUT /api/scope/[id] - Update scope item
 * DELETE /api/scope/[id] - Delete scope item
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ScopeItemUpdateData } from '@/types/scope'
import { SCOPE_PERMISSIONS } from '@/types/scope'
import { hasPermission } from '@/lib/permissions'

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

    if (!profile || !hasPermission(profile.permissions, SCOPE_PERMISSIONS.VIEW)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get scope item with relationships including subcontractor
    const { data: item, error: queryError } = await supabase
      .from('scope_items')
      .select(`
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
      `)
      .eq('id', id)
      .single()

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return Response.json({ error: 'Scope item not found' }, { status: 404 })
      }
      console.error('Scope item query error:', queryError)
      return Response.json({ error: 'Failed to fetch scope item' }, { status: 500 })
    }

    return Response.json({
      success: true,
      data: item
    })

  } catch (error) {
    console.error('Scope item GET API error:', error)
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

    if (!profile || !hasPermission(profile.permissions, SCOPE_PERMISSIONS.EDIT)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const updates: ScopeItemUpdateData = await request.json()

    // Validate that we're not trying to update computed fields
    const allowedFields = [
      'title', 'description', 'category', 'specification', 'quantity', 'unit', 
      'unit_cost', 'total_cost', 'initial_cost', 'actual_cost', 'start_date', 
      'end_date', 'priority', 'status', 'assigned_to', 'subcontractor_id', 
      'notes'
    ]

    const updateData: any = {}
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = (updates as any)[key]
      }
    })

    // Recalculate total cost if quantity or unit_cost changed
    if (updateData.quantity !== undefined || updateData.unit_cost !== undefined) {
      // Get current values for calculation
      const { data: currentItem } = await supabase
        .from('scope_items')
        .select('quantity, unit_cost')
        .eq('id', id)
        .single()

      if (currentItem) {
        const quantity = updateData.quantity ?? currentItem.quantity ?? 0
        const unitCost = updateData.unit_cost ?? currentItem.unit_cost ?? 0
        updateData.total_cost = quantity * unitCost
      }
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    // Update scope item
    const { data: updatedItem, error: updateError } = await supabase
      .from('scope_items')
      .update(updateData)
      .eq('id', id)
      .select(`
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
      `)
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return Response.json({ error: 'Scope item not found' }, { status: 404 })
      }
      console.error('Scope item update error:', updateError)
      return Response.json({ error: 'Failed to update scope item' }, { status: 500 })
    }

    return Response.json({
      success: true,
      data: updatedItem,
      updated_fields: Object.keys(updateData)
    })

  } catch (error) {
    console.error('Scope item PUT API error:', error)
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

    if (!profile || !hasPermission(profile.permissions, SCOPE_PERMISSIONS.DELETE)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if scope item exists and get project_id for activity logging
    const { data: existingItem, error: checkError } = await supabase
      .from('scope_items')
      .select('id, title, project_id')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return Response.json({ error: 'Scope item not found' }, { status: 404 })
      }
      console.error('Scope item check error:', checkError)
      return Response.json({ error: 'Failed to check scope item' }, { status: 500 })
    }

    // Delete scope item
    const { error: deleteError } = await supabase
      .from('scope_items')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Scope item deletion error:', deleteError)
      return Response.json({ error: 'Failed to delete scope item' }, { status: 500 })
    }

    // Log the deletion activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id: existingItem.project_id,
        entity_type: 'scope_item',
        entity_id: id,
        action: 'deleted',
        details: {
          title: existingItem.title
        }
      })

    return Response.json({
      success: true,
      message: 'Scope item deleted successfully'
    })

  } catch (error) {
    console.error('Scope item DELETE API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}