-- Migration: Fix Missing Columns Schema Issues
-- Date: 2025-08-23
-- Description: Fix database schema inconsistencies causing API errors
-- Issues Fixed:
--   1. Missing 'reviewed_by' column in material_specs table
--   2. Missing 'assigned_to' column in shop_drawings table
--   3. Missing foreign key constraints
--   4. Updated RLS policies to include new assignment logic

-- =============================================================================
-- PART 1: Add Missing Columns
-- =============================================================================

-- Add reviewed_by column to material_specs table
ALTER TABLE material_specs 
ADD COLUMN IF NOT EXISTS reviewed_by uuid;

-- Add assigned_to column to shop_drawings table
ALTER TABLE shop_drawings 
ADD COLUMN IF NOT EXISTS assigned_to uuid;

-- =============================================================================
-- PART 2: Create Foreign Key Constraints
-- =============================================================================

-- Add foreign key constraint for material_specs.reviewed_by
DO $$ 
BEGIN
    -- Check if constraint doesn't exist before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'material_specs_reviewed_by_fkey'
        AND table_name = 'material_specs'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE material_specs 
        ADD CONSTRAINT material_specs_reviewed_by_fkey 
        FOREIGN KEY (reviewed_by) REFERENCES user_profiles(id);
    END IF;
END $$;

-- Add foreign key constraint for shop_drawings.assigned_to
DO $$ 
BEGIN
    -- Check if constraint doesn't exist before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'shop_drawings_assigned_to_fkey'
        AND table_name = 'shop_drawings'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shop_drawings 
        ADD CONSTRAINT shop_drawings_assigned_to_fkey 
        FOREIGN KEY (assigned_to) REFERENCES user_profiles(id);
    END IF;
END $$;

-- Ensure the approved_by foreign key exists (referenced by API)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'material_specs_approved_by_fkey'
        AND table_name = 'material_specs'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE material_specs 
        ADD CONSTRAINT material_specs_approved_by_fkey 
        FOREIGN KEY (approved_by) REFERENCES user_profiles(id);
    END IF;
END $$;

-- =============================================================================
-- PART 3: Create Indexes for Performance
-- =============================================================================

-- Index for material_specs.reviewed_by
CREATE INDEX IF NOT EXISTS idx_material_specs_reviewed_by 
ON material_specs(reviewed_by);

-- Index for shop_drawings.assigned_to
CREATE INDEX IF NOT EXISTS idx_shop_drawings_assigned_to 
ON shop_drawings(assigned_to);

-- =============================================================================
-- PART 4: Add Column Comments for Documentation
-- =============================================================================

COMMENT ON COLUMN material_specs.reviewed_by IS 'User who reviewed this material specification';
COMMENT ON COLUMN shop_drawings.assigned_to IS 'User assigned to handle this shop drawing';

-- =============================================================================
-- PART 5: Update RLS Policies
-- =============================================================================

-- Update material_specs RLS policies to include reviewed_by logic
DROP POLICY IF EXISTS "material_specs_select_policy" ON material_specs;
CREATE POLICY "material_specs_select_policy" ON material_specs
    FOR SELECT USING (
        -- Allow if user has view permissions based on role or project assignment
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                up.role IN ('admin', 'project_manager', 'technical_manager')
                OR project_id = ANY(up.assigned_projects)
                OR created_by = auth.uid()
                OR reviewed_by = auth.uid()
                OR approved_by = auth.uid()
            )
        )
    );

-- Update material_specs update policy
DROP POLICY IF EXISTS "material_specs_update_policy" ON material_specs;
CREATE POLICY "material_specs_update_policy" ON material_specs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                up.role IN ('admin', 'project_manager', 'technical_manager')
                OR project_id = ANY(up.assigned_projects)
                OR created_by = auth.uid()
            )
        )
    );

-- Update shop_drawings RLS policies to include assigned_to logic
DROP POLICY IF EXISTS "shop_drawings_select_policy" ON shop_drawings;
CREATE POLICY "shop_drawings_select_policy" ON shop_drawings
    FOR SELECT USING (
        -- Allow if user has view permissions based on role, project assignment, or direct assignment
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                up.role IN ('admin', 'project_manager', 'technical_manager')
                OR project_id = ANY(up.assigned_projects)
                OR assigned_to = auth.uid()
                OR submitted_by = auth.uid()
                OR reviewed_by = auth.uid()
            )
        )
    );

-- Update shop_drawings update policy
DROP POLICY IF EXISTS "shop_drawings_update_policy" ON shop_drawings;
CREATE POLICY "shop_drawings_update_policy" ON shop_drawings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                up.role IN ('admin', 'project_manager', 'technical_manager')
                OR project_id = ANY(up.assigned_projects)
                OR assigned_to = auth.uid()
                OR submitted_by = auth.uid()
            )
        )
    );

-- =============================================================================
-- PART 6: Verification Queries (for testing)
-- =============================================================================

-- Verify the columns exist
DO $$
BEGIN
    -- Check material_specs.reviewed_by
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'material_specs' 
        AND column_name = 'reviewed_by'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Migration failed: reviewed_by column not created in material_specs';
    END IF;
    
    -- Check shop_drawings.assigned_to
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shop_drawings' 
        AND column_name = 'assigned_to'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'Migration failed: assigned_to column not created in shop_drawings';
    END IF;
    
    -- Success message
    RAISE NOTICE 'Migration completed successfully: All missing columns and constraints added';
END $$;