-- ============================================================================
-- Formula PM V3: Migrate Existing Permissions Data (OPTIONAL)
-- Migration: 20250122120200_migrate_existing_permissions_data
-- Description: Converts existing array-based permissions to role system
-- Author: Claude AI Assistant
-- Date: 2025-01-22
-- Depends on: 20250122120000_enhanced_permission_system_foundation
-- WARNING: This is optional - only run if you want to migrate existing data
-- ============================================================================

-- Execute the migration function to convert array permissions to roles
-- This will analyze each user's permissions array and assign appropriate roles
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  -- Run the migration
  SELECT migrate_existing_permissions() INTO migrated_count;
  
  -- Log the results
  RAISE NOTICE 'Migrated % users from array permissions to role system', migrated_count;
END $$;

-- Display migration results for review
DO $$
DECLARE
  role_summary RECORD;
BEGIN
  RAISE NOTICE '=== MIGRATION SUMMARY ===';
  
  -- Show role distribution
  FOR role_summary IN 
    SELECT 
      role,
      COUNT(*) as user_count
    FROM user_profiles 
    WHERE role IS NOT NULL
    GROUP BY role 
    ORDER BY role
  LOOP
    RAISE NOTICE 'Role: % - Users: %', role_summary.role, role_summary.user_count;
  END LOOP;
  
  RAISE NOTICE '=== END SUMMARY ===';
END $$;

-- Create a backup view of the migration results for audit purposes
CREATE OR REPLACE VIEW migration_audit_view AS
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  permissions as old_permissions,
  can_view_costs,
  assigned_projects,
  updated_at as migration_date
FROM user_profiles
ORDER BY role, email;

-- Add comment
COMMENT ON VIEW migration_audit_view IS 'Audit view showing results of permission system migration - shows both old array permissions and new role assignments';

-- Insert audit log entry (system action, so user_id is NULL)
INSERT INTO activity_logs (
  user_id,
  action,
  entity_type,
  details,
  created_at
) VALUES (
  NULL, -- System action - no specific user
  'permission_system_migration',
  'user_profiles', -- Required entity_type field
  jsonb_build_object(
    'migration_timestamp', NOW(),
    'migration_type', 'array_to_role_conversion',
    'total_users_migrated', (SELECT COUNT(*) FROM user_profiles WHERE role IS NOT NULL),
    'performed_by', 'system_migration'
  ),
  NOW()
);