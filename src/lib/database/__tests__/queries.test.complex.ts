/**
 * Integration tests for database queries
 * Tests that all queries work with the new type system
 * Fixed version with proper Supabase mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCurrentUserProfile,
  hasPermission,
  getUserProfile,
  getCompanyProjects,
  getProjectDetails,
  getTasks,
  getOverdueTasks,
  getScopeItems,
  getShopDrawings,
  getRFIs,
  getMaterialSpecs,
  getProjectStats,
  checkDatabaseConnection,
  measureConnectionLatency,
} from '../queries'
import type { Permission } from '@/types/auth'

// Mock data for testing
const mockUser = {
  id: 'user-123',
  email: 'john.doe@example.com',
}

const mockUserProfile = {
  id: 'user-123',
  email: 'john.doe@example.com',
  first_name: 'John',
  last_name: 'Doe',
  job_title: 'Project Manager',
  company_id: 'company-123',
  permissions: ['read_projects', 'write_tasks'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'Test project description',
  status: 'active',
  company_id: 'company-123',
  project_manager_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockTask = {
  id: 'task-123',
  title: 'Test Task',
  description: 'Test task description',
  status: 'in_progress',
  priority: 'high',
  project_id: 'project-123',
  assigned_to: 'user-123',
  created_by: 'user-123',
  due_date: '2024-12-31',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('User & Authentication Queries', () => {
  let mockSupabase: any
  let mockSupabaseAdmin: any

  beforeEach(async () => {
    const { supabase, supabaseAdmin } = await import('@/lib/supabase')
    mockSupabase = supabase
    mockSupabaseAdmin = supabaseAdmin
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUserProfile', () => {
    it('should return null when no user is authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await getCurrentUserProfile()
      expect(result).toBeNull()
    })

    it('should return transformed user profile when user is authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      })

      const result = await getCurrentUserProfile()

      expect(result).toEqual({
        ...mockUserProfile,
        full_name: 'John Doe',
        permissions: ['read_projects', 'write_tasks'],
      })
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await getCurrentUserProfile()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('hasPermission', () => {
    it('should return true when user has the permission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      })

      const result = await hasPermission('read_projects' as Permission)
      expect(result).toBe(true)
    })

    it('should return false when user does not have the permission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      })

      const result = await hasPermission('admin_access' as Permission)
      expect(result).toBe(false)
    })

    it('should return false when no user profile is found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const result = await hasPermission('read_projects' as Permission)
      expect(result).toBe(false)
    })
  })

  describe('getUserProfile', () => {
    it('should return user profile by ID using admin client', async () => {
      const mockQuery = mockSupabaseAdmin.from()
      mockQuery.mockResolvedValue({
        data: mockUserProfile,
        error: null,
      })

      const result = await getUserProfile('user-123')

      expect(result).toEqual({
        ...mockUserProfile,
        full_name: 'John Doe',
        permissions: ['read_projects', 'write_tasks'],
      })
    })

    it('should handle errors when fetching user profile', async () => {
      const mockQuery = mockSupabaseAdmin.from()
      mockQuery.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getUserProfile('user-123')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})

describe('Project Queries', () => {
  let mockSupabase: any

  beforeEach(async () => {
    const { supabase } = await import('@/lib/supabase')
    mockSupabase = supabase
  })

  describe('getCompanyProjects', () => {
    it('should fetch projects with pagination', async () => {
      const mockProjects = [mockProject]
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockProjects,
        error: null,
        count: 1,
      })

      const result = await getCompanyProjects(1, 10)

      expect(result.data).toEqual(mockProjects)
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      })
    })

    it('should apply status filter', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const result = await getCompanyProjects(1, 10, { status: 'active' })

      expect(result.data).toEqual([])
    })

    it('should apply search filter', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      })

      const result = await getCompanyProjects(1, 10, { search: 'test' })

      expect(result.data).toEqual([])
    })

    it('should handle errors gracefully', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getCompanyProjects()

      expect(result.data).toEqual([])
      expect(result.pagination.total).toBe(0)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('getProjectDetails', () => {
    it('should fetch project details with related data', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockProject,
        error: null,
      })

      const result = await getProjectDetails('project-123')

      expect(result).toEqual(mockProject)
    })

    it('should handle project not found', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: null,
        error: { message: 'Project not found' },
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getProjectDetails('project-123')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})

describe('Task Queries', () => {
  let mockSupabase: any

  beforeEach(async () => {
    const { supabase } = await import('@/lib/supabase')
    mockSupabase = supabase
  })

  describe('getTasks', () => {
    it('should fetch tasks with default options', async () => {
      const mockTasks = [mockTask]
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockTasks,
        error: null,
      })

      const result = await getTasks()

      expect(result).toEqual(mockTasks)
    })

    it('should apply project filter', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getTasks({ projectId: 'project-123' })

      expect(result).toEqual([])
    })

    it('should apply assignee filter', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getTasks({ assignedTo: 'user-123' })

      expect(result).toEqual([])
    })

    it('should apply limit', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getTasks({ limit: 5 })

      expect(result).toEqual([])
    })
  })

  describe('getOverdueTasks', () => {
    it('should fetch overdue tasks', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [mockTask],
        error: null,
      })

      const result = await getOverdueTasks()

      expect(result).toEqual([mockTask])
    })

    it('should apply project filter for overdue tasks', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getOverdueTasks('project-123')

      expect(result).toEqual([])
    })
  })
})

describe('Construction Workflow Queries', () => {
  let mockSupabase: any

  beforeEach(async () => {
    const { supabase } = await import('@/lib/supabase')
    mockSupabase = supabase
  })

  describe('getScopeItems', () => {
    it('should fetch scope items for project', async () => {
      const mockScopeItems = [{ id: 'scope-1', name: 'Test Scope' }]
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockScopeItems,
        error: null,
      })

      const result = await getScopeItems('project-123')

      expect(result).toEqual(mockScopeItems)
    })

    it('should apply category filter', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getScopeItems('project-123', 'electrical')

      expect(result).toEqual([])
    })
  })

  describe('getShopDrawings', () => {
    it('should fetch shop drawings for project', async () => {
      const mockDrawings = [{ id: 'drawing-1', name: 'Test Drawing' }]
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockDrawings,
        error: null,
      })

      const result = await getShopDrawings('project-123')

      expect(result).toEqual(mockDrawings)
    })

    it('should apply status filter', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getShopDrawings('project-123', 'approved')

      expect(result).toEqual([])
    })
  })

  describe('getRFIs', () => {
    it('should fetch RFIs for project', async () => {
      const mockRFIs = [{ id: 'rfi-1', title: 'Test RFI' }]
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockRFIs,
        error: null,
      })

      const result = await getRFIs('project-123')

      expect(result).toEqual(mockRFIs)
    })
  })

  describe('getMaterialSpecs', () => {
    it('should fetch material specs for project', async () => {
      const mockSpecs = [{ id: 'spec-1', name: 'Test Spec' }]
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        data: mockSpecs,
        error: null,
      })

      const result = await getMaterialSpecs('project-123')

      expect(result).toEqual(mockSpecs)
    })
  })
})

describe('Dashboard Analytics', () => {
  let mockSupabase: any

  beforeEach(async () => {
    const { supabase } = await import('@/lib/supabase')
    mockSupabase = supabase
  })

  describe('getProjectStats', () => {
    it('should fetch project statistics', async () => {
      const mockQuery = mockSupabase.from()
      
      // Mock different responses for different table queries
      mockQuery
        .mockResolvedValueOnce({
          data: [
            { status: 'completed', due_date: '2024-01-01' },
            { status: 'in_progress', due_date: '2024-12-31' },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [
            { status: 'completed', completion_percentage: 100, estimated_cost: 1000, actual_cost: 1100 },
            { status: 'in_progress', completion_percentage: 50, estimated_cost: 2000, actual_cost: 1800 },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [
            { status: 'approved' },
            { status: 'pending' },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [],
          error: null,
        })

      const result = await getProjectStats('project-123')

      expect(result).toEqual({
        tasks: {
          total: 2,
          completed: 1,
          inProgress: 1,
          overdue: 1, // One task is overdue (due_date in past)
        },
        scope: {
          total: 2,
          completed: 1,
          avgCompletion: 75, // (100 + 50) / 2
          budgetVariance: -100, // (1100 - 1000) + (1800 - 2000)
        },
        drawings: {
          total: 2,
          approved: 1,
          pending: 1,
        },
        milestones: {
          total: 0,
          completed: 0,
          overdue: 0,
        },
      })
    })

    it('should handle errors in individual queries', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Error' },
        })
        .mockResolvedValueOnce({
          data: [],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [],
          error: null,
        })

      const result = await getProjectStats('project-123')

      expect(result?.tasks.total).toBe(0)
    })
  })
})

describe('Utility Functions', () => {
  let mockSupabase: any

  beforeEach(async () => {
    const { supabase } = await import('@/lib/supabase')
    mockSupabase = supabase
  })

  describe('checkDatabaseConnection', () => {
    it('should return true when connection is successful', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        error: null,
      })

      const result = await checkDatabaseConnection()

      expect(result).toBe(true)
    })

    it('should return false when connection fails', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        error: { message: 'Connection failed' },
      })

      const result = await checkDatabaseConnection()

      expect(result).toBe(false)
    })

    it('should return false when exception is thrown', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockRejectedValue(new Error('Network error'))

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await checkDatabaseConnection()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('measureConnectionLatency', () => {
    it('should measure connection latency', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockResolvedValue({
        error: null,
      })

      const result = await measureConnectionLatency()

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
    })

    it('should return -1 when connection fails', async () => {
      const mockQuery = mockSupabase.from()
      mockQuery.mockRejectedValue(new Error('Network error'))

      const result = await measureConnectionLatency()

      expect(result).toBe(-1)
    })
  })
})