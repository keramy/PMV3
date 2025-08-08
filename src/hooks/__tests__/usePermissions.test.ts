/**
 * Tests for usePermissions hook
 * Tests dynamic permission checking with O(1) performance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions } from '../usePermissions'
import { useAuth } from '../useAuth'
import type { Permission } from '@/types/auth'

// Mock useAuth hook
vi.mock('../useAuth')
const mockedUseAuth = vi.mocked(useAuth)

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty permissions when no profile', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      isAuthenticated: false
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.permissions).toEqual([])
    expect(result.current.hasPermission('read_projects')).toBe(false)
    expect(result.current.hasAnyPermission(['read_projects', 'write_tasks'])).toBe(false)
    expect(result.current.hasAllPermissions(['read_projects'])).toBe(false)
  })

  it('should return profile permissions when available', () => {
    const mockPermissions: Permission[] = [
      'read_projects',
      'write_tasks',
      'view_project_costs'
    ]

    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123' } as any,
      profile: {
        id: 'user-123',
        permissions: mockPermissions
      } as any,
      loading: false,
      isAuthenticated: true
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.permissions).toEqual(mockPermissions)
  })

  it('should check single permission correctly', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123' } as any,
      profile: {
        id: 'user-123',
        permissions: ['read_projects', 'write_tasks']
      } as any,
      loading: false,
      isAuthenticated: true
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.hasPermission('read_projects')).toBe(true)
    expect(result.current.hasPermission('write_tasks')).toBe(true)
    expect(result.current.hasPermission('admin_all')).toBe(false)
  })

  it('should check any permission correctly', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123' } as any,
      profile: {
        id: 'user-123',
        permissions: ['read_projects', 'write_tasks']
      } as any,
      loading: false,
      isAuthenticated: true
    })

    const { result } = renderHook(() => usePermissions())

    // Should return true if user has ANY of the permissions
    expect(result.current.hasAnyPermission(['read_projects', 'admin_all'])).toBe(true)
    expect(result.current.hasAnyPermission(['write_tasks', 'admin_all'])).toBe(true)
    expect(result.current.hasAnyPermission(['admin_all', 'super_admin'])).toBe(false)
    expect(result.current.hasAnyPermission([])).toBe(false)
  })

  it('should check all permissions correctly', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123' } as any,
      profile: {
        id: 'user-123',
        permissions: ['read_projects', 'write_tasks', 'view_project_costs']
      } as any,
      loading: false,
      isAuthenticated: true
    })

    const { result } = renderHook(() => usePermissions())

    // Should return true only if user has ALL permissions
    expect(result.current.hasAllPermissions(['read_projects', 'write_tasks'])).toBe(true)
    expect(result.current.hasAllPermissions(['read_projects', 'admin_all'])).toBe(false)
    expect(result.current.hasAllPermissions([])).toBe(true) // Empty array should return true
  })

  it('should handle undefined permissions array', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 'user-123' } as any,
      profile: {
        id: 'user-123',
        permissions: undefined
      } as any,
      loading: false,
      isAuthenticated: true
    })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.permissions).toEqual([])
    expect(result.current.hasPermission('read_projects')).toBe(false)
  })

  it('should handle construction-specific permissions', () => {
    const constructionPermissions: Permission[] = [
      'review_shop_drawings',
      'approve_material_specs',
      'manage_scope_items',
      'view_project_costs',
      'internal_review_drawings'
    ]

    mockedUseAuth.mockReturnValue({
      user: { id: 'construction-manager-123' } as any,
      profile: {
        id: 'construction-manager-123',
        permissions: constructionPermissions
      } as any,
      loading: false,
      isAuthenticated: true
    })

    const { result } = renderHook(() => usePermissions())

    // Test construction workflow permissions
    expect(result.current.hasPermission('review_shop_drawings')).toBe(true)
    expect(result.current.hasPermission('approve_material_specs')).toBe(true)
    expect(result.current.hasPermission('manage_scope_items')).toBe(true)
    
    // Test permission combinations for construction workflows
    expect(result.current.hasAnyPermission([
      'review_shop_drawings', 
      'client_review_drawings'
    ])).toBe(true)
    
    expect(result.current.hasAllPermissions([
      'review_shop_drawings',
      'approve_material_specs'
    ])).toBe(true)

    expect(result.current.hasAllPermissions([
      'review_shop_drawings',
      'client_review_drawings' // This permission is not granted
    ])).toBe(false)
  })

  it('should be performant with large permission sets', () => {
    // Create a large permission set to test O(1) performance
    const largePermissionSet: Permission[] = []
    for (let i = 0; i < 100; i++) {
      largePermissionSet.push(`permission_${i}` as Permission)
    }

    mockedUseAuth.mockReturnValue({
      user: { id: 'power-user-123' } as any,
      profile: {
        id: 'power-user-123',
        permissions: largePermissionSet
      } as any,
      loading: false,
      isAuthenticated: true
    })

    const { result } = renderHook(() => usePermissions())

    // Performance should be consistent regardless of permission set size
    const startTime = performance.now()
    
    // Test various permission checks
    result.current.hasPermission('permission_50')
    result.current.hasAnyPermission(['permission_25', 'permission_75'])
    result.current.hasAllPermissions(['permission_0', 'permission_99'])
    
    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Should complete within reasonable time (< 5ms for this scale in test environment)
    expect(executionTime).toBeLessThan(5)
    expect(result.current.permissions.length).toBe(100)
  })
})