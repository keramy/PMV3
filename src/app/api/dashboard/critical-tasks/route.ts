/**
 * Critical Tasks API Route - Real Database Connection
 * Returns high-priority tasks requiring immediate attention from actual database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Task } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    console.log('🔍 Critical Tasks API - Fetching real data for user:', userId)

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = createClient()

    // Get critical and high priority tasks from database
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .in('priority', ['critical', 'high'])
      .in('status', ['todo', 'in_progress'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('🔍 Critical Tasks API - Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch critical tasks', details: error.message },
        { status: 500 }
      )
    }

    console.log('🔍 Critical Tasks API - Found critical tasks:', tasks?.length || 0)

    // If no real critical tasks, return empty array (no mock data)
    return NextResponse.json(tasks || [])

  } catch (error) {
    console.error('🔍 Critical Tasks API - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}