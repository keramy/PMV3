/**
 * Formula PM V3 - Centralized API Client
 * Phase 4 of Authentication Fix Plan
 * 
 * Provides authenticated fetch wrapper that automatically includes auth headers
 * Integrates with AuthProvider for seamless user context
 * Handles proper error handling for auth failures
 */

'use client'

import { useAuthContext } from '@/providers/AuthProvider'

export interface ApiClientOptions extends RequestInit {
  // Allow overriding headers if needed
  headers?: HeadersInit
}

export interface ApiClient {
  get: (url: string, options?: ApiClientOptions) => Promise<Response>
  post: (url: string, data?: any, options?: ApiClientOptions) => Promise<Response>
  put: (url: string, data?: any, options?: ApiClientOptions) => Promise<Response>
  delete: (url: string, options?: ApiClientOptions) => Promise<Response>
  patch: (url: string, data?: any, options?: ApiClientOptions) => Promise<Response>
  apiCall: (url: string, options?: ApiClientOptions) => Promise<Response>
}

/**
 * Hook that returns an authenticated API client
 * Automatically includes user authentication headers in all requests
 */
export function useApiClient(): ApiClient {
  const { user, profile } = useAuthContext()

  const apiCall = async (url: string, options: ApiClientOptions = {}): Promise<Response> => {
    // Build authenticated headers
    const authHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      // Use profile.id if available (for enhanced user data), fallback to user.id
      'x-user-id': profile?.id || user?.id || '',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: authHeaders,
      })

      // Handle auth failures
      if (response.status === 401) {
        const userId = profile?.id || user?.id || 'undefined'
        console.error('🔐 API Client: Authentication failed for', url, '| User ID:', userId)
        // Could trigger re-auth flow here if needed
        throw new Error(`Authentication failed for ${url}`)
      }

      if (response.status === 403) {
        console.error('🔐 API Client: Authorization failed for', url)
        throw new Error(`Access denied for ${url}`)
      }

      return response
    } catch (error) {
      console.error('🔐 API Client: Request failed for', url, error)
      throw error
    }
  }

  const get = async (url: string, options: ApiClientOptions = {}): Promise<Response> => {
    return apiCall(url, {
      ...options,
      method: 'GET',
    })
  }

  const post = async (url: string, data?: any, options: ApiClientOptions = {}): Promise<Response> => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  const put = async (url: string, data?: any, options: ApiClientOptions = {}): Promise<Response> => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  const patch = async (url: string, data?: any, options: ApiClientOptions = {}): Promise<Response> => {
    return apiCall(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  const deleteMethod = async (url: string, options: ApiClientOptions = {}): Promise<Response> => {
    return apiCall(url, {
      ...options,
      method: 'DELETE',
    })
  }

  return {
    get,
    post,
    put,
    patch,
    delete: deleteMethod,
    apiCall,
  }
}

/**
 * Legacy support: Non-hook version for use in non-React contexts
 * Requires manual user ID passing
 */
export function createApiClient(userId: string) {
  const apiCall = async (url: string, options: ApiClientOptions = {}): Promise<Response> => {
    const authHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: authHeaders,
      })

      if (response.status === 401) {
        console.error('🔐 API Client: Authentication failed for', url)
        throw new Error(`Authentication failed for ${url}`)
      }

      if (response.status === 403) {
        console.error('🔐 API Client: Authorization failed for', url)
        throw new Error(`Access denied for ${url}`)
      }

      return response
    } catch (error) {
      console.error('🔐 API Client: Request failed for', url, error)
      throw error
    }
  }

  return {
    get: (url: string, options?: ApiClientOptions) => apiCall(url, { ...options, method: 'GET' }),
    post: (url: string, data?: any, options?: ApiClientOptions) => 
      apiCall(url, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    put: (url: string, data?: any, options?: ApiClientOptions) => 
      apiCall(url, { ...options, method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
    patch: (url: string, data?: any, options?: ApiClientOptions) => 
      apiCall(url, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
    delete: (url: string, options?: ApiClientOptions) => apiCall(url, { ...options, method: 'DELETE' }),
    apiCall,
  }
}

/**
 * Utility function to check if a response is successful
 */
export function isApiSuccess(response: Response): boolean {
  return response.ok && response.status >= 200 && response.status < 300
}

/**
 * Utility function to handle common API response patterns
 */
export async function handleApiResponse<T = any>(response: Response): Promise<T> {
  if (!isApiSuccess(response)) {
    const errorText = await response.text()
    throw new Error(`API Error (${response.status}): ${errorText}`)
  }

  const contentType = response.headers.get('Content-Type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response.text() as unknown as T
}