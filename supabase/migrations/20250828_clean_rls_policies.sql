-- Clean up duplicate and conflicting RLS policies
-- Keep only bitwise-based policies for consistent authentication

BEGIN;

-- ============================================================================
-- PROJECTS TABLE - Keep only bitwise policy
-- ============================================================================

-- Drop old role-based and function-based policies
DROP POLICY IF EXISTS "projects_delete" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects; 
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;

-- Keep only: projects_access (bitwise-based)

-- ============================================================================
-- TASKS TABLE - Keep only bitwise policy  
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "tasks_delete_enhanced" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_enhanced" ON public.tasks;
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;

-- Keep only: tasks_access (bitwise-based)

-- ============================================================================
-- SHOP DRAWINGS TABLE - Keep only bitwise policy
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "shop_drawings_insert" ON public.shop_drawings;
DROP POLICY IF EXISTS "shop_drawings_select" ON public.shop_drawings;
DROP POLICY IF EXISTS "shop_drawings_select_policy" ON public.shop_drawings;
DROP POLICY IF EXISTS "shop_drawings_update_policy" ON public.shop_drawings;

-- Keep only: shop_drawings_access (bitwise-based)

-- ============================================================================
-- MATERIAL SPECS TABLE - Keep only bitwise policy
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "material_specs_insert" ON public.material_specs;
DROP POLICY IF EXISTS "material_specs_select" ON public.material_specs;
DROP POLICY IF EXISTS "material_specs_select_policy" ON public.material_specs;
DROP POLICY IF EXISTS "material_specs_update_policy" ON public.material_specs;

-- Keep only: material_specs_access (bitwise-based)

-- ============================================================================
-- LOG CHANGES
-- ============================================================================

-- Log the cleanup
INSERT INTO public.migration_log (migration_name, description, executed_at)
VALUES (
  '20250828_clean_rls_policies',
  'Cleaned up duplicate RLS policies - kept only bitwise-based policies for consistent authentication',
  NOW()
) ON CONFLICT (migration_name) DO UPDATE SET
  executed_at = NOW(),
  description = EXCLUDED.description;

COMMIT;