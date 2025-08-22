# Formula PM V3 - Permission System Migrations

This directory contains the database migrations for the enhanced role-based permission system.

## 📊 Migration Files

### 1. `20250122120000_enhanced_permission_system_foundation.sql`
**Status:** Required  
**Description:** Creates the foundation for the role-based permission system
- Adds `role`, `can_view_costs`, `assigned_projects` columns to `user_profiles`
- Creates `role_configurations` table with 5 predefined roles
- Adds helper functions for permission checking
- Fully backward compatible with existing permissions

### 2. `20250122120100_client_isolation_rls_policies.sql`
**Status:** Required  
**Description:** Implements client project isolation and enhanced RLS policies
- Replaces existing RLS policies with role-based versions
- Adds client project isolation (clients only see assigned projects)
- Implements cost field protection at database level
- Adds admin helper functions for client management

### 3. `20250122120200_migrate_existing_permissions_data.sql`
**Status:** Optional  
**Description:** Migrates existing array-based permissions to roles
- Converts existing permission arrays to appropriate roles
- Creates audit views for tracking migration results
- Only run this if you want to migrate existing user data

## 🚀 Deployment Instructions

### Option A: Using Supabase CLI (Recommended)

```bash
# Apply all migrations
supabase db push

# Or apply specific migration
supabase db push --include-migrations=20250122120000
```

### Option B: Manual Application

1. **Apply Foundation Migration First:**
   - Copy content of `20250122120000_enhanced_permission_system_foundation.sql`
   - Run in Supabase SQL Editor
   - Verify no errors

2. **Apply Client Isolation Migration:**
   - Copy content of `20250122120100_client_isolation_rls_policies.sql`
   - Run in Supabase SQL Editor
   - Verify RLS policies are updated

3. **Optional: Migrate Existing Data:**
   - Copy content of `20250122120200_migrate_existing_permissions_data.sql`
   - Run in Supabase SQL Editor
   - Review migration results

## 🔍 Verification Steps

After applying migrations, verify the system works correctly:

### 1. Check Database Schema
```sql
-- Verify new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('role', 'can_view_costs', 'assigned_projects');

-- Verify role configurations
SELECT * FROM role_configurations ORDER BY permission_level;
```

### 2. Test Role System
```sql
-- Check user roles distribution
SELECT role, COUNT(*) as user_count 
FROM user_profiles 
GROUP BY role 
ORDER BY role;
```

### 3. Test Permission Functions
```sql
-- Test permission checking (replace with actual user ID)
SELECT * FROM get_effective_permissions('your-user-id-here');
```

## 🔄 Rollback Instructions

If you need to rollback the changes:

### Rollback Client Isolation (Migration 2)
```sql
-- Remove enhanced policies and restore original ones
DROP POLICY IF EXISTS "projects_select_enhanced" ON projects;
DROP POLICY IF EXISTS "scope_items_select_enhanced" ON scope_items;
DROP POLICY IF EXISTS "tasks_select_enhanced" ON tasks;

-- Recreate original simple policies
CREATE POLICY "projects_select" ON projects FOR SELECT USING (
  id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
);
-- ... (restore other original policies as needed)
```

### Rollback Foundation (Migration 1)
```sql
-- Remove new columns (CAUTION: This will lose data)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS role;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS can_view_costs;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS assigned_projects;

-- Drop new table
DROP TABLE IF EXISTS role_configurations;

-- Drop new functions
DROP FUNCTION IF EXISTS get_effective_permissions(UUID);
DROP FUNCTION IF EXISTS user_can_view_costs(UUID);
DROP FUNCTION IF EXISTS user_can_access_project(UUID, UUID);
```

## 📋 Role Definitions

The system includes 5 predefined roles:

| Role | Level | Cost Access | Edit Costs | Project Access | Description |
|------|-------|-------------|------------|----------------|-------------|
| **admin** | 100 | ✅ Yes | ✅ Yes | All | Full system access |
| **technical_manager** | 80 | ✅ Yes | ✅ Yes | All | Technical decisions & cost management |
| **project_manager** | 60 | ✅ Yes | ❌ No | Assigned | Project planning & budget oversight |
| **team_member** | 30 | ❌ No | ❌ No | Assigned | Task execution without cost visibility |
| **client** | 10 | ❌ No | ❌ No | Restricted | Limited to assigned projects only |

## 🛡️ Security Features

- **Client Isolation:** Clients can only access projects in their `assigned_projects` array
- **Cost Protection:** Cost fields hidden from unauthorized roles at database level
- **Role Hierarchy:** Permission levels enable simple >= comparisons
- **Individual Overrides:** `can_view_costs` can override role defaults when needed
- **Audit Trail:** All permission changes logged in `activity_logs`

## 🎯 Next Steps

1. **Apply migrations** in order (foundation → client isolation → optional data migration)
2. **Test the admin dashboard** at `/admin/users`
3. **Verify cost visibility** in ScopeTable component
4. **Test client isolation** with test client users
5. **Update team documentation** with new role definitions

## 🐛 Troubleshooting

**Issue:** RLS policies blocking legitimate access
- **Solution:** Check user roles with `SELECT role FROM user_profiles WHERE email = 'user@example.com'`
- **Fix:** Update role or add to project_members table

**Issue:** Cost fields still showing for team members
- **Solution:** Clear browser cache, check `usePermissionsEnhanced` hook is being used

**Issue:** Migration fails on existing data
- **Solution:** Check for NULL values, run migrations in correct order

## 📞 Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify migration order and dependencies
3. Test with a single user account first
4. Contact the development team with specific error messages

---
**Created:** 2025-01-22  
**Version:** 1.0  
**Compatibility:** Formula PM V3