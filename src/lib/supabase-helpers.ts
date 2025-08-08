/**
 * Supabase Query Helpers
 * Wrapper functions to handle type mismatches between generated and expected types
 */

import { supabase } from '@/lib/supabase'

// Generic query wrapper that bypasses strict typing
export async function queryTable<T>(
  table: string,
  query: (q: any) => any
): Promise<T | null> {
  try {
    const baseQuery = supabase.from(table as any)
    const { data, error } = await query(baseQuery)
    
    if (error) {
      console.error(`Query error on ${table}:`, error)
      return null
    }
    
    return data as T
  } catch (error) {
    console.error(`Exception querying ${table}:`, error)
    return null
  }
}

// Simplified user profile fetcher
export async function getUserProfile(userId: string) {
  return queryTable<any>('user_profiles', (q) =>
    q.select('*').eq('id', userId).single()
  )
}

// Simplified project fetcher
export async function getProject(projectId: string) {
  return queryTable<any>('projects', (q) =>
    q.select('*').eq('id', projectId).single()
  )
}

// Simplified tasks fetcher
export async function getTasks(projectId?: string) {
  return queryTable<any[]>('tasks', (q) => {
    let query = q.select('*')
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    return query
  })
}