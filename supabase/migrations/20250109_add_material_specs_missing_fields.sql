-- Migration: add_material_specs_missing_fields
-- Adds missing fields to material_specs table to match TypeScript interface
-- Author: Formula PM V3 Development Team  
-- Date: 2025-01-09

-- =============================================
-- 1. CREATE MATERIAL PRIORITY ENUM
-- =============================================

-- Create material priority enum type (reuse existing priority_level if available)
DO $$ 
BEGIN
    -- Check if priority_level enum already exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'material_priority') THEN
        -- Check if priority_level already exists from shop drawings migration
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
            -- Create alias for material specs
            CREATE TYPE material_priority AS ENUM ('low', 'medium', 'high', 'critical');
        ELSE
            -- Create the enum type
            CREATE TYPE material_priority AS ENUM ('low', 'medium', 'high', 'critical');
        END IF;
    END IF;
END $$;

-- =============================================
-- 2. ADD MISSING FIELDS TO MATERIAL_SPECS TABLE
-- =============================================

-- Add priority column with default 'medium' (NOT NULL)
ALTER TABLE material_specs 
ADD COLUMN IF NOT EXISTS priority material_priority NOT NULL DEFAULT 'medium';

-- Add review_date timestamp column (nullable)
ALTER TABLE material_specs 
ADD COLUMN IF NOT EXISTS review_date timestamp with time zone NULL;

-- Add review_notes text column (nullable) 
ALTER TABLE material_specs 
ADD COLUMN IF NOT EXISTS review_notes text NULL;

-- =============================================
-- 3. ADD HELPFUL COMMENTS FOR DOCUMENTATION
-- =============================================

-- Add comments to document the new fields
COMMENT ON COLUMN material_specs.priority IS 'Priority level for material specification review: low, medium, high, critical. Used by PMs to prioritize review queue.';
COMMENT ON COLUMN material_specs.review_date IS 'Timestamp when PM reviewed this material specification. Set when status changes from pending.';
COMMENT ON COLUMN material_specs.review_notes IS 'PM feedback and notes from the review process. Captured during approval/rejection/revision workflows.';

-- Update table comment to reflect PM-only workflow
COMMENT ON TABLE material_specs IS 'Material specifications with simplified PM-only approval workflow. Single decision maker (PM) reviews and approves material specifications.';

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Index for priority-based queries (PMs filtering by priority)
CREATE INDEX IF NOT EXISTS idx_material_specs_priority ON material_specs(priority);

-- Index for review date queries (tracking review timelines)
CREATE INDEX IF NOT EXISTS idx_material_specs_review_date ON material_specs(review_date);

-- Composite index for project-priority filtering (common query pattern)
CREATE INDEX IF NOT EXISTS idx_material_specs_project_priority ON material_specs(project_id, priority) WHERE status = 'pending';

-- Composite index for status-priority dashboard views
CREATE INDEX IF NOT EXISTS idx_material_specs_status_priority ON material_specs(status, priority, created_at DESC);

-- =============================================
-- 5. UPDATE EXISTING DATA WITH DEFAULT PRIORITY
-- =============================================

-- Set priority for existing records based on cost (business logic)
-- High cost items get higher priority for PM attention
UPDATE material_specs 
SET priority = CASE 
    WHEN total_cost >= 10000 THEN 'high'::material_priority
    WHEN total_cost >= 5000 THEN 'medium'::material_priority  
    WHEN total_cost >= 1000 THEN 'medium'::material_priority
    ELSE 'low'::material_priority
END
WHERE priority = 'medium' AND total_cost IS NOT NULL;

-- Set critical priority for items in certain categories that are expensive
UPDATE material_specs 
SET priority = 'critical'::material_priority
WHERE total_cost >= 15000 
  AND category IN ('structural', 'mechanical', 'electrical', 'hvac')
  AND status = 'pending';

-- =============================================
-- 6. CREATE HELPER FUNCTION FOR MATERIAL SPECS
-- =============================================

-- Function to automatically set review_date when status changes
CREATE OR REPLACE FUNCTION update_material_spec_review_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Set review_date when status changes from 'pending' to any other status
    IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.review_date IS NULL THEN
        NEW.review_date = NOW();
    END IF;
    
    -- Clear review_date if status goes back to pending (re-submitted)
    IF NEW.status = 'pending' AND OLD.status != 'pending' THEN
        NEW.review_date = NULL;
        NEW.review_notes = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to material_specs table
DROP TRIGGER IF EXISTS update_material_spec_review_date_trigger ON material_specs;
CREATE TRIGGER update_material_spec_review_date_trigger
    BEFORE UPDATE ON material_specs
    FOR EACH ROW EXECUTE FUNCTION update_material_spec_review_date();

-- =============================================
-- 7. CREATE USEFUL VIEWS FOR PM WORKFLOW
-- =============================================

-- View for PM dashboard showing material specs requiring attention
CREATE OR REPLACE VIEW material_specs_pm_dashboard AS
SELECT 
    ms.id,
    ms.project_id,
    p.name as project_name,
    ms.spec_number,
    ms.name,
    ms.category,
    ms.priority,
    ms.status,
    ms.total_cost,
    ms.supplier,
    ms.manufacturer,
    ms.model,
    ms.review_date,
    ms.review_notes,
    up_created.first_name || ' ' || up_created.last_name as created_by_name,
    up_approved.first_name || ' ' || up_approved.last_name as approved_by_name,
    ms.created_at,
    ms.approval_date,
    -- Days since creation (for tracking review time)
    EXTRACT(DAYS FROM (NOW() - ms.created_at))::integer as days_since_created,
    -- Days since review (for follow-up tracking)
    CASE 
        WHEN ms.review_date IS NOT NULL THEN 
            EXTRACT(DAYS FROM (NOW() - ms.review_date))::integer
        ELSE NULL 
    END as days_since_review
FROM material_specs ms
LEFT JOIN projects p ON ms.project_id = p.id
LEFT JOIN user_profiles up_created ON ms.created_by = up_created.id
LEFT JOIN user_profiles up_approved ON ms.approved_by = up_approved.id
ORDER BY 
    -- Priority sorting: critical, high, medium, low
    CASE ms.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2  
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    ms.created_at ASC;

-- =============================================
-- 8. UPDATE RLS POLICIES FOR NEW FIELDS
-- =============================================

-- The existing RLS policies should automatically cover the new fields
-- But let's ensure PMs can update the new fields during review process

-- Note: Assuming RLS is already enabled on material_specs table
-- This would typically be handled by existing policies that allow PMs to update specs

-- =============================================
-- 9. SAMPLE DATA UPDATE (Optional)
-- =============================================

-- Update existing sample data to use the new fields (if any exists)
DO $$
BEGIN
    -- Only run if there's sample data
    IF EXISTS (SELECT 1 FROM material_specs LIMIT 1) THEN
        -- Add some realistic review notes to approved items
        UPDATE material_specs 
        SET review_notes = 'Approved - meets project specifications and budget requirements.'
        WHERE status = 'approved' AND review_notes IS NULL;
        
        -- Add review notes to rejected items  
        UPDATE material_specs
        SET review_notes = 'Rejected - exceeds budget allowance. Please find alternative option.'
        WHERE status = 'rejected' AND review_notes IS NULL;
        
        -- Add review notes to revision required items
        UPDATE material_specs
        SET review_notes = 'Revision required - need updated specifications and warranty information.'
        WHERE status = 'revision_required' AND review_notes IS NULL;
    END IF;
END $$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log the completion
DO $$
BEGIN
    -- Insert completion log if admin user exists
    IF EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE 'admin' = ANY(permissions) OR 'admin_material_specs' = ANY(permissions)
        LIMIT 1
    ) THEN
        INSERT INTO activity_logs (
            project_id,
            user_id, 
            action,
            description,
            created_at
        )
        SELECT 
            NULL as project_id,
            id as user_id,
            'system_migration' as action,
            'Added missing fields to material_specs table: priority, review_date, review_notes' as description,
            NOW() as created_at
        FROM user_profiles 
        WHERE 'admin' = ANY(permissions) OR 'admin_material_specs' = ANY(permissions)
        LIMIT 1;
    END IF;
END $$;