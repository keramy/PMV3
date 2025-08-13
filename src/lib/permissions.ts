/**
 * Formula PM V3 Permissions Utility Functions
 * Server-side permission checking helpers
 */

import type { Permission } from '@/types/auth'

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[] | string[] | null | undefined, 
  requiredPermissions: Permission[] | Permission
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }

  const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
  
  return required.some(permission => 
    userPermissions.includes(permission as Permission)
  )
}

/**
 * Check if a user has ALL of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[] | string[] | null | undefined,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }

  return requiredPermissions.every(permission =>
    userPermissions.includes(permission as Permission)
  )
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[] | string[] | null | undefined,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }

  return requiredPermissions.some(permission =>
    userPermissions.includes(permission as Permission)
  )
}

/**
 * Filter permissions based on a category
 */
export function getPermissionsByCategory(
  userPermissions: Permission[] | string[] | null | undefined,
  category: string
): Permission[] {
  if (!userPermissions) return []
  
  return userPermissions.filter(permission =>
    permission.toString().startsWith(category)
  ) as Permission[]
}