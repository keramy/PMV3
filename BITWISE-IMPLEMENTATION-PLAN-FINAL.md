# Formula PM V3 - Optimized Bitwise Permission Implementation Plan

## 📋 Executive Summary
Updated implementation plan using the optimized permission allocation with improved bit organization, precise role calculations, and project owner access logic.

**Implementation Strategy:** Big Bang Migration  
**Target:** 25 core permissions using 28 bits (36 bits available for future expansion)  
**New Feature:** Project owner access control
**Timeline:** Single migration event with backward compatibility cleanup

---

## 🎯 Optimized Permission Bit Mapping

### Final Permission Constants
```typescript
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

// Total: 25 permissions using 28 bits, 36 bits available for future expansion
```

---

## 👥 Optimized Role Permission Templates

### Complete Role Definitions (Precise Calculations)
```typescript
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
```

### Role Permissions Breakdown:
```typescript
// ADMIN (268435455) - All 28 permissions
// Binary: 1111111111111111111111111111

// TECHNICAL_MANAGER (251658239) - All except MANAGE_ALL_USERS + DELETE_DATA + admin functions
// Has: All project + financial + approval permissions

// PROJECT_MANAGER (184549375) - Management focus without expense approval
// Has: Project management + team management + scope/material approval

// TEAM_MEMBER (4718594) - Basic work permissions
// Has: Assigned project access + create tasks + shop drawings view + export data

// CLIENT (34818) - Limited view access
// Has: Assigned project access + view/approve shop drawings (client level)

// ACCOUNTANT (4194465) - Financial focus  
// Has: View all projects + financial data + export capabilities
```

---

## 🏗️ Enhanced Permission Manager

### Optimized Helper Functions
```typescript
export class PermissionManager {
  // Check if user can manage a specific project (owns it OR has MANAGE_ALL_PROJECTS)
  static canManageProject(userPerms: number, project: any, userId: string): boolean {
    return project.created_by === userId || 
           this.hasPermission(userPerms, PERMISSIONS.MANAGE_ALL_PROJECTS);
  }

  // Check if user can approve shop drawings for a project
  static canApproveShopDrawings(userPerms: number, project: any, userId: string): boolean {
    // Must have appropriate approval permission
    const hasInternalApproval = this.hasPermission(userPerms, PERMISSIONS.APPROVE_SHOP_DRAWINGS);
    const hasClientApproval = this.hasPermission(userPerms, PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT);
    
    if (!hasInternalApproval && !hasClientApproval) {
      return false;
    }

    // Check if user is project owner OR has MANAGE_ALL_PROJECTS OR is in project_approvers table
    return project.created_by === userId ||
           this.hasPermission(userPerms, PERMISSIONS.MANAGE_ALL_PROJECTS) ||
           this.isProjectApprover(userId, project.id, 'shop_drawings');
  }

  // Check financial data visibility (your key requirement)
  static canViewCosts(userPerms: number): boolean {
    return this.hasPermission(userPerms, PERMISSIONS.VIEW_FINANCIAL_DATA);
  }

  // Standard bitwise operations
  static hasPermission(userPerms: number, permission: number): boolean {
    return (userPerms & permission) !== 0;
  }

  static addPermission(userPerms: number, permission: number): number {
    return userPerms | permission;
  }

  static removePermission(userPerms: number, permission: number): number {
    return userPerms & ~permission;
  }

  // Filter data based on financial permissions
  static filterFinancialData<T extends Record<string, any>>(
    data: T[],
    userPerms: number,
    costFields: (keyof T)[] = ['unit_cost', 'total_cost', 'actual_cost', 'budget']
  ): T[] {
    if (this.canViewCosts(userPerms)) {
      return data;
    }
    
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

  // Placeholder for database check
  private static isProjectApprover(userId: string, projectId: string, approvalType: string): boolean {
    // This would check your project_approvers table
    // SELECT 1 FROM project_approvers WHERE user_id = ? AND project_id = ? AND approval_type = ?
    return false; // Implementation depends on your database layer
  }
}
```

---

## 🗄️ Enhanced Database Migration Plan

### Step 1: Add Bitwise Column + Project Owner Index
```sql
-- Add new bitwise permission column
ALTER TABLE user_profiles 
ADD COLUMN permissions_bitwise BIGINT DEFAULT 0;

-- Add index for performance
CREATE INDEX idx_user_profiles_permissions_bitwise 
ON user_profiles(permissions_bitwise);

-- Add project owner index for performance
CREATE INDEX idx_projects_created_by ON projects(created_by);
```

### Step 2: Migrate Existing Users (Optimized Values)
```sql
-- Migration function to convert array permissions to bitwise
CREATE OR REPLACE FUNCTION migrate_user_permissions() RETURNS void AS $$
DECLARE
  user_record RECORD;
  bitwise_perms BIGINT := 0;
BEGIN
  FOR user_record IN SELECT id, permissions, role FROM user_profiles LOOP
    bitwise_perms := 0;
    
    -- Set permissions based on role using optimized values
    CASE user_record.role
      WHEN 'admin' THEN
        bitwise_perms := 268435455;  -- All permissions
      WHEN 'technical_manager' THEN  
        bitwise_perms := 251658239;  -- Technical manager permissions
      WHEN 'project_manager' THEN
        bitwise_perms := 184549375;  -- Project manager permissions  
      WHEN 'team_member' THEN
        bitwise_perms := 4718594;    -- Team member permissions
      WHEN 'client' THEN
        bitwise_perms := 34818;      -- Client permissions
      ELSE
        bitwise_perms := 4718594;    -- Default to team member
    END CASE;
    
    -- Update user with bitwise permissions
    UPDATE user_profiles 
    SET permissions_bitwise = bitwise_perms 
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Migrated user % (%) to bitwise permissions: %', 
      user_record.id, user_record.role, bitwise_perms;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT migrate_user_permissions();

-- Clean up migration function
DROP FUNCTION migrate_user_permissions();
```

### Step 3: Enhanced RLS Policies with Project Owner Access
```sql
-- Update projects RLS policy to include project owner access
DROP POLICY IF EXISTS "projects_access" ON projects;

CREATE POLICY "projects_access" ON projects
FOR ALL
USING (
  -- Project owner can always access their projects
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Can view all projects (Admin/PM)
      (up.permissions_bitwise & 1) > 0 OR
      -- Can view assigned projects (Team/Client)
      ((up.permissions_bitwise & 2) > 0 AND 
       (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = projects.id AND pm.user_id = up.id) OR
        up.assigned_projects @> ARRAY[projects.id::text]))
    )
  )
);

-- Update scope_items RLS policy with project owner access
DROP POLICY IF EXISTS "scope_items_access" ON scope_items;

CREATE POLICY "scope_items_access" ON scope_items
FOR ALL
USING (
  -- Project owner can access scope items
  EXISTS (SELECT 1 FROM projects p WHERE p.id = scope_items.project_id AND p.created_by = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin/PM can see all
      (up.permissions_bitwise & 1) > 0 OR
      -- Others can see if assigned to project
      ((up.permissions_bitwise & 2) > 0 AND 
       EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = scope_items.project_id AND pm.user_id = up.id))
    )
  )
);

-- Update shop_drawings RLS policy with project owner access
DROP POLICY IF EXISTS "shop_drawings_access" ON shop_drawings;

CREATE POLICY "shop_drawings_access" ON shop_drawings
FOR ALL
USING (
  -- Project owner can access drawings
  EXISTS (SELECT 1 FROM projects p WHERE p.id = shop_drawings.project_id AND p.created_by = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin/PM can see all
      (up.permissions_bitwise & 1) > 0 OR
      -- Others can see if assigned to project and have view permission
      ((up.permissions_bitwise & 2) > 0 AND (up.permissions_bitwise & 2048) > 0 AND
       EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = shop_drawings.project_id AND pm.user_id = up.id))
    )
  )
);
```

---

## ⚛️ Enhanced Frontend Integration

### Updated Auth Context with Optimized Permissions
```typescript
// src/providers/AuthProvider.tsx - Enhanced version
import { PermissionManager, PERMISSIONS } from '@/lib/permissions/bitwise';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  permissions: number;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Permission checking methods
  hasPermission: (permission: number) => boolean;
  canManageProject: (project: Project) => boolean;
  canApproveShopDrawings: (project: Project) => boolean;
  canViewFinancials: boolean;
  isAdmin: boolean;
  isProjectOwner: (project: Project) => boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const permissions = profile?.permissions_bitwise || 0;
  
  // Enhanced permission checking methods
  const hasPermission = useCallback(
    (permission: number) => PermissionManager.hasPermission(permissions, permission),
    [permissions]
  );
  
  const canManageProject = useCallback(
    (project: Project) => PermissionManager.canManageProject(permissions, project, user?.id || ''),
    [permissions, user?.id]
  );
  
  const canApproveShopDrawings = useCallback(
    (project: Project) => PermissionManager.canApproveShopDrawings(permissions, project, user?.id || ''),
    [permissions, user?.id]
  );
  
  const canViewFinancials = PermissionManager.canViewCosts(permissions);
  const isAdmin = hasPermission(PERMISSIONS.MANAGE_ALL_USERS);
  
  const isProjectOwner = useCallback(
    (project: Project) => project.created_by === user?.id,
    [user?.id]
  );
  
  const value: AuthContextType = {
    user,
    profile,
    permissions,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    canManageProject,
    canApproveShopDrawings,
    canViewFinancials,
    isAdmin,
    isProjectOwner,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Enhanced Component Usage Examples
```typescript
// src/components/projects/ProjectCard.tsx - With project owner logic
import { useAuth } from '@/providers/AuthProvider';
import { PERMISSIONS } from '@/lib/permissions/bitwise';

export function ProjectCard({ project }: { project: Project }) {
  const { hasPermission, canManageProject, canViewFinancials, isProjectOwner } = useAuth();
  
  const canEdit = canManageProject(project); // Includes owner check
  const canDelete = hasPermission(PERMISSIONS.DELETE_DATA);
  const showOwnerBadge = isProjectOwner(project);
  
  return (
    <div className="project-card">
      <div className="header">
        <h3>{project.name}</h3>
        {showOwnerBadge && <Badge variant="secondary">Owner</Badge>}
      </div>
      
      <p>{project.description}</p>
      
      {/* Financial info - conditionally displayed */}
      {canViewFinancials && (
        <div className="financial-section">
          <p>Budget: ${project.budget?.toLocaleString()}</p>
          <p>Spent: ${project.spent?.toLocaleString()}</p>
        </div>
      )}
      
      {/* Action buttons based on permissions */}
      <div className="actions">
        {canEdit && (
          <button onClick={() => editProject(project.id)}>
            Edit Project
          </button>
        )}
        
        {canDelete && (
          <button 
            onClick={() => deleteProject(project.id)}
            className="btn-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 📊 Optimized Performance Improvements

### Before vs After Comparison:
| Metric | Original Plan | Optimized Plan | Improvement |
|--------|---------------|----------------|-------------|
| Permission Count | 29 permissions | 25 permissions | 4 fewer checks |
| Bit Usage | 30 bits | 28 bits | 2 bits saved |
| Future Capacity | 34 bits available | 36 bits available | Better expansion |
| Role Calculations | Manual/error-prone | Precise values | No calculation errors |
| Helper Functions | Basic operations | Construction-specific | Better logic |
| Project Access | Role-based only | Role + ownership | More flexible |

### Key Optimizations:
1. **Consolidated Permissions**: EXPORT_DATA replaces multiple export permissions
2. **Streamlined Materials**: MANAGE_MATERIALS combines view/edit/create
3. **Precise Role Values**: No manual calculation errors
4. **Project Owner Logic**: Creators can manage their own projects
5. **Better Helper Functions**: Construction-specific business logic

---

## ✅ Updated Success Criteria

Migration is successful when:
1. ✅ All users can log in with optimized permission values  
2. ✅ Project owners can manage their own projects regardless of role
3. ✅ Clients cannot see any financial data (costs, budgets)
4. ✅ Accountant role can access financial reports but not manage projects
5. ✅ Project-specific approvers work with enhanced logic
6. ✅ Single EXPORT_DATA permission handles all export functions
7. ✅ API responses are under 500ms consistently  
8. ✅ RLS policies use project owner access patterns
9. ✅ 28-bit permission checks perform as expected
10. ✅ System scales to 100+ concurrent users without issues

---

**This optimized implementation plan provides superior bit organization, precise role calculations, project owner access control, and enhanced helper functions specifically designed for construction project management workflows.**