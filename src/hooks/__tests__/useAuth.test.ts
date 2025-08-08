/**
 * Tests for useAuth hook
 * Tests authentication state management, session handling, and profile fetching
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/database/queries'

// Type the mocked functions
const mockedSupabase = vi.mocked(supabase)
const mockedGetCurrentUserProfile = vi.mocked(getCurrentUserProfile)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should handle no initial session', async () => {
    // Mock no session
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 1000 })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should handle initial session with user', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockProfile = {
      id: 'user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      permissions: ['read_projects']
    }

    // Mock session with user
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } as any },
      error: null
    })

    // Mock profile fetch
    mockedGetCurrentUserProfile.mockResolvedValue(mockProfile as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 1000 })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle profile fetch error gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }

    // Mock session with user
    mockedSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } as any },
      error: null
    })

    // Mock profile fetch error
    mockedGetCurrentUserProfile.mockRejectedValue(new Error('Profile fetch failed'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 1000 })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.profile).toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching profile:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = vi.fn()
    mockedSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })

    const { unmount } = renderHook(() => useAuth())

    unmount()

    // The cleanup should be called, but we can't easily test it directly
    // This test mainly ensures no errors are thrown during unmount
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})