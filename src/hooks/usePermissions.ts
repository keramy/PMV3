/**
 * Formula PM V3 Dynamic Permissions Hook
 * Revolutionary permission system - 20 lines of pure power!
 */

'use client'

import { useAuth } from './useAuth'
import type { Permission } from '@/types/auth'

export function usePermissions() {
  const { profile } = useAuth()

  const hasPermission = (permission: Permission): boolean => {
    return profile?.permissions?.includes(permission) ?? false
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  return {
    permissions: profile?.permissions ?? [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}