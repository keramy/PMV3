/**
 * Notification Preferences API Route
 * Handles user notification preferences management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { NotificationPreferences } from '@/types/notifications'

// Validation schema for preferences update
const preferencesUpdateSchema = z.object({
  in_app_enabled: z.boolean().optional(),
  mention_notifications: z.boolean().optional(),
  assignment_notifications: z.boolean().optional(),
  status_change_notifications: z.boolean().optional(),
  due_date_notifications: z.boolean().optional(),
  comment_notifications: z.boolean().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newPreferences, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: session.user.id })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating default preferences:', insertError)
          return NextResponse.json(
            { error: 'Failed to create preferences' },
            { status: 500 }
          )
        }

        return NextResponse.json(newPreferences)
      }

      console.error('Error fetching preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(preferences)

  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const updateData = preferencesUpdateSchema.parse(body)

    // Update preferences
    const { data: updatedPreferences, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      // If no preferences exist, create them with the update data
      if (error.code === 'PGRST116') {
        const { data: newPreferences, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: session.user.id,
            ...updateData
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating preferences:', insertError)
          return NextResponse.json(
            { error: 'Failed to create preferences' },
            { status: 500 }
          )
        }

        return NextResponse.json(newPreferences)
      }

      console.error('Error updating preferences:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPreferences)

  } catch (error) {
    console.error('Update preferences API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}