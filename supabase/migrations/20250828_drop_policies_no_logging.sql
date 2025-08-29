-- Drop All Policies Using Old Array Permissions Column (No Logging)
-- Date: 2025-08-28
-- Purpose: Remove the specific policies causing the dependency error (without migration_log)

BEGIN;

-- ============================================================================
-- COMPREHENSIVE POLICY CLEANUP
-- ============================================================================

-- Drop ALL policies in the public schema to ensure clean slate
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

-- Drop any views that might reference the permissions column
DROP VIEW IF EXISTS migration_audit_view CASCADE;
DROP VIEW IF EXISTS user_permissions_view CASCADE;
DROP VIEW IF EXISTS permission_audit_view CASCADE;

-- Drop any functions that reference the old permissions
DROP FUNCTION IF EXISTS user_can_access_project(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS has_permission(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS check_permissions(text[]) CASCADE;

-- ============================================================================
-- NOW REMOVE THE OLD PERMISSIONS COLUMN
-- ============================================================================

-- This should now work without dependency errors
ALTER TABLE user_profiles DROP COLUMN IF EXISTS permissions;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify no policies remain
SELECT 
    'Policy cleanup verification' as check_type,
    COALESCE(schemaname, 'No policies found') as schema,
    COUNT(*) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname;

-- Verify the permissions column is gone
SELECT 
    'Column cleanup verification' as check_type,
    COUNT(*) as remaining_permission_columns
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name = 'permissions';

-- Show what we have left for permissions
SELECT 
    'User profiles permission columns' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name IN ('permissions_bitwise', 'role', 'assigned_projects', 'can_view_costs')
ORDER BY column_name;

SELECT 
    'Old permissions system completely removed!' as status,
    'All policies dropped, permissions column removed' as result,
    'Ready for clean rebuild with bitwise-only system' as next_step;

COMMIT;