-- Migration: Update RLS Policies to Use Bitwise Permissions (FIXED)
-- Date: 2025-08-28
-- Description: Replace array-based permission checks with high-performance bitwise checks
-- Fixed: Array type casting issues

-- ============================================================================
-- PROJECTS TABLE - Enhanced with Project Owner Access
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "projects_access" ON projects;

-- Create new bitwise-based policy with project owner logic
CREATE POLICY "projects_access" ON projects
FOR ALL
USING (
  -- Project owner can always access their projects
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin/PM can view all projects (bit 0: VIEW_ALL_PROJECTS)
      (up.permissions_bitwise & 1) > 0 OR
      -- Others can view assigned projects (bit 1: VIEW_ASSIGNED_PROJECTS)
      ((up.permissions_bitwise & 2) > 0 AND 
       (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = projects.id AND pm.user_id = up.id) OR
        -- Fix array type casting: cast uuid[] to text[] for comparison
        COALESCE(up.assigned_projects, '{}')::text[] @> ARRAY[projects.id::text]))
    )
  )
);

-- ============================================================================
-- SCOPE ITEMS TABLE - With Project Owner Access
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "scope_items_access" ON scope_items;

-- Create new bitwise-based policy
CREATE POLICY "scope_items_access" ON scope_items
FOR ALL
USING (
  -- Project owner can access scope items
  EXISTS (SELECT 1 FROM projects p WHERE p.id = scope_items.project_id AND p.created_by = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin/PM can see all (bit 0: VIEW_ALL_PROJECTS)
      (up.permissions_bitwise & 1) > 0 OR
      -- Others can see if assigned to project (bit 1: VIEW_ASSIGNED_PROJECTS)
      ((up.permissions_bitwise & 2) > 0 AND 
       (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = scope_items.project_id AND pm.user_id = up.id) OR
        -- Fixed array casting
        COALESCE(up.assigned_projects, '{}')::text[] @> ARRAY[scope_items.project_id::text]))
    )
  )
);

-- ============================================================================
-- SHOP DRAWINGS TABLE - With Project Owner Access
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "shop_drawings_access" ON shop_drawings;

-- Create new bitwise-based policy
CREATE POLICY "shop_drawings_access" ON shop_drawings
FOR ALL
USING (
  -- Project owner can access drawings
  EXISTS (SELECT 1 FROM projects p WHERE p.id = shop_drawings.project_id AND p.created_by = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin/PM can see all (bit 0: VIEW_ALL_PROJECTS)
      (up.permissions_bitwise & 1) > 0 OR
      -- Others can see if assigned to project AND have view drawings permission (bit 11: VIEW_SHOP_DRAWINGS)
      ((up.permissions_bitwise & 2) > 0 AND (up.permissions_bitwise & 2048) > 0 AND
       (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = shop_drawings.project_id AND pm.user_id = up.id) OR
        -- Fixed array casting
        COALESCE(up.assigned_projects, '{}')::text[] @> ARRAY[shop_drawings.project_id::text]))
    )
  )
);

-- ============================================================================
-- MATERIAL SPECS TABLE - With Project Owner Access
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "material_specs_access" ON material_specs;

-- Create material_specs policy if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'material_specs') THEN
    EXECUTE '
    CREATE POLICY "material_specs_access" ON material_specs
    FOR ALL
    USING (
      -- Project owner can access material specs
      EXISTS (SELECT 1 FROM projects p WHERE p.id = material_specs.project_id AND p.created_by = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid() 
        AND (
          -- Admin/PM can see all (bit 0: VIEW_ALL_PROJECTS)
          (up.permissions_bitwise & 1) > 0 OR
          -- Others can see if assigned to project (bit 1: VIEW_ASSIGNED_PROJECTS)
          ((up.permissions_bitwise & 2) > 0 AND 
           (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = material_specs.project_id AND pm.user_id = up.id) OR
            COALESCE(up.assigned_projects, ARRAY[]::uuid[])::text[] @> ARRAY[material_specs.project_id::text]))
        )
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- TASKS TABLE - With Project Owner Access
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "tasks_access" ON tasks;

-- Create new bitwise-based policy
CREATE POLICY "tasks_access" ON tasks
FOR ALL
USING (
  -- Project owner can access tasks
  EXISTS (SELECT 1 FROM projects p WHERE p.id = tasks.project_id AND p.created_by = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin/PM can see all (bit 0: VIEW_ALL_PROJECTS)
      (up.permissions_bitwise & 1) > 0 OR
      -- Others can see if assigned to project (bit 1: VIEW_ASSIGNED_PROJECTS)
      ((up.permissions_bitwise & 2) > 0 AND 
       (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = tasks.project_id AND pm.user_id = up.id) OR
        -- Fixed array casting
        COALESCE(up.assigned_projects, '{}')::text[] @> ARRAY[tasks.project_id::text])) OR
      -- Users can see tasks assigned to them
      tasks.assigned_to = up.id
    )
  )
);

-- ============================================================================
-- USER PROFILES TABLE - Admin and Team Management Access
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "user_profiles_access" ON user_profiles;

-- Create new bitwise-based policy
CREATE POLICY "user_profiles_access" ON user_profiles
FOR ALL
USING (
  -- Users can always see their own profile
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND (
      -- Admin can see all users (bit 18: MANAGE_ALL_USERS)
      (up.permissions_bitwise & 262144) > 0 OR
      -- PM+ can see all users (bit 16: VIEW_ALL_USERS) 
      (up.permissions_bitwise & 65536) > 0
    )
  )
);

-- ============================================================================
-- NOTIFICATIONS TABLE - User-Specific Access
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "notifications_access" ON notifications;

-- Check if notifications table exists before creating policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE '
    CREATE POLICY "notifications_access" ON notifications
    FOR ALL
    USING (
      -- Users can see their own notifications
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid() 
        AND (
          -- Admin can see all notifications (bit 18: MANAGE_ALL_USERS)
          (up.permissions_bitwise & 262144) > 0
        )
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- ACTIVITY LOGS TABLE - Admin Access Only
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "activity_logs_access" ON activity_logs;

-- Check if activity_logs table exists before creating policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
    EXECUTE '
    CREATE POLICY "activity_logs_access" ON activity_logs
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid() 
        AND (
          -- Only admin and those with audit log permission (bit 25: VIEW_AUDIT_LOGS)
          (up.permissions_bitwise & 33554432) > 0
        )
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- SHOP DRAWING COMMENTS TABLE - Project-based Access
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "shop_drawing_comments_access" ON shop_drawing_comments;

-- Check if shop_drawing_comments table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_drawing_comments') THEN
    EXECUTE '
    CREATE POLICY "shop_drawing_comments_access" ON shop_drawing_comments
    FOR ALL
    USING (
      -- Users can access comments if they can access the shop drawing
      EXISTS (
        SELECT 1 FROM shop_drawings sd 
        WHERE sd.id = shop_drawing_comments.shop_drawing_id
        AND (
          -- Project owner
          EXISTS (SELECT 1 FROM projects p WHERE p.id = sd.project_id AND p.created_by = auth.uid()) OR
          EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() 
            AND (
              -- Admin/PM can see all
              (up.permissions_bitwise & 1) > 0 OR
              -- Others can see if assigned and have view permission
              ((up.permissions_bitwise & 2) > 0 AND (up.permissions_bitwise & 2048) > 0 AND
               (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = sd.project_id AND pm.user_id = up.id) OR
                COALESCE(up.assigned_projects, ARRAY[]::uuid[])::text[] @> ARRAY[sd.project_id::text]))
            )
          )
        )
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- TASK COMMENTS TABLE - Project-based Access  
-- ============================================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "task_comments_access" ON task_comments;

-- Check if task_comments table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_comments') THEN
    EXECUTE 'CREATE POLICY "task_comments_access" ON task_comments
    FOR ALL
    USING (
      -- Users can access comments if they can access the task
      EXISTS (
        SELECT 1 FROM tasks t
        WHERE t.id = task_comments.task_id
        AND (
          -- Project owner
          EXISTS (SELECT 1 FROM projects p WHERE p.id = t.project_id AND p.created_by = auth.uid()) OR
          -- Task assigned to user
          t.assigned_to = auth.uid() OR
          EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() 
            AND (
              -- Admin/PM can see all
              (up.permissions_bitwise & 1) > 0 OR
              -- Others can see if assigned to project
              ((up.permissions_bitwise & 2) > 0 AND
               (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = t.project_id AND pm.user_id = up.id) OR
                COALESCE(up.assigned_projects, ARRAY[]::uuid[])::text[] @> ARRAY[t.project_id::text]))
            )
          )
        )
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- PERFORMANCE IMPROVEMENTS
-- ============================================================================

-- Add index on permissions_bitwise for common permission checks if not exists
CREATE INDEX IF NOT EXISTS idx_user_profiles_permissions_bitwise 
ON user_profiles(permissions_bitwise);

-- Add index for project owner lookups
CREATE INDEX IF NOT EXISTS idx_projects_created_by 
ON projects(created_by);

-- Add index for project members (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_members') THEN
    CREATE INDEX IF NOT EXISTS idx_project_members_project_user 
    ON project_members(project_id, user_id);
  END IF;
END $$;

-- Add index for task assignments
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test RLS policies are working (these should run without errors)
SELECT 'RLS policies updated successfully with bitwise permissions!' as status;

-- Verify common permission bit values work
SELECT 
  'Admin permission test' as test,
  (268435455 & 1) > 0 as can_view_all_projects,
  (268435455 & 32) > 0 as can_view_financials,
  (268435455 & 262144) > 0 as can_manage_users;

SELECT 
  'Client permission test' as test,
  (34818 & 1) = 0 as cannot_view_all_projects,
  (34818 & 32) = 0 as cannot_view_financials,  
  (34818 & 2) > 0 as can_view_assigned_projects;

-- Count policies created
SELECT 
  'Total RLS policies' as info,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public';

-- Show bitwise permission migration summary
SELECT 
  'User permission migration summary' as info,
  role,
  COUNT(*) as user_count,
  MIN(permissions_bitwise) as min_permissions,
  MAX(permissions_bitwise) as max_permissions,
  -- Show some actual permission names for verification
  CASE 
    WHEN MAX(permissions_bitwise) = 268435455 THEN 'All permissions (Admin)'
    WHEN MAX(permissions_bitwise) = 184549375 THEN 'Project Manager level'
    WHEN MAX(permissions_bitwise) = 4718594 THEN 'Team Member level'
    WHEN MAX(permissions_bitwise) = 34818 THEN 'Client level'
    ELSE 'Custom permission set'
  END as permission_type
FROM user_profiles
WHERE permissions_bitwise > 0
GROUP BY role
ORDER BY MAX(permissions_bitwise) DESC;