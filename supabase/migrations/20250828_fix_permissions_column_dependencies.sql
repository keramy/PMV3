-- Fix Dependencies for Permissions Column Removal
-- Date: 2025-08-28
-- Purpose: Remove dependent objects before dropping old permissions column

BEGIN;

-- ============================================================================
-- PHASE 1: IDENTIFY AND DROP DEPENDENT OBJECTS
-- ============================================================================

-- Drop the migration_audit_view that depends on permissions column
DROP VIEW IF EXISTS migration_audit_view CASCADE;

-- Drop any other views that might depend on the permissions column
DROP VIEW IF EXISTS user_permissions_view CASCADE;
DROP VIEW IF EXISTS permission_audit_view CASCADE;

-- Check for any functions that might reference the permissions column
DROP FUNCTION IF EXISTS get_user_permissions(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_user_permission(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS has_any_permission(uuid, text[]) CASCADE;

-- ============================================================================
-- PHASE 2: NOW SAFELY DROP THE PERMISSIONS COLUMN
-- ============================================================================

-- Remove the old array-based permissions column completely
-- This should work now that dependencies are removed
ALTER TABLE user_profiles DROP COLUMN IF EXISTS permissions;

-- ============================================================================
-- PHASE 3: RECREATE AUDIT VIEW IF NEEDED (WITHOUT OLD PERMISSIONS)
-- ============================================================================

-- Create a new audit view using only the bitwise permissions system
CREATE OR REPLACE VIEW user_permissions_audit_view AS
SELECT 
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    up.role,
    up.permissions_bitwise,
    -- Decode bitwise permissions to readable format
    CASE 
        WHEN up.permissions_bitwise = 268435455 THEN 'All permissions (Admin)'
        WHEN up.permissions_bitwise = 184549375 THEN 'Project Manager level'
        WHEN up.permissions_bitwise = 4718594 THEN 'Team Member level'
        WHEN up.permissions_bitwise = 34818 THEN 'Client level'
        ELSE 'Custom permission set: ' || up.permissions_bitwise::text
    END as permission_description,
    up.can_view_costs,
    up.assigned_projects,
    up.is_active,
    up.last_login,
    up.created_at,
    up.updated_at
FROM user_profiles up
ORDER BY up.permissions_bitwise DESC, up.created_at;

-- Grant access to the audit view
GRANT SELECT ON user_permissions_audit_view TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the permissions column is gone
SELECT 
    'Column cleanup verification' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
AND column_name LIKE '%permission%';

-- Verify we still have users with bitwise permissions
SELECT 
    'User permission verification' as check_type,
    COUNT(*) as users_with_bitwise_permissions,
    MIN(permissions_bitwise) as min_permissions,
    MAX(permissions_bitwise) as max_permissions
FROM user_profiles 
WHERE permissions_bitwise > 0;

-- Show the new audit view
SELECT 'New audit view created' as status, COUNT(*) as user_count
FROM user_permissions_audit_view;

-- Log the fix
INSERT INTO public.migration_log (migration_name, description, executed_at)
VALUES (
  '20250828_fix_permissions_column_dependencies',
  'Fixed dependency error: Dropped migration_audit_view and other dependent objects, then removed old permissions array column, created new bitwise-only audit view',
  NOW()
) ON CONFLICT (migration_name) DO UPDATE SET
  executed_at = NOW(),
  description = EXCLUDED.description;

SELECT 'Dependencies fixed, old permissions column removed!' as status;

COMMIT;