# Formula PM V3 - Complete Bitwise Permission Implementation Plan

## 📋 Executive Summary
This document provides the complete implementation plan for migrating Formula PM V3 from array-based permissions to a high-performance bitwise permission system. This migration will eliminate all permission conflicts, resolve RLS recursion issues, and provide scalable permission management.

**Implementation Strategy:** Big Bang Migration  
**Target:** 23 core permissions using 19 bits (45 bits available for future expansion)  
**Timeline:** Single migration event with backward compatibility cleanup

---

## 🎯 Complete Permission Bit Mapping

### Final Permission Constants
```typescript
export const PERMISSIONS = {
  // Project Management (bits 0-4)
  VIEW_ALL_PROJECTS: 1,              // Admin/PM can see all company projects  
  VIEW_ASSIGNED_PROJECTS: 2,         // Can see projects user is assigned to
  CREATE_PROJECTS: 4,                // PM+ can create new projects  
  MANAGE_ALL_PROJECTS: 8,            // Can edit/delete any project
  ARCHIVE_PROJECTS: 16,              // Can archive completed projects
  
  // Financial Controls (bits 5-7)
  VIEW_FINANCIAL_DATA: 32,           // Can see ALL costs, budgets, profit margins  
  APPROVE_EXPENSES: 64,              // Can approve cost changes
  EXPORT_FINANCIAL_REPORTS: 128,    // Can export financial data
  
  // Scope & Materials Management (bits 8-12)
  MANAGE_SCOPE: 256,                 // Can create/edit scope items (PM+)
  APPROVE_SCOPE_CHANGES: 512,        // Can approve scope modifications (PM+)  
  EXPORT_SCOPE_EXCEL: 1024,          // Can export scope to Excel (everyone)
  VIEW_MATERIALS: 2048,              // Can view material specifications (everyone)
  MANAGE_MATERIALS: 4096,            // Can create/edit material specs (PM+)
  APPROVE_MATERIALS: 8192,           // Can approve material specifications (PM+)
  
  // Shop Drawings (bits 13-17) 
  VIEW_SHOP_DRAWINGS: 16384,         // Can view shop drawings
  CREATE_SHOP_DRAWINGS: 32768,       // Can upload/create shop drawings  
  EDIT_SHOP_DRAWINGS: 65536,         // Can edit shop drawings
  APPROVE_SHOP_DRAWINGS: 131072,     // Internal approval (PM/Tech Manager)
  APPROVE_SHOP_DRAWINGS_CLIENT: 262144, // Client approval authority
  
  // Task Management (bits 18-20)
  CREATE_TASKS: 524288,              // Can create tasks
  EDIT_TASKS: 1048576,               // Can edit tasks
  ASSIGN_TASKS: 2097152,             // Can assign tasks to users
  
  // User Management (bits 21-23)
  VIEW_ALL_USERS: 4194304,           // Can see all company users (PM+)
  MANAGE_TEAM_MEMBERS: 8388608,      // Can assign users to projects (PM+)
  MANAGE_ALL_USERS: 16777216,        // Full user management (Admin only)
  
  // Admin Functions (bits 24-28)  
  VIEW_AUDIT_LOGS: 33554432,         // Can see system activity logs (Admin)
  MANAGE_COMPANY_SETTINGS: 67108864, // Company-wide settings (Admin)
  BACKUP_RESTORE_DATA: 134217728,    // Backup/restore system (Admin)
  EXPORT_DATA: 268435456,            // Can export data (PM+)
  IMPORT_DATA: 536870912,            // Can import data (PM+)
  DELETE_DATA: 1073741824,           // Can permanently delete records (Admin)
} as const;

// Total: 29 permissions using 30 bits, 34 bits available for future expansion
```

---

## 👥 Role Permission Templates

### Complete Role Definitions
```typescript
export const USER_ROLES = {
  // CLIENT - Very limited access, project-specific
  CLIENT: 
    PERMISSIONS.VIEW_ASSIGNED_PROJECTS |      // 2
    PERMISSIONS.EXPORT_SCOPE_EXCEL |          // 1024  
    PERMISSIONS.VIEW_MATERIALS |              // 2048
    PERMISSIONS.VIEW_SHOP_DRAWINGS |          // 16384
    PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT, // 262144
  // Total CLIENT: 281602
  
  // TEAM_MEMBER - Basic project work permissions
  TEAM_MEMBER:
    PERMISSIONS.VIEW_ASSIGNED_PROJECTS |      // 2
    PERMISSIONS.EXPORT_SCOPE_EXCEL |          // 1024
    PERMISSIONS.VIEW_MATERIALS |              // 2048
    PERMISSIONS.VIEW_SHOP_DRAWINGS |          // 16384
    PERMISSIONS.CREATE_SHOP_DRAWINGS |        // 32768
    PERMISSIONS.EDIT_SHOP_DRAWINGS |          // 65536
    PERMISSIONS.CREATE_TASKS |                // 524288
    PERMISSIONS.EDIT_TASKS,                   // 1048576
  // Total TEAM_MEMBER: 1690626
  
  // PROJECT_MANAGER - Project oversight and management
  PROJECT_MANAGER:
    PERMISSIONS.VIEW_ALL_PROJECTS |           // 1
    PERMISSIONS.VIEW_ASSIGNED_PROJECTS |      // 2
    PERMISSIONS.CREATE_PROJECTS |             // 4
    PERMISSIONS.MANAGE_ALL_PROJECTS |         // 8
    PERMISSIONS.VIEW_FINANCIAL_DATA |         // 32
    PERMISSIONS.MANAGE_SCOPE |                // 256
    PERMISSIONS.APPROVE_SCOPE_CHANGES |       // 512
    PERMISSIONS.EXPORT_SCOPE_EXCEL |          // 1024
    PERMISSIONS.VIEW_MATERIALS |              // 2048
    PERMISSIONS.MANAGE_MATERIALS |            // 4096
    PERMISSIONS.APPROVE_MATERIALS |           // 8192
    PERMISSIONS.VIEW_SHOP_DRAWINGS |          // 16384
    PERMISSIONS.CREATE_SHOP_DRAWINGS |        // 32768
    PERMISSIONS.EDIT_SHOP_DRAWINGS |          // 65536
    PERMISSIONS.APPROVE_SHOP_DRAWINGS |       // 131072
    PERMISSIONS.CREATE_TASKS |                // 524288
    PERMISSIONS.EDIT_TASKS |                  // 1048576
    PERMISSIONS.ASSIGN_TASKS |                // 2097152
    PERMISSIONS.VIEW_ALL_USERS |              // 4194304
    PERMISSIONS.MANAGE_TEAM_MEMBERS |         // 8388608
    PERMISSIONS.EXPORT_DATA |                 // 268435456
    PERMISSIONS.IMPORT_DATA,                  // 536870912
  // Total PROJECT_MANAGER: 818282495
  
  // TECHNICAL_MANAGER - Technical decisions and cost approvals
  TECHNICAL_MANAGER:
    PERMISSIONS.VIEW_ALL_PROJECTS |           // 1
    PERMISSIONS.VIEW_ASSIGNED_PROJECTS |      // 2
    PERMISSIONS.CREATE_PROJECTS |             // 4
    PERMISSIONS.MANAGE_ALL_PROJECTS |         // 8
    PERMISSIONS.ARCHIVE_PROJECTS |            // 16
    PERMISSIONS.VIEW_FINANCIAL_DATA |         // 32
    PERMISSIONS.APPROVE_EXPENSES |            // 64
    PERMISSIONS.EXPORT_FINANCIAL_REPORTS |    // 128
    PERMISSIONS.MANAGE_SCOPE |                // 256
    PERMISSIONS.APPROVE_SCOPE_CHANGES |       // 512
    PERMISSIONS.EXPORT_SCOPE_EXCEL |          // 1024
    PERMISSIONS.VIEW_MATERIALS |              // 2048
    PERMISSIONS.MANAGE_MATERIALS |            // 4096
    PERMISSIONS.APPROVE_MATERIALS |           // 8192
    PERMISSIONS.VIEW_SHOP_DRAWINGS |          // 16384
    PERMISSIONS.CREATE_SHOP_DRAWINGS |        // 32768
    PERMISSIONS.EDIT_SHOP_DRAWINGS |          // 65536
    PERMISSIONS.APPROVE_SHOP_DRAWINGS |       // 131072
    PERMISSIONS.CREATE_TASKS |                // 524288
    PERMISSIONS.EDIT_TASKS |                  // 1048576
    PERMISSIONS.ASSIGN_TASKS |                // 2097152
    PERMISSIONS.VIEW_ALL_USERS |              // 4194304
    PERMISSIONS.MANAGE_TEAM_MEMBERS |         // 8388608
    PERMISSIONS.EXPORT_DATA |                 // 268435456
    PERMISSIONS.IMPORT_DATA,                  // 536870912
  // Total TECHNICAL_MANAGER: 818282703
  
  // ADMIN - Full system access
  ADMIN: 2147483647, // All bits set (2^31 - 1)
} as const;
```

---

## 🗄️ Database Migration Plan

### Step 1: Add Bitwise Column
```sql
-- Add new bitwise permission column
ALTER TABLE user_profiles 
ADD COLUMN permissions_bitwise BIGINT DEFAULT 0;

-- Add index for performance
CREATE INDEX idx_user_profiles_permissions_bitwise 
ON user_profiles(permissions_bitwise);
```

### Step 2: Migrate Existing Users
```sql
-- Migration function to convert array permissions to bitwise
CREATE OR REPLACE FUNCTION migrate_user_permissions() RETURNS void AS $$
DECLARE
  user_record RECORD;
  bitwise_perms BIGINT := 0;
  perm TEXT;
BEGIN
  FOR user_record IN SELECT id, permissions, role FROM user_profiles LOOP
    bitwise_perms := 0;
    
    -- Set permissions based on role
    CASE user_record.role
      WHEN 'admin' THEN
        bitwise_perms := 2147483647; -- All permissions
      WHEN 'technical_manager' THEN  
        bitwise_perms := 818282703;  -- Technical manager permissions
      WHEN 'project_manager' THEN
        bitwise_perms := 818282495;  -- Project manager permissions  
      WHEN 'team_member' THEN
        bitwise_perms := 1690626;    -- Team member permissions
      WHEN 'client' THEN
        bitwise_perms := 281602;     -- Client permissions
      ELSE
        bitwise_perms := 1690626;    -- Default to team member
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

### Step 3: Create Project Approvers Table
```sql
-- Create project-specific approver assignments
CREATE TABLE project_approvers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE, 
  approval_type TEXT NOT NULL CHECK (approval_type IN ('shop_drawings', 'material_specs', 'scope_changes')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  
  -- Prevent duplicate assignments
  UNIQUE(project_id, user_id, approval_type)
);

-- Add indexes for performance
CREATE INDEX idx_project_approvers_project_id ON project_approvers(project_id);
CREATE INDEX idx_project_approvers_user_id ON project_approvers(user_id);
CREATE INDEX idx_project_approvers_type ON project_approvers(approval_type);

-- Add RLS policy for project approvers
ALTER TABLE project_approvers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_approvers_access" ON project_approvers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin can see all
      (up.permissions_bitwise & 16777216) > 0 OR
      -- Project managers can see their projects
      ((up.permissions_bitwise & 8) > 0 AND 
       EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = project_approvers.project_id AND pm.user_id = up.id)) OR
      -- Users can see their own assignments
      project_approvers.user_id = up.id
    )
  )
);
```

### Step 4: Update RLS Policies
```sql
-- Example: Update projects RLS policy to use bitwise permissions
DROP POLICY IF EXISTS "projects_access" ON projects;

CREATE POLICY "projects_access" ON projects
FOR ALL
USING (
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

-- Example: Update scope_items RLS policy 
DROP POLICY IF EXISTS "scope_items_access" ON scope_items;

CREATE POLICY "scope_items_access" ON scope_items
FOR ALL
USING (
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
```

### Step 5: Remove Old Permission System
```sql
-- After migration is confirmed working, remove old columns
-- ALTER TABLE user_profiles DROP COLUMN permissions;
-- ALTER TABLE user_profiles DROP COLUMN can_view_costs;  
-- ALTER TABLE user_profiles DROP COLUMN assigned_projects;

-- Note: Keep these for rollback safety during initial deployment
```

---

## ⚛️ Frontend Integration

### Permission Helper Functions
```typescript
// src/lib/permissions/bitwise.ts
export class BitwisePermissionManager {
  // Check if user has specific permission
  static hasPermission(userPerms: number | bigint, permission: number): boolean {
    const userPermsNum = typeof userPerms === 'bigint' ? Number(userPerms) : userPerms;
    return (userPermsNum & permission) !== 0;
  }
  
  // Check if user has ANY of the provided permissions
  static hasAnyPermission(userPerms: number | bigint, permissions: number[]): boolean {
    return permissions.some(perm => this.hasPermission(userPerms, perm));
  }
  
  // Check if user has ALL provided permissions
  static hasAllPermissions(userPerms: number | bigint, permissions: number[]): boolean {
    return permissions.every(perm => this.hasPermission(userPerms, perm));
  }
  
  // Get human-readable permission names
  static getPermissionNames(userPerms: number | bigint): string[] {
    return Object.entries(PERMISSIONS)
      .filter(([name, value]) => this.hasPermission(userPerms, value))
      .map(([name]) => name.toLowerCase().replace(/_/g, ' '));
  }
  
  // Filter data based on financial permissions
  static filterFinancialData<T extends Record<string, any>>(
    data: T[],
    userPerms: number | bigint,
    costFields: (keyof T)[] = ['unit_cost', 'total_cost', 'actual_cost', 'budget']
  ): T[] {
    if (this.hasPermission(userPerms, PERMISSIONS.VIEW_FINANCIAL_DATA)) {
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
}
```

### Updated Auth Context
```typescript
// src/providers/AuthProvider.tsx - Updated portion
import { BitwisePermissionManager, PERMISSIONS } from '@/lib/permissions/bitwise';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  permissions: number;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Permission checking methods
  hasPermission: (permission: number) => boolean;
  hasAnyPermission: (permissions: number[]) => boolean;
  hasAllPermissions: (permissions: number[]) => boolean;
  canViewFinancials: boolean;
  canManageProjects: boolean;
  isAdmin: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const permissions = profile?.permissions_bitwise || 0;
  
  // Permission checking methods
  const hasPermission = useCallback(
    (permission: number) => BitwisePermissionManager.hasPermission(permissions, permission),
    [permissions]
  );
  
  const hasAnyPermission = useCallback(
    (perms: number[]) => BitwisePermissionManager.hasAnyPermission(permissions, perms),
    [permissions]
  );
  
  const hasAllPermissions = useCallback(
    (perms: number[]) => BitwisePermissionManager.hasAllPermissions(permissions, perms),
    [permissions]
  );
  
  // Computed permission flags
  const canViewFinancials = hasPermission(PERMISSIONS.VIEW_FINANCIAL_DATA);
  const canManageProjects = hasPermission(PERMISSIONS.MANAGE_ALL_PROJECTS);
  const isAdmin = hasPermission(PERMISSIONS.MANAGE_ALL_USERS);
  
  const value: AuthContextType = {
    user,
    profile,
    permissions,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    hasAnyPermission, 
    hasAllPermissions,
    canViewFinancials,
    canManageProjects,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Component Usage Examples
```typescript
// src/components/projects/ProjectCard.tsx
import { useAuth } from '@/providers/AuthProvider';
import { PERMISSIONS } from '@/lib/permissions/bitwise';

export function ProjectCard({ project }: { project: Project }) {
  const { hasPermission, canViewFinancials } = useAuth();
  
  const canEdit = hasPermission(PERMISSIONS.MANAGE_ALL_PROJECTS);
  const canDelete = hasPermission(PERMISSIONS.DELETE_DATA);
  
  return (
    <div className="project-card">
      <h3>{project.name}</h3>
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

## 🛡️ API Route Protection

### Middleware Update
```typescript
// src/lib/api/middleware.ts
import { BitwisePermissionManager } from '@/lib/permissions/bitwise';

export function requirePermissions(permissions: number | number[]) {
  return async (req: NextRequest, res: NextResponse) => {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userPerms = user.permissions_bitwise || 0;
    const requiredPerms = Array.isArray(permissions) ? permissions : [permissions];
    
    const hasPermission = BitwisePermissionManager.hasAnyPermission(userPerms, requiredPerms);
    
    if (!hasPermission) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required: requiredPerms,
          userPermissions: BitwisePermissionManager.getPermissionNames(userPerms)
        }, 
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}
```

### API Route Examples
```typescript
// src/app/api/projects/route.ts
import { requirePermissions } from '@/lib/api/middleware';
import { PERMISSIONS } from '@/lib/permissions/bitwise';

export const GET = requirePermissions([
  PERMISSIONS.VIEW_ALL_PROJECTS,
  PERMISSIONS.VIEW_ASSIGNED_PROJECTS
])(async (req) => {
  // Get projects logic
});

export const POST = requirePermissions(PERMISSIONS.CREATE_PROJECTS)(async (req) => {
  // Create project logic
});

// src/app/api/scope/[id]/route.ts  
export const PUT = requirePermissions(PERMISSIONS.MANAGE_SCOPE)(async (req, { params }) => {
  // Update scope item logic
});

// src/app/api/financial/reports/route.ts
export const GET = requirePermissions(PERMISSIONS.VIEW_FINANCIAL_DATA)(async (req) => {
  // Financial data logic
});
```

---

## 🎯 Special Logic Implementation

### Project-Specific Approvers
```typescript
// src/lib/permissions/approvers.ts
export async function canApproveForProject(
  userId: string, 
  projectId: string, 
  approvalType: 'shop_drawings' | 'material_specs' | 'scope_changes'
): Promise<boolean> {
  const supabase = createClient();
  
  // Get user permissions
  const { data: user } = await supabase
    .from('user_profiles')
    .select('permissions_bitwise')
    .eq('id', userId)
    .single();
    
  if (!user) return false;
  
  // Check base permission first
  const hasBasePermission = (() => {
    switch (approvalType) {
      case 'shop_drawings':
        return (user.permissions_bitwise & PERMISSIONS.APPROVE_SHOP_DRAWINGS) > 0 ||
               (user.permissions_bitwise & PERMISSIONS.APPROVE_SHOP_DRAWINGS_CLIENT) > 0;
      case 'material_specs':
        return (user.permissions_bitwise & PERMISSIONS.APPROVE_MATERIALS) > 0;
      case 'scope_changes':
        return (user.permissions_bitwise & PERMISSIONS.APPROVE_SCOPE_CHANGES) > 0;
      default:
        return false;
    }
  })();
  
  if (!hasBasePermission) return false;
  
  // Admin can approve anything
  if ((user.permissions_bitwise & PERMISSIONS.MANAGE_ALL_USERS) > 0) return true;
  
  // Check project-specific assignment
  const { data: assignment } = await supabase
    .from('project_approvers')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)  
    .eq('approval_type', approvalType)
    .single();
    
  return !!assignment;
}
```

### Cost Data Filtering
```typescript
// src/lib/data/filters.ts
export function filterScopeItems(scopeItems: ScopeItem[], userPermissions: number): ScopeItem[] {
  const canViewCosts = (userPermissions & PERMISSIONS.VIEW_FINANCIAL_DATA) > 0;
  
  if (canViewCosts) {
    return scopeItems; // Return full data
  }
  
  // Remove cost fields for users without financial permission
  return scopeItems.map(item => ({
    ...item,
    unit_cost: undefined,
    total_cost: undefined,
    actual_cost: undefined,
    budget: undefined,
  }));
}

export function filterProjectData(project: Project, userPermissions: number): Project {
  const canViewCosts = (userPermissions & PERMISSIONS.VIEW_FINANCIAL_DATA) > 0;
  
  if (canViewCosts) {
    return project;
  }
  
  return {
    ...project,
    budget: undefined,
    spent: undefined,
    remaining_budget: undefined,
    profit_margin: undefined,
  };
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Database Migration
- [ ] Run SQL migration to add permissions_bitwise column
- [ ] Execute user permission migration function  
- [ ] Create project_approvers table
- [ ] Update RLS policies to use bitwise checks
- [ ] Test database queries for performance

### Phase 2: Backend Updates  
- [ ] Add bitwise permission constants
- [ ] Update API middleware for permission checking
- [ ] Modify API routes to use bitwise permissions
- [ ] Implement project-specific approver logic
- [ ] Add data filtering functions

### Phase 3: Frontend Integration
- [ ] Update AuthProvider with bitwise permission methods
- [ ] Replace all component permission checks with bitwise
- [ ] Update all hasPermission calls in components  
- [ ] Implement cost data filtering in UI
- [ ] Test permission-based component rendering

### Phase 4: Testing & Cleanup
- [ ] Test all user roles and permissions
- [ ] Verify financial data is properly hidden from clients
- [ ] Test project-specific approver assignments
- [ ] Performance test permission checks vs old system
- [ ] Remove old permission arrays and logic

### Phase 5: Rollback Safety
- [ ] Keep old permission columns during initial deployment
- [ ] Monitor system for 1 week post-deployment
- [ ] Create rollback script if needed
- [ ] After stability confirmed, drop old permission columns

---

## 🔧 Migration Rollback Plan

In case rollback is needed:

```sql
-- Emergency rollback: restore array-based permissions
UPDATE user_profiles SET permissions = 
  CASE role
    WHEN 'admin' THEN ARRAY['manage_users', 'manage_permissions', 'manage_company_settings', 'view_audit_logs']
    WHEN 'project_manager' THEN ARRAY['create_projects', 'view_projects', 'manage_projects']  
    WHEN 'team_member' THEN ARRAY['view_projects']
    WHEN 'client' THEN ARRAY['view_client_projects']
    ELSE ARRAY[]::text[]
  END
WHERE permissions_bitwise IS NOT NULL;

-- Restore RLS policies to use array permissions
-- (Keep backup of old policies)
```

---

## 📊 Expected Performance Improvements

### Before (Array Permissions):
- Permission check: O(n) array search × number of permissions
- RLS policy: Complex subqueries with array operations
- Storage: ~50-200 bytes per user (variable)
- Memory: Multiple string comparisons per request

### After (Bitwise Permissions):  
- Permission check: O(1) bitwise operation
- RLS policy: Simple integer comparison
- Storage: 8 bytes per user (fixed)
- Memory: Single integer comparison per request

### Estimated Improvements:
- **Permission checks: 10-50x faster**
- **Database queries: 3-10x faster**  
- **Storage usage: 80-90% reduction**
- **Memory usage: 60-80% reduction**

---

## ✅ Success Criteria

Migration is successful when:
1. ✅ All users can log in and access appropriate features
2. ✅ Clients cannot see any financial data (costs, budgets)
3. ✅ Project managers can manage assigned projects and teams
4. ✅ Admins have full system access
5. ✅ Project-specific approvers work correctly
6. ✅ Export functions filter cost data appropriately
7. ✅ API responses are under 500ms consistently
8. ✅ No 403 permission errors for valid user actions
9. ✅ RLS policies prevent unauthorized data access
10. ✅ System handles 100+ concurrent users without issues

---

**This completes the comprehensive bitwise permission implementation plan for Formula PM V3. The system will provide blazing-fast permission checks, eliminate all current auth conflicts, and scale to hundreds of permissions without performance degradation.**