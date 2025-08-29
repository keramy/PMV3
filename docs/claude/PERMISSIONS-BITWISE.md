# Bitwise Permission System - Formula PM V3

## 🚀 Overview

Formula PM V3 uses a **high-performance bitwise permission system** with PostgreSQL BIGINT for efficient permission checking and role management.

### Why Bitwise Permissions?

- ⚡ **Performance**: Single database column vs array operations
- 🔢 **Efficiency**: Bitwise operations are CPU-optimized  
- 📊 **Scalability**: Supports up to 64 permissions (currently using 28)
- 🎯 **Precision**: Exact permission control without array complexity

## 🔧 Technical Implementation

### Database Structure
```sql
-- user_profiles table structure
permissions_bitwise BIGINT DEFAULT 0  -- Single integer storing all permissions
role VARCHAR(50)                     -- Human-readable role name
assigned_projects TEXT[]             -- Project isolation for clients
```

### Permission Constants (28 bits total)
```typescript
// All permission constants from /src/lib/permissions/bitwise.ts
export const PERMISSIONS = {
  // === PROJECT MANAGEMENT (bits 0-4) ===
  VIEW_ALL_PROJECTS: 1,           // 2^0 = 1
  VIEW_ASSIGNED_PROJECTS: 2,      // 2^1 = 2  
  CREATE_PROJECTS: 4,             // 2^2 = 4
  MANAGE_ALL_PROJECTS: 8,         // 2^3 = 8
  ARCHIVE_PROJECTS: 16,           // 2^4 = 16

  // === FINANCIAL CONTROLS (bits 5-7) ===  
  VIEW_FINANCIAL_DATA: 32,        // 2^5 = 32
  APPROVE_EXPENSES: 64,           // 2^6 = 64
  EXPORT_FINANCIAL_REPORTS: 128, // 2^7 = 128

  // === SCOPE & MATERIALS (bits 8-10) ===
  MANAGE_SCOPE: 256,              // 2^8 = 256
  APPROVE_SCOPE_CHANGES: 512,     // 2^9 = 512
  MANAGE_MATERIALS: 1024,         // 2^10 = 1024

  // === SHOP DRAWINGS (bits 11-15) ===
  VIEW_SHOP_DRAWINGS: 2048,           // 2^11 = 2048
  CREATE_SHOP_DRAWINGS: 4096,         // 2^12 = 4096
  EDIT_SHOP_DRAWINGS: 8192,           // 2^13 = 8192  
  APPROVE_SHOP_DRAWINGS: 16384,       // 2^14 = 16384
  APPROVE_SHOP_DRAWINGS_CLIENT: 32768, // 2^15 = 32768

  // === USER MANAGEMENT (bits 16-18) ===
  VIEW_ALL_USERS: 65536,          // 2^16 = 65536
  MANAGE_TEAM_MEMBERS: 131072,    // 2^17 = 131072
  MANAGE_ALL_USERS: 262144,       // 2^18 = 262144

  // === TASKS & WORKFLOW (bits 19-21) ===
  CREATE_TASKS: 524288,           // 2^19 = 524288
  EDIT_TASKS: 1048576,            // 2^20 = 1048576
  ASSIGN_TASKS: 2097152,          // 2^21 = 2097152

  // === DATA MANAGEMENT (bits 22-24) ===
  EXPORT_DATA: 4194304,           // 2^22 = 4194304
  IMPORT_DATA: 8388608,           // 2^23 = 8388608
  DELETE_DATA: 16777216,          // 2^24 = 16777216

  // === ADMIN FUNCTIONS (bits 25-27) ===
  VIEW_AUDIT_LOGS: 33554432,      // 2^25 = 33554432
  MANAGE_COMPANY_SETTINGS: 67108864, // 2^26 = 67108864
  BACKUP_RESTORE_DATA: 134217728,    // 2^27 = 134217728
} as const
```

## 👥 Role Templates

### Pre-defined Permission Sets
```typescript
export const USER_ROLES = {
  // Full admin access - all 28 permissions
  ADMIN: 268435455,

  // Technical Manager - all except admin functions and delete  
  TECHNICAL_MANAGER: 251658239,

  // Project Manager - project management + team oversight
  PROJECT_MANAGER: 184549375,

  // Team Member - basic work permissions
  TEAM_MEMBER: 4718594,

  // Client - limited view access to assigned projects
  CLIENT: 34818,

  // Accountant - financial focus  
  ACCOUNTANT: 4194465,
} as const
```

### Permission Breakdown by Role

| Permission | Admin | Tech Mgr | PM | Team | Client |
|------------|-------|----------|----|----- |--------|
| View Projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage All Projects | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Financial Data | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Expenses | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Scope | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Shop Drawings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Client Approval | ✅ | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Data | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🎣 React Hook Usage

### Consolidated usePermissions() Hook
```typescript
import { usePermissions } from '@/hooks/usePermissions'

function ProjectDashboard() {
  const { 
    hasPermission,
    hasAnyPermission, 
    hasAllPermissions,
    canViewCosts,
    canEditCosts,
    isAdmin,
    roleDisplayName,
    estimatedRole,
    bitwisePermissions,
    loading
  } = usePermissions()

  // Permission checking
  const canManageScope = hasPermission('manage_scope_items')
  const canViewFinancials = hasPermission('view_financial_data')
  
  // Multiple permission check
  const canManageProject = hasAnyPermission([
    'edit_projects', 
    'manage_all_projects'
  ])

  // Convenience flags  
  if (canViewCosts) {
    // Show cost information
  }

  if (isAdmin) {
    // Show admin features
  }

  return (
    <div>
      <h1>Role: {roleDisplayName}</h1>
      {canManageScope && <ScopeManager />}
      {canViewFinancials && <FinancialDashboard />}
    </div>
  )
}
```

## 🛡️ API Middleware Integration

### Permission-Protected Routes
```typescript
// /src/app/api/scope/route.ts
import { apiMiddleware } from '@/lib/api/middleware'

export const POST = apiMiddleware.permissions(
  'manage_scope_items', // Maps to PERMISSIONS.MANAGE_SCOPE (256)
  async (user, request) => {
    // User has required bitwise permission
    // Middleware already validated: (user.permissions_bitwise & 256) > 0
    
    const data = await request.json()
    // ... create scope item
    return NextResponse.json({ data })
  }
)
```

### How Middleware Validates Permissions
```typescript
// Inside /src/lib/api/middleware.ts
const PERMISSION_MAPPING: Partial<Record<Permission, number>> = {
  'manage_scope_items': PERMISSIONS.MANAGE_SCOPE,  // 256
  'view_financial_data': PERMISSIONS.VIEW_FINANCIAL_DATA, // 32
  // ... full mapping
}

// Permission check using bitwise AND operation
const hasRequiredPermission = permissions.some(permission => {
  const bitwiseConstant = PERMISSION_MAPPING[permission]
  return PermissionManager.hasPermission(user.permissions_bitwise!, bitwiseConstant)
})
```

## 💾 Database Operations

### Setting User Permissions
```sql
-- Assign admin role (all permissions)
UPDATE user_profiles 
SET permissions_bitwise = 268435455, role = 'admin'
WHERE email = 'admin@company.com';

-- Assign project manager role  
UPDATE user_profiles 
SET permissions_bitwise = 184549375, role = 'project_manager'
WHERE email = 'pm@company.com';

-- Assign team member role
UPDATE user_profiles 
SET permissions_bitwise = 4718594, role = 'team_member'  
WHERE email = 'team@company.com';
```

### Permission Checking Queries
```sql
-- Check if user has specific permission (VIEW_SCOPE = 2)
SELECT 
  email, 
  (permissions_bitwise & 2) > 0 as can_view_scope
FROM user_profiles 
WHERE email = 'user@company.com';

-- Check multiple permissions at once
SELECT 
  email,
  (permissions_bitwise & 2) > 0 as can_view_scope,       -- VIEW_ASSIGNED_PROJECTS
  (permissions_bitwise & 256) > 0 as can_manage_scope,   -- MANAGE_SCOPE  
  (permissions_bitwise & 32) > 0 as can_view_costs       -- VIEW_FINANCIAL_DATA
FROM user_profiles;

-- Find all users with admin permissions
SELECT email, role 
FROM user_profiles 
WHERE permissions_bitwise = 268435455;
```

### Adding/Removing Individual Permissions
```sql
-- Add permission using bitwise OR (add VIEW_FINANCIAL_DATA = 32)
UPDATE user_profiles 
SET permissions_bitwise = permissions_bitwise | 32
WHERE email = 'user@company.com';

-- Remove permission using bitwise AND NOT (remove VIEW_FINANCIAL_DATA = 32)  
UPDATE user_profiles 
SET permissions_bitwise = permissions_bitwise & ~32
WHERE email = 'user@company.com';

-- Check if user has ALL required permissions (VIEW_SCOPE=2 AND MANAGE_SCOPE=256)
SELECT email
FROM user_profiles 
WHERE (permissions_bitwise & (2 | 256)) = (2 | 256);
```

## ⚡ Performance Benefits

### Bitwise vs Array Comparison
```sql
-- OLD WAY (Array): Slow, requires array operations
SELECT * FROM user_profiles 
WHERE 'manage_scope_items' = ANY(permissions);

-- NEW WAY (Bitwise): Fast, single integer operation
SELECT * FROM user_profiles 
WHERE (permissions_bitwise & 256) > 0;
```

### Database Index Optimization
```sql
-- Index on bitwise column for fast permission queries
CREATE INDEX idx_user_profiles_permissions_bitwise 
ON user_profiles(permissions_bitwise);

-- Partial index for admin users
CREATE INDEX idx_user_profiles_admin 
ON user_profiles(id) 
WHERE permissions_bitwise = 268435455;
```

## 🔧 Utility Functions

### PermissionManager Class Methods
```typescript
import { PermissionManager, PERMISSIONS } from '@/lib/permissions/bitwise'

// Check single permission
const canView = PermissionManager.hasPermission(userPerms, PERMISSIONS.VIEW_SCOPE)

// Check multiple permissions (ANY)
const canManage = PermissionManager.hasAnyPermission(userPerms, [
  PERMISSIONS.MANAGE_SCOPE,
  PERMISSIONS.MANAGE_ALL_PROJECTS
])

// Check all permissions required
const canApprove = PermissionManager.hasAllPermissions(userPerms, [
  PERMISSIONS.VIEW_SHOP_DRAWINGS,
  PERMISSIONS.APPROVE_SHOP_DRAWINGS
])

// Get human-readable permission names  
const permissionNames = PermissionManager.getPermissionNames(268435455)
// Returns: ['view all projects', 'view assigned projects', ...]

// Get role from permission value
const role = PermissionManager.getRoleFromPermissions(268435455) 
// Returns: 'ADMIN'
```

## 🐛 Common Issues & Solutions

### Issue: "permissions column does not exist"
**Cause**: Code trying to access old array-based permissions
**Solution**: Use `permissions_bitwise` column
```typescript
// ❌ WRONG
.select('permissions')

// ✅ CORRECT  
.select('permissions_bitwise, role')
```

### Issue: Permission checks always fail
**Cause**: User has no bitwise permissions assigned (value = 0)
**Solution**: Assign proper role-based permissions
```sql
-- Check current value
SELECT permissions_bitwise FROM user_profiles WHERE email = 'user@example.com';

-- If 0 or null, assign appropriate role
UPDATE user_profiles 
SET permissions_bitwise = 184549375, role = 'project_manager'
WHERE email = 'user@example.com';
```

### Issue: Custom permission combinations
**Solution**: Calculate bitwise value manually
```typescript
// Example: User needs VIEW_SCOPE + MANAGE_SCOPE + EXPORT_DATA
const customPermissions = 
  PERMISSIONS.VIEW_ASSIGNED_PROJECTS |  // 2
  PERMISSIONS.MANAGE_SCOPE |            // 256  
  PERMISSIONS.EXPORT_DATA               // 4194304
// Result: 4194562

UPDATE user_profiles 
SET permissions_bitwise = 4194562, role = 'custom_scope_manager'
WHERE email = 'user@example.com';
```

## 📊 Migration from Array to Bitwise

### Migration Script Example
```sql
-- Backup existing permissions
CREATE TABLE permissions_backup AS 
SELECT id, email, permissions FROM user_profiles;

-- Migrate common roles
UPDATE user_profiles 
SET permissions_bitwise = 268435455, role = 'admin'
WHERE 'manage_users' = ANY(permissions);

UPDATE user_profiles 
SET permissions_bitwise = 184549375, role = 'project_manager'  
WHERE 'manage_all_projects' = ANY(permissions)
AND NOT ('manage_users' = ANY(permissions));

-- Clear old permissions column (optional)
-- ALTER TABLE user_profiles DROP COLUMN permissions;
```

## ✅ Testing Permissions

### Manual Testing Checklist
- [ ] Admin users can access all features
- [ ] Project managers can manage projects but not users
- [ ] Team members have limited access
- [ ] Clients only see assigned projects  
- [ ] Permission changes take effect immediately
- [ ] API endpoints respect bitwise permissions
- [ ] UI components show/hide based on permissions

### Debug Queries
```sql
-- See all users and their permission breakdown
SELECT 
  email,
  role,
  permissions_bitwise,
  CASE 
    WHEN permissions_bitwise = 268435455 THEN 'Full Admin Access'
    WHEN (permissions_bitwise & 8) > 0 THEN 'Can Manage Projects'
    WHEN (permissions_bitwise & 2) > 0 THEN 'Basic Project Access'
    ELSE 'No Project Access'
  END as access_level
FROM user_profiles
ORDER BY permissions_bitwise DESC;
```

---
*Last Updated: December 2024*  
*Bitwise Permission System - Formula PM V3*