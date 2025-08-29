/**
 * Formula PM V3 Shop Drawing Revisions API
 * GET /api/shop-drawings/[id]/revisions - Get revisions for shop drawing
 * POST /api/shop-drawings/[id]/revisions - Upload new revision
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RevisionUploadData } from '@/types/shop-drawings'
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
      return Response.json({ error: 'Insufficient permissions to view shop drawing revisions' }, { status: 403 })
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

    // Get revisions with uploader information
    const { data: revisions, error: revisionsError } = await supabase
      .from('shop_drawing_revisions' as any)
      .select(`
        id,
        shop_drawing_id,
        revision_number,
        file_url,
        file_name,
        file_size,
        revision_notes,
        uploaded_by,
        superseded_at,
        is_current,
        created_at,
        uploaded_by_user:user_profiles!uploaded_by(first_name, last_name)
      `)
      .eq('shop_drawing_id', id)
      .order('created_at', { ascending: false })

    if (revisionsError) {
      console.error('Revisions query error:', revisionsError)
      return Response.json({ error: 'Failed to fetch revisions' }, { status: 500 })
    }

    return Response.json({
      success: true,
      data: revisions || []
    })

  } catch (error) {
    console.error('Shop drawing revisions GET API error:', error)
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

    // Check EDIT_SHOP_DRAWINGS permission (bit 13: value 8192) for uploading revisions or admin (bit 0: value 1)
    const canUploadRevision = profile?.permissions_bitwise && 
      ((profile.permissions_bitwise & 8192) > 0 || (profile.permissions_bitwise & 1) > 0)
    if (!canUploadRevision) {
      return Response.json({ error: 'Insufficient permissions to upload shop drawing revisions' }, { status: 403 })
    }

    // Parse form data (for file uploads)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const revision_number = formData.get('revision_number') as string
    const revision_notes = formData.get('revision_notes') as string

    // Validate required fields
    if (!file || !revision_number) {
      return Response.json({ 
        error: 'Missing required fields',
        validation_errors: {
          file: !file ? ['File is required'] : undefined,
          revision_number: !revision_number ? ['Revision number is required'] : undefined
        }
      }, { status: 400 })
    }

    // Validate file type (PDF, DWG, or images)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/octet-stream', // for DWG files
      'application/vnd.autocad.dwg'
    ]
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dwg')) {
      return Response.json({
        error: 'Invalid file type',
        validation_errors: {
          file: ['File must be PDF, DWG, JPG, or PNG']
        }
      }, { status: 400 })
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return Response.json({
        error: 'File too large',
        validation_errors: {
          file: ['File size must be less than 50MB']
        }
      }, { status: 400 })
    }

    // Verify shop drawing exists
    const { data: drawing, error: drawingError } = await supabase
      .from('shop_drawings')
      .select('id, project_id, title')
      .eq('id', id)
      .single()

    if (drawingError) {
      if (drawingError.code === 'PGRST116') {
        return Response.json({ error: 'Shop drawing not found' }, { status: 404 })
      }
      return Response.json({ error: 'Failed to verify shop drawing' }, { status: 500 })
    }

    // Check if revision number already exists
    const { data: existingRevision, error: revisionCheckError } = await supabase
      .from('shop_drawing_revisions' as any)
      .select('id')
      .eq('shop_drawing_id', id)
      .eq('revision_number', revision_number)
      .single()

    if (existingRevision) {
      return Response.json({
        error: 'Revision number already exists',
        validation_errors: {
          revision_number: ['This revision number is already in use']
        }
      }, { status: 400 })
    }

    // Generate file path for Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${drawing.id}_rev_${revision_number}.${fileExt}`
    const filePath = `projects/${drawing.project_id}/drawings/${drawing.id}/revisions/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('drawings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('File upload error:', uploadError)
      return Response.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('drawings')
      .getPublicUrl(uploadData.path)

    // Start transaction to update revisions
    const now = new Date().toISOString()

    // Mark all previous revisions as not current
    const { error: updateError } = await supabase
      .from('shop_drawing_revisions' as any)
      .update({ 
        is_current: false,
        superseded_at: now
      })
      .eq('shop_drawing_id', id)
      .eq('is_current', true)

    if (updateError) {
      console.error('Error updating previous revisions:', updateError)
      // Clean up uploaded file
      await supabase.storage.from('drawings').remove([uploadData.path])
      return Response.json({ error: 'Failed to update revision history' }, { status: 500 })
    }

    // Create new revision record
    const { data: newRevision, error: createError } = await supabase
      .from('shop_drawing_revisions' as any)
      .insert({
        shop_drawing_id: id,
        revision_number,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        revision_notes: revision_notes || null,
        uploaded_by: user.id,
        is_current: true
      })
      .select(`
        id,
        shop_drawing_id,
        revision_number,
        file_url,
        file_name,
        file_size,
        revision_notes,
        uploaded_by,
        superseded_at,
        is_current,
        created_at,
        uploaded_by_user:user_profiles!uploaded_by(first_name, last_name)
      `)
      .single()

    if (createError) {
      console.error('Revision creation error:', createError)
      // Clean up uploaded file
      await supabase.storage.from('drawings').remove([uploadData.path])
      return Response.json({ error: 'Failed to create revision record' }, { status: 500 })
    }

    // Update shop drawing status to indicate new revision
    await supabase
      .from('shop_drawings')
      .update({
        status: 'submitted', // New revision resets to submitted status
        approval_stage: 'submittal',
        internal_approved_by: null,
        client_approved_by: null,
        internal_approved_at: null,
        client_approved_at: null,
        updated_at: now
      })
      .eq('id', id)

    // Log the revision upload activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        project_id: (drawing as any).project_id,
        entity_type: 'shop_drawing_revision',
        entity_id: (newRevision as any).id,
        action: 'uploaded',
        details: {
          shop_drawing_id: id,
          shop_drawing_title: (drawing as any).title,
          revision_number,
          file_name: file.name,
          file_size: file.size
        }
      })

    return Response.json({
      success: true,
      data: newRevision as any,
      message: 'Revision uploaded successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Shop drawing revisions POST API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}