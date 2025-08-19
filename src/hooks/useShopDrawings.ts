/**
 * Shop Drawings React Query Hook
 * Handles "whose turn" workflow data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import type { 
  ShopDrawing, 
  ShopDrawingFormData, 
  ShopDrawingListParams, 
  ShopDrawingListResponse,
  ShopDrawingUpdateData,
  CommentFormData,
  RevisionUploadData,
  ShopDrawingComment
} from '@/types/shop-drawings'

// Query keys
export const shopDrawingsQueryKeys = {
  all: ['shopDrawings'] as const,
  lists: () => [...shopDrawingsQueryKeys.all, 'list'] as const,
  list: (params: ShopDrawingListParams) => [...shopDrawingsQueryKeys.lists(), params] as const,
  details: () => [...shopDrawingsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopDrawingsQueryKeys.details(), id] as const,
  comments: (drawingId: string) => [...shopDrawingsQueryKeys.all, 'comments', drawingId] as const,
  statistics: (projectId: string) => [...shopDrawingsQueryKeys.all, 'statistics', projectId] as const,
}

// Custom hook for fetching shop drawings list with "whose turn" tracking
export function useShopDrawings(params: ShopDrawingListParams) {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: shopDrawingsQueryKeys.list(params),
    queryFn: async (): Promise<ShopDrawingListResponse> => {
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

      const response = await fetch(`/api/shop-drawings?${searchParams.toString()}`, {
        headers: { 'x-user-id': profile?.id || '' }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED')
        }
        if (response.status === 403) {
          throw new Error('FORBIDDEN')
        }
        throw new Error(`Failed to fetch shop drawings: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!profile?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for real-time workflow)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

// Custom hook for fetching a single shop drawing with full details
export function useShopDrawing(id: string) {
  return useQuery({
    queryKey: shopDrawingsQueryKeys.detail(id),
    queryFn: async (): Promise<ShopDrawing> => {
      const response = await fetch(`/api/shop-drawings/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch shop drawing: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Custom hook for fetching drawing comments
export function useShopDrawingComments(drawingId: string) {
  return useQuery({
    queryKey: shopDrawingsQueryKeys.comments(drawingId),
    queryFn: async (): Promise<ShopDrawingComment[]> => {
      const response = await fetch(`/api/shop-drawings/${drawingId}/comments`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!drawingId,
    staleTime: 1 * 60 * 1000, // 1 minute for comments
  })
}

// Mutation hook for creating shop drawings
export function useCreateShopDrawing() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ShopDrawingFormData & { project_id: string }): Promise<ShopDrawing> => {
      const response = await fetch('/api/shop-drawings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create shop drawing')
      }
      
      return response.json()
    },
    onSuccess: (newDrawing, variables) => {
      // Invalidate the lists to refetch
      queryClient.invalidateQueries({ queryKey: shopDrawingsQueryKeys.lists() })
      
      // Add the new drawing to cache
      queryClient.setQueryData(
        shopDrawingsQueryKeys.detail(newDrawing.id),
        newDrawing
      )
      
      // Optimistically update the list if we have it cached
      const listQueryKey = shopDrawingsQueryKeys.list({ project_id: variables.project_id })
      queryClient.setQueryData(listQueryKey, (old: ShopDrawingListResponse | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          drawings: [newDrawing, ...old.drawings],
          total_count: old.total_count + 1,
        }
      })
    },
  })
}

// Mutation hook for updating shop drawing status ("whose turn" workflow)
export function useUpdateShopDrawingStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ShopDrawingUpdateData }): Promise<ShopDrawing> => {
      const response = await fetch(`/api/shop-drawings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update shop drawing status')
      }
      
      return response.json()
    },
    onSuccess: (updatedDrawing) => {
      // Update the detail cache
      queryClient.setQueryData(
        shopDrawingsQueryKeys.detail(updatedDrawing.id),
        updatedDrawing
      )
      
      // Invalidate lists to refetch with updated "whose turn" statistics
      queryClient.invalidateQueries({ queryKey: shopDrawingsQueryKeys.lists() })
    },
    // Optimistic updates for instant workflow feedback
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: shopDrawingsQueryKeys.detail(id) })
      
      const previousDrawing = queryClient.getQueryData(shopDrawingsQueryKeys.detail(id))
      
      // Optimistically update status and computed fields
      queryClient.setQueryData(shopDrawingsQueryKeys.detail(id), (old: ShopDrawing | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          ...data,
          updated_at: new Date().toISOString(),
          // Update "whose turn" based on new status
          current_turn: data.status === 'submitted_to_client' ? 'client' as const :
                       data.status === 'approved' ? 'complete' as const :
                       'ours' as const
        }
      })
      
      return { previousDrawing }
    },
    onError: (err, { id }, context) => {
      if (context?.previousDrawing) {
        queryClient.setQueryData(shopDrawingsQueryKeys.detail(id), context.previousDrawing)
      }
    },
  })
}

// Mutation hook for submitting to client
export function useSubmitToClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      clientContact, 
      comments 
    }: { 
      id: string
      clientContact?: string
      comments?: string 
    }): Promise<ShopDrawing> => {
      const response = await fetch(`/api/shop-drawings/${id}/submit-to-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_contact: clientContact,
          submission_comments: comments
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit to client')
      }
      
      return response.json()
    },
    onSuccess: (updatedDrawing) => {
      queryClient.setQueryData(
        shopDrawingsQueryKeys.detail(updatedDrawing.id),
        updatedDrawing
      )
      queryClient.invalidateQueries({ queryKey: shopDrawingsQueryKeys.lists() })
    },
  })
}

// Mutation hook for recording client response
export function useRecordClientResponse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      responseType, 
      comments 
    }: { 
      id: string
      responseType: 'approved' | 'rejected' | 'revision_requested'
      comments?: string 
    }): Promise<ShopDrawing> => {
      const response = await fetch(`/api/shop-drawings/${id}/client-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_response_type: responseType,
          client_comments: comments,
          client_response_date: new Date().toISOString()
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to record client response')
      }
      
      return response.json()
    },
    onSuccess: (updatedDrawing) => {
      queryClient.setQueryData(
        shopDrawingsQueryKeys.detail(updatedDrawing.id),
        updatedDrawing
      )
      queryClient.invalidateQueries({ queryKey: shopDrawingsQueryKeys.lists() })
    },
  })
}

// Mutation hook for adding comments
export function useAddShopDrawingComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      drawingId, 
      commentData 
    }: { 
      drawingId: string
      commentData: CommentFormData 
    }): Promise<ShopDrawingComment> => {
      const formData = new FormData()
      formData.append('comment', commentData.comment)
      formData.append('comment_type', commentData.comment_type)
      
      // Add attachments if any
      commentData.attachments?.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })
      
      const response = await fetch(`/api/shop-drawings/${drawingId}/comments`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add comment')
      }
      
      return response.json()
    },
    onSuccess: (newComment, variables) => {
      // Add comment to cache
      const commentsKey = shopDrawingsQueryKeys.comments(variables.drawingId)
      queryClient.setQueryData(commentsKey, (old: ShopDrawingComment[] | undefined) => {
        return old ? [...old, newComment] : [newComment]
      })
      
      // Invalidate drawing detail to update comment count
      queryClient.invalidateQueries({ 
        queryKey: shopDrawingsQueryKeys.detail(variables.drawingId) 
      })
    },
  })
}

// Mutation hook for uploading drawing revisions
export function useUploadDrawingRevision() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      drawingId, 
      revisionData 
    }: { 
      drawingId: string
      revisionData: RevisionUploadData 
    }): Promise<void> => {
      const formData = new FormData()
      formData.append('revision_number', revisionData.revision_number)
      formData.append('file', revisionData.file)
      if (revisionData.revision_notes) {
        formData.append('revision_notes', revisionData.revision_notes)
      }
      
      const response = await fetch(`/api/shop-drawings/${drawingId}/revisions`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload revision')
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate drawing detail to refetch with new revision
      queryClient.invalidateQueries({ 
        queryKey: shopDrawingsQueryKeys.detail(variables.drawingId) 
      })
    },
  })
}

// Mutation hook for deleting shop drawings
export function useDeleteShopDrawing() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/shop-drawings/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete shop drawing')
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: shopDrawingsQueryKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: shopDrawingsQueryKeys.comments(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: shopDrawingsQueryKeys.lists() })
    },
  })
}