# Formula PM V3 - Bitwise Permission Architecture Decision Document

## 📋 Overview
This document records all architectural decisions for converting Formula PM V3 from array-based permissions to a bitwise permission system.

**Date Started:** 2025-08-27  
**Current Status:** Planning Phase

---

## 🎯 Project Goals
1. Eliminate permission system conflicts and inconsistencies
2. Improve performance for permission checks
3. Scale to hundreds of permissions without degradation
4. Simplify RLS policies and prevent infinite recursion
5. Maintain backward compatibility during migration

---

## 🏗️ Application Overview

### Core Purpose
Formula PM V3 is a construction project management system designed for:
- Managing construction projects from inception to completion
- Tracking scope of work, costs, and progress
- Managing shop drawings and material specifications
- Coordinating between office teams, field teams, and clients
- Handling RFIs, change orders, and punch lists

### Key User Types
1. **Admin** - Full system access, company management
2. **Technical Manager** - Technical approvals, cost management
3. **Project Manager** - Project oversight, team coordination
4. **Team Member** - Task execution, field updates
5. **Client** - Limited view of their projects

### Critical Workflows

#### Project Lifecycle
1. **Project Creation** → PM/Technical Manager creates project
2. **Tender Process** → Project may exist without scope initially
3. **Scope Definition** → After tender approval, scope items defined
4. **Shop Drawings & Materials** → Defined based on scope
5. **Tasks** → Created for PM follow-up and management
6. **Execution & Approval** → Work completed, drawings approved

#### Daily Operations
- Creating and assigning tasks
- Tracking project progress  
- Checking and managing scope items
- Managing shop drawings
- Approval workflows

#### Shop Drawing Approval Flow
1. **Upload** → PM or Team Member uploads drawing
2. **Internal Review** → PM reviews and approves OR
3. **Client Review** → Client gets notified, makes comments, sends back OR approves
4. **Final Approval** → Drawing marked as approved

#### Key Business Rules
- **Cost Visibility**: Clients can see everything EXCEPT costs
- **Material Specs**: PMs can approve material specifications
- **Project-Based Approvals**: Approval workflows can be customized per project
- **Assignable Approvers**: Can assign specific people as approvers per project

---

## 📊 Current System Analysis

### Problems with Current System
1. **Three conflicting permission layers:**
   - 50+ permissions defined in types
   - 15-21 permissions actually stored in database
   - Role-based permission_level system

2. **Performance Issues:**
   - Array searches for each permission check
   - RLS policies causing recursion
   - Large storage overhead

3. **Maintenance Challenges:**
   - Permissions missing from users
   - Inconsistent permission names
   - Difficult to add new permissions

---

## 🔧 Architectural Decisions

### Decision Log

#### Decision #1: RESOLVED
**Question:** Permission Granularity - How many distinct permissions?  
**Options:**
- A) Keep all 50+ granular permissions
- B) Consolidate to ~32 core permissions ✅
- C) Group permissions hierarchically

**Discussion:** User already has a bitwise_permissions_guide.md with 20 core permissions defined using powers of 2 (1, 2, 4, 8, 16, etc.). This covers the essential construction workflows.

**Decision:** Use existing 20-permission bitwise system from guide

**Rationale:** The existing guide covers core construction workflows efficiently with room for expansion

---

#### Decision #2: RESOLVED  
**Question:** Storage Format  
**Options:**
- A) 32-bit integer (fast, 32 permissions max)
- B) 64-bit bigint (balanced, 64 permissions) ✅
- C) Array of integers (complex, unlimited)

**Discussion:** Existing guide uses BIGINT which supports 64 permissions. Current design has 20 permissions leaving room for 44 more.

**Decision:** Use PostgreSQL BIGINT (64-bit) as specified in existing guide

**Rationale:** Provides excellent performance while allowing future expansion

---

#### Decision #3: RESOLVED
**Question:** Project Management Permission Structure
**Options:**
- A) Keep VIEW_ALL_PROJECTS, add logic to filter by assigned_projects
- B) Split into VIEW_ALL_PROJECTS vs VIEW_ASSIGNED_PROJECTS ✅
- C) Remove VIEW_ALL_PROJECTS, always filter by role + assignments

**Discussion:** 
- Option B provides better client isolation - clients get VIEW_ASSIGNED_PROJECTS only
- No need for MANAGE_TENDERS permission - regular project management covers this
- Project creation should be restricted to Project Managers and above only

**Decision:** 
- Split project viewing permissions for better security
- CREATE_PROJECTS only for PM level and above
- No separate tender management needed

**Rationale:** Better client data isolation and proper role hierarchy

---

## 🎯 **Updated Project Permissions Design**

Based on decisions above:
```typescript
// Project Management (bits 0-4)
VIEW_ALL_PROJECTS: 1,           // Admin/PM can see all company projects  
VIEW_ASSIGNED_PROJECTS: 2,      // Can see projects user is assigned to
CREATE_PROJECTS: 4,             // PM+ can create new projects  
MANAGE_ALL_PROJECTS: 8,         // Can edit/delete any project
ARCHIVE_PROJECTS: 16,           // Can archive completed projects
```

### Role Adjustments Needed:
- **CLIENT**: Gets VIEW_ASSIGNED_PROJECTS (2) instead of VIEW_ALL_PROJECTS (1)
- **TEAM_MEMBER**: Gets VIEW_ASSIGNED_PROJECTS (2), loses CREATE_PROJECTS (4)
- **PROJECT_MANAGER+**: Gets both VIEW_ALL_PROJECTS (1) and CREATE_PROJECTS (4)

#### Decision #4: RESOLVED
**Question:** Shop Drawings Permission Structure
**Options for Client Approvals:**
- A) Clients use same APPROVE_SHOP_DRAWINGS permission
- B) Add separate APPROVE_SHOP_DRAWINGS_CLIENT permission ✅

**Options for Project-Specific Approvers:**
- A) Anyone with permission can approve on assigned projects  
- B) Separate project_approvers table for specific assignments ✅

**Discussion:**
- Clients need separate approval permission for different workflow
- Comments integrated into approval flow (popup before submit) - no separate permission needed
- No separate permissions for approval stages to avoid complexity
- Project-specific approver assignments for maximum flexibility

**Decision:**
- Add APPROVE_SHOP_DRAWINGS_CLIENT permission
- Comments handled in UI, no separate permission
- Use project_approvers table for custom assignments per project

**Rationale:** Maintains workflow simplicity while providing necessary client/internal approval distinction

---

## 🎯 **Updated Shop Drawings Permissions Design**

```typescript
// Shop Drawings (bits 10-14) 
VIEW_SHOP_DRAWINGS: 1024,              // Can view shop drawings
CREATE_SHOP_DRAWINGS: 2048,            // Can upload/create shop drawings  
EDIT_SHOP_DRAWINGS: 4096,              // Can edit shop drawings
APPROVE_SHOP_DRAWINGS: 8192,           // Internal approval (PM/Tech Manager)
APPROVE_SHOP_DRAWINGS_CLIENT: 16384,   // Client approval authority
```

### Project Approvers Table Design:
```sql
CREATE TABLE project_approvers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES user_profiles(id), 
  approval_type TEXT, -- 'shop_drawings', 'material_specs', 'rfis'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);
```

### Approval Logic:
1. User must have base permission (APPROVE_SHOP_DRAWINGS or APPROVE_SHOP_DRAWINGS_CLIENT)
2. **AND** either be assigned in project_approvers table OR have MANAGE_ALL_PROJECTS permission

#### Decision #5: RESOLVED
**Question:** Financial Permissions Structure

**Scope of Financial Data:** All costs hidden from clients
- ✅ Scope item costs (unit costs, total costs)
- ✅ Project budget totals  
- ✅ Material specification costs
- ✅ Task cost estimates

**Cost Editing:** VIEW_FINANCIAL_DATA + role level sufficient (no separate edit permissions needed)

**Approval Levels:** Single APPROVE_EXPENSES permission sufficient

**Cost Visibility Overrides:** Option B - Remove individual overrides ✅
- Eliminates `can_view_costs` individual override system
- Uses only bitwise permissions (single key system)
- No conflicts between multiple permission systems

**Decision:** Simplified financial permissions with role-based access only

**Rationale:** Single permission system eliminates conflicts and complexity

---

## 🎯 **Updated Financial Permissions Design**

```typescript
// Financial Controls (bits 4-6)
VIEW_FINANCIAL_DATA: 32,        // Can see ALL costs, budgets, profit margins  
APPROVE_EXPENSES: 64,           // Can approve cost changes
EXPORT_FINANCIAL_REPORTS: 128, // Can export financial data
```

### Role Financial Access:
- **CLIENT**: No financial permissions (0)
- **TEAM_MEMBER**: No financial permissions (0)  
- **PROJECT_MANAGER**: VIEW_FINANCIAL_DATA (32)
- **TECHNICAL_MANAGER**: VIEW_FINANCIAL_DATA + APPROVE_EXPENSES (96)
- **ADMIN**: All financial permissions (224)

#### Decision #6: RESOLVED
**Question:** Scope Items & Materials Permissions Structure

**Scope Items Access:**
- Everyone can view scope items (no VIEW_SCOPE permission needed)
- PMs can manage scope (create/edit scope items)
- PMs can approve scope changes
- Everyone can export scope to Excel (costs filtered by financial permissions)

**Material Specifications:**
- Standard view/manage/approve pattern
- PMs can approve material specs

**Project Integration:** Option C - Same as project permissions
- If you can manage a project, you can manage its scope and materials
- No separate project-specific assignments needed

**Cost Filtering:** Handle via data filtering based on VIEW_FINANCIAL_DATA permission
- Users without financial permission get scope/materials data without cost fields
- Export functions filter cost columns based on permissions

**Decision:** Integrated scope/materials permissions tied to project access

**Rationale:** Simplifies permission model while maintaining proper cost visibility controls

---

## 🎯 **Updated Scope & Materials Permissions Design**

```typescript
// Scope & Materials Management (bits 7-12)
MANAGE_SCOPE: 256,            // Can create/edit scope items (PM+)
APPROVE_SCOPE_CHANGES: 512,   // Can approve scope modifications (PM+)  
EXPORT_SCOPE_EXCEL: 1024,     // Can export scope to Excel (everyone)

VIEW_MATERIALS: 2048,         // Can view material specifications (everyone)
MANAGE_MATERIALS: 4096,       // Can create/edit material specs (PM+)
APPROVE_MATERIALS: 8192,      // Can approve material specifications (PM+)
```

### Logic:
- **Viewing**: Scope items visible to all project members (no permission check)
- **Managing**: Requires PM+ role AND project access (manage project = manage scope)
- **Cost Data**: Filtered at data layer based on VIEW_FINANCIAL_DATA permission
- **Export**: Available to all, but cost columns removed for users without financial access

## 💭 Future Feature Expansion

**Note:** RFIs, Change Orders, Punch Items, and other features not yet implemented can be added later by simply defining new bit positions:

```typescript
// Future permissions (bits 20-40 available)
VIEW_RFIS: 1048576,              // Future: Can view RFIs
MANAGE_CHANGE_ORDERS: 2097152,   // Future: Can manage change orders
// ... etc
```

The bitwise system easily supports adding 40+ more permissions without any performance impact.

---

#### Decision #7: RESOLVED
**Question:** User Management & Admin Functions Structure

**MANAGE_ALL_USERS scope (Admin only):**
- ✅ Create new user accounts
- ✅ Delete/deactivate users  
- ✅ Change user roles (admin → PM, etc.)
- ✅ Edit user profiles (name, email, etc.)
- ✅ Reset user passwords
- ✅ Manage user permissions directly

**Team Assignment:** Option A - Can assign any user to any project they have access to

**Admin System Functions:** Add all suggested admin permissions
- VIEW_AUDIT_LOGS - Can see system activity logs
- MANAGE_COMPANY_SETTINGS - Can change company-wide settings  
- BACKUP_RESTORE_DATA - Can backup/restore system data

**Role Hierarchy:** Admins can manage everyone, PMs can manage team members only
- Prevents PMs from promoting themselves or managing other PMs
- Maintains proper organizational hierarchy

**Decision:** Comprehensive admin permissions with role-based management restrictions

**Rationale:** Proper security boundaries matching construction company hierarchy

---

## 🎯 **Updated User Management & Admin Permissions Design**

```typescript
// User Management (bits 13-19)
VIEW_ALL_USERS: 16384,            // Can see all company users (PM+)
MANAGE_TEAM_MEMBERS: 32768,       // Can assign users to projects (PM+)
MANAGE_ALL_USERS: 65536,          // Full user management (Admin only)

// Admin Functions (bits 20-22)  
VIEW_AUDIT_LOGS: 131072,          // Can see system activity logs (Admin)
MANAGE_COMPANY_SETTINGS: 262144,  // Company-wide settings (Admin)
BACKUP_RESTORE_DATA: 524288,      // Backup/restore system (Admin)
```

### Role Management Logic:
- **Team Members**: Cannot manage other users
- **Project Managers**: Can use MANAGE_TEAM_MEMBERS (assign team members to projects)
- **Admins**: Can use MANAGE_ALL_USERS (full user management including role changes)

### Implementation Notes:
- Role hierarchy checks in UI and API to prevent privilege escalation
- PMs can only assign users with role level ≤ team_member
- Admins can manage any user regardless of role level

## 💭 Ready for Final Design Summary

---

## 📝 Notes & Observations

### From Code Analysis
- App has 20 database tables
- Multiple permission checking patterns in use
- Heavy use of RLS policies
- Client isolation is important (assigned_projects)
- Cost visibility is a key differentiator

---

## ✅ Next Steps
1. Understand core workflows
2. Map essential permissions
3. Design bit allocation strategy
4. Create migration plan

---

*This document will be updated as decisions are made*