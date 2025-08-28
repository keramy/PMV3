/**
 * Formula PM V3 - Enhanced Permission System
 * Role-based access control with individual overrides and backward compatibility
 */

import type { 
  UserRole, 
  UserPermissions, 
  EnhancedUserProfile, 
  PermissionFlag,
  ProjectAccessType 
} from '@/types/roles'
import { DEFAULT_ROLES, ROLE_LEVELS, PERMISSION_FLAGS } from '@/types/roles'
import type { Permission } from '@/types/auth'

// Re-export for backward compatibility with UserPermissionManager
export { DEFAULT_ROLES, ROLE_LEVELS, PERMISSION_FLAGS } from '@/types/roles'

// ============================================================================
// ROLE-BASED PERMISSION UTILITIES
// ============================================================================

/**
 * Get effective permissions for a user based on role and individual overrides
 */
export function getEffectivePermissions(user: EnhancedUserProfile): UserPermissions {
  if (!user.role) {
    // Fallback for users without roles assigned
    return getDefaultPermissions('team_member')
  }

  const roleDefaults = DEFAULT_ROLES[user.role]
  
  return {
    role: user.role,
    permission_level: roleDefaults.permission_level,
    can_view_costs: user.can_view_costs !== null && user.can_view_costs !== undefined
      ? user.can_view_costs 
      : roleDefaults.default_can_view_costs,
    can_edit_costs: roleDefaults.default_can_edit_costs,
    project_access_type: roleDefaults.project_access_type,
    assigned_projects: user.assigned_projects || [],
  }
}

/**
 * Get default permissions for a role
 */
export function getDefaultPermissions(role: UserRole): UserPermissions {
  const roleConfig = DEFAULT_ROLES[role]
  
  return {
    role,
    permission_level: roleConfig.permission_level,
    can_view_costs: roleConfig.default_can_view_costs,
    can_edit_costs: roleConfig.default_can_edit_costs,
    project_access_type: roleConfig.project_access_type,
    assigned_projects: [],
  }
}

/**
 * Check if user has a specific permission flag
 */
export function hasPermissionFlag(permissions: UserPermissions, flag: PermissionFlag): boolean {
  switch (flag) {
    case PERMISSION_FLAGS.VIEW_COSTS:
      return permissions.can_view_costs
    
    case PERMISSION_FLAGS.EDIT_COSTS:
      return permissions.can_edit_costs
    
    case PERMISSION_FLAGS.VIEW_ALL_PROJECTS:
      return permissions.project_access_type === 'all' || permissions.permission_level >= 100
    
    case PERMISSION_FLAGS.MANAGE_USERS:
      return permissions.permission_level >= 100
    
    case PERMISSION_FLAGS.ADMIN_ACCESS:
      return permissions.permission_level >= 100
    
    default:
      return false
  }
}

/**
 * Check if user can access a specific project
 */
export function canAccessProject(
  permissions: UserPermissions, 
  projectId: string,
  userProjectIds?: string[]
): boolean {
  // Admin sees everything
  if (permissions.permission_level >= 100) {
    return true
  }
  
  // Client restricted to assigned projects only
  if (permissions.project_access_type === 'restricted') {
    return permissions.assigned_projects.includes(projectId)
  }
  
  // Others see projects they're members of
  return userProjectIds?.includes(projectId) ?? false
}

/**
 * Check if user has minimum permission level
 */
export function hasMinimumLevel(permissions: UserPermissions, minimumLevel: number): boolean {
  return permissions.permission_level >= minimumLevel
}

/**
 * Check if user role is at least the specified role level
 */
export function isAtLeastRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minimumRole]
}

// ============================================================================
// BACKWARD COMPATIBILITY LAYER
// ============================================================================

/**
 * Legacy permission checking - maintains compatibility with array-based permissions
 * Gradually migrate these to use the new role-based system
 */
export function hasLegacyPermission(
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
 * Enhanced permission checking that supports both new and legacy systems
 */
export function hasPermissionEnhanced(
  user: EnhancedUserProfile | null,
  permission: Permission | PermissionFlag
): boolean {
  if (!user) return false
  
  // Try new role-based system first
  if (user.role) {
    const permissions = getEffectivePermissions(user)
    
    // Map legacy permissions to new flags
    const permissionMapping: Record<string, PermissionFlag | null> = {
      'view_costs': PERMISSION_FLAGS.VIEW_COSTS,
      'edit_costs': PERMISSION_FLAGS.EDIT_COSTS,
      'manage_costs': PERMISSION_FLAGS.EDIT_COSTS,
      'view_all_projects': PERMISSION_FLAGS.VIEW_ALL_PROJECTS,
      'manage_users': PERMISSION_FLAGS.MANAGE_USERS,
      'admin': PERMISSION_FLAGS.ADMIN_ACCESS,
    }
    
    const mappedFlag = permissionMapping[permission]
    if (mappedFlag) {
      return hasPermissionFlag(permissions, mappedFlag)
    }
    
    // For unmapped permissions, use role level as fallback
    if (permission === 'create_projects' || permission === 'edit_projects') {
      return permissions.permission_level >= 60 // project_manager+
    }
    if (permission === 'delete_projects') {
      return permissions.permission_level >= 100 // admin only
    }
  }
  
  // Fallback to legacy array-based permissions
  return hasLegacyPermission(user.permissions, permission as Permission)
}

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return DEFAULT_ROLES[role]?.display_name ?? role
}

/**
 * Get role description for UI
 */
export function getRoleDescription(role: UserRole): string {
  return DEFAULT_ROLES[role]?.description ?? 'Standard access'
}

/**
 * Get all available roles for admin UI
 */
export function getAllRoles(): Array<{ value: UserRole; label: string; description: string; level: number }> {
  return Object.values(DEFAULT_ROLES).map(role => ({
    value: role.role_name,
    label: role.display_name,
    description: role.description || '',
    level: role.permission_level,
  }))
}

/**
 * Check if role change is allowed (prevent privilege escalation)
 */
export function canChangeUserRole(
  adminPermissions: UserPermissions, 
  targetRole: UserRole
): boolean {
  // Only admins can assign roles
  if (!hasPermissionFlag(adminPermissions, PERMISSION_FLAGS.ADMIN_ACCESS)) {
    return false
  }
  
  // Admins can assign any role
  return true
}

/**
 * Filter sensitive data based on user permissions
 */
export function filterSensitiveData<T extends Record<string, any>>(
  data: T[],
  permissions: UserPermissions,
  sensitiveFields: (keyof T)[] = ['unit_cost', 'total_cost', 'actual_cost', 'initial_cost']
): T[] {
  if (permissions.can_view_costs) {
    return data
  }
  
  return data.map(item => {
    const filtered = { ...item }
    sensitiveFields.forEach(field => {
      if (field in filtered) {
        delete filtered[field]
      }
    })
    return filtered
  })
}