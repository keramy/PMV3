import '@testing-library/jest-dom'

// Mock types for testing
vi.mock('@/types/auth', () => ({
  PERMISSION_TEMPLATES: {
    PROJECT_MANAGER: ['create_projects', 'edit_projects'],
    TECHNICAL_LEAD: ['manage_scope_items', 'approve_scope_changes'],
    CLIENT: ['access_client_portal', 'view_client_projects'],
    ADMIN: ['manage_users', 'manage_permissions'],
  },
}))

// Create a comprehensive Supabase query mock that properly chains methods
function createSupabaseQueryMock() {
  const queryMock = {
    // Query methods that return 'this' for chaining
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),

    // Terminal methods that can be mocked to return promises
    single: vi.fn(),
    maybeSingle: vi.fn(),

    // Add mockResolvedValue and other testing methods to the query mock
    mockResolvedValue: vi.fn(function(this: any, value: any) {
      this.single.mockResolvedValue(value)
      this.maybeSingle.mockResolvedValue(value)
      return this
    }),
    mockResolvedValueOnce: vi.fn(function(this: any, value: any) {
      this.single.mockResolvedValueOnce(value)
      this.maybeSingle.mockResolvedValueOnce(value)
      return this
    }),
    mockRejectedValue: vi.fn(function(this: any, error: any) {
      this.single.mockRejectedValue(error)
      this.maybeSingle.mockRejectedValue(error)
      return this
    }),
    mockRejectedValueOnce: vi.fn(function(this: any, error: any) {
      this.single.mockRejectedValueOnce(error)
      this.maybeSingle.mockRejectedValueOnce(error)
      return this
    }),
  }

  // Make sure all methods return the same mock object for chaining
  Object.keys(queryMock).forEach(key => {
    if (typeof queryMock[key as keyof typeof queryMock] === 'function' && 
        !['single', 'maybeSingle', 'mockResolvedValue', 'mockResolvedValueOnce', 'mockRejectedValue', 'mockRejectedValueOnce'].includes(key)) {
      queryMock[key as keyof typeof queryMock] = vi.fn(() => queryMock)
    }
  })

  return queryMock
}

// Mock Supabase client for testing with proper method chaining
vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn(() => createSupabaseQueryMock()),
      auth: {
        getUser: vi.fn(),
      },
    },
    supabaseAdmin: {
      from: vi.fn(() => createSupabaseQueryMock()),
      auth: {
        getUser: vi.fn(),
      },
    },
  }
})

// Mock database helpers that use createTypedQuery
vi.mock('@/lib/database-helpers', async (importOriginal) => {
  const actual = await importOriginal() as any
  
  return {
    ...actual,
    createTypedQuery: vi.fn((tableName: string, useAdmin: boolean = false) => {
      return createSupabaseQueryMock()
    }),
    withErrorHandling: vi.fn(async (operation: Function, context: string) => {
      try {
        const result = await operation()
        return {
          data: result.data || null,
          error: result.error || null,
          success: !result.error
        }
      } catch (error) {
        return {
          data: null,
          error: { message: (error as Error).message },
          success: false
        }
      }
    }),
    withArrayErrorHandling: vi.fn(async (operation: Function, context: string) => {
      try {
        const result = await operation()
        return {
          data: result.data || [],
          error: result.error || null,
          success: !result.error,
          count: result.count || 0
        }
      } catch (error) {
        return {
          data: [],
          error: { message: (error as Error).message },
          success: false,
          count: 0
        }
      }
    }),
    withTransformErrorHandling: vi.fn(async (operation: Function, transformer: any, context: string) => {
      try {
        const result = await operation()
        if (result.error || !result.data) {
          return {
            data: null,
            error: result.error || { message: 'No data returned' },
            success: false
          }
        }
        const transformedData = transformer.toApp ? transformer.toApp(result.data) : result.data
        return {
          data: transformedData,
          error: null,
          success: true
        }
      } catch (error) {
        return {
          data: null,
          error: { message: (error as Error).message },
          success: false
        }
      }
    }),
    // Keep all the actual transformer functions
    transformUserProfile: actual.transformUserProfile,
    transformToRawUserProfile: actual.transformToRawUserProfile,
  }
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))