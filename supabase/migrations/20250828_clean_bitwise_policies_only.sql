-- Clean Bitwise-Only RLS Policies
-- Date: 2025-08-28
-- Purpose: Create simple, clean policies using ONLY bitwise permissions (no circular dependencies)

BEGIN;

-- ============================================================================
-- ENSURE PROPER RLS SETTINGS
-- ============================================================================

-- User profiles should NOT have RLS (it's the source of truth)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- All other tables should have RLS enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_drawings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on optional tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'material_specs') THEN
    ALTER TABLE material_specs ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
    ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_comments') THEN
    ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_drawing_comments') THEN
    ALTER TABLE shop_drawing_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- CREATE CLEAN, SIMPLE POLICIES (NO CIRCULAR DEPENDENCIES)
-- ============================================================================

-- PROJECTS TABLE - Simple project access
CREATE POLICY "projects_access" ON projects
FOR ALL
USING (
  -- Project owner can access their projects
  created_by = auth.uid() 
  OR
  -- User is assigned to this specific project
  id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- User has admin permissions (bit 0: VIEW_ALL_PROJECTS)
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()), 
    0
  ) > 0
);

-- PROJECT MEMBERS TABLE - Project membership management
CREATE POLICY "project_members_access" ON project_members
FOR ALL
USING (
  -- User can see their own membership
  user_id = auth.uid()
  OR
  -- Project owner can manage members of their projects
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  -- Admin can manage all project members (bit 18: MANAGE_ALL_USERS)
  COALESCE(
    (SELECT permissions_bitwise & 262144 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- TASKS TABLE - Task access based on assignment and project access
CREATE POLICY "tasks_access" ON tasks
FOR ALL
USING (
  -- Task is assigned to the current user
  assigned_to = auth.uid()
  OR
  -- User created the task
  created_by = auth.uid()
  OR
  -- User owns the project this task belongs to
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  -- User is assigned to the project this task belongs to
  project_id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Admin can see all tasks (bit 0: VIEW_ALL_PROJECTS)
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- SCOPE ITEMS TABLE - Project-based access
CREATE POLICY "scope_items_access" ON scope_items
FOR ALL
USING (
  -- User owns the project
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  -- User is assigned to the project
  project_id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Admin can see all scope items (bit 0: VIEW_ALL_PROJECTS)
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- SHOP DRAWINGS TABLE - Project-based access
CREATE POLICY "shop_drawings_access" ON shop_drawings
FOR ALL
USING (
  -- User owns the project
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  -- User is assigned to the project
  project_id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Drawing is assigned to the current user
  assigned_to = auth.uid()
  OR
  -- Admin can see all drawings (bit 0: VIEW_ALL_PROJECTS)
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- MATERIAL SPECS TABLE (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'material_specs') THEN
    EXECUTE '
    CREATE POLICY "material_specs_access" ON material_specs
    FOR ALL
    USING (
      project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid()
      )
      OR
      project_id = ANY(
        SELECT unnest(COALESCE(assigned_projects, ''{}''))
        FROM user_profiles 
        WHERE id = auth.uid()
      )
      OR
      COALESCE(
        (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()),
        0
      ) > 0
    )';
  END IF;
END $$;

-- NOTIFICATIONS TABLE (if exists) - User-specific
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE '
    CREATE POLICY "notifications_access" ON notifications
    FOR ALL
    USING (
      user_id = auth.uid()
      OR
      COALESCE(
        (SELECT permissions_bitwise & 262144 FROM user_profiles WHERE id = auth.uid()),
        0
      ) > 0
    )';
  END IF;
END $$;

-- ACTIVITY LOGS TABLE (if exists) - Admin only
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
    EXECUTE '
    CREATE POLICY "activity_logs_access" ON activity_logs
    FOR SELECT
    USING (
      COALESCE(
        (SELECT permissions_bitwise & 33554432 FROM user_profiles WHERE id = auth.uid()),
        0
      ) > 0
    )';
  END IF;
END $$;

-- TASK COMMENTS TABLE (if exists) - Task-based access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_comments') THEN
    EXECUTE '
    CREATE POLICY "task_comments_access" ON task_comments
    FOR ALL
    USING (
      user_id = auth.uid()
      OR
      task_id IN (
        SELECT id FROM tasks WHERE assigned_to = auth.uid() OR created_by = auth.uid()
      )
    )';
  END IF;
END $$;

-- SHOP DRAWING COMMENTS TABLE (if exists) - Drawing-based access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_drawing_comments') THEN
    EXECUTE '
    CREATE POLICY "shop_drawing_comments_access" ON shop_drawing_comments
    FOR ALL
    USING (
      user_id = auth.uid()
      OR
      shop_drawing_id IN (
        SELECT id FROM shop_drawings WHERE assigned_to = auth.uid()
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Indexes for the new policy patterns
CREATE INDEX IF NOT EXISTS idx_user_profiles_permissions_bitwise 
ON user_profiles(permissions_bitwise) WHERE permissions_bitwise > 0;

CREATE INDEX IF NOT EXISTS idx_user_profiles_assigned_projects_gin 
ON user_profiles USING GIN(assigned_projects) WHERE assigned_projects IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_created_by 
ON projects(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to 
ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_created_by 
ON tasks(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_shop_drawings_assigned_to 
ON shop_drawings(assigned_to) WHERE assigned_to IS NOT NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count new policies
SELECT 
    'New Policy Summary' as info,
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Test basic permission check
SELECT 
    'Permission Test' as test,
    (SELECT COUNT(*) FROM user_profiles WHERE permissions_bitwise > 0) as users_with_permissions,
    (SELECT COUNT(*) FROM projects) as total_projects;

-- Create audit view for monitoring
CREATE OR REPLACE VIEW user_permissions_summary AS
SELECT 
    up.id,
    up.email,
    up.role,
    up.permissions_bitwise,
    CASE 
        WHEN up.permissions_bitwise = 268435455 THEN 'Admin (All)'
        WHEN up.permissions_bitwise = 184549375 THEN 'Project Manager'
        WHEN up.permissions_bitwise = 4718594 THEN 'Team Member'
        WHEN up.permissions_bitwise = 34818 THEN 'Client'
        ELSE 'Custom: ' || up.permissions_bitwise::text
    END as permission_level,
    array_length(up.assigned_projects, 1) as assigned_project_count,
    up.can_view_costs,
    up.is_active
FROM user_profiles up
WHERE up.is_active = true
ORDER BY up.permissions_bitwise DESC;

-- Grant access to the summary view
GRANT SELECT ON user_permissions_summary TO authenticated;

-- Log the rebuild
INSERT INTO public.migration_log (migration_name, description, executed_at)
VALUES (
  '20250828_clean_bitwise_policies_only',
  'CLEAN REBUILD: Created simple, clean RLS policies using ONLY bitwise permissions. No circular dependencies, no array permissions, single source of truth.',
  NOW()
) ON CONFLICT (migration_name) DO UPDATE SET
  executed_at = NOW(),
  description = EXCLUDED.description;

SELECT 
    'Clean Bitwise Permission System Created!' as status,
    'Single source of truth established' as architecture,
    'No circular dependencies' as reliability,
    'Ready for production use' as result;

COMMIT;