/**
 * React Query Provider with Construction Site Optimizations
 * Configured for low-bandwidth, high-latency construction environments
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// Optimized Query Client for construction sites
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data longer for construction sites with poor connectivity
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        
        // Retry configuration for spotty construction site internet
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (bad requests, unauthorized, etc.)
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false
          }
          // Retry up to 3 times for network issues
          return failureCount < 3
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Network detection optimizations
        networkMode: 'online',
        
        // Background refetch optimizations for mobile usage
        refetchOnWindowFocus: false, // Prevent unnecessary refetches when switching between apps
        refetchOnMount: 'always', // Always refetch when component mounts
        refetchOnReconnect: 'always', // Refetch when network reconnects
      },
      mutations: {
        // Retry mutations for network issues but not client errors
        retry: (failureCount, error: any) => {
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false
          }
          return failureCount < 2
        },
        networkMode: 'online',
      },
    },
  })
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable query client instance
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}

// Export query client type for use in other files
export type { QueryClient } from '@tanstack/react-query'