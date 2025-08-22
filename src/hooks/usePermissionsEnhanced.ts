/**
 * Enhanced Permissions Hook for Formula PM V3
 * Role-based permission system with backward compatibility
 */

import { useMemo } from 'react'
import { useAuth } from './useAuth'
import type { Permission } from '@/types/auth'
import type { UserRole, UserPermissions, PermissionFlag } from '@/types/roles'
import { 
  getEffectivePermissions, 
  hasPermissionFlag, 
  canAccessProject, 
  hasMinimumLevel,
  isAtLeastRole,
  hasPermissionEnhanced,
  filterSensitiveData,
  getRoleDisplayName,
  getAllRoles
} from '@/lib/permissions/roles'

export interface UsePermissionsEnhanced {
  // Role-based system
  permissions: UserPermissions | null
  role: UserRole | null
  canViewCosts: boolean
  canEditCosts: boolean
  canViewAllProjects: boolean
  canManageUsers: boolean
  isAdmin: boolean
  
  // Permission checking functions
  hasFlag: (flag: PermissionFlag) => boolean
  hasMinLevel: (level: number) => boolean
  isAtLeast: (role: UserRole) => boolean
  canAccess: (projectId: string, userProjectIds?: string[]) => boolean
  
  // Data filtering
  filterCosts: <T extends Record<string, any>>(data: T[], fields?: (keyof T)[]) => T[]
  
  // UI helpers
  roleDisplayName: string
  availableRoles: Array<{ value: UserRole; label: string; description: string; level: number }>
  
  // Legacy compatibility
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  
  // Loading states
  loading: boolean
  isAuthenticated: boolean
}

export function usePermissionsEnhanced(): UsePermissionsEnhanced {
  const { user, profile, loading, isAuthenticated } = useAuth()
  
  const permissions = useMemo(() => {
    if (!profile) return null
    
    // Convert profile to EnhancedUserProfile format
    const enhancedProfile = {
      ...profile,
      role: profile.role || 'team_member' as UserRole,
      can_view_costs: profile.can_view_costs,
      assigned_projects: profile.assigned_projects || [],
    }
    
    return getEffectivePermissions(enhancedProfile)
  }, [profile])
  
  const role = profile?.role || null
  
  // Computed permission flags
  const canViewCosts = permissions?.can_view_costs ?? false
  const canEditCosts = permissions?.can_edit_costs ?? false
  const canViewAllProjects = permissions ? hasPermissionFlag(permissions, 'view_all_projects') : false
  const canManageUsers = permissions ? hasPermissionFlag(permissions, 'manage_users') : false
  const isAdmin = permissions ? hasPermissionFlag(permissions, 'admin_access') : false
  
  // Permission checking functions
  const hasFlag = (flag: PermissionFlag): boolean => {
    return permissions ? hasPermissionFlag(permissions, flag) : false
  }
  
  const hasMinLevel = (level: number): boolean => {
    return permissions ? hasMinimumLevel(permissions, level) : false
  }
  
  const isAtLeast = (minRole: UserRole): boolean => {
    return role ? isAtLeastRole(role, minRole) : false
  }
  
  const canAccess = (projectId: string, userProjectIds?: string[]): boolean => {
    return permissions ? canAccessProject(permissions, projectId, userProjectIds) : false
  }
  
  const filterCosts = <T extends Record<string, any>>(
    data: T[], 
    fields?: (keyof T)[]
  ): T[] => {
    return permissions ? filterSensitiveData(data, permissions, fields) : data
  }
  
  // UI helpers
  const roleDisplayName = role ? getRoleDisplayName(role) : 'Unknown'
  const availableRoles = getAllRoles()
  
  // Legacy compatibility functions
  const hasPermission = (permission: Permission): boolean => {
    if (!profile) return false
    
    const enhancedProfile = {
      ...profile,
      role: profile.role || 'team_member' as UserRole,
      can_view_costs: profile.can_view_costs,
      assigned_projects: profile.assigned_projects || [],
    }
    
    return hasPermissionEnhanced(enhancedProfile, permission)
  }
  
  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some(permission => hasPermission(permission))
  }
  
  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every(permission => hasPermission(permission))
  }
  
  return {
    // Role-based system
    permissions,
    role,
    canViewCosts,
    canEditCosts,
    canViewAllProjects,
    canManageUsers,
    isAdmin,
    
    // Permission checking functions
    hasFlag,
    hasMinLevel,
    isAtLeast,
    canAccess,
    
    // Data filtering
    filterCosts,
    
    // UI helpers
    roleDisplayName,
    availableRoles,
    
    // Legacy compatibility
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Loading states
    loading,
    isAuthenticated,
  }
}