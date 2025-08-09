/**
 * Individual Material Spec API Route
 * Handle individual material spec operations and PM approval workflow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/database/queries'
import type { 
  MaterialSpec,
  MaterialSpecUpdateData,
  MaterialSpecReviewData,
  MaterialSpecStatus
} from '@/types/material-specs'

// ============================================================================
// GET - Get Single Material Spec
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const { data: spec, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) {
      console.error('Get material spec error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Material spec not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch material spec' },
        { status: 500 }
      )
    }

    return NextResponse.json(spec)

  } catch (error) {
    console.error('Material spec GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Material Spec
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const user = await getCurrentUserProfile()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const updateData: MaterialSpecUpdateData = await request.json()

    // Get existing spec to check permissions
    const { data: existingSpec, error: fetchError } = await supabase
      .from('material_specs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingSpec) {
      return NextResponse.json(
        { error: 'Material spec not found' },
        { status: 404 }
      )
    }

    // Check permissions based on operation type
    const isStatusUpdate = 'status' in updateData
    const isOwner = existingSpec.created_by === user.id

    if (isStatusUpdate) {
      // Only PMs can change status (approve/reject/request revision)
      if (!user.permissions.includes('approve_material_specs')) {
        return NextResponse.json(
          { error: 'Insufficient permissions for approval operations' },
          { status: 403 }
        )
      }
    } else {
      // Regular updates require either ownership or creation permissions
      if (!isOwner && !user.permissions.includes('create_material_specs')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to edit material spec' },
          { status: 403 }
        )
      }
    }

    // Calculate total cost if quantity or unit_cost changed
    let total_cost = existingSpec.total_cost
    if ('quantity' in updateData || 'unit_cost' in updateData) {
      const newQuantity = updateData.quantity ?? existingSpec.quantity
      const newUnitCost = updateData.unit_cost ?? existingSpec.unit_cost
      total_cost = (newQuantity && newUnitCost) ? newQuantity * newUnitCost : null
    }

    // Prepare update object
    const updateObject: any = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    // Add total_cost if calculated
    if (total_cost !== existingSpec.total_cost) {
      updateObject.total_cost = total_cost
    }

    // Add approval fields for PM review actions
    if (isStatusUpdate && updateData.status) {
      updateObject.reviewed_by = user.id
      updateObject.review_date = new Date().toISOString()
      
      if (updateData.status === 'approved') {
        updateObject.approval_date = new Date().toISOString()
      }
    }

    const { data: updatedSpec, error } = await supabase
      .from('material_specs')
      .update(updateObject)
      .eq('id', id)
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
      .single()

    if (error) {
      console.error('Update material spec error:', error)
      return NextResponse.json(
        { error: 'Failed to update material spec' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedSpec)

  } catch (error) {
    console.error('Material spec PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Material Spec
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const user = await getCurrentUserProfile()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get existing spec to check permissions
    const { data: existingSpec, error: fetchError } = await supabase
      .from('material_specs')
      .select('created_by, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingSpec) {
      return NextResponse.json(
        { error: 'Material spec not found' },
        { status: 404 }
      )
    }

    // Check permissions - only owner or users with creation permissions can delete
    const isOwner = existingSpec.created_by === user.id
    if (!isOwner && !user.permissions.includes('create_material_specs')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete material spec' },
        { status: 403 }
      )
    }

    // Prevent deletion of approved specs without special permission
    if (existingSpec.status === 'approved' && !user.permissions.includes('approve_material_specs')) {
      return NextResponse.json(
        { error: 'Cannot delete approved material spec' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('material_specs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete material spec error:', error)
      return NextResponse.json(
        { error: 'Failed to delete material spec' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Material spec DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}