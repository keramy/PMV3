/**
 * Scope Items React Query Hook
 * Handles scope management with filtering and Excel import/export
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
  ScopeItem, 
  ScopeItemFormData, 
  ScopeItemUpdateData,
  ScopeFilters,
  ScopeListParams,
  ScopeListResponse,
  BulkScopeUpdate,
  ExcelImportResult,
} from '@/types/scope'

// Query keys
export const scopeItemsQueryKeys = {
  all: ['scopeItems'] as const,
  lists: () => [...scopeItemsQueryKeys.all, 'list'] as const,
  list: (params: ScopeListParams) => [...scopeItemsQueryKeys.lists(), params] as const,
  details: () => [...scopeItemsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...scopeItemsQueryKeys.details(), id] as const,
  statistics: (projectId: string) => [...scopeItemsQueryKeys.all, 'statistics', projectId] as const,
  export: (projectId: string, filters?: ScopeFilters) => [...scopeItemsQueryKeys.all, 'export', projectId, filters] as const,
}

// Custom hook for fetching scope items with advanced filtering
export function useScopeItems(params: ScopeListParams) {
  return useQuery({
    queryKey: scopeItemsQueryKeys.list(params),
    queryFn: async (): Promise<ScopeListResponse> => {
      const searchParams = new URLSearchParams()
      
      // Add all parameters to search params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.set(key, value.join(','))
          } else if (typeof value === 'object') {
            // Handle nested objects like date_range, cost_range
            searchParams.set(key, JSON.stringify(value))
          } else {
            searchParams.set(key, String(value))
          }
        }
      })

      const response = await fetch(`/api/scope?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scope items: ${response.statusText}`)
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (longer for scope data)
    retry: 2,
  })
}

// Custom hook for fetching a single scope item
export function useScopeItem(id: string) {
  return useQuery({
    queryKey: scopeItemsQueryKeys.detail(id),
    queryFn: async (): Promise<ScopeItem> => {
      const response = await fetch(`/api/scope/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scope item: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual items
  })
}

// Mutation hook for creating scope items
export function useCreateScopeItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ScopeItemFormData & { project_id: string }): Promise<ScopeItem> => {
      const response = await fetch('/api/scope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create scope item')
      }
      
      return response.json()
    },
    onSuccess: (newItem, variables) => {
      // Invalidate the lists to refetch
      queryClient.invalidateQueries({ queryKey: scopeItemsQueryKeys.lists() })
      
      // Add the new item to cache
      queryClient.setQueryData(
        scopeItemsQueryKeys.detail(newItem.id),
        newItem
      )
      
      // Optimistically update the list if we have it cached
      const listQueryKey = scopeItemsQueryKeys.list({ project_id: variables.project_id })
      queryClient.setQueryData(listQueryKey, (old: ScopeListResponse | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          items: [newItem, ...old.items],
          total_count: old.total_count + 1,
          statistics: {
            ...old.statistics,
            total_items: old.statistics.total_items + 1,
            financial: {
              ...old.statistics.financial,
              total_budget: old.statistics.financial.total_budget + (newItem.total_cost || 0)
            }
          }
        }
      })
    },
  })
}

// Mutation hook for updating scope items
export function useUpdateScopeItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ScopeItemUpdateData }): Promise<ScopeItem> => {
      const response = await fetch(`/api/scope/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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
        scopeItemsQueryKeys.detail(updatedItem.id),
        updatedItem
      )
      
      // Invalidate lists to refetch with updated data
      queryClient.invalidateQueries({ queryKey: scopeItemsQueryKeys.lists() })
    },
  })
}

// Mutation hook for bulk updating scope items
export function useBulkUpdateScopeItems() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (bulkUpdate: BulkScopeUpdate): Promise<ScopeItem[]> => {
      const response = await fetch('/api/scope/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkUpdate),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to bulk update scope items')
      }
      
      return response.json()
    },
    onSuccess: (updatedItems) => {
      // Update individual item caches
      updatedItems.forEach(item => {
        queryClient.setQueryData(
          scopeItemsQueryKeys.detail(item.id),
          item
        )
      })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: scopeItemsQueryKeys.lists() })
    },
  })
}

// Mutation hook for deleting scope items
export function useDeleteScopeItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/scope/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete scope item')
      }
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: scopeItemsQueryKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: scopeItemsQueryKeys.lists() })
    },
  })
}

// Mutation hook for Excel import
export function useImportScopeFromExcel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      file, 
      options 
    }: { 
      projectId: string
      file: File
      options?: {
        skipHeaderRow?: boolean
        updateExisting?: boolean
        validateOnly?: boolean
      }
    }): Promise<ExcelImportResult> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', projectId)
      
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }
      
      const response = await fetch('/api/scope/import-excel', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to import Excel file')
      }
      
      return response.json()
    },
    onSuccess: (result, variables) => {
      // If items were successfully imported, invalidate lists
      if (result.successful_imports > 0) {
        queryClient.invalidateQueries({ 
          queryKey: scopeItemsQueryKeys.lists() 
        })
        
        // Also invalidate statistics
        queryClient.invalidateQueries({ 
          queryKey: scopeItemsQueryKeys.statistics(variables.projectId) 
        })
      }
    },
  })
}

// Hook for generating Excel export data
export function useScopeExcelExport(projectId: string, filters?: ScopeFilters) {
  return useQuery({
    queryKey: scopeItemsQueryKeys.export(projectId, filters),
    queryFn: async (): Promise<{ success: boolean }> => {
      const searchParams = new URLSearchParams({ project_id: projectId })
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              searchParams.set(key, value.join(','))
            } else if (typeof value === 'object') {
              searchParams.set(key, JSON.stringify(value))
            } else {
              searchParams.set(key, String(value))
            }
          }
        })
      }
      
      const response = await fetch(`/api/scope/export-excel?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to generate Excel export: ${response.statusText}`)
      }
      
      return response.json()
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes for export data
  })
}

// Mutation hook for downloading Excel export
export function useDownloadScopeExcel() {
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      filters, 
      filename 
    }: { 
      projectId: string
      filters?: ScopeFilters
      filename?: string 
    }): Promise<Blob> => {
      const searchParams = new URLSearchParams({ 
        project_id: projectId,
        format: 'file' 
      })
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              searchParams.set(key, value.join(','))
            } else if (typeof value === 'object') {
              searchParams.set(key, JSON.stringify(value))
            } else {
              searchParams.set(key, String(value))
            }
          }
        })
      }
      
      if (filename) {
        searchParams.set('filename', filename)
      }
      
      const response = await fetch(`/api/scope/export-excel?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to download Excel file: ${response.statusText}`)
      }
      
      return response.blob()
    },
    onSuccess: (blob, variables) => {
      // Auto-download the file
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = variables.filename || `scope-export-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
  })
}