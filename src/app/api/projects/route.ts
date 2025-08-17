/**
 * Projects API Route - Real Database Connection
 * Replaces mock data with actual Supabase queries
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client-fixed'
import type { Project } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    console.log('🔍 Projects API - Fetching projects for user:', userId)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'updated_at'

    const supabase = createClient()
    
    // Build query
    let query = supabase
      .from('projects')
      .select('*')
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    // Apply sorting
    const [sortField, sortOrder] = sort.split(':')
    query = query.order(sortField, { ascending: sortOrder !== 'desc' })
    
    // Apply limit
    if (limit) {
      query = query.limit(limit)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('🔍 Projects API - Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error.message },
        { status: 500 }
      )
    }

    console.log('🔍 Projects API - Found projects:', projects?.length || 0)

    return NextResponse.json({
      projects: projects || [],
      total: projects?.length || 0,
      status: 'success'
    })

  } catch (error) {
    console.error('🔍 Projects API - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, start_date, end_date, budget, client_name, status = 'planning' } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Projects API - Creating project:', { name, client_name })

    const supabase = createClient()
    
    // Get user's company ID
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile?.company_id) {
      console.error('🔍 Projects API - User profile error:', profileError)
      return NextResponse.json(
        { error: 'User company not found' },
        { status: 400 }
      )
    }

    // Create project
    const projectData = {
      name,
      description,
      company_id: userProfile.company_id,
      created_by: userId,
      start_date,
      end_date,
      budget: budget ? parseFloat(budget) : null,
      client_name,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('🔍 Projects API - Create error:', error)
      return NextResponse.json(
        { error: 'Failed to create project', details: error.message },
        { status: 500 }
      )
    }

    console.log('🔍 Projects API - Created project:', project.id)

    return NextResponse.json({
      project,
      status: 'success',
      message: 'Project created successfully'
    })

  } catch (error) {
    console.error('🔍 Projects API - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}