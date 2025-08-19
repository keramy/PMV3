/**
 * Single Project API Route
 * Fetches individual project data with authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    console.log('🔍 Project Detail API - Fetching project:', projectId, 'for user:', userId)

    const supabase = await createClient()
    
    // Fetch project data
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('🔍 Project Detail API - Database error:', error)
      
      // Handle specific error cases
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found or you don\'t have access to it' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch project', details: error.message },
        { status: 500 }
      )
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or you don\'t have access to it' },
        { status: 404 }
      )
    }

    console.log('🔍 Project Detail API - Found project:', project.name)

    return NextResponse.json({
      project,
      status: 'success'
    })

  } catch (error) {
    console.error('🔍 Project Detail API - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}