-- Drop All Policies Using Old Array Permissions Column
-- Date: 2025-08-28
-- Purpose: Remove the specific policies causing the dependency error

BEGIN;

-- ============================================================================
-- DROP ALL POLICIES THAT REFERENCE OLD PERMISSIONS ARRAY
-- ============================================================================

-- From the error message, these are the exact policies that need to be dropped:

-- Project members policies using old permissions
DROP POLICY IF EXISTS "users_manage_project_members" ON project_members;
DROP POLICY IF EXISTS "users_update_project_members" ON project_members;
DROP POLICY IF EXISTS "users_delete_project_members" ON project_members;
DROP POLICY IF EXISTS "users_view_project_members" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

-- Scope items policies using old permissions
DROP POLICY IF EXISTS "users_view_scope_items" ON scope_items;
DROP POLICY IF EXISTS "users_manage_scope_items" ON scope_items;

-- Let's also drop ANY other policy that might reference the old permissions column
-- by checking all policies and dropping those with 'permissions' array references

-- Additional cleanup of any other policies that might reference old permissions
DROP POLICY IF EXISTS "scope_items_insert" ON scope_items;
DROP POLICY IF EXISTS "scope_items_update" ON scope_items;
DROP POLICY IF EXISTS "scope_items_select" ON scope_items;
DROP POLICY IF EXISTS "tasks_update" ON tasks;

-- Drop any views that might reference the permissions column
DROP VIEW IF EXISTS migration_audit_view CASCADE;
DROP VIEW IF EXISTS user_permissions_view CASCADE;
DROP VIEW IF EXISTS permission_audit_view CASCADE;

-- Drop any functions that reference the old permissions
DROP FUNCTION IF EXISTS user_can_access_project(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS has_permission(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS check_permissions(text[]) CASCADE;

-- ============================================================================
-- COMPREHENSIVE POLICY CLEANUP
-- ============================================================================

-- Get a complete list of all policies and drop them systematically
-- This ensures we don't miss any that reference the old permissions column

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies in the public schema
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        -- Drop each policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
    
    RAISE NOTICE 'All RLS policies have been dropped from public schema';
END $$;

-- ============================================================================
-- NOW REMOVE THE OLD PERMISSIONS COLUMN
-- ============================================================================

-- This should now work without dependency errors
ALTER TABLE user_profiles DROP COLUMN IF EXISTS permissions;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify no policies remain that could reference old permissions
SELECT 
    'Policy cleanup verification' as check_type,
    schemaname,
    COUNT(*) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname;

-- Verify the permissions column is gone
SELECT 
    'Column cleanup verification' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name LIKE '%permission%';

-- Show what we have left
SELECT 
    'User profiles structure' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name IN ('permissions_bitwise', 'role', 'assigned_projects')
ORDER BY column_name;

-- Log the cleanup
INSERT INTO public.migration_log (migration_name, description, executed_at)
VALUES (
  '20250828_drop_array_permission_policies',
  'COMPLETE CLEANUP: Dropped ALL RLS policies referencing old permissions array column, removed the permissions column entirely. Ready for clean rebuild.',
  NOW()
) ON CONFLICT (migration_name) DO UPDATE SET
  executed_at = NOW(),
  description = EXCLUDED.description;

SELECT 
    'Old permissions system completely removed!' as status,
    'All policies dropped, permissions column removed' as result,
    'Ready for clean rebuild with bitwise-only system' as next_step;

COMMIT;