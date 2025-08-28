-- ============================================================================
-- Formula PM V3: Client Isolation RLS Policies
-- Migration: 20250122120100_client_isolation_rls_policies
-- Description: Implements client project isolation and enhanced RLS policies
-- Author: Claude AI Assistant
-- Date: 2025-01-22
-- Depends on: 20250122120000_enhanced_permission_system_foundation
-- ============================================================================

-- Drop existing policies (we'll replace with enhanced versions)
DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;

DROP POLICY IF EXISTS "scope_items_select" ON scope_items;
DROP POLICY IF EXISTS "scope_items_update" ON scope_items;
DROP POLICY IF EXISTS "scope_items_insert" ON scope_items;
DROP POLICY IF EXISTS "scope_items_delete" ON scope_items;

DROP POLICY IF EXISTS "tasks_select" ON tasks;
DROP POLICY IF EXISTS "tasks_update" ON tasks;
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
DROP POLICY IF EXISTS "tasks_delete" ON tasks;

-- Enhanced Projects RLS with client isolation
CREATE POLICY "projects_select_enhanced" ON projects FOR SELECT USING (
  CASE 
    -- Admin sees everything
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin' THEN true
    
    -- Client sees only specifically assigned projects
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'client' THEN
      id = ANY(SELECT unnest(assigned_projects) FROM user_profiles WHERE id = auth.uid())
    
    -- Others see projects they're members of or created
    ELSE 
      created_by = auth.uid() 
      OR project_manager = auth.uid()
      OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  END
);

CREATE POLICY "projects_insert_enhanced" ON projects FOR INSERT WITH CHECK (
  -- Only admin, technical managers, and project managers can create projects
  (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'technical_manager', 'project_manager')
);

CREATE POLICY "projects_update_enhanced" ON projects FOR UPDATE USING (
  CASE 
    -- Admin can update anything
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin' THEN true
    
    -- Clients cannot update projects
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'client' THEN false
    
    -- Others can update projects they're involved in
    ELSE 
      created_by = auth.uid() 
      OR project_manager = auth.uid()
      OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  END
);

CREATE POLICY "projects_delete_enhanced" ON projects FOR DELETE USING (
  -- Only admin or project creator can delete
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  OR created_by = auth.uid()
);

-- Enhanced Scope Items RLS with client isolation and cost protection
CREATE POLICY "scope_items_select_enhanced" ON scope_items FOR SELECT USING (
  CASE 
    -- Admin sees everything
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin' THEN true
    
    -- Client sees scope items from assigned projects only
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'client' THEN
      project_id = ANY(SELECT unnest(assigned_projects) FROM user_profiles WHERE id = auth.uid())
    
    -- Others see scope items from accessible projects
    ELSE 
      project_id IN (
        SELECT p.id FROM projects p
        WHERE p.created_by = auth.uid() 
           OR p.project_manager = auth.uid()
           OR p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      )
  END
);

CREATE POLICY "scope_items_insert_enhanced" ON scope_items FOR INSERT WITH CHECK (
  -- Clients cannot create scope items
  (SELECT role FROM user_profiles WHERE id = auth.uid()) != 'client'
  AND
  -- Must be able to access the project
  project_id IN (
    SELECT p.id FROM projects p
    WHERE p.created_by = auth.uid() 
       OR p.project_manager = auth.uid()
       OR p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  )
);

CREATE POLICY "scope_items_update_enhanced" ON scope_items FOR UPDATE USING (
  -- Clients cannot update scope items
  (SELECT role FROM user_profiles WHERE id = auth.uid()) != 'client'
  AND
  -- Must be able to access the project
  project_id IN (
    SELECT p.id FROM projects p
    WHERE p.created_by = auth.uid() 
       OR p.project_manager = auth.uid()
       OR p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  )
);

CREATE POLICY "scope_items_delete_enhanced" ON scope_items FOR DELETE USING (
  -- Only admin or project stakeholders can delete
  (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'technical_manager', 'project_manager')
  AND
  project_id IN (
    SELECT p.id FROM projects p
    WHERE p.created_by = auth.uid() 
       OR p.project_manager = auth.uid()
       OR p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  )
);

-- Enhanced Tasks RLS with client isolation
CREATE POLICY "tasks_select_enhanced" ON tasks FOR SELECT USING (
  CASE 
    -- Admin sees everything
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin' THEN true
    
    -- Client sees tasks from assigned projects only
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'client' THEN
      project_id = ANY(SELECT unnest(assigned_projects) FROM user_profiles WHERE id = auth.uid())
    
    -- Others see tasks from accessible projects
    ELSE 
      project_id IN (
        SELECT p.id FROM projects p
        WHERE p.created_by = auth.uid() 
           OR p.project_manager = auth.uid()
           OR p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      )
  END
);

CREATE POLICY "tasks_insert_enhanced" ON tasks FOR INSERT WITH CHECK (
  -- Clients cannot create tasks
  (SELECT role FROM user_profiles WHERE id = auth.uid()) != 'client'
  AND
  -- Must be able to access the project
  project_id IN (
    SELECT p.id FROM projects p
    WHERE p.created_by = auth.uid() 
       OR p.project_manager = auth.uid()
       OR p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  )
);

CREATE POLICY "tasks_update_enhanced" ON tasks FOR UPDATE USING (
  -- Clients can only update tasks assigned to them
  CASE 
    WHEN (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'client' THEN
      assigned_to = auth.uid()
      AND project_id = ANY(SELECT unnest(assigned_projects) FROM user_profiles WHERE id = auth.uid())
    
    -- Others can update tasks in accessible projects
    ELSE 
      project_id IN (
        SELECT p.id FROM projects p
        WHERE p.created_by = auth.uid() 
           OR p.project_manager = auth.uid()
           OR p.id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
      )
  END
);

CREATE POLICY "tasks_delete_enhanced" ON tasks FOR DELETE USING (
  -- Clients cannot delete tasks
  (SELECT role FROM user_profiles WHERE id = auth.uid()) != 'client'
  AND
  -- Must be admin or project stakeholder
  (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
    OR created_by = auth.uid()
    OR project_id IN (
      SELECT p.id FROM projects p
      WHERE p.created_by = auth.uid() 
         OR p.project_manager = auth.uid()
    )
  )
);

-- Function to help admins assign projects to clients
CREATE OR REPLACE FUNCTION assign_client_to_projects(
  client_user_id UUID,
  project_ids UUID[]
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins can assign clients to projects
  IF (SELECT role FROM user_profiles WHERE id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can assign clients to projects';
  END IF;
  
  -- Verify the target user is a client
  IF (SELECT role FROM user_profiles WHERE id = client_user_id) != 'client' THEN
    RAISE EXCEPTION 'Target user must have client role';
  END IF;
  
  -- Update the client's assigned projects
  UPDATE user_profiles 
  SET assigned_projects = project_ids,
      updated_at = NOW()
  WHERE id = client_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user can access a specific project (for API use)
CREATE OR REPLACE FUNCTION can_user_access_project(check_user_id UUID, check_project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_projects UUID[];
BEGIN
  -- Get user role and assigned projects
  SELECT role, assigned_projects 
  INTO user_role, user_projects
  FROM user_profiles 
  WHERE id = check_user_id;
  
  -- Admin can access everything
  IF user_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Client can only access assigned projects
  IF user_role = 'client' THEN
    RETURN check_project_id = ANY(user_projects);
  END IF;
  
  -- Others check project membership
  RETURN EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = check_project_id
      AND (
        p.created_by = check_user_id 
        OR p.project_manager = check_user_id
        OR p.id IN (SELECT project_id FROM project_members WHERE user_id = check_user_id)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;