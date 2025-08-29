-- Complete Permission System Rebuild
-- Date: 2025-08-28
-- Purpose: Clean slate rebuild - remove all broken policies and mixed systems

BEGIN;

-- ============================================================================
-- PHASE 1: CLEAN HOUSE - REMOVE ALL BROKEN POLICIES
-- ============================================================================

-- Drop ALL existing RLS policies on ALL tables
-- (This will break the infinite recursion immediately)

-- Projects table policies
DROP POLICY IF EXISTS "projects_access" ON projects;
DROP POLICY IF EXISTS "projects_admin_access" ON projects;
DROP POLICY IF EXISTS "projects_member_access" ON projects;
DROP POLICY IF EXISTS "projects_owner_access" ON projects;

-- Project members table policies  
DROP POLICY IF EXISTS "project_members_delete" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "users_delete_project_members" ON project_members;
DROP POLICY IF EXISTS "users_manage_project_members" ON project_members;
DROP POLICY IF EXISTS "users_update_project_members" ON project_members;
DROP POLICY IF EXISTS "users_view_project_members" ON project_members;

-- Tasks table policies
DROP POLICY IF EXISTS "tasks_access" ON tasks;
DROP POLICY IF EXISTS "tasks_select_enhanced" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_update_enhanced" ON tasks;

-- Scope items table policies
DROP POLICY IF EXISTS "scope_items_access" ON scope_items;
DROP POLICY IF EXISTS "scope_items_delete_enhanced" ON scope_items;
DROP POLICY IF EXISTS "scope_items_insert" ON scope_items;
DROP POLICY IF EXISTS "scope_items_insert_enhanced" ON scope_items;
DROP POLICY IF EXISTS "scope_items_select" ON scope_items;
DROP POLICY IF EXISTS "scope_items_select_enhanced" ON scope_items;
DROP POLICY IF EXISTS "scope_items_update" ON scope_items;
DROP POLICY IF EXISTS "scope_items_update_enhanced" ON scope_items;
DROP POLICY IF EXISTS "users_manage_scope_items" ON scope_items;
DROP POLICY IF EXISTS "users_view_scope_items" ON scope_items;

-- Shop drawings table policies
DROP POLICY IF EXISTS "shop_drawings_access" ON shop_drawings;
DROP POLICY IF EXISTS "shop_drawings_insert" ON shop_drawings;
DROP POLICY IF EXISTS "shop_drawings_select" ON shop_drawings;
DROP POLICY IF EXISTS "shop_drawings_select_policy" ON shop_drawings;
DROP POLICY IF EXISTS "shop_drawings_update_policy" ON shop_drawings;

-- Material specs table policies
DROP POLICY IF EXISTS "material_specs_access" ON material_specs;
DROP POLICY IF EXISTS "material_specs_insert" ON material_specs;
DROP POLICY IF EXISTS "material_specs_select" ON material_specs;
DROP POLICY IF EXISTS "material_specs_select_policy" ON material_specs;
DROP POLICY IF EXISTS "material_specs_update_policy" ON material_specs;

-- Other table policies
DROP POLICY IF EXISTS "user_profiles_access" ON user_profiles;
DROP POLICY IF EXISTS "notifications_access" ON notifications;
DROP POLICY IF EXISTS "activity_logs_access" ON activity_logs;
DROP POLICY IF EXISTS "shop_drawing_comments_access" ON shop_drawing_comments;
DROP POLICY IF EXISTS "task_comments_access" ON task_comments;

-- ============================================================================
-- PHASE 2: REMOVE OLD PERMISSION SYSTEM
-- ============================================================================

-- Remove the old array-based permissions column completely
ALTER TABLE user_profiles DROP COLUMN IF EXISTS permissions;

-- Remove any permission-checking functions that might exist
DROP FUNCTION IF EXISTS user_can_access_project(uuid, uuid);
DROP FUNCTION IF EXISTS has_permission(uuid, text);
DROP FUNCTION IF EXISTS check_permissions(text[]);

-- ============================================================================
-- PHASE 3: ENSURE SINGLE SOURCE OF TRUTH
-- ============================================================================

-- Ensure user_profiles has RLS disabled (it should be the source of truth)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Ensure all other tables have RLS enabled for controlled access
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on comment tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_comments') THEN
    ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_drawing_comments') THEN
    ALTER TABLE shop_drawing_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- PHASE 4: CREATE CLEAN, SIMPLE RLS POLICIES (NO CIRCULAR DEPENDENCIES)
-- ============================================================================

-- PROJECTS TABLE - Simple, no circular references
CREATE POLICY "projects_policy" ON projects
FOR ALL
USING (
  -- Project owner can access
  created_by = auth.uid() 
  OR
  -- User is assigned to this project
  id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- User has admin privileges (bitwise check)
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()), 
    0
  ) > 0
);

-- PROJECT MEMBERS TABLE - Simple project access check
CREATE POLICY "project_members_policy" ON project_members
FOR ALL
USING (
  -- User can see their own membership
  user_id = auth.uid()
  OR
  -- Project owner can manage members
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  -- Admin can manage all members
  COALESCE(
    (SELECT permissions_bitwise & 262144 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- TASKS TABLE - Project-based access
CREATE POLICY "tasks_policy" ON tasks
FOR ALL
USING (
  -- Task assigned to user
  assigned_to = auth.uid()
  OR
  -- User can access the project this task belongs to
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  project_id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Admin access
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- SCOPE ITEMS TABLE - Project-based access
CREATE POLICY "scope_items_policy" ON scope_items
FOR ALL
USING (
  -- User can access the project
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  project_id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Admin access
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- SHOP DRAWINGS TABLE - Project-based access
CREATE POLICY "shop_drawings_policy" ON shop_drawings
FOR ALL
USING (
  -- User can access the project
  project_id IN (
    SELECT id FROM projects WHERE created_by = auth.uid()
  )
  OR
  project_id = ANY(
    SELECT unnest(COALESCE(assigned_projects, '{}'))
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  OR
  -- Admin access
  COALESCE(
    (SELECT permissions_bitwise & 1 FROM user_profiles WHERE id = auth.uid()),
    0
  ) > 0
);

-- MATERIAL SPECS TABLE - Project-based access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'material_specs') THEN
    EXECUTE '
    CREATE POLICY "material_specs_policy" ON material_specs
    FOR ALL
    USING (
      project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid()
      )
      OR
      project_id = ANY(
        SELECT unnest(COALESCE(assigned_projects, '{}'))
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

-- NOTIFICATIONS TABLE - User-specific access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE '
    CREATE POLICY "notifications_policy" ON notifications
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

-- ACTIVITY LOGS TABLE - Admin access only
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
    EXECUTE '
    CREATE POLICY "activity_logs_policy" ON activity_logs
    FOR SELECT
    USING (
      COALESCE(
        (SELECT permissions_bitwise & 33554432 FROM user_profiles WHERE id = auth.uid()),
        0
      ) > 0
    )';
  END IF;
END $$;

-- TASK COMMENTS TABLE - Task-based access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_comments') THEN
    EXECUTE '
    CREATE POLICY "task_comments_policy" ON task_comments
    FOR ALL
    USING (
      user_id = auth.uid()
      OR
      task_id IN (
        SELECT id FROM tasks WHERE assigned_to = auth.uid()
      )
      OR
      task_id IN (
        SELECT t.id FROM tasks t
        WHERE t.project_id IN (
          SELECT id FROM projects WHERE created_by = auth.uid()
        )
        OR t.project_id = ANY(
          SELECT unnest(COALESCE(assigned_projects, '{}'))
          FROM user_profiles 
          WHERE id = auth.uid()
        )
      )
    )';
  END IF;
END $$;

-- SHOP DRAWING COMMENTS TABLE - Drawing-based access
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_drawing_comments') THEN
    EXECUTE '
    CREATE POLICY "shop_drawing_comments_policy" ON shop_drawing_comments
    FOR ALL
    USING (
      user_id = auth.uid()
      OR
      shop_drawing_id IN (
        SELECT sd.id FROM shop_drawings sd
        WHERE sd.project_id IN (
          SELECT id FROM projects WHERE created_by = auth.uid()
        )
        OR sd.project_id = ANY(
          SELECT unnest(COALESCE(assigned_projects, '{}'))
          FROM user_profiles 
          WHERE id = auth.uid()
        )
      )
    )';
  END IF;
END $$;

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Add indexes for the new policy patterns
CREATE INDEX IF NOT EXISTS idx_user_profiles_permissions_bitwise_only 
ON user_profiles(permissions_bitwise) WHERE permissions_bitwise > 0;

CREATE INDEX IF NOT EXISTS idx_user_profiles_assigned_projects_gin 
ON user_profiles USING GIN(assigned_projects);

CREATE INDEX IF NOT EXISTS idx_projects_created_by_auth 
ON projects(created_by) WHERE created_by IS NOT NULL;

-- ============================================================================
-- VERIFICATION & LOGGING
-- ============================================================================

-- Count policies to verify cleanup
SELECT 'Cleanup Summary' as info, 
  schemaname,
  COUNT(*) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname;

-- Test permission system
SELECT 
  'Permission System Test' as test,
  (SELECT COUNT(*) FROM user_profiles WHERE permissions_bitwise > 0) as users_with_permissions,
  (SELECT COUNT(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') as tables_with_policies;

-- Log the rebuild
INSERT INTO public.migration_log (migration_name, description, executed_at)
VALUES (
  '20250828_complete_permission_system_rebuild',
  'COMPLETE REBUILD: Removed all conflicting RLS policies, dropped old permissions array, created simple bitwise-only policies with no circular dependencies',
  NOW()
) ON CONFLICT (migration_name) DO UPDATE SET
  executed_at = NOW(),
  description = EXCLUDED.description;

SELECT 'Permission System Rebuild Complete!' as status,
       'All policies cleaned, single source of truth established' as result;

COMMIT;