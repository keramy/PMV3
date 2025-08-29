/**
 * Individual Material Spec API Route
 * Handle individual material spec operations and PM approval workflow
 * Using new bitwise permission middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiMiddleware } from '@/lib/api/middleware'
import type { 
  MaterialSpec,
  MaterialSpecUpdateData,
  MaterialSpecReviewData,
  MaterialSpecStatus
} from '@/types/material-specs'

// ============================================================================
// GET - Get Single Material Spec
// ============================================================================

async function getHandler(user: any, request: NextRequest) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const id = pathSegments[pathSegments.length - 1]
  
  const supabase = await createClient()

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
      return apiMiddleware.response.notFound('Material spec not found')
    }
    return apiMiddleware.response.internalError('Failed to fetch material spec')
  }

  return apiMiddleware.response.success(spec)
}

export const GET = apiMiddleware.permissions('view_materials', getHandler)

// ============================================================================
// PUT - Update Material Spec  
// ============================================================================

async function putHandler(user: any, request: NextRequest) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const id = pathSegments[pathSegments.length - 1]
  
  const supabase = await createClient()
  const updateData: MaterialSpecUpdateData = await request.json()

  // Get existing spec to check permissions
  const { data: existingSpec, error: fetchError } = await supabase
    .from('material_specs')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existingSpec) {
    return apiMiddleware.response.notFound('Material spec not found')
  }

  // Update the material spec
  const { data: updatedSpec, error: updateError } = await supabase
    .from('material_specs')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Update material spec error:', updateError)
    return apiMiddleware.response.internalError('Failed to update material spec')
  }

  return apiMiddleware.response.success(updatedSpec)
}

export const PUT = apiMiddleware.permissions('create_material_specs', putHandler)

// ============================================================================
// DELETE - Delete Material Spec
// ============================================================================

async function deleteHandler(user: any, request: NextRequest) {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const id = pathSegments[pathSegments.length - 1]
  
  const supabase = await createClient()

  const { error } = await supabase
    .from('material_specs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete material spec error:', error)
    return apiMiddleware.response.internalError('Failed to delete material spec')
  }

  return apiMiddleware.response.noContent()
}

export const DELETE = apiMiddleware.permissions('create_material_specs', deleteHandler)