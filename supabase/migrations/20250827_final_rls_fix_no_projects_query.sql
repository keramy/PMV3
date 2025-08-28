-- Final RLS Fix: Completely Remove Projects Table Query
-- This removes ALL queries to the projects table to prevent any recursion

CREATE OR REPLACE FUNCTION user_can_access_project(user_id UUID, project_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
  user_assigned_projects UUID[];
BEGIN
  -- Get user role and assigned projects WITHOUT any projects table query
  SELECT role, assigned_projects 
  INTO user_role, user_assigned_projects
  FROM public.user_profiles
  WHERE id = user_id;
  
  -- If user not found, deny access
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admin sees everything
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Client sees only assigned projects
  IF user_role = 'client' THEN
    RETURN project_id = ANY(COALESCE(user_assigned_projects, ARRAY[]::UUID[]));
  END IF;
  
  -- For others (project_manager, team_member), check project_members table ONLY
  -- No direct projects table query to prevent recursion
  RETURN EXISTS (
    SELECT 1 
    FROM public.project_members pm
    WHERE pm.project_id = project_id 
    AND pm.user_id = user_id
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION user_can_access_project(UUID, UUID) TO authenticated;

-- Update comment
COMMENT ON FUNCTION user_can_access_project IS 'Final fix: Removed ALL projects table queries to prevent recursion. Uses only user_profiles and project_members tables.';