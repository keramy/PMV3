-- Migration: Add Cost Tracking to Scope Items
-- Date: 2025-01-12
-- Description: Add initial_cost and actual_cost columns to scope_items table with admin access control

-- Add cost tracking columns to scope_items table
ALTER TABLE scope_items 
ADD COLUMN initial_cost DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN actual_cost DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN cost_variance DECIMAL(12,2) GENERATED ALWAYS AS (actual_cost - initial_cost) STORED,
ADD COLUMN cost_variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
  CASE 
    WHEN initial_cost > 0 THEN ((actual_cost - initial_cost) / initial_cost) * 100
    ELSE 0
  END
) STORED;

-- Add comments for documentation
COMMENT ON COLUMN scope_items.initial_cost IS 'Original budgeted cost for the scope item';
COMMENT ON COLUMN scope_items.actual_cost IS 'Actual incurred cost for the scope item';
COMMENT ON COLUMN scope_items.cost_variance IS 'Calculated difference between actual and initial cost';
COMMENT ON COLUMN scope_items.cost_variance_percentage IS 'Percentage variance between actual and initial cost';

-- Create index for cost-based queries
CREATE INDEX idx_scope_items_cost_tracking ON scope_items(initial_cost, actual_cost);
CREATE INDEX idx_scope_items_cost_variance ON scope_items(cost_variance) WHERE cost_variance != 0;

-- Update existing records to use unit_cost * quantity as initial_cost if not set
UPDATE scope_items 
SET initial_cost = (unit_cost * quantity)
WHERE initial_cost = 0.00 OR initial_cost IS NULL;

-- Create RLS policy for cost data access
-- Only users with 'view_project_costs' permission can see cost columns
CREATE POLICY "Cost data visible to authorized users" ON scope_items
FOR SELECT
USING (
  auth.uid() IN (
    SELECT up.user_id 
    FROM user_profiles up
    WHERE 'view_project_costs' = ANY(up.permissions)
  )
);

-- Create RLS policy for cost data updates
-- Only users with 'manage_project_costs' permission can update cost columns
CREATE POLICY "Cost data updatable by cost managers" ON scope_items
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT up.user_id 
    FROM user_profiles up
    WHERE 'manage_project_costs' = ANY(up.permissions)
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT up.user_id 
    FROM user_profiles up
    WHERE 'manage_project_costs' = ANY(up.permissions)
  )
);

-- Add the new permissions to the existing permissions enum if they don't exist
DO $$
BEGIN
  -- Check if permissions need to be added to any existing enum
  -- This is just documentation - permissions are stored as text arrays
  -- Add these permissions to admin users' permission arrays manually or via admin interface:
  -- 'view_project_costs' - Can view initial_cost, actual_cost, and variance data
  -- 'manage_project_costs' - Can edit initial_cost and actual_cost values
  
  RAISE NOTICE 'Cost tracking columns added successfully';
  RAISE NOTICE 'Grant these permissions to appropriate users:';
  RAISE NOTICE '- view_project_costs: View cost data and variance reports';
  RAISE NOTICE '- manage_project_costs: Edit initial and actual cost values';
END $$;

-- Create a view for cost analysis (accessible only to users with cost permissions)
CREATE VIEW scope_cost_analysis AS
SELECT 
  si.id,
  si.project_id,
  p.name AS project_name,
  si.title,
  si.category,
  si.quantity,
  si.unit,
  si.unit_cost,
  si.total_cost,
  si.initial_cost,
  si.actual_cost,
  si.cost_variance,
  si.cost_variance_percentage,
  CASE 
    WHEN si.cost_variance > 0 THEN 'over_budget'
    WHEN si.cost_variance < 0 THEN 'under_budget'
    ELSE 'on_budget'
  END AS budget_status,
  sub.name AS subcontractor_name,
  sub.trade AS subcontractor_trade
FROM scope_items si
LEFT JOIN projects p ON si.project_id = p.id
LEFT JOIN subcontractors sub ON si.subcontractor_id = sub.id
WHERE 
  -- Only show to users with cost viewing permissions
  auth.uid() IN (
    SELECT up.user_id 
    FROM user_profiles up
    WHERE 'view_project_costs' = ANY(up.permissions)
  );

-- Add RLS to the view
ALTER VIEW scope_cost_analysis SET (security_invoker = true);

-- Create helper function to check cost permissions
CREATE OR REPLACE FUNCTION has_cost_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles up
    WHERE up.user_id = auth.uid() 
    AND permission_name = ANY(up.permissions)
  );
$$;

-- Grant usage on the helper function
GRANT EXECUTE ON FUNCTION has_cost_permission(TEXT) TO authenticated;

-- Example queries for testing (run these after granting permissions):
/*

-- Grant cost permissions to an admin user (replace 'user-uuid' with actual user ID):
UPDATE user_profiles 
SET permissions = array_append(permissions, 'view_project_costs')
WHERE user_id = 'user-uuid' AND NOT ('view_project_costs' = ANY(permissions));

UPDATE user_profiles 
SET permissions = array_append(permissions, 'manage_project_costs')
WHERE user_id = 'user-uuid' AND NOT ('manage_project_costs' = ANY(permissions));

-- Test cost analysis view:
SELECT * FROM scope_cost_analysis 
WHERE budget_status != 'on_budget'
ORDER BY cost_variance_percentage DESC;

-- Update actual costs (only users with manage_project_costs can do this):
UPDATE scope_items 
SET actual_cost = 2000.00 
WHERE id = 'SCOPE001';

*/