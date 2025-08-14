/**
 * Material Specs React Query Hook
 * Handles all material specs data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { 
  MaterialSpec, 
  MaterialSpecFormData, 
  MaterialSpecListParams, 
  MaterialSpecListResponse,
  MaterialSpecUpdateData,
  MaterialSpecReviewData
} from '@/types/material-specs'

// Query keys
export const materialSpecsQueryKeys = {
  all: ['materialSpecs'] as const,
  lists: () => [...materialSpecsQueryKeys.all, 'list'] as const,
  list: (params: MaterialSpecListParams) => [...materialSpecsQueryKeys.lists(), params] as const,
  details: () => [...materialSpecsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialSpecsQueryKeys.details(), id] as const,
  statistics: (projectId: string) => [...materialSpecsQueryKeys.all, 'statistics', projectId] as const,
}

// Custom hook for fetching material specs list
export function useMaterialSpecs(params: MaterialSpecListParams) {
  return useQuery({
    queryKey: materialSpecsQueryKeys.list(params),
    queryFn: async (): Promise<MaterialSpecListResponse> => {
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

      const response = await fetch(`/api/material-specs?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch material specs: ${response.statusText}`)
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

// Custom hook for fetching a single material spec
export function useMaterialSpec(id: string) {
  return useQuery({
    queryKey: materialSpecsQueryKeys.detail(id),
    queryFn: async (): Promise<MaterialSpec> => {
      const response = await fetch(`/api/material-specs/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch material spec: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Mutation hook for creating material specs
export function useCreateMaterialSpec() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: MaterialSpecFormData & { project_id: string }): Promise<MaterialSpec> => {
      const response = await fetch('/api/material-specs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create material spec')
      }
      
      return response.json()
    },
    onSuccess: (newSpec, variables) => {
      // Invalidate the lists to refetch
      queryClient.invalidateQueries({ queryKey: materialSpecsQueryKeys.lists() })
      
      // Add the new spec to cache
      queryClient.setQueryData(
        materialSpecsQueryKeys.detail(newSpec.id),
        newSpec
      )
      
      // Optimistically update the list if we have the right query in cache
      const listQueryKey = materialSpecsQueryKeys.list({ project_id: variables.project_id })
      queryClient.setQueryData(listQueryKey, (old: MaterialSpecListResponse | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          specs: [newSpec, ...old.specs],
          total_count: old.total_count + 1,
        }
      })
    },
  })
}

// Mutation hook for updating material specs
export function useUpdateMaterialSpec() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MaterialSpecUpdateData }): Promise<MaterialSpec> => {
      const response = await fetch(`/api/material-specs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update material spec')
      }
      
      return response.json()
    },
    onSuccess: (updatedSpec) => {
      // Update the detail cache
      queryClient.setQueryData(
        materialSpecsQueryKeys.detail(updatedSpec.id),
        updatedSpec
      )
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: materialSpecsQueryKeys.lists() })
    },
  })
}

// Mutation hook for PM review (approve/reject)
export function useReviewMaterialSpec() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, reviewData }: { id: string; reviewData: MaterialSpecReviewData }): Promise<MaterialSpec> => {
      const response = await fetch(`/api/material-specs/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to review material spec')
      }
      
      return response.json()
    },
    onSuccess: (reviewedSpec) => {
      // Update the detail cache
      queryClient.setQueryData(
        materialSpecsQueryKeys.detail(reviewedSpec.id),
        reviewedSpec
      )
      
      // Invalidate lists to refetch statistics
      queryClient.invalidateQueries({ queryKey: materialSpecsQueryKeys.lists() })
    },
    // Optimistic updates for instant feedback
    onMutate: async ({ id, reviewData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: materialSpecsQueryKeys.detail(id) })
      
      // Snapshot previous value
      const previousSpec = queryClient.getQueryData(materialSpecsQueryKeys.detail(id))
      
      // Optimistically update
      queryClient.setQueryData(materialSpecsQueryKeys.detail(id), (old: MaterialSpec | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          status: reviewData.status,
          review_notes: reviewData.review_notes,
          review_date: new Date().toISOString(),
        }
      })
      
      // Return context for rollback
      return { previousSpec }
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousSpec) {
        queryClient.setQueryData(materialSpecsQueryKeys.detail(id), context.previousSpec)
      }
    },
  })
}

// Mutation hook for deleting material specs
export function useDeleteMaterialSpec() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/material-specs/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete material spec')
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: materialSpecsQueryKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: materialSpecsQueryKeys.lists() })
    },
  })
}

// Hook for image upload
export function useUploadMaterialSpecImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<{ url: string }> => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/material-specs/upload-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload image')
      }
      
      return response.json()
    },
  })
}