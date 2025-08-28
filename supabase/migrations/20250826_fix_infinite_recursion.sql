-- Fix Infinite Recursion in user_can_access_project Function
-- The function was querying projects table which triggers RLS policy, causing infinite recursion

-- Replace the function with SECURITY DEFINER to bypass RLS (don't drop due to policy dependencies)

CREATE OR REPLACE FUNCTION user_can_access_project(user_id UUID, project_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
AS $$
DECLARE
  user_perms RECORD;
  project_created_by UUID;
  project_manager UUID;
BEGIN
  -- Get user permissions
  SELECT * INTO user_perms FROM get_effective_permissions(user_id);
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Admin sees everything
  IF user_perms.role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Client sees only assigned projects
  IF user_perms.role = 'client' THEN
    RETURN project_id = ANY(user_perms.assigned_projects);
  END IF;
  
  -- For others, check project ownership and membership without triggering RLS
  -- Use SECURITY DEFINER context to bypass RLS on projects table
  SELECT created_by, project_manager INTO project_created_by, project_manager
  FROM projects 
  WHERE id = project_id;
  
  -- Check if user is creator or manager
  IF project_created_by = user_id OR project_manager = user_id THEN
    RETURN true;
  END IF;
  
  -- Check project membership
  RETURN EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = project_id AND pm.user_id = user_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION user_can_access_project(UUID, UUID) TO authenticated;

-- Add comment explaining the fix
COMMENT ON FUNCTION user_can_access_project IS 'Fixed infinite recursion by using SECURITY DEFINER to bypass RLS when checking projects table';