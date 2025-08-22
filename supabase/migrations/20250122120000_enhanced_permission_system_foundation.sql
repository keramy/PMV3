-- ============================================================================
-- Formula PM V3: Enhanced Permission System Foundation
-- Migration: 20250122120000_enhanced_permission_system_foundation
-- Description: Adds role-based permission system with individual overrides
-- Author: Claude AI Assistant
-- Date: 2025-01-22
-- ============================================================================

-- Add new permission system columns to user_profiles (non-breaking)
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'team_member',
  ADD COLUMN IF NOT EXISTS can_view_costs BOOLEAN DEFAULT NULL,  -- NULL = use role default
  ADD COLUMN IF NOT EXISTS assigned_projects UUID[] DEFAULT '{}';

-- Create role configuration table for easy management
CREATE TABLE IF NOT EXISTS role_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  permission_level INTEGER NOT NULL,
  default_can_view_costs BOOLEAN NOT NULL DEFAULT false,
  default_can_edit_costs BOOLEAN NOT NULL DEFAULT false,
  project_access_type TEXT NOT NULL DEFAULT 'assigned', -- 'all', 'assigned', 'restricted'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default role configurations
INSERT INTO role_configurations (role_name, display_name, permission_level, default_can_view_costs, default_can_edit_costs, project_access_type, description)
VALUES 
  ('admin', 'Administrator', 100, true, true, 'all', 'Full system access'),
  ('technical_manager', 'Technical Manager', 80, true, true, 'all', 'Can view and edit costs for technical decisions'),
  ('project_manager', 'Project Manager', 60, true, false, 'assigned', 'Can view costs for budgeting and planning'),
  ('team_member', 'Team Member', 30, false, false, 'assigned', 'Basic project access without cost visibility'),
  ('client', 'Client', 10, false, false, 'restricted', 'Limited access to assigned projects only')
ON CONFLICT (role_name) DO NOTHING;

-- Helper function to get effective user permissions
CREATE OR REPLACE FUNCTION get_effective_permissions(user_id UUID)
RETURNS TABLE(
  role TEXT,
  permission_level INTEGER,
  can_view_costs BOOLEAN,
  can_edit_costs BOOLEAN,
  project_access_type TEXT,
  assigned_projects UUID[]
) AS $$
DECLARE
  user_rec RECORD;
  role_config RECORD;
BEGIN
  -- Get user data
  SELECT up.role, up.can_view_costs, up.assigned_projects
  INTO user_rec
  FROM user_profiles up
  WHERE up.id = user_id;
  
  -- Get role configuration
  SELECT rc.*
  INTO role_config
  FROM role_configurations rc
  WHERE rc.role_name = COALESCE(user_rec.role, 'team_member');
  
  -- Return effective permissions
  RETURN QUERY SELECT
    role_config.role_name,
    role_config.permission_level,
    COALESCE(user_rec.can_view_costs, role_config.default_can_view_costs),
    role_config.default_can_edit_costs,
    role_config.project_access_type,
    COALESCE(user_rec.assigned_projects, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view costs
CREATE OR REPLACE FUNCTION user_can_view_costs(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT can_view_costs 
  INTO result
  FROM get_effective_permissions(user_id);
  
  RETURN COALESCE(result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user's project access
CREATE OR REPLACE FUNCTION user_can_access_project(user_id UUID, project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_perms RECORD;
BEGIN
  SELECT * INTO user_perms FROM get_effective_permissions(user_id);
  
  -- Admin sees everything
  IF user_perms.permission_level >= 100 THEN
    RETURN true;
  END IF;
  
  -- Client restricted to assigned projects only
  IF user_perms.project_access_type = 'restricted' THEN
    RETURN project_id = ANY(user_perms.assigned_projects);
  END IF;
  
  -- Check if user is a project member (existing logic)
  RETURN EXISTS (
    SELECT 1 FROM project_members 
    WHERE user_id = $1 AND project_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Data migration function to convert existing array permissions
CREATE OR REPLACE FUNCTION migrate_existing_permissions()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  new_role TEXT;
  migrated_count INTEGER := 0;
BEGIN
  FOR user_record IN SELECT id, permissions FROM user_profiles WHERE role IS NULL OR role = 'team_member' LOOP
    -- Determine role based on existing permissions
    new_role := 'team_member'; -- default
    
    IF 'admin' = ANY(user_record.permissions) OR 
       array_length(user_record.permissions, 1) > 15 THEN
      new_role := 'admin';
    ELSIF 'manage_costs' = ANY(user_record.permissions) OR
          'edit_budget' = ANY(user_record.permissions) OR
          'technical_review' = ANY(user_record.permissions) THEN
      new_role := 'technical_manager';
    ELSIF 'view_costs' = ANY(user_record.permissions) OR
          'manage_projects' = ANY(user_record.permissions) OR
          'project_oversight' = ANY(user_record.permissions) THEN
      new_role := 'project_manager';
    ELSIF 'view_projects' = ANY(user_record.permissions) AND
          array_length(user_record.permissions, 1) > 5 THEN
      new_role := 'team_member';
    ELSIF array_length(user_record.permissions, 1) <= 3 THEN
      new_role := 'client';
    END IF;
    
    -- Update user with new role
    UPDATE user_profiles 
    SET role = new_role,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_assigned_projects ON user_profiles USING GIN(assigned_projects);
CREATE INDEX IF NOT EXISTS idx_role_configurations_role_name ON role_configurations(role_name);

-- Add helpful comments
COMMENT ON COLUMN user_profiles.role IS 'User role determining default permissions (admin, technical_manager, project_manager, team_member, client)';
COMMENT ON COLUMN user_profiles.can_view_costs IS 'Individual cost visibility override: NULL=use role default, true/false=explicit override';
COMMENT ON COLUMN user_profiles.assigned_projects IS 'Project IDs this user can access (used for client isolation)';

-- Enable RLS on role_configurations table
ALTER TABLE role_configurations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read role configurations (for UI)
CREATE POLICY "role_configurations_read" ON role_configurations
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can modify role configurations
CREATE POLICY "role_configurations_admin_only" ON role_configurations
  FOR ALL TO authenticated
  USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');