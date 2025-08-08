/**
 * Unit tests for database helper functions and data transformations
 * Tests type-safe operations and data transformation utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  eqFilter,
  neqFilter,
  inFilter,
  likeFilter,
  transformUserProfile,
  transformToRawUserProfile,
  dateTransformer,
  jsonTransformer,
  arrayTransformer,
  numericTransformer,
  booleanTransformer,
  isNotNull,
  isNotEmpty,
  isNotEmptyArray,
  withErrorHandling,
  withArrayErrorHandling,
} from '../database-helpers'

// Mock data for testing
const mockUserProfile = {
  id: 'user-123',
  email: 'john.doe@example.com',
  first_name: 'John',
  last_name: 'Doe',
  job_title: 'Project Manager',
  company_id: 'company-123',
  permissions: ['read_projects', 'write_tasks'] as string[],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockAppUserProfile = {
  id: 'user-123',
  email: 'john.doe@example.com',
  full_name: 'John Doe',
  job_title: 'Project Manager',
  company_id: 'company-123',
  permissions: ['read_projects', 'write_tasks'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('Filter Functions', () => {
  let mockQuery: any

  beforeEach(() => {
    mockQuery = {
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
    }
  })

  it('should create eq filter function', () => {
    const filter = eqFilter('id', 'user-123')
    const result = filter(mockQuery)
    expect(mockQuery.eq).toHaveBeenCalledWith('id', 'user-123')
    expect(result).toBe(mockQuery)
  })

  it('should create neq filter function', () => {
    const filter = neqFilter('status', 'inactive')
    const result = filter(mockQuery)
    expect(mockQuery.neq).toHaveBeenCalledWith('status', 'inactive')
    expect(result).toBe(mockQuery)
  })

  it('should create in filter function', () => {
    const filter = inFilter('status', ['active', 'pending'])
    const result = filter(mockQuery)
    expect(mockQuery.in).toHaveBeenCalledWith('status', ['active', 'pending'])
    expect(result).toBe(mockQuery)
  })

  it('should create like filter function', () => {
    const filter = likeFilter('name', '%john%')
    const result = filter(mockQuery)
    expect(mockQuery.like).toHaveBeenCalledWith('name', '%john%')
    expect(result).toBe(mockQuery)
  })
})

describe('Data Transformation Functions', () => {
  describe('transformUserProfile', () => {
    it('should transform raw user profile to app user profile', () => {
      const result = transformUserProfile(mockUserProfile)
      
      expect(result).toEqual({
        ...mockUserProfile,
        full_name: 'John Doe',
        permissions: ['read_projects', 'write_tasks'],
      })
    })

    it('should handle missing first_name', () => {
      const profileWithoutFirstName = { ...mockUserProfile, first_name: null }
      const result = transformUserProfile(profileWithoutFirstName as any)
      
      expect(result.full_name).toBe('Doe')
    })

    it('should handle missing last_name', () => {
      const profileWithoutLastName = { ...mockUserProfile, last_name: null }
      const result = transformUserProfile(profileWithoutLastName as any)
      
      expect(result.full_name).toBe('John')
    })

    it('should fallback to email when both names are missing', () => {
      const profileWithoutNames = { 
        ...mockUserProfile, 
        first_name: null, 
        last_name: null 
      }
      const result = transformUserProfile(profileWithoutNames as any)
      
      expect(result.full_name).toBe('john.doe@example.com')
    })

    it('should handle null permissions', () => {
      const profileWithNullPermissions = { ...mockUserProfile, permissions: null }
      const result = transformUserProfile(profileWithNullPermissions as any)
      
      expect(result.permissions).toEqual([])
    })
  })

  describe('transformToRawUserProfile', () => {
    it('should transform app user profile to raw format', () => {
      const result = transformToRawUserProfile(mockAppUserProfile)
      
      expect(result).toEqual({
        ...mockAppUserProfile,
        first_name: 'John',
        last_name: 'Doe',
        permissions: ['read_projects', 'write_tasks'],
      })
    })

    it('should handle single name', () => {
      const profileWithSingleName = { ...mockAppUserProfile, full_name: 'John' }
      const result = transformToRawUserProfile(profileWithSingleName)
      
      expect(result.first_name).toBe('John')
      expect(result.last_name).toBe('')
    })

    it('should handle multiple last names', () => {
      const profileWithMultipleNames = { ...mockAppUserProfile, full_name: 'John von Doe Smith' }
      const result = transformToRawUserProfile(profileWithMultipleNames)
      
      expect(result.first_name).toBe('John')
      expect(result.last_name).toBe('von Doe Smith')
    })
  })
})

describe('Data Type Transformers', () => {
  describe('dateTransformer', () => {
    it('should transform date string to Date object', () => {
      const dateString = '2024-01-01T00:00:00Z'
      const result = dateTransformer.toApp(dateString)
      
      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toContain('2024-01-01T00:00:00')
    })

    it('should handle null date string', () => {
      const result = dateTransformer.toApp(null)
      expect(result).toBeNull()
    })

    it('should transform Date object to string', () => {
      const date = new Date('2024-01-01T00:00:00Z')
      const result = dateTransformer.toRaw(date)
      
      expect(result).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should handle null Date object', () => {
      const result = dateTransformer.toRaw(null)
      expect(result).toBeNull()
    })
  })

  describe('jsonTransformer', () => {
    it('should parse valid JSON string', () => {
      const jsonString = '{"key": "value", "number": 42}'
      const result = jsonTransformer.toApp(jsonString)
      
      expect(result).toEqual({ key: 'value', number: 42 })
    })

    it('should handle invalid JSON string', () => {
      const invalidJson = '{"key": invalid}'
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = jsonTransformer.toApp(invalidJson)
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle null JSON string', () => {
      const result = jsonTransformer.toApp(null)
      expect(result).toBeNull()
    })

    it('should stringify object to JSON', () => {
      const obj = { key: 'value', number: 42 }
      const result = jsonTransformer.toRaw(obj)
      
      expect(result).toBe('{"key":"value","number":42}')
    })

    it('should handle null object', () => {
      const result = jsonTransformer.toRaw(null)
      expect(result).toBeNull()
    })
  })

  describe('arrayTransformer', () => {
    it('should handle array input', () => {
      const array = ['item1', 'item2', 'item3']
      const result = arrayTransformer.toApp(array)
      
      expect(result).toEqual(['item1', 'item2', 'item3'])
    })

    it('should parse PostgreSQL array format', () => {
      const pgArray = '{item1,item2,item3}'
      const result = arrayTransformer.toApp(pgArray)
      
      expect(result).toEqual(['item1', 'item2', 'item3'])
    })

    it('should handle empty PostgreSQL array', () => {
      const pgArray = '{}'
      const result = arrayTransformer.toApp(pgArray)
      
      expect(result).toEqual([])
    })

    it('should handle null input', () => {
      const result = arrayTransformer.toApp(null)
      expect(result).toEqual([])
    })

    it('should return array as-is for raw transformation', () => {
      const array = ['item1', 'item2']
      const result = arrayTransformer.toRaw(array)
      
      expect(result).toEqual(['item1', 'item2'])
    })
  })

  describe('numericTransformer', () => {
    it('should handle number input', () => {
      const result = numericTransformer.toApp(42)
      expect(result).toBe(42)
    })

    it('should parse string number', () => {
      const result = numericTransformer.toApp('42.5')
      expect(result).toBe(42.5)
    })

    it('should handle invalid string', () => {
      const result = numericTransformer.toApp('not-a-number')
      expect(result).toBeNull()
    })

    it('should handle null input', () => {
      const result = numericTransformer.toApp(null)
      expect(result).toBeNull()
    })

    it('should return number as-is for raw transformation', () => {
      const result = numericTransformer.toRaw(42)
      expect(result).toBe(42)
    })
  })

  describe('booleanTransformer', () => {
    it('should handle boolean input', () => {
      expect(booleanTransformer.toApp(true)).toBe(true)
      expect(booleanTransformer.toApp(false)).toBe(false)
    })

    it('should parse string boolean', () => {
      expect(booleanTransformer.toApp('true')).toBe(true)
      expect(booleanTransformer.toApp('false')).toBe(false)
      expect(booleanTransformer.toApp('TRUE')).toBe(true)
      expect(booleanTransformer.toApp('FALSE')).toBe(false)
    })

    it('should handle null input', () => {
      const result = booleanTransformer.toApp(null)
      expect(result).toBeNull()
    })

    it('should return boolean as-is for raw transformation', () => {
      expect(booleanTransformer.toRaw(true)).toBe(true)
      expect(booleanTransformer.toRaw(false)).toBe(false)
    })
  })
})

describe('Validation Utilities', () => {
  describe('isNotNull', () => {
    it('should return true for non-null values', () => {
      expect(isNotNull('value')).toBe(true)
      expect(isNotNull(0)).toBe(true)
      expect(isNotNull(false)).toBe(true)
      expect(isNotNull([])).toBe(true)
    })

    it('should return false for null/undefined values', () => {
      expect(isNotNull(null)).toBe(false)
      expect(isNotNull(undefined)).toBe(false)
    })
  })

  describe('isNotEmpty', () => {
    it('should return true for non-empty strings', () => {
      expect(isNotEmpty('value')).toBe(true)
      expect(isNotEmpty('test')).toBe(true)
    })

    it('should return false for empty/null strings', () => {
      expect(isNotEmpty('')).toBe(false)
      expect(isNotEmpty('   ')).toBe(false)
      expect(isNotEmpty(null)).toBe(false)
      expect(isNotEmpty(undefined)).toBe(false)
    })
  })

  describe('isNotEmptyArray', () => {
    it('should return true for non-empty arrays', () => {
      expect(isNotEmptyArray([1, 2, 3])).toBe(true)
      expect(isNotEmptyArray(['item'])).toBe(true)
    })

    it('should return false for empty/null arrays', () => {
      expect(isNotEmptyArray([])).toBe(false)
      expect(isNotEmptyArray(null)).toBe(false)
      expect(isNotEmptyArray(undefined)).toBe(false)
    })
  })
})

describe('Error Handling Wrappers', () => {
  describe('withErrorHandling', () => {
    it('should handle successful operation', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: { id: 'test' },
        error: null,
      })

      const result = await withErrorHandling(mockOperation, 'test-context')

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 'test' })
      expect(result.error).toBeNull()
    })

    it('should handle database error', async () => {
      const mockError = {
        code: '23505',
        message: 'Duplicate key violation',
        details: 'Key already exists',
        hint: 'Use different key',
      }

      const mockOperation = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await withErrorHandling(mockOperation, 'test-context')

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should handle thrown exception', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Network error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await withErrorHandling(mockOperation, 'test-context')

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Network error')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('withArrayErrorHandling', () => {
    it('should handle successful array operation', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: [{ id: '1' }, { id: '2' }],
        error: null,
        count: 2,
      })

      const result = await withArrayErrorHandling(mockOperation, 'test-context')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([{ id: '1' }, { id: '2' }])
      expect(result.count).toBe(2)
      expect(result.error).toBeNull()
    })

    it('should handle array operation error', async () => {
      const mockError = {
        code: '42P01',
        message: 'Table does not exist',
      }

      const mockOperation = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await withArrayErrorHandling(mockOperation, 'test-context')

      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
      expect(result.count).toBe(0)
      expect(result.error).toEqual(mockError)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should handle null data as empty array', async () => {
      const mockOperation = vi.fn().mockResolvedValue({
        data: null,
        error: null,
        count: 0,
      })

      const result = await withArrayErrorHandling(mockOperation, 'test-context')

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
      expect(result.count).toBe(0)
    })
  })
})