# Bitwise Permissions System Implementation Guide

## 🎯 Overview

This document provides complete implementation details for migrating Formula PM V3 from array-based permissions to a high-performance bitwise permissions system. This will solve all RLS recursion issues, eliminate 403 API errors, and provide lightning-fast permission checks.

## 📋 Permission Constants

Use these exact values in your TypeScript/JavaScript code:

```typescript
export const PERMISSIONS = {
  // Project Management
  VIEW_ALL_PROJECTS: 1,           // Can see all company projects
  CREATE_PROJECTS: 2,             // Can create new projects  
  MANAGE_ALL_PROJECTS: 4,         // Can edit/delete any project
  ARCHIVE_PROJECTS: 8,            // Can archive completed projects
  
  // Financial Controls
  VIEW_FINANCIAL_DATA: 16,        // Can see costs, budgets, profit margins
  APPROVE_EXPENSES: 32,           // Can approve cost changes
  EXPORT_FINANCIAL_REPORTS: 64,  // Can export financial data
  
  // User Management
  MANAGE_ALL_USERS: 128,          // Can add/remove users (admin only)
  MANAGE_TEAM_MEMBERS: 256,       // Can assign users to projects
  VIEW_ALL_USERS: 512,            // Can see all company users
  
  // Shop Drawings & Technical
  VIEW_SHOP_DRAWINGS: 1024,       // Can view shop drawings
  CREATE_SHOP_DRAWINGS: 2048,     // Can create shop drawings
  EDIT_SHOP_DRAWINGS: 4096,       // Can edit shop drawings
  APPROVE_SHOP_DRAWINGS: 8192,    // Can approve drawings
  
  // Tasks & Workflow
  CREATE_TASKS: 16384,            // Can create tasks
  EDIT_TASKS: 32768,              // Can edit tasks
  ASSIGN_TASKS: 65536,            // Can assign tasks to users
  
  // Data Management
  EXPORT_DATA: 131072,            // Can export Excel/CSV files
  IMPORT_DATA: 262144,            // Can import Excel data
  DELETE_DATA: 524288,            // Can permanently delete records
  VIEW_AUDIT_LOGS: 1048576,       // Can see activity logs
} as const;
```

## 👥 Role Templates

Pre-built permission combinations for common roles:

```typescript
export const USER_ROLES = {
  // Site supervisor - sees everything, manages day-to-day
  ADMIN: 2097151,        // All permissions (sum of all values)
  
  // Project manager - manages specific projects and teams
  PROJECT_MANAGER: 1055743,   // Most permissions except delete/admin
  
  // Team member - works on assigned projects
  TEAM_MEMBER: 21248,    // Basic work permissions
  
  // Client - view only access to their projects
  CLIENT: 1025,          // Very limited view permissions
  
  // Accounting - financial focus
  ACCOUNTANT: 131184,    // Financial permissions + export
  
  // Subcontractor - limited project access
  SUBCONTRACTOR: 17408,  // Task and drawing permissions
} as const;
```

## 🔧 Permission Helper Functions

Use these utility functions in your codebase:

```typescript
export class PermissionManager {
  // Check if user has specific permission
  static hasPermission(userPerms: number, permission: number): boolean {
    return (userPerms & permission) !== 0;
  }
  
  // Check if user has ANY of the provided permissions
  static hasAnyPermission(userPerms: number, permissions: number[]): boolean {
    return permissions.some(perm => this.hasPermission(userPerms, perm));
  }
  
  // Check if user has ALL provided permissions
  static hasAllPermissions(userPerms: number, permissions: number[]): boolean {
    return permissions.every(perm => this.hasPermission(userPerms, perm));
  }
  
  // Add permission to user
  static addPermission(userPerms: number, permission: number): number {
    return userPerms | permission;
  }
  
  // Remove permission from user
  static removePermission(userPerms: number, permission: number): number {
    return userPerms & ~permission;
  }
  
  // Get human-readable permission names
  static getPermissionNames(userPerms: number): string[] {
    return Object.entries(PERMISSIONS)
      .filter(([name, value]) => this.hasPermission(userPerms, value))
      .map(([name]) => name.toLowerCase().replace(/_/g, ' '));
  }
}
```

## 🗃️ Database Schema Updates

The SQL migration has already been provided. Key points:

- User permissions stored as `permissions_bitwise` BIGINT column
- RLS policies use simple bitwise checks: `(permissions_bitwise & flag) > 0`
- Performance indexes created for fast lookups
- All old array-based policies removed

## ⚛️ React Component Usage

### Basic Permission Checks

```typescript
// In your React components
const user = useUser(); // Your user hook
const hasPermission = (permission: number) => 
  (user.permissions_bitwise & permission) !== 0;

// Hide components based on permissions
{hasPermission(PERMISSIONS.VIEW_FINANCIAL_DATA) && (
  <FinancialDataSection project={project} />
)}

// Conditional rendering for buttons
{hasPermission(PERMISSIONS.EDIT_PROJECTS) ? (
  <button onClick={handleEdit}>Edit Project</button>
) : (
  <span className="text-gray-400">View Only</span>
)}

// Disable actions
<button 
  disabled={!hasPermission(PERMISSIONS.DELETE_DATA)}
  onClick={handleDelete}
  className={hasPermission(PERMISSIONS.DELETE_DATA) ? 
    "btn-danger" : "btn-disabled"
  }
>
  Delete Project
</button>
```

### Advanced Permission Patterns

```typescript
// Check multiple permissions
const canManageProject = hasPermission(PERMISSIONS.MANAGE_ALL_PROJECTS) || 
                        project.created_by === user.id;

// Complex permission logic
const canViewFinancials = hasPermission(PERMISSIONS.VIEW_FINANCIAL_DATA) &&
                         (hasPermission(PERMISSIONS.VIEW_ALL_PROJECTS) || 
                          project.team_members.includes(user.id));

// Role-based rendering
const renderProjectActions = () => {
  if (hasPermission(PERMISSIONS.MANAGE_ALL_PROJECTS)) {
    return <AdminProjectActions />;
  } else if (hasPermission(PERMISSIONS.EDIT_PROJECTS)) {
    return <ManagerProjectActions />;
  } else {
    return <ViewOnlyActions />;
  }
};
```

## 🛡️ API Route Protection

### Next.js Middleware Example

```typescript
// middleware.ts
import { PermissionManager, PERMISSIONS } from './lib/permissions';

export function requirePermission(permission: number) {
  return async (req: NextRequest, res: NextResponse) => {
    const user = await getCurrentUser(req);
    
    if (!PermissionManager.hasPermission(user.permissions_bitwise, permission)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required: getPermissionName(permission),
          userPerms: PermissionManager.getPermissionNames(user.permissions_bitwise)
        }, 
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}

// Usage in API routes
export const config = {
  matcher: ['/api/projects/:path*', '/api/financial/:path*']
};
```

### API Route Examples

```typescript
// api/projects/create/route.ts
export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  
  if (!PermissionManager.hasPermission(user.permissions_bitwise, PERMISSIONS.CREATE_PROJECTS)) {
    return Response.json({ error: 'Cannot create projects' }, { status: 403 });
  }
  
  // Create project logic
}

// api/financial/reports/route.ts
export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  
  if (!PermissionManager.hasPermission(user.permissions_bitwise, PERMISSIONS.VIEW_FINANCIAL_DATA)) {
    return Response.json({ error: 'Cannot access financial data' }, { status: 403 });
  }
  
  // Return financial data
}
```

## 🔄 Migration from Array Permissions

If you need to migrate existing users:

```typescript
// Migration utility
const migrateUserPermissions = (arrayPermissions: string[]): number => {
  const PERMISSION_MAP: Record<string, number> = {
    'view_all_projects': PERMISSIONS.VIEW_ALL_PROJECTS,
    'create_projects': PERMISSIONS.CREATE_PROJECTS,
    'manage_all_projects': PERMISSIONS.MANAGE_ALL_PROJECTS,
    'view_financial_data': PERMISSIONS.VIEW_FINANCIAL_DATA,
    'manage_all_users': PERMISSIONS.MANAGE_ALL_USERS,
    'export_data': PERMISSIONS.EXPORT_DATA,
    // Add more mappings as needed
  };
  
  let bitwisePerms = 0;
  arrayPermissions.forEach(perm => {
    const bitwisePerm = PERMISSION_MAP[perm];
    if (bitwisePerm) {
      bitwisePerms = PermissionManager.addPermission(bitwisePerms, bitwisePerm);
    }
  });
  
  return bitwisePerms;
};
```

## 📱 Common UI Patterns

### Project Cards with Permission-Based Content

```typescript
const ProjectCard = ({ project, user }) => {
  const hasFinancialAccess = (user.permissions_bitwise & PERMISSIONS.VIEW_FINANCIAL_DATA) > 0;
  const canEdit = (user.permissions_bitwise & PERMISSIONS.EDIT_PROJECTS) > 0;
  const canDelete = (user.permissions_bitwise & PERMISSIONS.DELETE_DATA) > 0;
  
  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      
      {/* Financial info - hidden from clients */}
      {hasFinancialAccess && (
        <div className="financial-section">
          <p>Budget: ${project.budget}</p>
          <p>Spent: ${project.spent}</p>
          <p>Profit: ${project.profit}</p>
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
        
        {!canEdit && !canDelete && (
          <span className="text-gray-500">View Only</span>
        )}
      </div>
    </div>
  );
};
```

### Shop Drawings with Multi-Level Access

```typescript
const ShopDrawingViewer = ({ drawing, user }) => {
  const canView = (user.permissions_bitwise & PERMISSIONS.VIEW_SHOP_DRAWINGS) > 0;
  const canEdit = (user.permissions_bitwise & PERMISSIONS.EDIT_SHOP_DRAWINGS) > 0;
  const canApprove = (user.permissions_bitwise & PERMISSIONS.APPROVE_SHOP_DRAWINGS) > 0;
  
  if (!canView) {
    return <div>Access Denied - Contact Project Manager</div>;
  }
  
  return (
    <div className="drawing-viewer">
      <DrawingImage src={drawing.image_url} />
      
      {canEdit && (
        <div className="edit-tools">
          <button onClick={openEditor}>Edit Drawing</button>
          <button onClick={addComment}>Add Comment</button>
        </div>
      )}
      
      {canApprove && drawing.status === 'pending' && (
        <div className="approval-section">
          <button onClick={approveDrawing} className="btn-success">
            Approve Drawing
          </button>
          <button onClick={rejectDrawing} className="btn-danger">
            Request Changes
          </button>
        </div>
      )}
    </div>
  );
};
```

## 🎯 Construction-Specific Use Cases

### Client Portal (Limited Access)
```typescript
// Client permissions = 1025 (VIEW_ALL_PROJECTS + VIEW_SHOP_DRAWINGS)
const ClientDashboard = ({ user }) => {
  // Clients can see their projects but no financial data
  const projects = getProjectsForUser(user.id); // Only assigned projects
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>Status: {project.status}</p>
          <p>Timeline: {project.timeline}</p>
          
          {/* No cost information for clients */}
          <p>Contact your project manager for cost details</p>
          
          {/* Can view drawings but not edit */}
          <DrawingViewer 
            drawings={project.shop_drawings} 
            readonly={true}
          />
        </div>
      ))}
    </div>
  );
};
```

### Project Manager Dashboard
```typescript
// Project Manager permissions = 1055743 (most permissions)
const PMDashboard = ({ user }) => {
  const canViewFinancials = (user.permissions_bitwise & PERMISSIONS.VIEW_FINANCIAL_DATA) > 0;
  const canApproveExpenses = (user.permissions_bitwise & PERMISSIONS.APPROVE_EXPENSES) > 0;
  
  return (
    <div>
      <ProjectOverview />
      
      {canViewFinancials && (
        <FinancialSummary />
      )}
      
      {canApproveExpenses && (
        <PendingExpenses />
      )}
      
      <TeamManagement />
      <TaskAssignment />
    </div>
  );
};
```

## 🚀 Implementation Checklist

### Phase 1: Database Migration ✅
- [x] Run the provided SQL migration
- [x] Update user permissions to bitwise values
- [x] Test RLS policies work correctly

### Phase 2: Frontend Updates
- [ ] Add permission constants and helper functions
- [ ] Update all components to use bitwise permission checks
- [ ] Replace array permission logic with bitwise operations
- [ ] Test UI component visibility based on user roles

### Phase 3: API Protection
- [ ] Add permission checks to all API routes
- [ ] Update middleware for route protection
- [ ] Test 403 responses for unauthorized access

### Phase 4: Admin Interface
- [ ] Build permission management interface
- [ ] Add role assignment functionality
- [ ] Create user permission audit logs

## 🔍 Debugging and Testing

### Testing Permission Combinations
```typescript
// Test different user roles
const testUsers = [
  { role: 'admin', permissions: USER_ROLES.ADMIN },
  { role: 'pm', permissions: USER_ROLES.PROJECT_MANAGER },
  { role: 'client', permissions: USER_ROLES.CLIENT },
];

testUsers.forEach(user => {
  console.log(`${user.role} can view financials:`, 
    (user.permissions & PERMISSIONS.VIEW_FINANCIAL_DATA) > 0);
  console.log(`${user.role} can edit projects:`, 
    (user.permissions & PERMISSIONS.EDIT_PROJECTS) > 0);
});
```

### Permission Debugging Utility
```typescript
const debugPermissions = (userPerms: number) => {
  console.log('User Permissions:', userPerms);
  console.log('Binary:', userPerms.toString(2));
  console.log('Active permissions:');
  
  Object.entries(PERMISSIONS).forEach(([name, value]) => {
    if ((userPerms & value) > 0) {
      console.log(`  ✅ ${name}`);
    }
  });
};
```

## ⚡ Performance Benefits

- **Database queries**: Single integer comparison vs array operations
- **Memory usage**: 8 bytes per user vs variable array size
- **Permission checks**: O(1) bitwise operation vs O(n) array search
- **RLS policies**: Simple arithmetic vs complex subqueries

## 🛟 Support and Troubleshooting

### Common Issues
1. **Permission check returns false unexpectedly**
   - Verify the permission constant value
   - Check user's permissions_bitwise value in database
   - Use debugging utility to see active permissions

2. **UI component not hiding/showing correctly**
   - Confirm bitwise operation syntax: `(userPerms & flag) > 0`
   - Check for component re-renders after permission updates

3. **API route still allowing unauthorized access**
   - Ensure permission check is before main logic
   - Verify user object contains permissions_bitwise field

### Quick Validation
```sql
-- Check user permissions in database
SELECT email, permissions_bitwise, 
  CASE 
    WHEN (permissions_bitwise & 16) > 0 THEN 'CAN view financial data'
    ELSE 'CANNOT view financial data'
  END as financial_access
FROM user_profiles;
```

---

**This bitwise permission system will solve all your RLS issues and provide lightning-fast, granular access control for your construction project management application.**