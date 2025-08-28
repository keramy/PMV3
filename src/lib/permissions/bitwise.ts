/**
 * Formula PM V3 - Bitwise Permission System
 * High-performance permission checking with construction-specific logic
 */

// ============================================================================
// PERMISSION CONSTANTS
// ============================================================================

export const PERMISSIONS = {
  // === PROJECT MANAGEMENT (bits 0-4) ===
  VIEW_ALL_PROJECTS: 1,           // 2^0 = 1 - Admin/PM can see all company projects
  VIEW_ASSIGNED_PROJECTS: 2,      // 2^1 = 2 - Can see projects user is assigned to  
  CREATE_PROJECTS: 4,             // 2^2 = 4 - PM+ can create new projects
  MANAGE_ALL_PROJECTS: 8,         // 2^3 = 8 - Can edit/delete any project
  ARCHIVE_PROJECTS: 16,           // 2^4 = 16 - Can archive completed projects

  // === FINANCIAL CONTROLS (bits 5-7) ===  
  VIEW_FINANCIAL_DATA: 32,        // 2^5 = 32 - Can see ALL costs, budgets, profit margins
  APPROVE_EXPENSES: 64,           // 2^6 = 64 - Can approve cost changes
  EXPORT_FINANCIAL_REPORTS: 128, // 2^7 = 128 - Can export financial data

  // === SCOPE & MATERIALS (bits 8-10) ===
  MANAGE_SCOPE: 256,              // 2^8 = 256 - Can create/edit scope items (PM+)
  APPROVE_SCOPE_CHANGES: 512,     // 2^9 = 512 - Can approve scope modifications (PM+)
  MANAGE_MATERIALS: 1024,         // 2^10 = 1024 - Can create/edit material specs (PM+)

  // === SHOP DRAWINGS (bits 11-15) ===
  VIEW_SHOP_DRAWINGS: 2048,           // 2^11 = 2048 - Can view shop drawings
  CREATE_SHOP_DRAWINGS: 4096,         // 2^12 = 4096 - Can upload/create shop drawings
  EDIT_SHOP_DRAWINGS: 8192,           // 2^13 = 8192 - Can edit shop drawings  
  APPROVE_SHOP_DRAWINGS: 16384,       // 2^14 = 16384 - Internal approval (PM/Tech Manager)
  APPROVE_SHOP_DRAWINGS_CLIENT: 32768, // 2^15 = 32768 - Client approval authority

  // === USER MANAGEMENT (bits 16-18) ===
  VIEW_ALL_USERS: 65536,          // 2^16 = 65536 - Can see all company users (PM+)
  MANAGE_TEAM_MEMBERS: 131072,    // 2^17 = 131072 - Can assign users to projects (PM+)  
  MANAGE_ALL_USERS: 262144,       // 2^18 = 262144 - Full user management (Admin only)

  // === TASKS & WORKFLOW (bits 19-21) ===
  CREATE_TASKS: 524288,           // 2^19 = 524288 - Can create tasks
  EDIT_TASKS: 1048576,            // 2^20 = 1048576 - Can edit tasks
  ASSIGN_TASKS: 2097152,          // 2^21 = 2097152 - Can assign tasks to users

  // === DATA MANAGEMENT (bits 22-24) ===
  EXPORT_DATA: 4194304,           // 2^22 = 4194304 - Can export Excel/CSV files
  IMPORT_DATA: 8388608,           // 2^23 = 8388608 - Can import Excel data  
  DELETE_DATA: 16777216,          // 2^24 = 16777216 - Can permanently delete records

  // === ADMIN FUNCTIONS (bits 25-27) ===
  VIEW_AUDIT_LOGS: 33554432,      // 2^25 = 33554432 - Can see system activity logs
  MANAGE_COMPANY_SETTINGS: 67108864, // 2^26 = 67108864 - Company-wide settings
  BACKUP_RESTORE_DATA: 134217728,    // 2^27 = 134217728 - Backup/restore system

  // === FUTURE EXPANSION (bits 28-63) ===
  // RFIs, Change Orders, Punch Items, Custom Fields, etc.
  // 36 bits available for future features
} as const;

// ============================================================================
// ROLE TEMPLATES
// ============================================================================

export const USER_ROLES = {
  // Full admin access - all 28 permissions = 268435455
  ADMIN: 268435455,

  // Technical Manager - all except admin functions and delete
  // PROJECT_MANAGER permissions + APPROVE_EXPENSES + APPROVE_SHOP_DRAWINGS
  TECHNICAL_MANAGER: 251658239,

  // Project Manager - most permissions except admin functions, delete, and expense approval  
  // Can manage projects, teams, view financials, approve scope/materials/drawings
  PROJECT_MANAGER: 184549375,

  // Team Member - basic work permissions, assigned project access
  // VIEW_ASSIGNED_PROJECTS + VIEW_SHOP_DRAWINGS + CREATE_TASKS + EXPORT_DATA
  TEAM_MEMBER: 4718594,

  // Client - very limited view access to assigned projects and drawings
  // VIEW_ASSIGNED_PROJECTS + VIEW_SHOP_DRAWINGS + APPROVE_SHOP_DRAWINGS_CLIENT  
  CLIENT: 34818,

  // Accountant - financial focus with view permissions
  // VIEW_ALL_PROJECTS + VIEW_FINANCIAL_DATA + EXPORT_FINANCIAL_REPORTS + EXPORT_DATA
  ACCOUNTANT: 4194465,
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type PermissionFlag = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type UserRole = keyof typeof USER_ROLES;

export interface Project {
  id: string;
  created_by: string;
  [key: string]: any;
}

// ============================================================================
// PERMISSION MANAGER CLASS
// ============================================================================

export class PermissionManager {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(userPerms: number | bigint, permission: number): boolean {
    const userPermsNum = typeof userPerms === 'bigint' ? Number(userPerms) : userPerms;
    return (userPermsNum & permission) !== 0;
  }

  /**
   * Check if user has ANY of the provided permissions
   */
  static hasAnyPermission(userPerms: number | bigint, permissions: number[]): boolean {
    return permissions.some(perm => this.hasPermission(userPerms, perm));
  }

  /**
   * Check if user has ALL provided permissions
   */
  static hasAllPermissions(userPerms: number | bigint, permissions: number[]): boolean {
    return permissions.every(perm => this.hasPermission(userPerms, perm));
  }

  /**
   * Check if user can manage a specific project (owns it OR has MANAGE_ALL_PROJECTS)
   */
  static canManageProject(userPerms: number | bigint, project: Project, userId: string): boolean {
    return project.created_by === userId || 
           this.hasPermission(userPerms, PERMISSIONS.MANAGE_ALL_PROJECTS);
  }

  /**
   * Check if user can approve shop drawings for a project
   */
  static canApproveShopDrawings(
    userPerms: number | bigint, 
    project: Project, 
    userId: string,
    isProjectApprover?: boolean
  ): boolean {
    // Must have appropriate approval permission
    const hasInternalApproval = this.hasPermission(userPerms, PERMISSIONS.APPROVE_SHOP_DRAWINGS);
    const hasClientApproval = this.hasPermission(userPerms, PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT);
    
    if (!hasInternalApproval && !hasClientApproval) {
      return false;
    }

    // Check if user is project owner OR has MANAGE_ALL_PROJECTS OR is project-specific approver
    return project.created_by === userId ||
           this.hasPermission(userPerms, PERMISSIONS.MANAGE_ALL_PROJECTS) ||
           isProjectApprover === true;
  }

  /**
   * Check financial data visibility (critical for client cost protection)
   */
  static canViewCosts(userPerms: number | bigint): boolean {
    return this.hasPermission(userPerms, PERMISSIONS.VIEW_FINANCIAL_DATA);
  }

  /**
   * Check if user can access a project (view permissions)
   */
  static canAccessProject(userPerms: number | bigint, project: Project, userId: string, isAssigned?: boolean): boolean {
    // Project owner can always access
    if (project.created_by === userId) return true;
    
    // Admin/PM can see all projects
    if (this.hasPermission(userPerms, PERMISSIONS.VIEW_ALL_PROJECTS)) return true;
    
    // Others need assigned project permission AND be assigned to the project
    return this.hasPermission(userPerms, PERMISSIONS.VIEW_ASSIGNED_PROJECTS) && 
           (isAssigned === true);
  }

  /**
   * Filter data based on financial permissions - CRITICAL for cost protection
   */
  static filterFinancialData<T extends Record<string, any>>(
    data: T[],
    userPerms: number | bigint,
    costFields: (keyof T)[] = ['unit_cost', 'total_cost', 'actual_cost', 'budget', 'cost', 'price']
  ): T[] {
    if (this.canViewCosts(userPerms)) {
      return data; // User can see costs - return full data
    }
    
    // Remove cost fields for users without financial permission
    return data.map(item => {
      const filtered = { ...item };
      costFields.forEach(field => {
        if (field in filtered) {
          delete filtered[field];
        }
      });
      return filtered;
    });
  }

  /**
   * Add permission to user (utility for admin functions)
   */
  static addPermission(userPerms: number | bigint, permission: number): number {
    const userPermsNum = typeof userPerms === 'bigint' ? Number(userPerms) : userPerms;
    return userPermsNum | permission;
  }

  /**
   * Remove permission from user (utility for admin functions)
   */
  static removePermission(userPerms: number | bigint, permission: number): number {
    const userPermsNum = typeof userPerms === 'bigint' ? Number(userPerms) : userPerms;
    return userPermsNum & ~permission;
  }

  /**
   * Get human-readable permission names for debugging
   */
  static getPermissionNames(userPerms: number | bigint): string[] {
    return Object.entries(PERMISSIONS)
      .filter(([name, value]) => this.hasPermission(userPerms, value))
      .map(([name]) => name.toLowerCase().replace(/_/g, ' '));
  }

  /**
   * Validate permission value is within valid range
   */
  static isValidPermissionValue(perms: number | bigint): boolean {
    const permsNum = typeof perms === 'bigint' ? Number(perms) : perms;
    return permsNum >= 0 && permsNum <= 268435455; // Max value for 28 bits
  }

  /**
   * Get role name from permission value
   */
  static getRoleFromPermissions(perms: number | bigint): UserRole | null {
    const permsNum = typeof perms === 'bigint' ? Number(perms) : perms;
    
    for (const [role, value] of Object.entries(USER_ROLES)) {
      if (value === permsNum) {
        return role as UserRole;
      }
    }
    
    return null; // Custom permission set
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick permission check function for common use cases
 */
export function hasPermission(userPerms: number | bigint, permission: number): boolean {
  return PermissionManager.hasPermission(userPerms, permission);
}

/**
 * Quick cost visibility check
 */
export function canViewCosts(userPerms: number | bigint): boolean {
  return PermissionManager.canViewCosts(userPerms);
}

/**
 * Quick admin check
 */
export function isAdmin(userPerms: number | bigint): boolean {
  return PermissionManager.hasPermission(userPerms, PERMISSIONS.MANAGE_ALL_USERS);
}

/**
 * Quick project management check
 */
export function canManageProject(userPerms: number | bigint, project: Project, userId: string): boolean {
  return PermissionManager.canManageProject(userPerms, project, userId);
}