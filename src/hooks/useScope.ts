/**
 * Scope Items React Query Hook
 * Handles all scope items data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseSingleton } from '@/lib/supabase/singleton'
import { useAuthContext } from '@/providers/AuthProvider'
import type { 
  ScopeItem, 
  ScopeItemFormData, 
  ScopeListParams, 
  ScopeListResponse,
  ScopeItemUpdateData
} from '@/types/scope'

// Query keys
export const scopeQueryKeys = {
  all: ['scopeItems'] as const,
  lists: () => [...scopeQueryKeys.all, 'list'] as const,
  list: (params: ScopeListParams) => [...scopeQueryKeys.lists(), params] as const,
  details: () => [...scopeQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...scopeQueryKeys.details(), id] as const,
  statistics: (projectId: string) => [...scopeQueryKeys.all, 'statistics', projectId] as const,
}

// Custom hook for fetching scope items list
export function useScopeItems(params: ScopeListParams) {
  const { profile, user } = useAuthContext()
  
  // Auth verification - prevent queries without authentication
  if (!user || !profile) {
    throw new Error('Authentication required for scope items')
  }
  
  return useQuery({
    queryKey: scopeQueryKeys.list(params),
    queryFn: async (): Promise<ScopeListResponse> => {
      const searchParams = new URLSearchParams()
      
      // Add all parameters to search params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.set(key, value.join(','))
          } else {
            searchParams.set(key, String(value))
          }
        }
      })

      const response = await fetch(`/api/scope?${searchParams.toString()}`, {
        headers: { 'x-user-id': profile?.id || '' }  // ✅ CRITICAL: Authentication header
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED')
        }
        if (response.status === 403) {
          throw new Error('FORBIDDEN')
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch scope items`)
      }
      
      return response.json()
    },
    enabled: !!profile?.id, // ✅ CRITICAL: Only run when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

// Custom hook for fetching a single scope item
export function useScopeItem(id: string) {
  const { profile } = useAuthContext()
  
  return useQuery({
    queryKey: scopeQueryKeys.detail(id),
    queryFn: async (): Promise<ScopeItem> => {
      const response = await fetch(`/api/scope/${id}`, {
        headers: { 'x-user-id': profile?.id || '' }  // ✅ Authentication header
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scope item: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!id && !!profile?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Mutation hook for creating scope items
export function useCreateScopeItem() {
  const queryClient = useQueryClient()
  const { profile } = useAuthContext()
  
  return useMutation({
    mutationFn: async (data: ScopeItemFormData): Promise<ScopeItem> => {
      const response = await fetch('/api/scope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile?.id || ''  // ✅ Authentication header
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create scope item')
      }
      
      const result = await response.json()
      return result.data || result
    },
    onSuccess: (newItem, variables) => {
      // Invalidate the lists to refetch - use exact key pattern from component
      queryClient.invalidateQueries({ queryKey: ['scope-items'] })
      
      // Add the new item to cache
      queryClient.setQueryData(
        scopeQueryKeys.detail(newItem.id),
        newItem
      )
      
      // Optimistically update the list if we have the right query in cache
      const listQueryKey = scopeQueryKeys.list({ project_id: variables.project_id })
      queryClient.setQueryData(listQueryKey, (old: ScopeListResponse | undefined) => {
        if (!old?.items) return old
        
        return {
          ...old,
          items: [newItem, ...old.items],
          statistics: {
            ...old.statistics,
            total_items: (old.statistics?.total_items || 0) + 1,
          },
          total_count: (old.total_count || 0) + 1
        }
      })
    },
  })
}

// Mutation hook for updating scope items
export function useUpdateScopeItem() {
  const queryClient = useQueryClient()
  const { profile } = useAuthContext()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ScopeItemUpdateData }): Promise<ScopeItem> => {
      const response = await fetch(`/api/scope/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': profile?.id || ''  // ✅ Authentication header
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update scope item')
      }
      
      return response.json()
    },
    onSuccess: (updatedItem) => {
      // Update the detail cache
      queryClient.setQueryData(
        scopeQueryKeys.detail(updatedItem.id),
        updatedItem
      )
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: scopeQueryKeys.lists() })
    },
  })
}

// Mutation hook for deleting scope items
export function useDeleteScopeItem() {
  const queryClient = useQueryClient()
  const { profile } = useAuthContext()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/scope/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': profile?.id || '' }  // ✅ Authentication header
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete scope item')
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: scopeQueryKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: scopeQueryKeys.lists() })
    },
  })
}

// Utility hook for scope statistics
export function useScopeStatistics(projectId: string) {
  const { profile } = useAuthContext()
  
  return useQuery({
    queryKey: scopeQueryKeys.statistics(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/scope?project_id=${projectId}&limit=1`, {
        headers: { 'x-user-id': profile?.id || '' }  // ✅ Authentication header
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch scope statistics')
      }
      
      const data = await response.json()
      return data?.data?.statistics || {}
    },
    enabled: !!projectId && !!profile?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}