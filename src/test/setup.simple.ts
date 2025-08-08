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

// Global test state to control Supabase mock responses
globalThis.__supabaseMockState = {
  responses: new Map(),
  defaultResponse: { data: null, error: null, count: 0 }
}

// Helper to set mock responses for specific queries
globalThis.__setMockResponse = (key: string, response: any) => {
  globalThis.__supabaseMockState.responses.set(key, response)
}

globalThis.__clearMockResponses = () => {
  globalThis.__supabaseMockState.responses.clear()
}

// Create a simple but complete Supabase mock
const createMockQuery = () => {
  const mockQuery = {
    // Chaining methods
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
    
    // Terminal methods - these need to return promises
    single: vi.fn(),
    maybeSingle: vi.fn(),
    
    // Custom methods for test control
    then: vi.fn((resolve) => {
      const response = globalThis.__supabaseMockState.defaultResponse
      return Promise.resolve(response).then(resolve)
    }),
    
    // These allow chaining but also control final response
    mockResolvedValue: function(value: any) {
      this.single.mockResolvedValue(value)
      this.maybeSingle.mockResolvedValue(value)
      this.then.mockImplementation((resolve: any) => Promise.resolve(value).then(resolve))
      // Return a promise-like object for direct awaiting
      return Promise.resolve(value)
    },
    
    mockResolvedValueOnce: function(value: any) {
      this.single.mockResolvedValueOnce(value)
      this.maybeSingle.mockResolvedValueOnce(value)
      this.then.mockImplementationOnce((resolve: any) => Promise.resolve(value).then(resolve))
      return Promise.resolve(value)
    },
    
    mockRejectedValue: function(error: any) {
      this.single.mockRejectedValue(error)
      this.maybeSingle.mockRejectedValue(error)
      this.then.mockImplementation((resolve: any, reject: any) => Promise.reject(error).catch(reject || (() => {})))
      return Promise.reject(error)
    },
  }
  
  // Override then to make query awaitable
  mockQuery.then = (resolve: any, reject?: any) => {
    const response = globalThis.__supabaseMockState.defaultResponse
    return Promise.resolve(response).then(resolve).catch(reject || (() => {}))
  }
  
  return mockQuery
}

// Mock Supabase clients
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => createMockQuery()),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null
      }),
    },
  },
  supabaseAdmin: {
    from: vi.fn(() => createMockQuery()),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}))

// Mock database queries
vi.mock('@/lib/database/queries', () => ({
  getCurrentUserProfile: vi.fn().mockResolvedValue(null),
  hasPermission: vi.fn().mockResolvedValue(false),
  getUserProfile: vi.fn().mockResolvedValue(null),
  getCompanyProjects: vi.fn().mockResolvedValue([]),
  getProjectDetails: vi.fn().mockResolvedValue(null),
  getTasks: vi.fn().mockResolvedValue([]),
  getOverdueTasks: vi.fn().mockResolvedValue([]),
  getScopeItems: vi.fn().mockResolvedValue([]),
  getShopDrawings: vi.fn().mockResolvedValue([]),
  getRFIs: vi.fn().mockResolvedValue([]),
  getMaterialSpecs: vi.fn().mockResolvedValue([]),
  getProjectStats: vi.fn().mockResolvedValue(null),
  checkDatabaseConnection: vi.fn().mockResolvedValue(true),
  measureConnectionLatency: vi.fn().mockResolvedValue(50),
}))

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