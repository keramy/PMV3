/**
 * Formula PM V3 Comprehensive Permissions Hook
 * High-performance bitwise permission system with all convenience features
 * Single source of truth for all permission logic
 */

'use client'

import { useMemo } from 'react'
import { useAuthContext } from '@/providers/AuthProvider'
import { PERMISSIONS, PermissionManager } from '@/lib/permissions/bitwise'
import type { Permission } from '@/types/auth'

// Mapping from old Permission strings to new bitwise constants
const PERMISSION_MAPPING: Partial<Record<Permission, number>> = {
  // Project permissions
  'view_projects': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
  'create_projects': PERMISSIONS.CREATE_PROJECTS,
  'edit_projects': PERMISSIONS.MANAGE_ALL_PROJECTS,
  'delete_projects': PERMISSIONS.DELETE_DATA,
  'edit_project_settings': PERMISSIONS.MANAGE_ALL_PROJECTS,
  'view_project_costs': PERMISSIONS.VIEW_FINANCIAL_DATA,
  'assign_project_team': PERMISSIONS.MANAGE_TEAM_MEMBERS,
  
  // Scope management
  'view_scope': PERMISSIONS.VIEW_ASSIGNED_PROJECTS, // Everyone can view scope
  'manage_scope_items': PERMISSIONS.MANAGE_SCOPE,
  'assign_subcontractors': PERMISSIONS.MANAGE_SCOPE,
  'approve_scope_changes': PERMISSIONS.APPROVE_SCOPE_CHANGES,
  'export_scope_excel': PERMISSIONS.EXPORT_DATA,
  
  // Shop drawings workflow
  'view_drawings': PERMISSIONS.VIEW_SHOP_DRAWINGS,
  'upload_drawings': PERMISSIONS.CREATE_SHOP_DRAWINGS,
  'internal_review_drawings': PERMISSIONS.EDIT_SHOP_DRAWINGS,
  'client_review_drawings': PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT,
  'approve_shop_drawings': PERMISSIONS.APPROVE_SHOP_DRAWINGS,
  
  // Material specifications  
  'view_materials': PERMISSIONS.VIEW_ASSIGNED_PROJECTS, // Everyone can view materials
  'create_material_specs': PERMISSIONS.MANAGE_MATERIALS,
  'approve_material_specs': PERMISSIONS.MANAGE_MATERIALS,
  
  // Task management
  'view_tasks': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
  'create_tasks': PERMISSIONS.CREATE_TASKS,
  'assign_tasks': PERMISSIONS.ASSIGN_TASKS,
  'edit_tasks': PERMISSIONS.EDIT_TASKS,
  
  // Financial permissions
  'view_all_costs': PERMISSIONS.VIEW_FINANCIAL_DATA,
  'approve_expenses': PERMISSIONS.APPROVE_EXPENSES,
  'generate_financial_reports': PERMISSIONS.EXPORT_FINANCIAL_REPORTS,
  'export_data': PERMISSIONS.EXPORT_DATA,
  
  // Admin permissions
  'manage_users': PERMISSIONS.MANAGE_ALL_USERS,
  'manage_company_settings': PERMISSIONS.MANAGE_COMPANY_SETTINGS,
  'view_audit_logs': PERMISSIONS.VIEW_AUDIT_LOGS,
  'backup_restore': PERMISSIONS.BACKUP_RESTORE_DATA,
  
  // Client permissions  
  'client_portal_access': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
  'submit_feedback': PERMISSIONS.VIEW_ASSIGNED_PROJECTS,
  'approve_drawings_client': PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT
}

export interface UsePermissions {
  // Core bitwise permission data
  bitwisePermissions: number
  permissionNames: string[]
  
  // Basic permission checking functions
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  hasBitwisePermission: (bitwiseFlag: number) => boolean
  
  // Convenience flags (computed from bitwise)
  canViewCosts: boolean
  canEditCosts: boolean
  canViewAllProjects: boolean
  canViewAssignedProjects: boolean
  canManageUsers: boolean
  canManageProjects: boolean
  isAdmin: boolean
  
  // Data filtering based on bitwise permissions
  filterCosts: <T extends Record<string, any>>(data: T[], fields?: (keyof T)[]) => T[]
  
  // Project access (bitwise-based)
  canAccessProject: (projectId: string, userProjectIds?: string[]) => boolean
  
  // Role information (computed from bitwise permissions)
  roleDisplayName: string
  estimatedRole: string
  
  // Loading states
  loading: boolean
  isAuthenticated: boolean
  
  // Legacy compatibility
  permissions: string[]
}

export function usePermissions(): UsePermissions {
  const { 
    hasPermission: bitwiseHasPermission,
    hasAnyPermission: bitwiseHasAnyPermission, 
    hasAllPermissions: bitwiseHasAllPermissions,
    permissionNames,
    permissions: bitwisePermissions,
    loading,
    isAuthenticated,
    profile
  } = useAuthContext()

  // Get bitwise permissions from profile
  const userBitwisePermissions = profile?.permissions_bitwise || 0

  // Basic permission checking functions
  const hasPermission = (permission: Permission): boolean => {
    const bitwiseConstant = PERMISSION_MAPPING[permission]
    if (bitwiseConstant === undefined) {
      console.warn(`Unknown permission: ${permission}`)
      return false
    }
    return bitwiseHasPermission(bitwiseConstant)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    const bitwiseConstants = permissions
      .map(p => PERMISSION_MAPPING[p])
      .filter((val): val is number => typeof val === 'number')
    return bitwiseHasAnyPermission(bitwiseConstants)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    const bitwiseConstants = permissions
      .map(p => PERMISSION_MAPPING[p])
      .filter((val): val is number => typeof val === 'number')
    return bitwiseHasAllPermissions(bitwiseConstants)
  }

  const hasBitwisePermission = (bitwiseFlag: number): boolean => {
    return PermissionManager.hasPermission(userBitwisePermissions, bitwiseFlag)
  }

  // Computed convenience flags using bitwise operations
  const canViewCosts = PermissionManager.hasPermission(userBitwisePermissions, PERMISSIONS.VIEW_FINANCIAL_DATA)
  const canEditCosts = PermissionManager.hasPermission(userBitwisePermissions, PERMISSIONS.APPROVE_EXPENSES)
  const canViewAllProjects = PermissionManager.hasPermission(userBitwisePermissions, PERMISSIONS.VIEW_ALL_PROJECTS)
  const canViewAssignedProjects = PermissionManager.hasPermission(userBitwisePermissions, PERMISSIONS.VIEW_ASSIGNED_PROJECTS)
  const canManageUsers = PermissionManager.hasPermission(userBitwisePermissions, PERMISSIONS.MANAGE_ALL_USERS)
  const canManageProjects = PermissionManager.hasPermission(userBitwisePermissions, PERMISSIONS.MANAGE_ALL_PROJECTS)
  const isAdmin = canManageUsers // Admin defined by user management permission

  // Data filtering using bitwise permissions
  const filterCosts = <T extends Record<string, any>>(
    data: T[], 
    fields?: (keyof T)[]
  ): T[] => {
    return PermissionManager.filterFinancialData(data, userBitwisePermissions, fields)
  }

  // Project access based on bitwise permissions
  const canAccessProject = (projectId: string, userProjectIds?: string[]): boolean => {
    // Admin can access all projects
    if (canViewAllProjects) return true
    
    // Others need VIEW_ASSIGNED_PROJECTS and be assigned to the project
    if (!canViewAssignedProjects) return false
    
    return userProjectIds?.includes(projectId) ?? false
  }

  // Estimate role from bitwise permissions
  const estimatedRole = useMemo(() => {
    if (userBitwisePermissions === 268435455) return 'admin'
    if (userBitwisePermissions === 251658239) return 'technical_manager'
    if (userBitwisePermissions === 184549375) return 'project_manager'
    if (userBitwisePermissions === 4718594) return 'team_member'
    if (userBitwisePermissions === 34818) return 'client'
    return 'custom'
  }, [userBitwisePermissions])

  const roleDisplayName = useMemo(() => {
    switch (estimatedRole) {
      case 'admin': return 'Administrator'
      case 'technical_manager': return 'Technical Manager'
      case 'project_manager': return 'Project Manager'
      case 'team_member': return 'Team Member'
      case 'client': return 'Client'
      case 'custom': return 'Custom Role'
      default: return 'Unknown Role'
    }
  }, [estimatedRole])

  return {
    // Core bitwise permission data
    bitwisePermissions: userBitwisePermissions,
    permissionNames,
    
    // Basic permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasBitwisePermission,
    
    // Convenience flags
    canViewCosts,
    canEditCosts,
    canViewAllProjects,
    canViewAssignedProjects,
    canManageUsers,
    canManageProjects,
    isAdmin,
    
    // Data filtering
    filterCosts,
    
    // Project access
    canAccessProject,
    
    // Role information
    roleDisplayName,
    estimatedRole,
    
    // Loading states
    loading,
    isAuthenticated,
    
    // Legacy compatibility
    permissions: permissionNames
  }
}