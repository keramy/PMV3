/**
 * Projects API Route - Real Database Connection
 * Replaces mock data with actual Supabase queries
 */

import { NextRequest } from 'next/server'
import { apiMiddleware } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import type { Project } from '@/types/database'
import { 
  ProjectCreateApiSchema,
  ProjectResponseSchema,
  validateProjectForm 
} from '@/schemas/project'

export const GET = apiMiddleware.auth(async (user, request) => {
  try {
    console.log('🔍 Projects API - Fetching projects for user:', user.id)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'updated_at'

    const supabase = await createClient()
    
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
})

export const POST = apiMiddleware.auth(async (user, request) => {
  try {

    const body = await request.json()
    
    // Validate request body using Zod schema
    const validationResult = ProjectCreateApiSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('🚨 Project API - Validation failed:', validationResult.error.issues)
      return NextResponse.json(
        { 
          error: 'Invalid project data', 
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }
    
    const validatedData = validationResult.data
    console.log('🚀 Project API - Creating project:', { name: validatedData.name, client: validatedData.client_name })

    const supabase = await createClient()
    
    // Insert project using validated data
    const projectData = {
      name: validatedData.name,
      description: validatedData.description,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
      budget: validatedData.budget,
      client_name: validatedData.client_name,
      status: validatedData.status,
      priority: validatedData.priority,
      project_number: validatedData.project_number,
      address: validatedData.address,
      created_by: user.id,
      created_at: validatedData.created_at,
      updated_at: validatedData.updated_at
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

    // Validate response data for type safety
    const validatedProject = ProjectResponseSchema.parse(project)
    
    return NextResponse.json({
      project: validatedProject,
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
})