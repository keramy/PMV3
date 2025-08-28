/**
 * Tests for useAuthActions hook
 * Tests authentication actions: sign in, sign out, sign up
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthActions } from '../useAuthActions'
import { getSupabaseClient } from '@/lib/supabase/singleton'

// Get the singleton client and mock it
const supabase = getSupabaseClient()
const mockedSupabase = vi.mocked(supabase)

describe('useAuthActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn', () => {
    it('should call signInWithPassword with correct parameters', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'token-123' }
        },
        error: null
      }

      mockedSupabase.auth.signInWithPassword.mockResolvedValue(mockResponse as any)

      const { result } = renderHook(() => useAuthActions())

      const response = await result.current.signIn('test@example.com', 'password123')

      expect(mockedSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(response).toEqual(mockResponse)
    })

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid credentials' }
      const mockResponse = {
        data: { user: null, session: null },
        error: mockError
      }

      mockedSupabase.auth.signInWithPassword.mockResolvedValue(mockResponse as any)

      const { result } = renderHook(() => useAuthActions())

      const response = await result.current.signIn('test@example.com', 'wrongpassword')

      expect(response.error).toEqual(mockError)
      expect(response.data.user).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should call signOut successfully', async () => {
      const mockResponse = { error: null }
      mockedSupabase.auth.signOut.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthActions())

      const response = await result.current.signOut()

      expect(mockedSupabase.auth.signOut).toHaveBeenCalled()
      expect(response).toEqual(mockResponse)
    })

    it('should handle sign out error', async () => {
      const mockError = { message: 'Sign out failed' }
      const mockResponse = { error: mockError }
      
      mockedSupabase.auth.signOut.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useAuthActions())

      const response = await result.current.signOut()

      expect(response.error).toEqual(mockError)
    })
  })

  describe('signUp', () => {
    it('should call signUp with correct parameters', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-123', email: 'newuser@example.com' },
          session: null // Usually null until email confirmation
        },
        error: null
      }

      mockedSupabase.auth.signUp.mockResolvedValue(mockResponse as any)

      const { result } = renderHook(() => useAuthActions())

      const response = await result.current.signUp(
        'newuser@example.com',
        'password123',
        'John Doe'
      )

      expect(mockedSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'John Doe'
          }
        }
      })

      expect(response).toEqual(mockResponse)
    })

    it('should handle construction worker sign up', async () => {
      const mockResponse = {
        data: {
          user: { id: 'worker-123', email: 'worker@construction.com' },
          session: null
        },
        error: null
      }

      mockedSupabase.auth.signUp.mockResolvedValue(mockResponse as any)

      const { result } = renderHook(() => useAuthActions())

      const response = await result.current.signUp(
        'worker@construction.com',
        'construction123',
        'Mike Construction Worker'
      )

      expect(mockedSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'worker@construction.com',
        password: 'construction123',
        options: {
          data: {
            full_name: 'Mike Construction Worker'
          }
        }
      })

      expect(response.data.user?.email).toBe('worker@construction.com')
    })
  })

  it('should provide all authentication actions', () => {
    const { result } = renderHook(() => useAuthActions())

    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
  })
})