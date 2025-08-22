/**
 * Formula PM V3 Permissions Utility Functions
 * Server-side permission checking helpers with enhanced role-based system support
 */

import type { Permission } from '@/types/auth'
import type { EnhancedUserProfile, PermissionFlag } from '@/types/roles'
import { hasPermissionEnhanced } from '@/lib/permissions/roles'

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

// ============================================================================
// ENHANCED PERMISSION SYSTEM (Role-Based)
// ============================================================================

/**
 * Enhanced permission checking that supports both new role-based and legacy array-based systems
 * This is the recommended function to use going forward
 */
export function hasPermissionRole(
  user: EnhancedUserProfile | null,
  permission: Permission | PermissionFlag
): boolean {
  return hasPermissionEnhanced(user, permission)
}

/**
 * Server-side permission checking for API routes with role support
 * Backward compatible with existing array-based permissions
 */
export function hasPermissionServer(
  userPermissions: Permission[] | string[] | null | undefined,
  user: EnhancedUserProfile | null,
  requiredPermissions: Permission[] | Permission
): boolean {
  // Try enhanced role-based system first
  if (user?.role) {
    const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]
    return required.some(permission => hasPermissionEnhanced(user, permission))
  }
  
  // Fallback to legacy array-based system
  return hasPermission(userPermissions, requiredPermissions)
}