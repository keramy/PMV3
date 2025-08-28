-- Migration: Add Bitwise Permissions System
-- Date: 2025-08-28
-- Description: Add bitwise permission column and supporting infrastructure

-- ============================================================================
-- STEP 1: Add bitwise permissions column (non-breaking change)
-- ============================================================================

ALTER TABLE user_profiles 
ADD COLUMN permissions_bitwise BIGINT DEFAULT 0;

-- Add performance index for bitwise checks
CREATE INDEX idx_user_profiles_permissions_bitwise 
ON user_profiles(permissions_bitwise);

-- Add project owner access index (if not exists)
CREATE INDEX IF NOT EXISTS idx_projects_created_by 
ON projects(created_by);

-- Add helpful comment
COMMENT ON COLUMN user_profiles.permissions_bitwise IS 'Bitwise permission flags for high-performance permission checking';

-- ============================================================================
-- STEP 2: Create project-specific approvers table
-- ============================================================================

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

-- Add helpful comment
COMMENT ON TABLE project_approvers IS 'Project-specific approver assignments for flexible approval workflows';

-- ============================================================================
-- STEP 3: Populate bitwise permissions for existing users
-- ============================================================================

-- Migration function to convert existing permissions to bitwise
CREATE OR REPLACE FUNCTION migrate_user_permissions() RETURNS void AS $$
DECLARE
  user_record RECORD;
  bitwise_perms BIGINT := 0;
BEGIN
  FOR user_record IN SELECT id, permissions, role FROM user_profiles LOOP
    bitwise_perms := 0;
    
    -- Set permissions based on role using optimized values from our plan
    CASE user_record.role
      WHEN 'admin' THEN
        bitwise_perms := 268435455;  -- All 28 permissions
      WHEN 'technical_manager' THEN  
        bitwise_perms := 251658239;  -- All except admin functions and delete
      WHEN 'project_manager' THEN
        bitwise_perms := 184549375;  -- Management permissions without expense approval  
      WHEN 'team_member' THEN
        bitwise_perms := 4718594;    -- Basic work permissions
      WHEN 'client' THEN
        bitwise_perms := 34818;      -- Limited view access
      ELSE
        -- Default to team member permissions for unknown roles
        bitwise_perms := 4718594;
    END CASE;
    
    -- Update user with bitwise permissions
    UPDATE user_profiles 
    SET permissions_bitwise = bitwise_perms 
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Migrated user % (%) to bitwise permissions: %', 
      user_record.id, user_record.role, bitwise_perms;
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- Execute migration
SELECT migrate_user_permissions();

-- Clean up migration function
DROP FUNCTION migrate_user_permissions();

-- ============================================================================
-- STEP 4: Enable RLS on project_approvers table
-- ============================================================================

ALTER TABLE project_approvers ENABLE ROW LEVEL SECURITY;

-- RLS policy for project_approvers access
CREATE POLICY "project_approvers_access" ON project_approvers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin can see all
      (up.permissions_bitwise & 262144) > 0 OR  -- MANAGE_ALL_USERS
      -- Project managers can see their projects  
      ((up.permissions_bitwise & 8) > 0 AND 
       EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = project_approvers.project_id AND pm.user_id = up.id)) OR
      -- Users can see their own assignments
      project_approvers.user_id = up.id
    )
  )
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'permissions_bitwise';

-- Verify all users have bitwise permissions populated
SELECT 
    role,
    COUNT(*) as user_count,
    MIN(permissions_bitwise) as min_perms,
    MAX(permissions_bitwise) as max_perms
FROM user_profiles 
GROUP BY role
ORDER BY role;

-- Verify project_approvers table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_approvers' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Bitwise permissions migration completed successfully!' as status;