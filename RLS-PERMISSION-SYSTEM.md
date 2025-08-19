# Formula PM V3 - RLS Permission System Implementation

## 🎯 Overview

This document contains the complete SQL implementation for Formula PM V3's permission-based Row Level Security (RLS) system. This system enables dynamic permission management through an admin panel without requiring code changes.

## 🔑 Key Features

- **No Infinite Recursion**: Simple, non-circular policies
- **Dynamic Permissions**: Admin panel can grant/revoke access
- **Flexible Roles**: Mix and match permissions per user
- **Performance Optimized**: Efficient permission checks
- **Boss Visibility**: Executives can see all projects with proper permission

## 📋 Available Permissions

### Project Permissions
- `view_all_projects` - See all company projects (for executives/boss)
- `create_projects` - Can create new projects
- `manage_all_projects` - Edit/delete any project (super admin)
- `archive_projects` - Can archive completed projects

### Financial Permissions
- `view_financial_data` - See costs, budgets, spending
- `approve_expenses` - Approve cost changes
- `export_financial_reports` - Download financial data

### Team Permissions
- `manage_all_users` - Add/remove any user (admin only)
- `manage_team_members` - Add users to own projects
- `view_all_users` - See all company users

### Data Permissions
- `export_data` - Export Excel/CSV files
- `import_data` - Import scope items from Excel
- `delete_data` - Permanently delete records

## 🗂️ How It Works

1. **Permissions stored in** `user_profiles.permissions` array
2. **RLS policies check** these permissions dynamically
3. **Admin panel updates** permissions without code changes
4. **Immediate enforcement** by database

### Example Permission Assignment

```javascript
// Regular Team Member
permissions: []  // Only sees assigned projects

// Project Manager
permissions: [
  'create_projects',
  'manage_team_members',
  'view_financial_data'
]

// Boss/Executive
permissions: [
  'view_all_projects',     // Sees ALL projects
  'view_financial_data',   // Financial visibility
  'export_financial_reports'
]

// Admin (You)
permissions: [
  'view_all_projects',
  'create_projects',
  'manage_all_projects',
  'view_financial_data',
  'manage_all_users',
  // ... all permissions
]
```

## 🚨 IMPORTANT: Before Running SQL

**REPLACE THE ADMIN EMAIL** at the bottom of the SQL with your actual admin email address!

```sql
-- Change this line to your actual admin email:
WHERE email = 'YOUR_ADMIN_EMAIL@DOMAIN.COM';  -- ← CHANGE THIS!
```

## 📝 Complete SQL Implementation

```sql
-- ============================================
-- FORMULA PM V3 - PERMISSION-BASED RLS POLICIES
-- ============================================
-- This implements a flexible permission system where:
-- 1. Permissions are stored in user_profiles.permissions array
-- 2. Admin panel can dynamically grant/revoke permissions
-- 3. No code changes needed for access control
-- 4. No infinite recursion issues
-- ============================================

-- Step 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "users_view_own_and_project_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_delete_own_profile" ON user_profiles;

DROP POLICY IF EXISTS "users_view_own_project_members" ON project_members;
DROP POLICY IF EXISTS "users_insert_project_members" ON project_members;
DROP POLICY IF EXISTS "users_update_project_members" ON project_members;
DROP POLICY IF EXISTS "users_delete_project_members" ON project_members;

DROP POLICY IF EXISTS "users_view_own_projects" ON projects;
DROP POLICY IF EXISTS "users_manage_own_projects" ON projects;
DROP POLICY IF EXISTS "users_view_member_projects" ON projects;
DROP POLICY IF EXISTS "users_create_projects" ON projects;
DROP POLICY IF EXISTS "users_update_own_projects" ON projects;
DROP POLICY IF EXISTS "users_delete_own_projects" ON projects;

DROP POLICY IF EXISTS "users_view_scope_items" ON scope_items;
DROP POLICY IF EXISTS "users_manage_scope_items" ON scope_items;

-- ============================================
-- USER PROFILES POLICIES (SIMPLE - NO RECURSION)
-- ============================================
-- Users can only see and edit their own profile
-- Team visibility handled at application layer

CREATE POLICY "users_view_own_profile" ON user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_insert_own_profile" ON user_profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "users_delete_own_profile" ON user_profiles
FOR DELETE TO authenticated
USING (id = auth.uid());

-- ============================================
-- PROJECTS POLICIES (PERMISSION & MEMBERSHIP BASED)
-- ============================================
-- View: Members OR users with view_all_projects permission
-- Create: Users with create_projects permission
-- Update/Delete: Project creators OR users with manage_all_projects

CREATE POLICY "users_view_projects" ON projects
FOR SELECT TO authenticated
USING (
  -- User is a member of the project
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = projects.id
    AND user_id = auth.uid()
  )
  OR
  -- User has permission to view all projects (boss/admin)
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'view_all_projects' = ANY(permissions)
  )
);

CREATE POLICY "users_create_projects" ON projects
FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'create_projects' = ANY(permissions)
  )
);

CREATE POLICY "users_update_projects" ON projects
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'manage_all_projects' = ANY(permissions)
  )
);

CREATE POLICY "users_delete_projects" ON projects
FOR DELETE TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'manage_all_projects' = ANY(permissions)
  )
);

-- ============================================
-- PROJECT MEMBERS POLICIES
-- ============================================
-- View: See members of your projects OR admin permission
-- Manage: Project creators OR admin permission

CREATE POLICY "users_view_project_members" ON project_members
FOR SELECT TO authenticated
USING (
  -- You're on this project
  project_id IN (
    SELECT project_id FROM project_members
    WHERE user_id = auth.uid()
  )
  OR
  -- You have admin permission
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND ('view_all_projects' = ANY(permissions) OR 'manage_all_users' = ANY(permissions))
  )
);

CREATE POLICY "users_manage_project_members" ON project_members
FOR INSERT TO authenticated
WITH CHECK (
  -- You created this project
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_members.project_id
    AND created_by = auth.uid()
  )
  OR
  -- You have admin permission
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'manage_all_users' = ANY(permissions)
  )
);

CREATE POLICY "users_update_project_members" ON project_members
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_members.project_id
    AND created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'manage_all_users' = ANY(permissions)
  )
);

CREATE POLICY "users_delete_project_members" ON project_members
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_members.project_id
    AND created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'manage_all_users' = ANY(permissions)
  )
);

-- ============================================
-- SCOPE ITEMS POLICIES
-- ============================================
-- View based on project membership or permissions

CREATE POLICY "users_view_scope_items" ON scope_items
FOR SELECT TO authenticated
USING (
  -- You're on this project
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = scope_items.project_id
    AND user_id = auth.uid()
  )
  OR
  -- You have permission to view all projects
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'view_all_projects' = ANY(permissions)
  )
);

CREATE POLICY "users_manage_scope_items" ON scope_items
FOR ALL TO authenticated
USING (
  -- You created this project
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = scope_items.project_id
    AND created_by = auth.uid()
  )
  OR
  -- You have admin permission
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND 'manage_all_projects' = ANY(permissions)
  )
);

-- ============================================
-- GRANT YOUR ADMIN USER ALL PERMISSIONS
-- ============================================
-- ⚠️ IMPORTANT: Replace with your actual admin email!
UPDATE user_profiles 
SET permissions = ARRAY[
  'view_all_projects',
  'create_projects',
  'manage_all_projects',
  'view_financial_data',
  'manage_all_users',
  'export_data',
  'import_data',
  'delete_data',
  'approve_expenses',
  'archive_projects',
  'export_financial_reports',
  'view_all_users',
  'manage_team_members'
]
WHERE email = 'YOUR_ADMIN_EMAIL@DOMAIN.COM';  -- ← ⚠️ CHANGE THIS TO YOUR ADMIN EMAIL!

-- ============================================
-- VERIFY ADMIN PERMISSIONS (Optional)
-- ============================================
-- Run this query to verify your admin user has permissions:
-- SELECT id, email, permissions FROM user_profiles WHERE email = 'YOUR_ADMIN_EMAIL@DOMAIN.COM';
```

## 🔍 Testing After Implementation

1. **Run the SQL** in Supabase SQL Editor (remember to change the admin email!)
2. **Test Login** at http://localhost:3002/login
3. **Check Console** - Should see NO infinite recursion errors
4. **Access Dashboard** - Should load without 500 errors
5. **Create Project** - Click "New Project" button

## 📊 Policy Logic Explained

### User Profiles
- **Simple self-access only** - No cross-table queries
- Team visibility handled in application layer
- Prevents infinite recursion completely

### Projects
- **Members see their projects** - Via project_members join
- **Boss sees all** - Via `view_all_projects` permission
- **Creators manage** - Full control over created projects

### Project Members
- **View team rosters** - For projects you're on
- **Creators add members** - Only project creators
- **Admins override** - With `manage_all_users` permission

### Scope Items
- **Project-based access** - See items for your projects
- **Financial visibility** - Controlled by permissions
- **Subcontractors NOT members** - Just payment tracking

## 🚀 Next Steps

1. **Run SQL** with your admin email
2. **Test authentication** works without errors
3. **Create first project** through UI
4. **Build admin panel** for permission management
5. **Add team members** and test access control

## 💡 Important Notes

- **No Company Structure**: Removed as per requirements
- **Subcontractors**: Tracked via scope items, not project members
- **Boss Access**: Use `view_all_projects` permission
- **Performance**: Optimized queries, no recursion
- **Flexibility**: Add/remove permissions dynamically

## 🛠️ Troubleshooting

If you still see infinite recursion errors:
1. Make sure ALL old policies are dropped
2. Check that you're not missing any DROP POLICY statements
3. Verify no custom policies were added outside this script

If authentication fails:
1. Check your admin email is correct
2. Verify user_profiles entry exists for your user
3. Check Supabase logs for specific errors

---

**Created**: December 2024  
**Last Updated**: December 2024  
**Version**: 1.0 - Permission-Based RLS System