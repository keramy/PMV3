/**
 * Critical Tasks API Route
 * Returns high-priority tasks requiring immediate attention
 */

import { NextRequest, NextResponse } from 'next/server'
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

    // Mock critical tasks data
    const tasks: Task[] = [
      {
        id: '1',
        project_id: '2',
        title: 'Emergency structural repair - East wing',
        description: 'Structural engineer has identified critical beam that requires immediate attention.',
        status: 'in_progress',
        priority: 'critical',
        assigned_to: 'mike_rodriguez',
        created_by: 'sarah_johnson',
        due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        estimated_hours: 8,
        actual_hours: null,
        progress_percentage: null,
        parent_task_id: null,
        start_date: null,
        completion_date: null,
        tags: null,
        attachments: [],
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        project_id: '4',
        // scope_item_id: 'scope_2',
        title: 'Fire system inspection - Due today',
        description: 'Fire marshal inspection scheduled for 2 PM today. All systems must be operational.',
        status: 'todo',
        priority: 'critical',
        assigned_to: 'david_chen',
        created_by: 'lisa_martinez',
        due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        estimated_hours: 4,
        actual_hours: null,
        progress_percentage: null,
        parent_task_id: null,
        start_date: null,
        completion_date: null,
        tags: null,
        attachments: [],
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        project_id: '1',
        // scope_item_id: 'scope_3',
        title: 'Weather protection - Storm incoming',
        description: 'Secure all materials and equipment. Storm expected tonight with 60mph winds.',
        status: 'in_progress',
        priority: 'high',
        assigned_to: 'carlos_mendoza',
        created_by: 'tom_wilson',
        due_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        estimated_hours: 3,
        actual_hours: null,
        progress_percentage: null,
        parent_task_id: null,
        start_date: null,
        completion_date: null,
        tags: null,
        attachments: [],
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        project_id: '5',
        // scope_item_id: 'scope_4',
        title: 'Client walkthrough preparation',
        description: 'Prepare areas for client final walkthrough scheduled for tomorrow morning.',
        status: 'todo',
        priority: 'high',
        assigned_to: 'amanda_davis',
        created_by: 'jennifer_lee',
        due_date: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
        estimated_hours: 6,
        actual_hours: null,
        progress_percentage: null,
        parent_task_id: null,
        start_date: null,
        completion_date: null,
        tags: null,
        attachments: [],
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        project_id: '3',
        // scope_item_id: 'scope_5',
        title: 'Equipment delivery coordination',
        description: 'Coordinate delivery of critical crane equipment. Access road must be clear.',
        status: 'todo',
        priority: 'high',
        assigned_to: 'robert_kim',
        created_by: 'kevin_brown',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        estimated_hours: 2,
        actual_hours: null,
        progress_percentage: null,
        parent_task_id: null,
        start_date: null,
        completion_date: null,
        tags: null,
        attachments: [],
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      }
    ]

    // Simulate network delay for development
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 400))
    }

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Critical tasks API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch critical tasks' },
      { status: 500 }
    )
  }
}