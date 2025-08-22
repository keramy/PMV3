/**
 * Formula PM V3 - Role and Permission System Types
 * Simplified role-based access control with individual overrides
 */

export type UserRole = 'admin' | 'technical_manager' | 'project_manager' | 'team_member' | 'client'

export type ProjectAccessType = 'all' | 'assigned' | 'restricted'

export interface RoleConfiguration {
  id: string
  role_name: UserRole
  display_name: string
  permission_level: number
  default_can_view_costs: boolean
  default_can_edit_costs: boolean
  project_access_type: ProjectAccessType
  description?: string
  created_at: string
  updated_at: string
}

export interface UserPermissions {
  role: UserRole
  permission_level: number
  can_view_costs: boolean
  can_edit_costs: boolean
  project_access_type: ProjectAccessType
  assigned_projects: string[]
}

export interface EnhancedUserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  job_title?: string
  avatar_url?: string
  phone?: string
  is_active?: boolean
  last_login?: string
  created_at: string
  updated_at: string
  
  // Legacy permissions (for compatibility)
  permissions?: string[]
  
  // New permission system
  role: UserRole
  can_view_costs?: boolean | null
  assigned_projects?: string[]
  
  // Computed permissions (populated by helper functions)
  effective_permissions?: UserPermissions
}

// Role hierarchy levels for quick comparisons
export const ROLE_LEVELS = {
  client: 10,
  team_member: 30,
  project_manager: 60,
  technical_manager: 80,
  admin: 100,
} as const

// Default role configurations (matches database seeding)
export const DEFAULT_ROLES: Record<UserRole, Omit<RoleConfiguration, 'id' | 'created_at' | 'updated_at'>> = {
  admin: {
    role_name: 'admin',
    display_name: 'Administrator',
    permission_level: 100,
    default_can_view_costs: true,
    default_can_edit_costs: true,
    project_access_type: 'all',
    description: 'Full system access',
  },
  technical_manager: {
    role_name: 'technical_manager',
    display_name: 'Technical Manager',
    permission_level: 80,
    default_can_view_costs: true,
    default_can_edit_costs: true,
    project_access_type: 'all',
    description: 'Can view and edit costs for technical decisions',
  },
  project_manager: {
    role_name: 'project_manager',
    display_name: 'Project Manager',
    permission_level: 60,
    default_can_view_costs: true,
    default_can_edit_costs: false,
    project_access_type: 'assigned',
    description: 'Can view costs for budgeting and planning',
  },
  team_member: {
    role_name: 'team_member',
    display_name: 'Team Member',
    permission_level: 30,
    default_can_view_costs: false,
    default_can_edit_costs: false,
    project_access_type: 'assigned',
    description: 'Basic project access without cost visibility',
  },
  client: {
    role_name: 'client',
    display_name: 'Client',
    permission_level: 10,
    default_can_view_costs: false,
    default_can_edit_costs: false,
    project_access_type: 'restricted',
    description: 'Limited access to assigned projects only',
  },
}

// Permission flags for specific actions
export const PERMISSION_FLAGS = {
  VIEW_COSTS: 'view_costs',
  EDIT_COSTS: 'edit_costs',
  VIEW_ALL_PROJECTS: 'view_all_projects',
  MANAGE_USERS: 'manage_users',
  ADMIN_ACCESS: 'admin_access',
} as const

export type PermissionFlag = typeof PERMISSION_FLAGS[keyof typeof PERMISSION_FLAGS]