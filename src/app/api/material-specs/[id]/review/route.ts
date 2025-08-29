/**
 * Material Spec PM Review API Route
 * Dedicated endpoint for PM approval/rejection actions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/database/queries'
import type { MaterialSpecReviewData, MaterialSpecStatus } from '@/types/material-specs'

// ============================================================================
// POST - PM Review Action (Approve/Reject/Request Revision)
// ============================================================================

export async function POST(
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

    // Check PM permissions - APPROVE_MATERIAL_SPECS permission (bit 18: value 262144) or admin (bit 0: value 1)
    const canApproveMaterialSpecs = user.permissions_bitwise && 
      ((user.permissions_bitwise & 262144) > 0 || (user.permissions_bitwise & 1) > 0)
    if (!canApproveMaterialSpecs) {
      return NextResponse.json(
        { error: 'Only Project Managers can review material specs - need approve_material_specs permission' },
        { status: 403 }
      )
    }

    const reviewData: MaterialSpecReviewData = await request.json()

    // Validate review data
    if (!reviewData.status || !['approved', 'rejected', 'revision_required'].includes(reviewData.status)) {
      return NextResponse.json(
        { error: 'Valid status required (approved, rejected, or revision_required)' },
        { status: 400 }
      )
    }

    // Get existing spec
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

    // Check if spec is in reviewable state
    if (existingSpec.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot review already approved material spec' },
        { status: 400 }
      )
    }

    // Prepare review update
    const reviewUpdate: any = {
      status: reviewData.status,
      reviewed_by: user.id,
      review_date: new Date().toISOString(),
      review_notes: reviewData.review_notes,
      updated_at: new Date().toISOString(),
    }

    // Set approval date if approved
    if (reviewData.status === 'approved') {
      reviewUpdate.approval_date = new Date().toISOString()
    }

    // Update the material spec
    const { data: updatedSpec, error } = await supabase
      .from('material_specs')
      .update(reviewUpdate)
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
      console.error('Material spec review error:', error)
      return NextResponse.json(
        { error: 'Failed to update material spec review' },
        { status: 500 }
      )
    }

    // Return success with updated spec
    return NextResponse.json({
      success: true,
      action: reviewData.status,
      material_spec: updatedSpec,
      message: `Material spec ${reviewData.status} by ${user.full_name || 'PM'}`
    })

  } catch (error) {
    console.error('Material spec review API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Get Review History
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

    // Check permissions - VIEW_MATERIALS permission (bit 16: value 65536) or admin (bit 0: value 1)
    const canViewMaterials = user.permissions_bitwise && 
      ((user.permissions_bitwise & 65536) > 0 || (user.permissions_bitwise & 1) > 0)
    if (!canViewMaterials) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view material specs' },
        { status: 403 }
      )
    }

    // Get the material spec with review details
    const { data: spec, error } = await supabase
      .from('material_specs')
      .select(`
        id,
        name,
        status,
        created_at,
        review_date,
        review_notes,
        approval_date,
        created_by_user:user_profiles!material_specs_created_by_fkey(
          id, first_name, last_name, job_title
        ),
        reviewed_by_user:user_profiles!material_specs_approved_by_fkey(
          id, first_name, last_name, job_title
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Get material spec review error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Material spec not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch review details' },
        { status: 500 }
      )
    }

    // Build review history
    const reviewHistory = []

    // Creation event
    reviewHistory.push({
      action: 'created',
      date: spec.created_at,
      user: spec.created_by_user,
      notes: `Material spec created and submitted for PM review`
    })

    // Review event (if reviewed)
    if (spec.review_date && spec.reviewed_by_user) {
      reviewHistory.push({
        action: spec.status,
        date: spec.review_date,
        user: spec.reviewed_by_user,
        notes: spec.review_notes || `Material spec ${spec.status}`
      })
    }

    return NextResponse.json({
      material_spec: {
        id: spec.id,
        name: spec.name,
        status: spec.status,
      },
      review_history: reviewHistory,
      current_status: spec.status,
      awaiting_pm_review: spec.status === 'pending',
      can_review: user.permissions_bitwise && ((user.permissions_bitwise & 262144) > 0 || (user.permissions_bitwise & 1) > 0) && spec.status !== 'approved'
    })

  } catch (error) {
    console.error('Material spec review history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}